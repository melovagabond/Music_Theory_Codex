import React, { useState } from "react";
import { Piano, Guitar, Music } from "lucide-react";
import type { Genre, ProgressionChord } from "./App";

/* ---------- THEORY MAPPINGS ---------- */

const NOTE_PC: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

type ChordShapeName =
  | "Maj7"
  | "min7"
  | "Dom7"
  | "Dom9"
  | "min9"
  | "6/9"
  | "m7b5"
  | "dim7"
  | "Sus4"
  | "Maj6"
  | "11th";

interface ChordShape {
  pianoIntervals: number[]; // intervals from root, in semitones
  guitarFrets: number[]; // 6-string EADGBE, -1 = mute, 0 = open
  ukeFrets: number[]; // 4-string GCEA, -1 = mute, 0 = open
}

// Basic voicing dictionary. You can refine these with your preferred grips.
const CHORD_SHAPES: Record<ChordShapeName, ChordShape> = {
  Maj7: {
    pianoIntervals: [0, 4, 7, 11],
    guitarFrets: [-1, 3, 2, 0, 0, 0], // E-shape Maj7 (Cmaj7 at 3rd fret)
    ukeFrets: [0, 0, 0, 2], // simple movable maj7
  },
  min7: {
    pianoIntervals: [0, 3, 7, 10],
    guitarFrets: [-1, 3, 1, 3, 1, 3], // generic jazzy min7
    ukeFrets: [0, 3, 3, 3],
  },
  Dom7: {
    pianoIntervals: [0, 4, 7, 10],
    guitarFrets: [-1, 3, 2, 0, 0, 0], // C7-type voicing
    ukeFrets: [0, 0, 1, 0],
  },
  Dom9: {
    pianoIntervals: [0, 4, 7, 10, 14],
    guitarFrets: [-1, 3, 2, 3, 3, 3], // C9 grip
    ukeFrets: [0, 2, 1, 2],
  },
  min9: {
    pianoIntervals: [0, 3, 7, 10, 14],
    guitarFrets: [-1, 3, 1, 3, 3, 3],
    ukeFrets: [0, 2, 0, 2],
  },
  "6/9": {
    pianoIntervals: [0, 4, 7, 9, 14],
    guitarFrets: [-1, 3, 2, 2, 3, -1],
    ukeFrets: [0, 2, 2, 2],
  },
  m7b5: {
    pianoIntervals: [0, 3, 6, 10],
    guitarFrets: [-1, 3, 4, 3, 4, -1],
    ukeFrets: [0, 1, 0, 1],
  },
  dim7: {
    pianoIntervals: [0, 3, 6, 9],
    guitarFrets: [-1, 3, 4, 2, 4, -1],
    ukeFrets: [2, 3, 2, 3],
  },
  Sus4: {
    pianoIntervals: [0, 5, 7],
    guitarFrets: [3, 5, 5, 5, 3, 3],
    ukeFrets: [0, 2, 3, 3],
  },
  Maj6: {
    pianoIntervals: [0, 4, 7, 9],
    guitarFrets: [-1, 3, 2, 2, 3, -1],
    ukeFrets: [0, 2, 0, 2],
  },
  "11th": {
    pianoIntervals: [0, 7, 10, 14, 17],
    guitarFrets: [-1, 3, 3, 3, 3, 3],
    ukeFrets: [0, 0, 1, 0],
  },
};

function parseRoot(symbol: string): string | null {
  if (!symbol) return null;
  const first = symbol[0].toUpperCase();
  const second = symbol[1];

  if (second === "#" || second === "b") {
    return (first + second) as string;
  }
  return first;
}

function getPitchClasses(symbol: string, shape: ChordShapeName): number[] {
  const root = parseRoot(symbol);
  if (!root || !(root in NOTE_PC)) return [];
  const rootPc = NOTE_PC[root];
  const shapeData = CHORD_SHAPES[shape];
  if (!shapeData) return [];
  return shapeData.pianoIntervals.map((i) => (rootPc + i) % 12);
}

interface PianoKeyboardProps {
  pitchClasses: number[];
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ pitchClasses }) => {
  // one visual octave, C–B
  const keys = [
    { pc: 0, isBlack: false }, // C
    { pc: 1, isBlack: true }, // C#
    { pc: 2, isBlack: false }, // D
    { pc: 3, isBlack: true }, // D#
    { pc: 4, isBlack: false }, // E
    { pc: 5, isBlack: false }, // F
    { pc: 6, isBlack: true }, // F#
    { pc: 7, isBlack: false }, // G
    { pc: 8, isBlack: true }, // G#
    { pc: 9, isBlack: false }, // A
    { pc: 10, isBlack: true }, // A#
    { pc: 11, isBlack: false }, // B
  ];

  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  return (
    <div className="relative w-full max-w-xs mx-auto h-24 select-none">
      {/* White keys */}
      <div className="absolute inset-0 flex">
        {whiteKeys.map((k, idx) => {
          const isActive = pitchClasses.includes(k.pc);
          return (
            <div
              key={`w-${idx}`}
              className={`flex-1 border border-slate-500/70 rounded-b-md mx-[1px] transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-300 shadow-[0_0_12px_rgba(129,140,248,0.8)]"
                  : "bg-slate-50"
              }`}
            />
          );
        })}
      </div>
      {/* Black keys */}
      <div className="absolute inset-0 flex justify-between px-[8%] pointer-events-none">
        {blackKeys.map((k, idx) => {
          const isActive = pitchClasses.includes(k.pc);
          return (
            <div
              key={`b-${idx}`}
              className="relative flex-1 flex justify-center"
            >
              <div
                className={`w-[55%] h-[60%] rounded-b-md mt-0 shadow-md transition-colors duration-200 ${
                  isActive ? "bg-indigo-700" : "bg-slate-900"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface FretboardProps {
  frets: number[]; // length 6 for guitar or 4 for uke
  tuningLabel: string;
}

const Fretboard: React.FC<FretboardProps> = ({ frets, tuningLabel }) => {
  const numStrings = frets.length;
  const numFrets = 5;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between text-[9px] text-slate-400 mb-1 px-1">
        <span>{tuningLabel}</span>
        <span>frets 0–4</span>
      </div>
      <div className="relative border border-slate-600 rounded-md bg-slate-900/80 px-2 py-2">
        {/* Strings (vertical) */}
        <div className="absolute inset-y-2 left-2 right-2 flex justify-between">
          {Array.from({ length: numStrings }).map((_, i) => (
            <div
              key={i}
              className="w-[1px] bg-slate-500/70 rounded-full"
            ></div>
          ))}
        </div>
        {/* Frets (horizontal) */}
        <div className="flex flex-col gap-1 relative z-10">
          {Array.from({ length: numFrets }).map((_, fretIdx) => (
            <div
              key={fretIdx}
              className="relative h-6 border-b border-slate-700 last:border-b-0"
            >
              {/* markers */}
              {frets.map((f, stringIdx) => {
                if (f !== fretIdx) return null;
                return (
                  <div
                    key={`${stringIdx}-${fretIdx}`}
                    className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-md -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${
                        (stringIdx / (numStrings - 1 || 1)) * 100
                      }%`,
                      top: "50%",
                    }}
                  />
                );
              })}
              {/* fret number */}
              <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">
                {fretIdx}
              </span>
            </div>
          ))}
        </div>
        {/* Open / muted indicators */}
        <div className="absolute -top-4 left-2 right-2 flex justify-between">
          {frets.map((f, i) => (
            <div key={i} className="w-3 text-center">
              {f === 0 && (
                <div className="w-3 h-3 rounded-full border border-slate-200 mx-auto"></div>
              )}
              {f === -1 && (
                <span className="text-[9px] font-bold text-red-400">X</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- MAIN VISUALIZER ---------- */

interface InstrumentVisualizerProps {
  genre: Genre;
}

type Instrument = "piano" | "guitar" | "ukulele";

export const InstrumentVisualizer: React.FC<InstrumentVisualizerProps> = ({
  genre,
}) => {
  const [instrument, setInstrument] = useState<Instrument>("piano");

  const chords: ProgressionChord[] =
    genre.progressionChords && genre.progressionChords.length > 0
      ? genre.progressionChords
      : [
          {
            degree: "I",
            symbol: genre.key?.split(" ")[0] ?? "C",
            shape: genre.visual_chord as ChordShapeName,
            note: "Basic chord visual – add more detailed progressionChords to this genre for richer analysis.",
          },
        ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          {instrument === "piano" && <Piano className="h-5 w-5 text-emerald-400" />}
          {instrument === "guitar" && (
            <Guitar className="h-5 w-5 text-emerald-400" />
          )}
          {instrument === "ukulele" && (
            <Music className="h-5 w-5 text-emerald-400" />
          )}
          Chord Progression Visualizer
        </h2>
        <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 p-1 text-[11px]">
          <button
            onClick={() => setInstrument("piano")}
            className={`px-2.5 py-1 rounded-full ${
              instrument === "piano"
                ? "bg-emerald-500 text-slate-900 font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Piano
          </button>
          <button
            onClick={() => setInstrument("guitar")}
            className={`px-2.5 py-1 rounded-full ${
              instrument === "guitar"
                ? "bg-emerald-500 text-slate-900 font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Guitar
          </button>
          <button
            onClick={() => setInstrument("ukulele")}
            className={`px-2.5 py-1 rounded-full ${
              instrument === "ukulele"
                ? "bg-emerald-500 text-slate-900 font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Uke
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-4">
        {chords.length === 0 ? (
          <p className="text-xs text-slate-400">
            No chord data defined for this genre yet.
          </p>
        ) : (
          <div className="flex gap-3 text-[11px] text-slate-400 mb-3">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
              Tip: click through the chords in order – this is the actual
              progression for this style.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {chords.map((chord, idx) => {
            const shapeName = chord.shape as ChordShapeName;
            const shape = CHORD_SHAPES[shapeName];
            if (!shape) {
              return (
                <div
                  key={`${chord.symbol}-${idx}`}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-3"
                >
                  <div className="text-xs text-slate-500">
                    No visual mapping yet for shape{" "}
                    <span className="font-mono font-semibold">
                      {chord.shape}
                    </span>
                    .
                  </div>
                </div>
              );
            }

            const pitchClasses = getPitchClasses(chord.symbol, shapeName);

            let diagram: React.ReactNode = null;
            if (instrument === "piano") {
              diagram = <PianoKeyboard pitchClasses={pitchClasses} />;
            } else if (instrument === "guitar") {
              diagram = (
                <Fretboard
                  frets={shape.guitarFrets}
                  tuningLabel="E A D G B E"
                />
              );
            } else {
              diagram = (
                <Fretboard frets={shape.ukeFrets} tuningLabel="G C E A" />
              );
            }

            return (
              <div
                key={`${chord.symbol}-${idx}`}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      {chord.degree}
                    </div>
                    <div className="text-lg font-bold text-emerald-300 font-mono">
                      {chord.symbol}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                    {chord.shape}
                  </span>
                </div>
                {diagram}
                <p className="text-[11px] text-slate-400 leading-snug">
                  {chord.note}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-[10px] text-slate-500">
          These diagrams are{" "}
          <span className="text-slate-200">conceptual</span> — adjust exact
          voicings to sit better in your track, but the <em>function</em> of
          each chord stays the same.
        </div>
      </div>
    </section>
  );
};
