import { useRef, useCallback, useState } from "react";
import { pcm16ToAudioBuffer } from "@/utils/functions/audioHelpers";

export function useAudioPlayer( {sampleRate = 24_000, numChannels = 1, bitsPerSample = 32, bufferAhead = 0.5} ) {
    const [systemSpeaking, setSystemSpeaking] = useState(false);
	const audioContextRef = useRef<AudioContext>(null);
	const scheduleTimeRef = useRef<number>(0);

	const startPlayer = useCallback(() => {
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext();
			scheduleTimeRef.current = audioContextRef.current.currentTime + bufferAhead;
		}
	}, [bufferAhead]);

	const sendAudio = useCallback(
		async (bytes: string) => {
			if (!audioContextRef.current) return;
			const ctx = audioContextRef.current;
            const data = JSON.parse(bytes).data;
			const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
			const bufferToDecode = raw.buffer;
			try {
				const audioBuffer = pcm16ToAudioBuffer(bufferToDecode, sampleRate, numChannels, ctx);
				const startTime = Math.max(scheduleTimeRef.current, ctx.currentTime + bufferAhead);

				const source = ctx.createBufferSource();
				source.buffer = audioBuffer;
				source.connect(ctx.destination);
				source.start(startTime);

				scheduleTimeRef.current = startTime + audioBuffer.duration;

                source.onended = () => {
                    // When the last scheduled chunk ends, mark systemSpeaking false
                    if (scheduleTimeRef.current <= ctx.currentTime + 0.01) {
                        setSystemSpeaking(false);
                    }
                };
			} catch (e) {
				console.error("Could not decode audio data: ", e);
			}
		}, [sampleRate, numChannels, bitsPerSample, bufferAhead]);

	const stopPlayer = useCallback(() => {
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}
		scheduleTimeRef.current = 0;
	}, []);

	return { startPlayer, sendAudio, stopPlayer, systemSpeaking };
}
