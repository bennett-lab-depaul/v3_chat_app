# =======================================================================
# Processes incoming messages, scores them, and responds
# =======================================================================
from django.apps                import apps
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db                import database_sync_to_async

# Logging
from time import time
import json, asyncio, logging
logger = logging.getLogger(__name__)

# From this project
from ..                      import config        as cf
from ..services              import logging_utils as lu 
from ..services.db_services  import ChatService
from  .services.bg_helpers   import fire_and_log
from  .services.chatHelpers  import handle_transcription
from  .services.audioHelpers import extract_audio_biomarkers, extract_text_biomarkers
from .services.chatAnalysis  import get_sentiment_topics

# ======================================================================= ===================================
# ChatConsumer 
# ======================================================================= ===================================
class ChatConsumer(AsyncJsonWebsocketConsumer):
    MAX_CONTEXT = 5  # (how many recent messages to keep for the LLM)

    # =======================================================================
    # Open WebSocket Connection
    # =======================================================================
    async def connect(self):
        """
        1) Authentication Block -> user information, chat source
            Later on, when adding functionality for users to connect to the same chat via webapp & robot simultaneously, 
            this is how we will do it. If the current active chat source is "buddyrobot" or "qtrobot" and we are connecting
            from "webapp" or "mobile", disable the chat functionality but send updates for the each utterance so the UI
            can follow along with each message in real time. 

        2) Load or create active session
            get_or_create_active_session(user) will return a chat if it's still active. The consumer builds a brand-new 
            context_buffer from those persisted messages so the LLM has context.
        """
        # -----------------------------------------------------------------------
        # 1) Authentication Block 
        # -----------------------------------------------------------------------
        # Authenticate before accepting connection (uses custom "unauth" code)
        if not self.scope["user"].is_authenticated: await self.close(code=4001); return
        self.user   = self.scope["user"]
        self.source = self.scope.get("source", "unknown")
        await self.accept()
        logger.info(f"{cf.RLINE_1}{cf.RED}[WS] ChatSession opened for {self.user} from {self.source} {cf.RESET}{cf.RLINE_2}")
        
        # I don't think any frontend uses these during the chat right now, but I'll leave this option in
        self.return_biomarkers = False # (self.source in ["webapp"])

        # -----------------------------------------------------------------------
        # 2) Load or create an active session
        # -----------------------------------------------------------------------
        self.session = await database_sync_to_async(ChatService.get_or_create_active_session)(self.user, source=self.source)
        recent = await database_sync_to_async(lambda: list(self.session.messages.all().order_by("-start_ts")[: self.MAX_CONTEXT])[::-1])()

        # TODO: I added the timestamps in just now for biomarker scores, but I actually don't really like how this works at the moment...
        # Actually since I want to remove the "resume" chat thing, probably don't need to do this with the context buffer (loading in old data)
        self.context_buffer = [(m.role, m.content, m.ts.timestamp()) for m in recent]
        
        # Appends the user utterances here for sentiment and topic analysis
        self.message_history = [m.content for m in recent]

        # Adding one default message at the start of the chat every time (so I have a reference timestamp before every user message)
        self.context_buffer = [("assistant", "How can I help you today?", time())] + self.context_buffer
        
        # Other misc. setup
        self.overlapped_speech_count  = 0.0
        self.audio_windows_count      = 0.0
        self.overlapped_speech_events = []  # List of timestamps (ToDo: Add this to the DB somehow)

        # -----------------------------------------------------------------------
        # 3) Send misc information to the frontend (ToDo: biomarkers, etc)
        # -----------------------------------------------------------------------
        # This is where we could potentially have a connection on the robot and web app and monitor the conversation in real time
        if self.return_biomarkers: await self.send_json({"type": "history", "messages": self.context_buffer})

    # -----------------------------------------------------------------------
    # Close Connection 
    # -----------------------------------------------------------------------
    async def disconnect(self, code):
        """
        # DO NOT close the session -- just clean local state.
        --- Originally had pausing in here, but im just changing it so disconnects end the chat. ---
        """
        # 1) Close the ChatSession in the DB
        if self.session.is_active: await self._save_to_db()

        # Cancel background tasks (if any -- none right now)
        for task in getattr(self, "_bg_tasks", []): task.cancel()
        await asyncio.gather(*getattr(self, "_bg_tasks", []), return_exceptions=True)

        # Reset some properties for the next connection
        self.context_buffer           = []
        self.overlapped_speech_count  = 0.0
        self.audio_windows_count      = 0.0
        self.overlapped_speech_events = []

        logger.info(f"Client disconnected:  {code}") 

    # ======================================================================= ===================================
    # Handle Incoming Data
    # ======================================================================= ===================================
    async def receive_json(self, data, **kwargs):
        if   data["type"] == "overlapped_speech" : await self._handle_overlap(data=data)
        elif data["type"] == "audio_data"        : await self._handle_audio_data(data)
        elif data["type"] == "transcription"     : await handle_transcription(data, msg_callback=self._add_message_CB, send_callback=self.send, bio_callback=self._utt_bio)
        elif data["type"] == "end_chat"          : await self._save_to_db()

    # -----------------------------------------------------------------------
    # Overlapped Speech
    # -----------------------------------------------------------------------
    async def _handle_overlap(self, data=None):
        self.overlapped_speech_count += 1
        self.overlapped_speech_events.append(time())
        logger.info(f"{lu.YELLOW}Overlapped speech detected. Count: {self.overlapped_speech_count} {lu.RESET}")

    # =======================================================================
    # Text Transcriptions
    # =======================================================================
    # TODO: Because altered_grammar specifically is so slow, they will actually go to the db out of order. Need to add a manual time setting argument.
    async def _utt_bio(self):
        """ On-Utterance Biomarkers (saves them to the DB as soon as we get them). """
        utterance_biomarkers = await extract_text_biomarkers(self.context_buffer)
        fire_and_log(database_sync_to_async(ChatService.add_biomarkers_bulk)(self.session, utterance_biomarkers))
        if self.return_biomarkers: await self.send(json.dumps({"type": "biomarker_scores", "data": utterance_biomarkers}))
    
    async def _add_message_CB(self, role, text, time):
        """
        Add messages to the database & update the local context.
            - Role must be "user" or "assistant"
        """
        # Fire-and-forget DB write for the user message
        fire_and_log(database_sync_to_async(ChatService.add_message)(self.session, role, text))

        # Update in memory context
        self.context_buffer.append((role, text, time))
        if len(self.context_buffer) > self.MAX_CONTEXT: self.context_buffer.pop(0)
        self.message_history.append(text)

        # Return the updated context (if the message was from the user, this will be used for the LLM)
        if role == "user": return self.context_buffer
        
    # =======================================================================
    # Audio Data
    # =======================================================================
    async def _handle_audio_data(self, data):
        # Generate the audio-related biomarker scores
        audio_biomarkers = await extract_audio_biomarkers(data, self.overlapped_speech_count)
      
        # Save biomarkers to the DB
        fire_and_log(database_sync_to_async(ChatService.add_biomarkers_bulk)(self.session, audio_biomarkers))
        if self.return_biomarkers: await self.send(json.dumps({"type": "audio_scores", "data": audio_biomarkers}))

        # Update turntaking (12 audio windows for 1 minute of data)
        self.audio_windows_count += 1
        self.overlapped_speech_count = self.overlapped_speech_count / (self.audio_windows_count / 12)
        
    # =======================================================================
    # DB Saving
    # =======================================================================
    async def _save_to_db(self):
        sentiment, topics = get_sentiment_topics(self.message_history)
        await database_sync_to_async(ChatService.close_session)(self.user, self.session, source=self.source, sentiment=sentiment, topics=topics)