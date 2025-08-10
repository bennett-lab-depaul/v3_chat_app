import { useEffect, useRef, useState } from "react";
import createWavFromRawPcm from "@/utils/functions/createWavFromRawPcm";

// Hook that handles audio playback. Takes in parameters for the audio format.
export default function useAudioPlayer({
	numChannels = 1,
	sampleRate = 24000,
	bitsPerSample = 32,
}) {
	const [playing, setPlaying] = useState(false);
	const [urlQueue, setUrlQueue] = useState<string[]>([]);
	const audioElem = useRef(null);

    /**
     *   Sends audio to the player. Converts the base64 string to a WAV Blob and creates a URL for playback. 
     *   Url is then added to the queue to be played.
     * @param data The base 64 encoded audio data string.
     */
	const sendAudio = (data: string) => {
		const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
		const wavBlob = createWavFromRawPcm(raw.buffer, numChannels, bitsPerSample, sampleRate);
		const url = URL.createObjectURL(wavBlob);
		setUrlQueue((prevUrlQueue) => [...prevUrlQueue, url]);
	};

    /**
     * Plays the next audio URL in the queue.
     */
	useEffect(() => {
		const playAudio = async () => {
			const nextUrl = urlQueue[0];
			try {
				if (urlQueue.length) {
					audioElem.current = new Audio(nextUrl);

					audioElem.current.src = nextUrl;
					audioElem.current.autoplay = true;
					audioElem.current.preload = "auto";
					setPlaying(true);
					audioElem.current.onended = () => {
						setPlaying(false);
						setUrlQueue((prevQ) => prevQ.slice(1));
					};
					audioElem.current
						.play()
						.catch((err) => console.error("Playback error:", err));
				}
			} catch (error) {
				console.error("Error playing audio:", error);
			}
		};
		if (!playing && urlQueue.length > 0) {
			playAudio();
		}
	}, [urlQueue, playing]);

    // Expose these functions and state
	return { sendAudio, playing };
}
