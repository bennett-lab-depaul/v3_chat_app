import { useEffect, useRef, useState } from "react";

export default function useAudioPlayer({
	numChannels = 1,
	sampleRate = 24000,
	bitsPerSample = 32,
}) {
	const [playing, setPlaying] = useState(false);
	const [urlQueue, setUrlQueue] = useState<string[]>([]);
	const audioElem = useRef(null);

	const createWavFromRawPcm = (rawBuffer: ArrayBuffer) => {
		const blockAlign = (numChannels * bitsPerSample) / 8;
		const byteRate = sampleRate * blockAlign;
		const dataSize = rawBuffer.byteLength;

		const buffer = new ArrayBuffer(dataSize);
		const view = new DataView(buffer);

		const writeString = (offset: number, str: string) => {
			for (let i = 0; i < str.length; i++) {
				view.setUint8(offset + i, str.charCodeAt(i));
			}
		};

		writeString(0, "RIFF");
		view.setUint32(4, 36 + dataSize, true);
		writeString(8, "WAVE");
		writeString(12, "fmt ");
		view.setUint32(16, 16, true); // PCM
		view.setUint16(20, 1, true); // format = PCM
		view.setUint16(22, numChannels, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, byteRate, true);
		view.setUint16(32, blockAlign, true);
		view.setUint16(34, bitsPerSample, true);
		writeString(36, "data");
		view.setUint32(40, dataSize, true);

		const wav = new Uint8Array(buffer);
		wav.set(new Uint8Array(rawBuffer));
		return new Blob([wav], { type: "audio/wav" });
	};

	const sendAudio = (data: string) => {
		const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
		const wavBlob = createWavFromRawPcm(raw.buffer);
		const url = URL.createObjectURL(wavBlob);
		setUrlQueue((prevUrlQueue) => [...prevUrlQueue, url]);
	};

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

	return { sendAudio, playing };
}
