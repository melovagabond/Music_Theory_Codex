import React, { useState, useMemo } from "react";
import {
  Disc,
  Info,
  Piano,
  Guitar,
  Music2,
  ChevronRight,
} from "lucide-react";

// --- TYPES & DATA ---

interface CircleKey {
  name: string;          // C, G, D...
  relativeMinor: string; // Am, Em...
  accidentals: string;   // 0, 1♯, 2♭...
}

const CIRCLE_KEYS: CircleKey[] = [
  { name: "C",  relativeMinor: "Am",  accidentals: "0"   },
  { name: "G",  relativeMinor: "Em",  accidentals: "1♯"  },
  { name: "D",  relativeMinor: "Bm",  accidentals: "2♯"  },
  { name: "A",  relativeMinor: "F♯m", accidentals: "3♯"  },
  { name: "E",  relativeMinor: "C♯m", accidentals: "4♯"  },
  { name: "B",  relativeMinor: "G♯m", accidentals: "5♯"  },
  { name: "F♯", relativeMinor: "D♯m", accidentals: "6♯"  },
  { name: "D♭", relativeMinor: "B♭m", accidentals: "5♭"  },
  { name: "A♭", relativeMinor: "Fm",  accidentals: "4♭"  },
  { name: "E♭", relativeMinor: "Cm",  accidentals: "3♭"  },
  { name: "B♭", relativeMinor: "Gm",  accidentals: "2♭"  },
  { name: "F",  relativeMinor: "Dm",  accidentals: "1♭"  },
];

// --- CHORD SHAPE DB (same style as InstrumentVisualizer) ---

const CHORD_SHAPES = {
  Maj7: {
    pianoIntervals: [0, 4, 7, 11],
    guitarFrets: [-1, 3, 2, 0, 0, 0], // generic maj7 voicing
    ukeFrets: [0, 0, 0, 2],
  },
  min7: {
    pianoIntervals: [0, 3, 7, 10],
    guitarFrets: [-1, 1, 3, 1, 3, 1],
    ukeFrets: [2, 0, 1, 1],
  },
  Dom7: {
    pianoIntervals: [0, 4, 7, 10],
    guitarFrets: [3, 2, 0, 0, 0, 1],
    ukeFrets: [0, 2, 1, 2],
  },
  "6/9": {
    pianoIntervals: [0, 4, 7, 9, 14],
    guitarFrets: [-1, 3, 2, 2, 3, 3],
    ukeFrets: [0, 2, 2, 2],
  },
  min9: {
    pianoIntervals: [0, 3, 7, 10, 14],
    guitarFrets: [1, 3, 1, 1, 1, 1],
    ukeFrets: [0, 2, 0, 2],
  },
  "11th": {
    pianoIntervals: [0, 7, 10, 14, 17],
    guitarFrets: [-1, 3, 3, 3, 3, 3],
    ukeFrets: [0, 0, 1, 0],
  },
} as const;

type ChordShapeKey = keyof typeof CHORD_SHAPES;

interface CircleChord {
  degree: string;      // I, IV, V
  symbol: string;      // Imaj7, IVmaj7, V7
  shape: ChordShapeKey;
  note: string;        // explanation text
}

// Functional snapshot for the active major key
const getMajorFunctionalChords = (key: CircleKey): CircleChord[] => [
  {
    degree: "I",
    symbol: "Imaj7",
    shape: "Maj7",
    note: `Tonic chord of ${key.name} major. This is "home" – start and end here to feel resolved.`,
  },
  {
    degree: "IV",
    symbol: "IVmaj7",
    shape: "Maj7",
    note: `Subdominant in ${key.name} major. Moves you away from home and sets up the V chord.`,
  },
  {
    degree: "V",
    symbol: "V7",
    shape: "Dom7",
    note: `Dominant of ${key.name} major. Wants to resolve back to I. Classic tension–release.`,
  },
];

const getMinorFunctionalChords = (key: CircleKey): CircleChord[] => [
  {
    degree: "i",
    symbol: "i7",
    shape: "min7",
    note: `Tonic of ${key.relativeMinor}. Same pitch collection as ${key.name} major, but centered on the minor root.`,
  },
  {
    degree: "iv",
    symbol: "iv7",
    shape: "min7",
    note: `Subdominant in the relative minor. Great for deepening the melancholy without leaving the key.`,
  },
  {
    degree: "V",
    symbol: "V7",
    shape: "Dom7",
    note: `Dominant that often borrows from harmonic minor. Strong pull back to i, even though the notes bend the shared scale a bit.`,
  },
];

// --- VISUAL SUBCOMPONENTS (piano + fretboards) ---

const KeyboardDiagram: React.FC<{ intervals: readonly number[] }> = ({ intervals }) => {
  const active = useMemo(
    () => intervals.map(v => ((v % 12) + 12) % 12),
    [intervals]
  );

  const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
  const blackMap = [
    { note: 1, between: 0 },
    { note: 3, between: 1 },
    { note: 6, between: 3 },
    { note: 8, between: 4 },
    { note: 10, between: 5 },
  ];

  return (
    <div className="relative w-full max-w-xs mx-auto h-24 select-none">
      {/* White keys */}
      <div className="absolute inset-0 flex">
        {whiteNotes.map((note, idx) => {
          const isActive = active.includes(note);
          return (
            <div
              key={idx}
              className={`flex-1 border border-slate-500/60 rounded-b-md mx-[1px] transition-colors ${
                isActive
                  ? "bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                  : "bg-white"
              }`}
            />
          );
        })}
      </div>

      {/* Black keys */}
      <div className="absolute inset-0 flex pointer-events-none">
        {blackMap.map(({ note, between }, idx) => {
          const isActive = active.includes(note);
          const left =
            ((between + 1) / whiteNotes.length) * 100 -
            100 / (whiteNotes.length * 4);
          return (
            <div
              key={idx}
              className="absolute top-0 h-[60%] w-[10%]"
              style={{ left: `${left}%` }}
            >
              <div
                className={`w-full h-full rounded-b-md border border-slate-900 transition-colors ${
                  isActive
                    ? "bg-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.9)]"
                    : "bg-slate-900"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GuitarFretboard: React.FC<{ frets: readonly number[] }> = ({ frets }) => {
  const numericFrets = frets.filter(f => f > 0);
  const minFret = numericFrets.length ? Math.min(...numericFrets) : 1;
  const startFret = Math.max(1, minFret);
  const endFret = startFret + 3;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex flex-col gap-1">
        {frets.map((fret, stringIndex) => (
          <div
            key={stringIndex}
            className="flex items-center h-6 text-[11px] text-slate-400"
          >
            <div className="w-5 flex justify-center items-center">
              {fret === -1 && <span className="text-rose-400">X</span>}
              {fret === 0 && <span className="text-slate-200">O</span>}
            </div>
            <div className="flex-1 flex">
              {Array.from(
                { length: endFret - startFret + 1 },
                (_, i) => startFret + i
              ).map(fretNumber => {
                const isActive = fret === fretNumber;
                return (
                  <div
                    key={fretNumber}
                    className="flex-1 border-b border-slate-600 relative"
                  >
                    {stringIndex === 0 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-slate-500">
                        {fretNumber}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UkeFretboard: React.FC<{ frets: readonly number[] }> = ({ frets }) => {
  const numericFrets = frets.filter(f => f > 0);
  const minFret = numericFrets.length ? Math.min(...numericFrets) : 1;
  const startFret = Math.max(1, minFret);
  const endFret = startFret + 3;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex flex-col gap-1">
        {frets.map((fret, stringIndex) => (
          <div
            key={stringIndex}
            className="flex items-center h-6 text-[11px] text-slate-400"
          >
            <div className="w-5 flex justify-center items-center">
              {fret === -1 && <span className="text-rose-400">X</span>}
              {fret === 0 && <span className="text-slate-200">O</span>}
            </div>
            <div className="flex-1 flex">
              {Array.from(
                { length: endFret - startFret + 1 },
                (_, i) => startFret + i
              ).map(fretNumber => {
                const isActive = fret === fretNumber;
                return (
                  <div
                    key={fretNumber}
                    className="flex-1 border-b border-slate-600 relative"
                  >
                    {stringIndex === 0 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-slate-500">
                        {fretNumber}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-3 h-3 rounded-full bg-emerald-300 shadow-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const CircleOfFifthsTool: React.FC = () => {
  const [activeKey, setActiveKey] = useState<CircleKey>(CIRCLE_KEYS[0]);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"major" | "minor">("major");

  const chords: CircleChord[] = useMemo(
    () =>
      viewMode === "major"
        ? getMajorFunctionalChords(activeKey)
        : getMinorFunctionalChords(activeKey),
    [activeKey, viewMode]
  );

  const activeChord = chords[activeChordIndex] ?? chords[0];
  const shape = CHORD_SHAPES[activeChord.shape];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="mb-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 mb-3">
          <span>codex</span>
          <span className="opacity-50">/</span>
          <span>circle-of-fifths</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 flex items-center gap-3">
          <Disc className="h-7 w-7 text-amber-400" />
          Circle of Fifths Lab
        </h1>
        <p className="text-slate-400 max-w-3xl text-sm md:text-base leading-relaxed">
          The Circle of Fifths is your{" "}
          <span className="text-slate-200">map of key relationships</span>.  
          Moving clockwise adds sharps (brighter, more tension); counter-clockwise adds flats
          (warmer, darker). Adjacent keys share most of their notes, which is why they’re perfect
          for <span className="text-indigo-300">modulations, secondary dominants, and borrowed chords</span>.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* BIGGER WHEEL */}
        <div className="flex justify-center">
          <div className="relative w-80 h-80 md:w-[26rem] md:h-[26rem] rounded-full bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center">
            <div className="absolute inset-6 rounded-full bg-slate-950/80 border border-slate-800" />

            {/* Active center badge */}
            <div className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/80 to-pink-500/80 flex flex-col items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.5)]">
              <div className="text-[11px] font-mono uppercase mb-1 text-slate-900/80">
                Active Key
              </div>
              <div className="text-3xl font-black tracking-tight">
                {activeKey.name}
              </div>
              <div className="text-[11px] font-mono mt-1 text-slate-900/80">
                Rel: {activeKey.relativeMinor}
              </div>
            </div>

            {/* Major labels */}
            {CIRCLE_KEYS.map((key, index) => {
              const angleDeg = index * (360 / CIRCLE_KEYS.length);
              const isActive = key.name === activeKey.name;
              return (
                <button
                  key={key.name}
                  onClick={() => {
                    setActiveKey(key);
                    setActiveChordIndex(0);
                  }}
                  className={`
                    absolute left-1/2 top-1/2 origin-center 
                    -translate-x-1/2 -translate-y-1/2
                    text-xs font-mono px-2 py-1 rounded-full border
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-amber-400 text-slate-900 border-amber-200 shadow-lg scale-110"
                        : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-slate-500"
                    }
                  `}
                  style={{
                    transform: `rotate(${angleDeg}deg) translateY(-8.4rem) rotate(${-angleDeg}deg)`,
                  }}
                >
                  {key.name}
                </button>
              );
            })}

            {/* Minor ring labels */}
            {CIRCLE_KEYS.map((key, index) => {
              const angleDeg = index * (360 / CIRCLE_KEYS.length) + 15;
              const isActive = key.name === activeKey.name;
              return (
                <div
                  key={`${key.name}-minor`}
                  className={`
                    absolute left-1/2 top-1/2 origin-center 
                    -translate-x-1/2 -translate-y-1/2
                    text-[9px] font-mono px-1.5 py-0.5 rounded-full
                    ${
                      isActive
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-900/70 text-slate-400"
                    }
                  `}
                  style={{
                    transform: `rotate(${angleDeg}deg) translateY(-5rem) rotate(${-angleDeg}deg)`,
                  }}
                >
                  {key.relativeMinor}
                </div>
              );
            })}
          </div>
        </div>

        {/* THEORY + CHORD LAB */}
        <div className="space-y-6">
          <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Info className="h-4 w-4 text-indigo-400" />
              How to actually use this thing
            </div>
            <ul className="text-sm text-slate-300 space-y-2 leading-relaxed list-disc pl-5">
              <li>
                <span className="font-semibold text-slate-100">
                  Pick a home key
                </span>{" "}
                (center of gravity) — that’s your song’s default key. Right now
                you’re in{" "}
                <span className="text-amber-300 font-mono">
                  {activeKey.name} major / {activeKey.relativeMinor} minor
                </span>
                .
              </li>
              <li>
                <span className="font-semibold text-slate-100">
                  Move to neighbors
                </span>{" "}
                (one step left/right) for friendly modulations and borrowed
                chords with minimal note changes.
              </li>
              <li>
                Use the{" "}
                <span className="text-indigo-300">relative minor</span> to flip
                the emotional tone without changing the pitch set.
              </li>
              <li>
                Opposite keys on the circle feel like{" "}
                <span className="text-rose-300">hard cuts</span> – perfect for
                big dramatic moments or “second half of the song goes wild.”
              </li>
            </ul>
          </section>

          {/* CHORD VISUALS FOR ACTIVE KEY */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Piano className="h-4 w-4 text-emerald-400" />
                Functional chord pack in this key
              </h2>
              <div className="flex text-[11px] bg-slate-950/80 rounded-full border border-slate-700 overflow-hidden">
                <button
                  onClick={() => {
                    setViewMode("major");
                    setActiveChordIndex(0);
                  }}
                  className={`px-3 py-1 ${
                    viewMode === "major"
                      ? "bg-emerald-500/30 text-emerald-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {activeKey.name} Major
                </button>
                <button
                  onClick={() => {
                    setViewMode("minor");
                    setActiveChordIndex(0);
                  }}
                  className={`px-3 py-1 ${
                    viewMode === "minor"
                      ? "bg-indigo-500/30 text-indigo-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {activeKey.relativeMinor} Minor
                </button>
              </div>
            </div>

            {/* Flow buttons */}
            <div className="flex flex-wrap gap-2 items-center text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wide text-slate-500">
                Flow:
              </span>
              {chords.map((chord, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChordIndex(idx)}
                  className={`px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
                    idx === activeChordIndex
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-100"
                      : "bg-slate-900 border-slate-700 hover:border-slate-500 hover:text-slate-100"
                  }`}
                >
                  <span>{chord.degree}</span>
                  <span className="text-[10px] text-slate-500">
                    ({chord.symbol})
                  </span>
                  {idx < chords.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Active chord explanation */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs md:text-sm mb-2">
              <div className="font-mono text-slate-100 mb-1">
                {viewMode === "major" ? (
                  <>
                    {activeKey.name} major •{" "}
                    <span className="text-emerald-300">
                      {activeChord.degree} ({activeChord.symbol})
                    </span>
                  </>
                ) : (
                  <>
                    {activeKey.relativeMinor} minor •{" "}
                    <span className="text-indigo-300">
                      {activeChord.degree} ({activeChord.symbol})
                    </span>
                  </>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed">
                {activeChord.note}
              </p>
            </div>

            {/* Instrument visuals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Piano */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-200 text-sm">
                  <Piano className="h-4 w-4 text-emerald-400" />
                  Piano voicing
                </div>
                <KeyboardDiagram intervals={shape.pianoIntervals} />
                <p className="text-[11px] text-slate-400 mt-1">
                  Intervals from root:{" "}
                  <span className="font-mono">
                    {shape.pianoIntervals.join(", ")} semitones
                  </span>
                  . Use this as a shell and add 9/13 on top.
                </p>
              </div>

              {/* Guitar */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-200 text-sm">
                  <Guitar className="h-4 w-4 text-amber-300" />
                  Guitar shape
                </div>
                <GuitarFretboard frets={shape.guitarFrets} />
                <p className="text-[11px] text-slate-400 mt-1">
                  <span className="font-mono">X</span> = muted,{" "}
                  <span className="font-mono">O</span> = open string. Dots show
                  a compact grip usable in most keys via barre.
                </p>
              </div>

              {/* Ukulele */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-200 text-sm">
                  <Music2 className="h-4 w-4 text-pink-300" />
                  Ukulele shape
                </div>
                <UkeFretboard frets={shape.ukeFrets} />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tuned to <span className="font-mono">G–C–E–A</span>. Treat
                  these as movable shapes when you start exploring transposition.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
