from google.cloud import speech, texttospeech
from google import genai
from google.genai import types
import threading
import asyncio
import os
import time
from queue import Queue
import base64
from ... import config as cf
import wave
import logging

logger = logging.getLogger(__name__)

# Constants
SAMPLE_RATE = 16_000
CHUNK_SIZE = 2_048  # 64ms of 16-bit PCM audio = 2048 bytes

class SpeechToTextProvider:
    def __init__(self, on_transcription_callback=None, loop=None):
        self._client = speech.SpeechClient()
        self._streaming_config = None
        self._audio_buffer = Queue()
        self._streaming = False
        self._on_transcription_callback = on_transcription_callback
        self._loop = loop or asyncio.get_event_loop()

    def _audio_generator(self):
        while self._streaming:
            if self._audio_buffer:
                data = self._audio_buffer.get()
                if data is None:
                    break
                yield speech.StreamingRecognizeRequest(audio_content=data)

    def start(self):
        self._streaming = True
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=SAMPLE_RATE,
            language_code="en-US",
        )
        self._streaming_config = speech.StreamingRecognitionConfig(
            config=config,
            interim_results=False,
        )

        threading.Thread(target=self._start_streaming_thread, daemon=True).start()
        
    def stop(self):
        self._streaming = False
        self._audio_buffer.put(None)
        
    def send_audio(self, data):
        audio_bytes = base64.b64decode(data["data"])
        self._audio_buffer.put(audio_bytes)
        if not self._streaming:
            self.start()
            

    def _start_streaming_thread(self):
        requests = self._audio_generator()

        try:
            responses = self._client.streaming_recognize(config=self._streaming_config, requests=requests)
            self._listen_responses(responses)
        except Exception as e:
            print(f"[ERROR] Streaming connection failed: {e}")


    def _listen_responses(self, responses):
        for response in responses:
            for result in response.results:
                if result.is_final:
                    transcript = result.alternatives[0].transcript
                    logger.info(f"{cf.RED}[Transcription] Received final transcription: {transcript}.")
                    if self._on_transcription_callback:
                        data = {"type": "transcript", "data": transcript}
                        if asyncio.iscoroutinefunction(self._on_transcription_callback):
                            asyncio.run_coroutine_threadsafe(
                                self._on_transcription_callback(data),
                                self._loop
                            )
                        else:
                            self._on_transcription_callback(data)

class TextToSpeechProvider:
    
    def __init__(self):
        self._client = texttospeech.TextToSpeechClient()
        self._voice = texttospeech.VoiceSelectionParams(
            language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        self._gemini_client = genai.Client()
        self._audio_config = None
                        
    def synthesize_speech(self, text: str, encoding: str) -> bytes:
        if encoding == "mp3":
            self._audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
            )
        elif encoding == "pcm":
            self._audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.PCM,
            )
        elif encoding == "wav":
            self._audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            )
        else:
            logger.error(f"{cf.RED}[TTS] Unsupported audio encoding: {encoding}")
            return None
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            response = self._client.synthesize_speech(
                input=synthesis_input, voice=self._voice, audio_config=self._audio_config,
            )
            logger.info(f"{cf.YELLOW}[TTS] Speech synthesized")
            return response.audio_content
        except Exception as e:
            logger.error(f"{cf.RED}[TTS] Error synthesizing speech: {e}")
            
    def write_audio_bytes(self, filename: str, content: bytes):
        with open(filename, "wb") as out:
            out.write(content)
        logger.info(f"{cf.RED}[TTS] Wrote audio bytes to file")
            
    def write_wav(self, filename: str, content: bytes, channels=1, rate=24000, sample_width=2):
        with wave.open(filename, "wb") as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(sample_width)
            wf.setframerate(rate)
            wf.writeframes(content)

    
    def synthesize_speech_gemini(self, text: str) -> bytes:
        try:
            response = self._gemini_client.models.generate_content(
                model="gemini-2.5-flash-preview-tts",
                contents="Say cheerfully: " + text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Kore',
                            )
                        )
                    ),
                )
            )
            data = response.candidates[0].content.parts[0].inline_data.data
            logger.info(f"{cf.YELLOW}[TTS] Speech synthesized")
            return data
        except Exception as e:
            logger.error(f"{cf.RED}[TTS] Error synthesizing speech: {e}")