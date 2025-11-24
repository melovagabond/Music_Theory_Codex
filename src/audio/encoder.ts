import { Mp3Encoder } from "lamejs";

const floatTo16BitPCM = (input: Float32Array) => {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
};

export const encodeAudioBufferToMp3 = async (
  buffer: AudioBuffer
): Promise<Blob> => {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, 160);
  const blockSize = 1152;
  const mp3Data: number[] = [];

  const left = buffer.getChannelData(0);
  const right = channels > 1 ? buffer.getChannelData(1) : left;

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = floatTo16BitPCM(left.subarray(i, i + blockSize));
    const rightChunk = floatTo16BitPCM(right.subarray(i, i + blockSize));
    const data = encoder.encodeBuffer(leftChunk, rightChunk);
    if (data.length > 0) {
      mp3Data.push(...data);
    }
  }

  const end = encoder.flush();
  if (end.length > 0) {
    mp3Data.push(...end);
  }

  return new Blob([new Uint8Array(mp3Data)], { type: "audio/mpeg" });
};
