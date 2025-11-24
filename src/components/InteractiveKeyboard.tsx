import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InstrumentKey, playNote } from "../audio/sampler";

export type NoteSource = "pointer" | "keyboard";

export type NoteMetadata = { source: NoteSource; label: string };

type KeyboardKey = {
  key: string;
  midi: number;
  note: string;
  isSharp: boolean;
};

const COMPUTER_KEY_BINDINGS = [
  "z",
  "s",
  "x",
  "d",
  "c",
  "v",
  "g",
  "b",
  "h",
  "n",
  "j",
  "m",
  "q",
  "2",
  "w",
  "3",
  "e",
  "r",
  "5",
  "t",
  "6",
  "y",
  "7",
  "u",
];

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const buildKeys = (startMidi: number, octaves: number): KeyboardKey[] =>
  Array.from({ length: octaves * 12 }, (_, idx) => {
    const midi = startMidi + idx;
    const noteName = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    const note = `${noteName}${octave}`;

    return {
      key: COMPUTER_KEY_BINDINGS[idx] ?? "",
      midi,
      note,
      isSharp: noteName.includes("#"),
    };
  });

interface InteractiveKeyboardProps {
  instrument: InstrumentKey;
  muted?: boolean;
  startMidi?: number;
  octaves?: number;
  onNoteStart?: (midi: number, meta: NoteMetadata) => void;
  onNoteEnd?: (midi: number, meta: NoteMetadata) => void;
}

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  instrument,
  muted = false,
  startMidi = 60,
  octaves = 2,
  onNoteStart,
  onNoteEnd,
}) => {
  const keys = useMemo(() => buildKeys(startMidi, octaves), [octaves, startMidi]);

  const whiteKeys = useMemo(() => keys.filter((key) => !key.isSharp), [keys]);
  const blackKeys = useMemo(() => keys.filter((key) => key.isSharp), [keys]);

  const keyToMidi = useMemo(
    () =>
      new Map<string, KeyboardKey>(
        keys
          .filter((key) => key.key)
          .map((key) => [key.key.toLowerCase(), key])
      ),
    [keys]
  );

  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const triggerNote = useCallback(
    (key: KeyboardKey, source: NoteSource) => {
      setActiveNotes((current) => new Set(current).add(key.midi));
      onNoteStart?.(key.midi, { source, label: key.note });
      if (!muted) {
        void playNote(key.midi, instrument);
      }
    },
    [instrument, muted, onNoteStart]
  );

  const releaseNote = useCallback(
    (key: KeyboardKey, source: NoteSource) => {
      setActiveNotes((current) => {
        const next = new Set(current);
        next.delete(key.midi);
        return next;
      });
      onNoteEnd?.(key.midi, { source, label: key.note });
    },
    [onNoteEnd]
  );

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      const mapped = keyToMidi.get(event.key.toLowerCase());
      if (!mapped) return;
      if (event.repeat) return;
      event.preventDefault();
      event.stopPropagation();
      triggerNote(mapped, "keyboard");
    };

    const upHandler = (event: KeyboardEvent) => {
      const mapped = keyToMidi.get(event.key.toLowerCase());
      if (!mapped) return;
      event.preventDefault();
      event.stopPropagation();
      releaseNote(mapped, "keyboard");
    };

    window.addEventListener("keydown", downHandler, { capture: true });
    window.addEventListener("keyup", upHandler, { capture: true });

    return () => {
      window.removeEventListener("keydown", downHandler, { capture: true });
      window.removeEventListener("keyup", upHandler, { capture: true });
    };
  }, [keyToMidi, releaseNote, triggerNote]);

  const handlePointerDown = useCallback(
    (key: KeyboardKey) => {
      triggerNote(key, "pointer");
    },
    [triggerNote]
  );

  const handlePointerUp = useCallback(
    (key: KeyboardKey) => {
      releaseNote(key, "pointer");
    },
    [releaseNote]
  );

  const totalWhiteKeys = whiteKeys.length;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-40 select-none">
      <div className="absolute inset-0 flex">
        {whiteKeys.map((key) => {
          const isActive = activeNotes.has(key.midi);
          return (
            <button
              key={key.midi}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePointerDown(key);
              }}
              onPointerUp={() => handlePointerUp(key)}
              onPointerLeave={() => handlePointerUp(key)}
              className={`flex-1 border border-slate-500/60 rounded-b-md mx-[1px] transition-all relative ${
                isActive
                  ? "bg-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.8)]"
                  : "bg-white"
              }`}
            >
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">{key.note}</span>
                {key.key && (
                  <span className="ml-1 font-mono text-[9px] text-slate-400">
                    [{key.key.toUpperCase()}]
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="absolute inset-0">
        {blackKeys.map((key) => {
          const isActive = activeNotes.has(key.midi);
          const precedingWhiteIndex = whiteKeys.findIndex((w) => w.midi > key.midi) - 1;
          const clampedIndex = Math.max(precedingWhiteIndex, 0);
          const left =
            ((clampedIndex + 1) / totalWhiteKeys) * 100 -
            100 / (totalWhiteKeys * 3.8);

          return (
            <button
              key={key.midi}
              style={{ left: `${left}%` }}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePointerDown(key);
              }}
              onPointerUp={() => handlePointerUp(key)}
              onPointerLeave={() => handlePointerUp(key)}
              className={`absolute top-0 h-[65%] w-[7%] -translate-x-1/2 rounded-b-md border border-slate-900 transition-all ${
                isActive
                  ? "bg-emerald-700 shadow-[0_0_22px_rgba(16,185,129,0.9)]"
                  : "bg-slate-900"
              }`}
            >
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-200 font-mono">
                {key.key.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
