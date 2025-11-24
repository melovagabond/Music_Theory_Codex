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

type DrumSampleConfig = {
  id: string;
  label: string;
  midi: number;
  file: string;
};

export type InstrumentKey =
  | "piano"
  | "guitar"
  | "ukulele"
  | "bass"
  | "drums";

const DRUM_SAMPLE_CONFIG: DrumSampleConfig[] = [
  {
    id: "kick",
    label: "Kick",
    midi: 36,
    file: new URL("../assets/audio/drum_kick.wav", import.meta.url).href,
  },
  {
    id: "snare",
    label: "Snare",
    midi: 38,
    file: new URL("../assets/audio/drum_snare.wav", import.meta.url).href,
  },
  {
    id: "hihat",
    label: "Hi-hat",
    midi: 42,
    file: new URL("../assets/audio/drum_hihat.wav", import.meta.url).href,
  },
  {
    id: "tom-low",
    label: "Low tom",
    midi: 45,
    file: new URL("../assets/audio/drum_tom_low.wav", import.meta.url).href,
  },
  {
    id: "tom-mid",
    label: "Mid tom",
    midi: 47,
    file: new URL("../assets/audio/drum_tom_mid.wav", import.meta.url).href,
  },
  {
    id: "tom-high",
    label: "High tom",
    midi: 50,
    file: new URL("../assets/audio/drum_tom_high.wav", import.meta.url).href,
  },
];

export const DRUM_PADS = DRUM_SAMPLE_CONFIG.map(({ id, label, midi }) => ({
  id,
  label,
  midi,
}));

const SAMPLE_CONFIG: Record<Exclude<InstrumentKey, "drums">, SampleConfig> = {
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

<<<<<<< ours
const sampleCache = new Map<InstrumentKey, AudioBuffer>();
const sampleDataCache = new Map<InstrumentKey, ArrayBuffer>();
=======
const DRUM_NOTE_MAP = new Map<number, DrumSampleConfig>(
  DRUM_SAMPLE_CONFIG.map((sample) => [sample.midi, sample])
);

const sampleCache = new Map<string, AudioBuffer>();
>>>>>>> theirs
let loadPromise: Promise<void> | null = null;
let audioContext: AudioContext | null = null;

const cacheKey = (instrument: InstrumentKey, id = "root") =>
  `${instrument}:${id}`;

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

<<<<<<< ours
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
=======
  const pitchedLoads = (Object.keys(
    SAMPLE_CONFIG
  ) as (keyof typeof SAMPLE_CONFIG)[]).map(async (instrument) => {
    const { file } = SAMPLE_CONFIG[instrument];
    const res = await fetch(file);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    sampleCache.set(cacheKey(instrument), buffer);
  });

  const drumLoads = DRUM_SAMPLE_CONFIG.map(async (sample) => {
    const res = await fetch(sample.file);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    sampleCache.set(cacheKey("drums", sample.id), buffer);
  });

  loadPromise = Promise.all([...pitchedLoads, ...drumLoads]).then(
    () => undefined
  );
>>>>>>> theirs

  return loadPromise;
};

export const warmupSamples = async () => {
  try {
    await fetchSamples();
  } catch (err) {
    console.error("Failed to warmup samples", err);
  }
};

const getBuffer = (instrument: InstrumentKey, id = "root") =>
  sampleCache.get(cacheKey(instrument, id));

const DRUM_PATTERN = [
  { midi: 36, offset: 0 },
  { midi: 42, offset: 0 },
  { midi: 38, offset: 0.35 },
  { midi: 42, offset: 0.2 },
  { midi: 47, offset: 0.55 },
];

export const playDrumNote = async (midiNote: number) => {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  await fetchSamples();
  const sample = DRUM_NOTE_MAP.get(midiNote);
  if (!sample) return;

  const buffer = getBuffer("drums", sample.id);
  if (!buffer) return;

  const startTime = ctx.currentTime + 0.01;
  scheduleVoice(ctx, buffer, "drums", 1, startTime, 2);
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
<<<<<<< ours
  const release = instrument === "bass" ? 2.6 : instrument === "piano" ? 1.6 : 1.4;
  const startGain = instrument === "bass" ? 0.85 : 0.7;
=======
  const now = ctx.currentTime;
  const release =
    instrument === "bass"
      ? 2.6
      : instrument === "piano"
      ? 1.6
      : instrument === "drums"
      ? 0.9
      : 1.4;
  const startGain = instrument === "bass" ? 0.85 : instrument === "drums" ? 0.9 : 0.7;
>>>>>>> theirs

  gain.gain.setValueAtTime(startGain, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + release);

  source.connect(gain);
  gain.connect(destination);
  return { source, gain, release };
};

const scheduleVoice = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  instrument: InstrumentKey,
  playbackRate: number,
  startTime: number,
  duration = 4
) => {
  const { source, gain } = createVoice(ctx, buffer, playbackRate, instrument);
  source.start(startTime);
  source.stop(startTime + duration);
  source.onended = () => {
    gain.disconnect();
  };
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

  if (instrument === "drums") {
    const now = ctx.currentTime + 0.02;
    DRUM_PATTERN.forEach(({ midi, offset }) => {
      const sample = DRUM_NOTE_MAP.get(midi);
      if (!sample) return;
      const buffer = getBuffer("drums", sample.id);
      if (!buffer) return;
      scheduleVoice(ctx, buffer, instrument, 1, now + offset, 2);
    });
    return;
  }

  const buffer = getBuffer(instrument);
  if (!buffer) return;

  const intervals =
    CHORD_SHAPES[shapeKey]?.pianoIntervals || CHORD_SHAPES.Maj7.pianoIntervals;

  const base = SAMPLE_CONFIG[instrument].rootMidi;
  const now = ctx.currentTime + 0.02;

  intervals.forEach((interval) => {
    const targetMidi = rootMidi + interval;
    const playbackRate = Math.pow(2, (targetMidi - base) / 12);
<<<<<<< ours
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
=======
    scheduleVoice(ctx, buffer, instrument, playbackRate, now);
>>>>>>> theirs
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
export const playNote = async (midiNote: number, instrument: InstrumentKey) => {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  await fetchSamples();
  const buffer = sampleCache.get(instrument);
  if (!buffer) return;

  const base = SAMPLE_CONFIG[instrument].rootMidi;
  const playbackRate = Math.pow(2, (midiNote - base) / 12);
  const now = ctx.currentTime + 0.01;

  const { source, gain } = createVoice(ctx, buffer, playbackRate, instrument);
  source.start(now);
  source.stop(now + 4);
  source.onended = () => {
    gain.disconnect();
  };
};
