import React, { useMemo, useState } from "react";
import { Piano, Guitar, Music2, ChevronRight } from "lucide-react";
import type { Genre, ProgressionChord } from "./types/codex";

interface InstrumentVisualizerProps {
  genre: Genre;
  chords?: ProgressionChord[];
}

// --- chord shape database ---

const CHORD_SHAPES = {
  Maj7: {
    pianoIntervals: [0, 4, 7, 11],
    guitarFrets: [-1, 3, 2, 0, 0, 0], // example Cmaj7-ish voicing
    ukeFrets: [0, 0, 0, 2],
  },
  min7: {
    pianoIntervals: [0, 3, 7, 10],
    guitarFrets: [-1, 1, 3, 1, 3, 1], // Dm7 shape-ish
    ukeFrets: [2, 0, 1, 1],
  },
  Dom7: {
    pianoIntervals: [0, 4, 7, 10],
    guitarFrets: [3, 2, 0, 0, 0, 1], // G7 style
    ukeFrets: [0, 2, 1, 2],
  },
  Dom9: {
    pianoIntervals: [0, 4, 7, 10, 14],
    guitarFrets: [3, 2, 0, 2, 3, 0], // G9-ish
    ukeFrets: [0, 2, 1, 2],
  },
  min9: {
    pianoIntervals: [0, 3, 7, 10, 14],
    guitarFrets: [1, 3, 1, 1, 1, 1], // Fm9 type grip
    ukeFrets: [0, 2, 0, 2],
  },
  "6/9": {
    pianoIntervals: [0, 4, 7, 9, 14],
    guitarFrets: [-1, 3, 2, 2, 3, 3], // C6/9-ish
    ukeFrets: [0, 2, 2, 2],
  },
  m7b5: {
    pianoIntervals: [0, 3, 6, 10],
    guitarFrets: [1, 2, 1, 2, 1, 1], // Bm7b5 type
    ukeFrets: [1, 1, 0, 1],
  },
  dim7: {
    pianoIntervals: [0, 3, 6, 9],
    guitarFrets: [-1, 1, 2, 0, 2, 0], // diminished shape
    ukeFrets: [2, 3, 2, 3],
  },
  Sus4: {
    pianoIntervals: [0, 5, 7],
    guitarFrets: [3, 3, 5, 5, 3, 3],
    ukeFrets: [0, 2, 3, 3],
  },
  Maj6: {
    pianoIntervals: [0, 4, 7, 9],
    guitarFrets: [-1, 3, 2, 2, 3, -1],
    ukeFrets: [2, 2, 1, 2],
  },
  "11th": {
    pianoIntervals: [0, 7, 10, 14, 17],
    guitarFrets: [-1, 3, 3, 3, 3, 3],
    ukeFrets: [0, 0, 1, 0],
  },
} as const;

type ChordShapeKey = keyof typeof CHORD_SHAPES;

// --- helpers to fall back when no detailed progressionChords ---

const splitProgression = (progression: string): string[] =>
  progression
    .split(/[-–→>/]/)
    .map(p => p.trim())
    .filter(Boolean);

const guessShapeFromToken = (token: string): ChordShapeKey => {
  const normalized = token.toLowerCase();

  if (/m7b5|ø/.test(normalized)) return "m7b5";
  if (/dim|°/.test(normalized)) return "dim7";
  if (/sus/.test(normalized)) return "Sus4";
  if (/6\/9/.test(normalized)) return "6/9";
  if (/11/.test(normalized)) return "11th";
  if (/9/.test(normalized)) {
    return /m|min/.test(normalized) || /ii|iii|vi/.test(normalized)
      ? "min9"
      : "Dom9";
  }
  if (/v7/.test(normalized)) return "Dom7";
  if (/ii|iii|iv|vi/.test(normalized)) return "min7";
  return /v/.test(normalized) ? "Dom7" : "Maj7";
};

export const deriveProgressionChords = (
  genre: Genre
): ProgressionChord[] => {
  if (genre.progressionChords && genre.progressionChords.length > 0) {
    return genre.progressionChords;
  }

  const pieces = splitProgression(genre.progression);

  return pieces.map((piece, idx) => {
    const shape = guessShapeFromToken(piece);
    const degree = piece.toUpperCase();

    return {
      degree,
      symbol: piece,
      shape,
      note:
        idx === 0
          ? "Fallback from raw progression string — add progressionChords to this genre in App.tsx for richer detail."
          : "Auto-derived from progression text.",
    };
  });
};

// --- visual subcomponents ---

// Piano: one-octave keyboard diagram
const KeyboardDiagram: React.FC<{ intervals: readonly number[] }> = ({ intervals }) => {
  const active = useMemo(
    () => intervals.map(v => ((v % 12) + 12) % 12),
    [intervals]
  );

  const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
  const blackMap = [
    { note: 1, between: 0 }, // C# between C(0) & D(2)
    { note: 3, between: 1 }, // D# between D & E
    { note: 6, between: 3 }, // F#
    { note: 8, between: 4 }, // G#
    { note: 10, between: 5 }, // A#
  ];

  return (
    <div className="relative w-full max-w-xs mx-auto h-24 select-none">
      {/* White keys */}
      <div className="absolute inset-0 flex">
        {whiteNotes.map((note) => {
          const isActive = active.includes(note);
          return (
            <div
              key={note}
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
            ((between + 1) / (whiteNotes.length)) * 100 - 100 / (whiteNotes.length * 4);
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

// 6-string guitar fretboard (4-fret window)
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
            {/* Nut markers */}
            <div className="w-5 flex justify-center items-center">
              {fret === -1 && <span className="text-rose-400">X</span>}
              {fret === 0 && <span className="text-slate-200">O</span>}
            </div>
            {/* Fret grid */}
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

// 4-string uke fretboard (4-fret window)
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

// --- main visualizer ---

export const InstrumentVisualizer: React.FC<InstrumentVisualizerProps> = ({
  genre,
  chords: providedChords,
}) => {
  const chords: ProgressionChord[] = useMemo(
    () => providedChords ?? deriveProgressionChords(genre),
    [genre, providedChords]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const active = chords[activeIndex] ?? chords[0];

  const shapeKey: ChordShapeKey =
    (active?.shape as ChordShapeKey) ||
    (genre.visual_chord as ChordShapeKey) ||
    "Maj7";

  const shape = CHORD_SHAPES[shapeKey];

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Piano className="h-5 w-5 text-emerald-400" />
        Progression &amp; Voicing Map
      </h2>

      {/* Flow of degrees */}
      <div className="mb-4 flex flex-wrap gap-2 items-center text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wide text-slate-500">Flow:</span>
        {chords.map((chord, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`
              px-2 py-1 rounded-md border flex items-center gap-1 transition-colors
              ${
                idx === activeIndex
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-100"
                  : "bg-slate-900 border-slate-700 hover:border-slate-500 hover:text-slate-100"
              }
            `}
          >
            <span>{chord.degree}</span>
            <span className="text-[10px] text-slate-500">({chord.symbol})</span>
            {idx < chords.length - 1 && (
              <ChevronRight className="h-3 w-3 text-slate-500" />
            )}
          </button>
        ))}
      </div>

      {/* Active chord explanation */}
      <div className="mb-4 bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs md:text-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-slate-100">
            {active.degree} •{" "}
            <span className="text-emerald-300">{active.symbol}</span>{" "}
            <span className="text-slate-500">[{shapeKey}]</span>
          </div>
        </div>
        <p className="text-slate-400 leading-relaxed">{active.note}</p>
      </div>

      {/* Instrument visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Piano */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 text-sm">
            <Piano className="h-4 w-4 text-emerald-400" />
            Piano voicing
          </div>
          <KeyboardDiagram intervals={shape.pianoIntervals} />
          <p className="text-[11px] text-slate-400 mt-1">
            Intervals from the root:{" "}
            <span className="font-mono">
              {shape.pianoIntervals.join(", ")} semitones
            </span>
          </p>
        </div>

        {/* Guitar */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 text-sm">
            <Guitar className="h-4 w-4 text-amber-300" />
            Guitar shape
          </div>
          <GuitarFretboard frets={shape.guitarFrets} />
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="font-mono">X</span> = muted,{" "}
            <span className="font-mono">O</span> = open string. Dots show
            suggested grip.
          </p>
        </div>

        {/* Ukulele */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 text-sm">
            <Music2 className="h-4 w-4 text-pink-300" />
            Ukulele shape
          </div>
          <UkeFretboard frets={shape.ukeFrets} />
          <p className="text-[11px] text-slate-400 mt-1">
            Tuned to <span className="font-mono">G–C–E–A</span>. Use this as a
            starting voicing and adjust for comfort.
          </p>
        </div>
      </div>
    </section>
  );
};
