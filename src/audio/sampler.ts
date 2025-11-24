import { CHORD_SHAPES, ChordShapeKey } from "../data/chordShapes";

type SampleConfig = {
  file: string;
  rootMidi: number;
};

export type InstrumentKey = "piano" | "guitar" | "ukulele" | "bass";

const SAMPLE_CONFIG: Record<InstrumentKey, SampleConfig> = {
  piano: {
    file: new URL("../assets/audio/piano_C4.wav", import.meta.url).href,
    rootMidi: 60,
  },
  guitar: {
    file: new URL("../assets/audio/guitar_C4.wav", import.meta.url).href,
    rootMidi: 60,
  },
  ukulele: {
    file: new URL("../assets/audio/ukulele_C4.wav", import.meta.url).href,
    rootMidi: 60,
  },
  bass: {
    file: new URL("../assets/audio/bass_C2.wav", import.meta.url).href,
    rootMidi: 48,
  },
};

const sampleCache = new Map<InstrumentKey, AudioBuffer>();
let loadPromise: Promise<void> | null = null;
let audioContext: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = AudioCtx ? new AudioCtx() : null;
  }
  return audioContext;
};

const fetchSamples = async () => {
  if (loadPromise) return loadPromise;
  const ctx = getContext();
  if (!ctx) return;

  loadPromise = Promise.all(
    (Object.keys(SAMPLE_CONFIG) as InstrumentKey[]).map(async (instrument) => {
      const { file } = SAMPLE_CONFIG[instrument];
      const res = await fetch(file);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      sampleCache.set(instrument, buffer);
    })
  ).then(() => undefined);

  return loadPromise;
};

export const warmupSamples = async () => {
  try {
    await fetchSamples();
  } catch (err) {
    console.error("Failed to warmup samples", err);
  }
};

const createVoice = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  playbackRate: number,
  instrument: InstrumentKey
) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const release = instrument === "bass" ? 2.6 : instrument === "piano" ? 1.6 : 1.4;
  const startGain = instrument === "bass" ? 0.85 : 0.7;

  gain.gain.setValueAtTime(startGain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + release);

  source.connect(gain);
  gain.connect(ctx.destination);
  return { source, gain };
};

export const playChord = async (
  shapeKey: ChordShapeKey,
  rootMidi: number,
  instrument: InstrumentKey
) => {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  await fetchSamples();
  const buffer = sampleCache.get(instrument);
  if (!buffer) return;

  const intervals =
    CHORD_SHAPES[shapeKey]?.pianoIntervals || CHORD_SHAPES.Maj7.pianoIntervals;

  const base = SAMPLE_CONFIG[instrument].rootMidi;
  const now = ctx.currentTime + 0.02;

  intervals.forEach((interval) => {
    const targetMidi = rootMidi + interval;
    const playbackRate = Math.pow(2, (targetMidi - base) / 12);
    const { source, gain } = createVoice(ctx, buffer, playbackRate, instrument);
    source.start(now);
    source.stop(now + 4);
    source.onended = () => {
      gain.disconnect();
    };
  });
};
