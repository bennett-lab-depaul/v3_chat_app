// Converts raw PCM audio data to a WAV Blob
function createWavFromRawPcm(
	rawBuffer: ArrayBuffer,
	numChannels: number,
	bitsPerSample: number,
	sampleRate: number
) {
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
}

function pcm16ToAudioBuffer(
	pcmData: ArrayBuffer,
	sampleRate: number,
	numChannels: number,
	ctx: AudioContext
): AudioBuffer {
	const audioBuffer = ctx.createBuffer(
		numChannels,
		pcmData.byteLength / (2 * numChannels),
		sampleRate
	);
	const view = new DataView(pcmData);
	let offset = 0;

	for (let ch = 0; ch < numChannels; ch++) {
		const channelData = audioBuffer.getChannelData(ch);
		for (let i = ch; i < pcmData.byteLength / 2; i += numChannels) {
			channelData[(i - ch) / numChannels] =
				view.getInt16(offset, true) / 0x8000;
			offset += 2;
		}
	}
	return audioBuffer;
}

export {createWavFromRawPcm, pcm16ToAudioBuffer}
