import { CHORD_SHAPES, ChordShapeKey } from "../data/chordShapes";

export const NOTE_BASE: Record<string, number> = {
  C: 60,
  "C#": 61,
  Db: 61,
  D: 62,
  "D#": 63,
  Eb: 63,
  E: 64,
  F: 65,
  "F#": 66,
  Gb: 66,
  G: 67,
  "G#": 68,
  Ab: 68,
  A: 69,
  "A#": 70,
  Bb: 70,
  B: 71,
};

export const parseRootMidi = (symbol: string): number | null => {
  const match = symbol.match(/^([A-Ga-g])(#{1}|b)?/);
  if (!match) return null;
  const [, root, accidental] = match;
  const key = `${root.toUpperCase()}${accidental ?? ""}`;
  return NOTE_BASE[key] ?? null;
};

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
const sampleDataCache = new Map<InstrumentKey, ArrayBuffer>();
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
      sampleDataCache.set(instrument, arrayBuffer);
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
  ctx: BaseAudioContext,
  buffer: AudioBuffer,
  playbackRate: number,
  instrument: InstrumentKey,
  destination: AudioNode,
  startTime: number
) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;

  const gain = ctx.createGain();
  const release = instrument === "bass" ? 2.6 : instrument === "piano" ? 1.6 : 1.4;
  const startGain = instrument === "bass" ? 0.85 : 0.7;

  gain.gain.setValueAtTime(startGain, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + release);

  source.connect(gain);
  gain.connect(destination);
  return { source, gain, release };
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
    const { source, gain, release } = createVoice(
      ctx,
      buffer,
      playbackRate,
      instrument,
      ctx.destination,
      now
    );
    source.start(now);
    source.stop(now + release + 0.05);
    source.onended = () => {
      gain.disconnect();
    };
  });
};

type RenderableChord = {
  symbol: string;
  shape?: ChordShapeKey;
};

const getIntervalsForChord = (shapeKey?: ChordShapeKey) =>
  CHORD_SHAPES[shapeKey ?? "Maj7"].pianoIntervals;

export const renderProgressionOffline = async (
  chords: RenderableChord[],
  instrument: InstrumentKey,
  tempoBpm = 88,
  beatsPerChord = 4
): Promise<AudioBuffer | null> => {
  if (typeof window === "undefined") return null;
  await fetchSamples();

  const sampleData = sampleDataCache.get(instrument);
  if (!sampleData) return null;

  const sampleRate = 44100;
  const secondsPerBeat = 60 / tempoBpm;
  const chordDuration = beatsPerChord * secondsPerBeat;
  const releaseTail = instrument === "bass" ? 2.6 : instrument === "piano" ? 1.6 : 1.4;
  const totalDuration = chords.length * chordDuration + releaseTail + 0.5;

  const offlineCtx = new OfflineAudioContext(
    2,
    Math.ceil(totalDuration * sampleRate),
    sampleRate
  );

  const decodedSample = await offlineCtx.decodeAudioData(sampleData.slice(0));
  const base = SAMPLE_CONFIG[instrument].rootMidi;

  chords.forEach((chord, idx) => {
    const rootMidi = parseRootMidi(chord.symbol) ?? 60;
    const intervals = getIntervalsForChord(chord.shape as ChordShapeKey);
    const startTime = idx * chordDuration + 0.05;

    intervals.forEach((interval: number) => {
      const targetMidi = rootMidi + interval;
      const playbackRate = Math.pow(2, (targetMidi - base) / 12);
      const { source, gain, release } = createVoice(
        offlineCtx,
        decodedSample,
        playbackRate,
        instrument,
        offlineCtx.destination,
        startTime
      );
      source.start(startTime);
      source.stop(startTime + release + 0.05);
      source.onended = () => gain.disconnect();
    });
  });

  return offlineCtx.startRendering();
};
