import { GoogleGenAI } from '@google/generative-ai';

// Default Arguments
const defaultModel = 'gemini-2.0-flash-live-001';
const defaultSampleRateHertz = 16_000;

/*  ====================================================================
 *  GeminiASR
 *  ====================================================================
 *  Wrapper around Gemini streaming ASR.
 *
 *  constructor(opts) expects:
 *      apiKey                   : Google AI key
 *      onUtterance(text)        : final transcript callback
 *      onPartial(text)          : (optional) partial transcript callback
 *      onUserSpeakingChange(b)  : (optional) speaking flag callback
 *      model                    : Gemini model name, default flash-live
 *
 *  start_stream()               : open live session
 *  pushAudio(Int16Array)        : send 16-kHz PCM chunk
 *  stop_stream()                : close session
 * ==================================================================== */
export class GeminiASR {
    constructor({ apiKey, onUtterance, onPartial, onUserSpeakingChange, model, sourceSampleRateHertz }) {
        if (!apiKey) throw new Error('GeminiASR requires an API key.');

        this.genai = new GoogleGenAI({ apiKey });
        this.model = model ?? defaultModel;
        
        this.onUtterance           = onUtterance;
        this.onPartial             = onPartial             ?? (() => {});
        this.onUserSpeakingChange  = onUserSpeakingChange  ?? (() => {});
        this.sourceSampleRateHertz = sourceSampleRateHertz ?? defaultSampleRateHertz;

        this.session   = null;
        this._listener = null;
    }

    // --------------------------------------------------------------------
    // Just does ASR, so only response is 'TEXT'
    // --------------------------------------------------------------------
    async start_stream() {if (this.session) return; // (already running)
        // Connect to the cloud
        this.session = await this.genai.live.connect({
            model : this.model,
            config: {responseModalities: ['TEXT'], audio: {sourceSampleRateHertz: this.sourceSampleRateHertz}}
        });

        // Flag user is speaking on partial, then user is done speaking on final
        let speaking = false;
        this._listener = (async () => {
            try {
                for await (const msg of this.session.stream()) {
                    if (msg.transcriptPart ) {this.onPartial  (msg.transcriptPart .text); if (!speaking) {speaking = true;  this.onUserSpeakingChange(true );}}
                    if (msg.transcriptFinal) {this.onUtterance(msg.transcriptFinal.text); if ( speaking) {speaking = false; this.onUserSpeakingChange(false);}}
                }
            } catch (err) { console.error('GeminiASR stream error:', err); }
        })();
    }

    // --------------------------------------------------------------------
    // Push a 16-kHz Int16Array chunk from the AudioStreamer
    // --------------------------------------------------------------------
    async pushAudio(int16) {
        if (!this.session) return;
        const bytes = new Uint8Array(int16.buffer);
        await this.session.sendAudio({ audio: { data: bytes } });
    }

    // --------------------------------------------------------------------
    // Close Session
    // --------------------------------------------------------------------
    async stop_stream() {
        this.onUserSpeakingChange(false);
        await this.session?.close();
        this.session   = null;
        this._listener = null;
    }
}


/*  ==================================================================== 
 *  GeminiTTS
 *  ====================================================================
 *  Uses the same live session mode but asks for AUDIO responses.
 *
 *  constructor(opts) expects:
 *      apiKey                 : Google AI key
 *      onStart() / onDone()   : (optional) hooks
 *      model                  : live model name (default flash-live)
 *
 *  speak(text)  : synthesize & play
 *  stop()       : cancel current playback
 *  ==================================================================== */
export class GeminiTTS {
    constructor({ apiKey, onStart, onDone, model }) {
        if (!apiKey) throw new Error('GeminiTTS requires an API key.');
        
        this.genai   = new GoogleGenAI({ apiKey });
        this.model   = model ?? defaultModel;

        this.onStart = onStart ?? (() => {});
        this.onDone  = onDone  ?? (() => {});

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.currSrc  = null;
    }

    // --------------------------------------------------------------------
    // TTS for the given text
    // --------------------------------------------------------------------
    async speak(text) {if (!text) return;
        this.onStart();

        // One-off live session just for this utterance
        const session = await this.genai.live.connect({model: this.model, config: {responseModalities: ['AUDIO']}});

        // Send the prompt
        await session.sendClientContent({role: 'user', parts: [{ text }]});

        // Get the response
        try           {for await (const msg of session.stream()) {if (msg.audioChunk) {await this._playChunk(msg.audioChunk);}}} 
        catch (error) {console.error('GeminiTTS error:', error);} 
        finally       {await session.close(); console.log("Speech synthesized"); this.onDone();}
    }

    // --------------------------------------------------------------------
    // Play the audio received
    // --------------------------------------------------------------------
    async _playChunk(chunk) {
        // chunk.data is Uint8Array PCM-ulaw @24kHz 
        // Might need to resample to match output device...
        const buffer = await this.audioCtx.decodeAudioData(chunk.data.buffer);
        this.currSrc?.stop();

        const src = this.audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(this.audioCtx.destination);
        src.start(0);
        this.currSrc = src;
    }

    // --------------------------------------------------------------------
    // Close Session
    // --------------------------------------------------------------------
    stop() {this.currSrc?.stop(); this.onDone();}
}