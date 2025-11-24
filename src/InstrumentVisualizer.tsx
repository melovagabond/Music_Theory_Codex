import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Piano,
  Guitar,
  Music2,
  ChevronRight,
  Keyboard,
  Download,
  Lightbulb,
  RadioReceiver,
  Power,
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
} from "lucide-react";
import type { Genre, ProgressionChord } from "./types/codex";
import { useMidiInput } from "./hooks/useMidiInput";
import { CHORD_SHAPES, ChordShapeKey } from "./data/chordShapes";
import {
  InstrumentKey,
  parseRootMidi,
  playChord,
  renderProgressionOffline,
  warmupSamples,
} from "./audio/sampler";
import { encodeAudioBufferToMp3 } from "./audio/encoder";
import {
  InteractiveKeyboard,
  NoteMetadata,
} from "./components/InteractiveKeyboard";

interface InstrumentVisualizerProps {
  genre: Genre;
  chords?: ProgressionChord[];
}

// --- chord shape database ---

const INSTRUMENT_OPTIONS: { value: InstrumentKey; label: string }[] = [
  { value: "piano", label: "Piano" },
  { value: "guitar", label: "Guitar" },
  { value: "ukulele", label: "Ukulele" },
  { value: "bass", label: "Bass" },
];

// Simple QWERTY mapping for quick chord stepping
const KEY_BINDINGS = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] as const;
type KeyBinding = (typeof KEY_BINDINGS)[number];

const varLen = (value: number): number[] => {
  const buffer: number[] = [];
  let val = value & 0x7f;
  while ((value >>= 7)) {
    val <<= 8;
    val |= (value & 0x7f) | 0x80;
  }
  while (true) {
    buffer.push(val & 0xff);
    if (val & 0x80) val >>= 8;
    else break;
  }
  return buffer;
};

const buildMidiFile = (progression: ProgressionChord[]): Uint8Array => {
  const division = 0x01e0; // 480 ticks per quarter note
  const tempo = 500000; // microseconds per quarter note (120 bpm)
  const trackData: number[] = [
    0x00,
    0xff,
    0x51,
    0x03,
    (tempo >> 16) & 0xff,
    (tempo >> 8) & 0xff,
    tempo & 0xff,
  ];

  progression.forEach((chord) => {
    const rootMidi = parseRootMidi(chord.symbol) ?? 60;
    const intervals =
      CHORD_SHAPES[chord.shape as ChordShapeKey]?.pianoIntervals ||
      CHORD_SHAPES.Maj7.pianoIntervals;
    const notes = intervals.map((interval) => rootMidi + interval);

    notes.forEach((note) => {
      trackData.push(...varLen(0));
      trackData.push(0x90, note, 100);
    });

    notes.forEach((note, idx) => {
      trackData.push(...varLen(idx === 0 ? division : 0));
      trackData.push(0x80, note, 64);
    });
  });

  trackData.push(0x00, 0xff, 0x2f, 0x00);

  const trackLength = trackData.length;
  const header = [
    0x4d,
    0x54,
    0x68,
    0x64,
    0x00,
    0x00,
    0x00,
    0x06,
    0x00,
    0x00,
    0x00,
    0x01,
    (division >> 8) & 0xff,
    division & 0xff,
  ];

  const trackHeader = [
    0x4d,
    0x54,
    0x72,
    0x6b,
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
  ];

  return new Uint8Array([...header, ...trackHeader, ...trackData]);
};

// --- helpers to fall back when no detailed progressionChords ---

const splitProgression = (progression: string): string[] =>
  progression
    .split(/[-–→>/]/)
    .map((p) => p.trim())
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

export const deriveProgressionChords = (genre: Genre): ProgressionChord[] => {
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
const KeyboardDiagram: React.FC<{ intervals: readonly number[] }> = ({
  intervals,
}) => {
  const active = useMemo(
    () => intervals.map((v) => ((v % 12) + 12) % 12),
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

// 6-string guitar fretboard (4-fret window)
const GuitarFretboard: React.FC<{ frets: readonly number[] }> = ({ frets }) => {
  const numericFrets = frets.filter((f) => f > 0);
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
              ).map((fretNumber) => {
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
  const numericFrets = frets.filter((f) => f > 0);
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
              ).map((fretNumber) => {
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
  const [pressedKey, setPressedKey] = useState<KeyBinding | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [midiFocusIndex, setMidiFocusIndex] = useState<number | null>(null);
  const [instrument, setInstrument] = useState<InstrumentKey>("piano");
  const [muted, setMuted] = useState(false);
  const [exportingMp3, setExportingMp3] = useState(false);
  const [mp3Error, setMp3Error] = useState<string | null>(null);
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);
  const active = chords[activeIndex] ?? chords[0];
  const midiNoteToIndexRef = useRef(new Map<number, number>());

  const resolveShapeKey = useCallback(
    (chord?: ProgressionChord): ChordShapeKey =>
      (chord?.shape as ChordShapeKey) ||
      (genre.visual_chord as ChordShapeKey) ||
      "Maj7",
    [genre.visual_chord]
  );

  const shapeKey: ChordShapeKey = resolveShapeKey(active);
  const shape = CHORD_SHAPES[shapeKey];

  const handleExportMidi = () => {
    const midi = buildMidiFile(chords);
    const blob = new Blob([midi.buffer as ArrayBuffer], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${genre.id}-progression.mid`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMp3 = useCallback(async () => {
    setMp3Error(null);
    setExportingMp3(true);
    try {
      const offlineBuffer = await renderProgressionOffline(
        chords.map((chord) => ({
          symbol: chord.symbol,
          shape: resolveShapeKey(chord),
        })),
        instrument
      );

      if (!offlineBuffer) {
        throw new Error(
          "Offline rendering is not available in this browser environment."
        );
      }

      const mp3 = await encodeAudioBufferToMp3(offlineBuffer);
      const url = URL.createObjectURL(mp3);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${genre.id}-progression.mp3`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to export MP3 at this time.";
      setMp3Error(message);
      console.error(err);
    } finally {
      setExportingMp3(false);
    }
  }, [chords, genre.id, instrument, resolveShapeKey]);

  useEffect(() => {
    warmupSamples();
  }, []);

  const handleKeyboardNoteStart = useCallback(
    (_midi: number, meta: NoteMetadata) => {
      const sourceLabel = meta.source === "keyboard" ? "keys" : "pointer";
      setLastPlayedNote(`${meta.label} via ${sourceLabel}`);
    },
    []
  );

  const handleKeyboardNoteEnd = useCallback(
    (_midi: number, _meta: NoteMetadata) => {
      // hook for loop recording/overdubs
    },
    []
  );

  const playChordForStep = useCallback(
    (idx: number) => {
      if (muted) return;
      const chord = chords[idx];
      if (!chord) return;
      const rootMidi = parseRootMidi(chord.symbol) ?? 60;
      const chordShape = resolveShapeKey(chord);
      void playChord(chordShape, rootMidi, instrument);
    },
    [chords, instrument, muted, resolveShapeKey]
  );

  const handleStepSelect = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      playChordForStep(idx);
    },
    [playChordForStep]
  );

  useEffect(() => {
    const mapping = new Map<KeyBinding, number>(
      KEY_BINDINGS.map((key, idx) => [key, idx])
    );

    const downHandler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const key = event.key.toLowerCase() as KeyBinding;
      if (!mapping.has(key)) return;
      const idx = mapping.get(key);
      if (idx === undefined) return;
      const targetIndex = Math.min(idx, chords.length - 1);
      setActiveIndex(targetIndex);
      setPressedKey(key);
      playChordForStep(targetIndex);
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const key = event.key.toLowerCase() as KeyBinding;
      if (mapping.has(key)) {
        setPressedKey((current) => (current === key ? null : current));
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [chords.length, playChordForStep]);

  const mapNoteToIndex = (note: number): number => {
    if (!chords.length) return 0;
    const normalized = Math.abs(note) % chords.length;
    return normalized;
  };

  const handleMidiNoteOn = (message: { note: number }) => {
    const nextIndex = mapNoteToIndex(message.note);
    midiNoteToIndexRef.current.set(message.note, nextIndex);
    setActiveIndex(nextIndex);
    setMidiFocusIndex(nextIndex);
    setPressedKey(null);
  };

  const handleMidiNoteOff = (message: { note: number }) => {
    const mappedIndex = midiNoteToIndexRef.current.get(message.note);
    midiNoteToIndexRef.current.delete(message.note);
    if (mappedIndex !== undefined && mappedIndex === midiFocusIndex) {
      setMidiFocusIndex(null);
    }
  };

  const handleMidiControlChange = (message: { value: number }) => {
    if (!chords.length) return;
    setActiveIndex((prev) => {
      const direction = message.value >= 64 ? 1 : -1;
      const next = (prev + direction + chords.length) % chords.length;
      setMidiFocusIndex(next);
      setPressedKey(null);
      return next;
    });
  };

  const {
    supported: midiSupported,
    provider: midiProvider,
    status: midiStatus,
    permissionError: midiError,
    isEnabled: midiEnabled,
    setIsEnabled: setMidiEnabled,
    inputs: midiInputs,
    selectedInputId: midiInputId,
    setSelectedInputId: setMidiInputId,
  } = useMidiInput({
    onNoteOn: handleMidiNoteOn,
    onNoteOff: handleMidiNoteOff,
    onControlChange: handleMidiControlChange,
  });

  useEffect(() => {
    if (!midiEnabled) {
      midiNoteToIndexRef.current.clear();
      setMidiFocusIndex(null);
    }
  }, [midiEnabled]);

  const explanations = useMemo(
    () =>
      chords.map((chord, idx) => {
        const next = chords[idx + 1];
        const movement = next
          ? `Moves to ${next.degree} (${next.symbol}) next.`
          : "Cadences or loops back to the top.";
        return {
          title: `Step ${idx + 1}: ${chord.degree} → ${chord.symbol}`,
          detail: `${chord.note} ${movement}`,
        };
      }),
    [chords]
  );

  const midiStatusColor = !midiSupported
    ? "bg-rose-500"
    : midiStatus === "listening"
    ? "bg-emerald-400"
    : midiStatus === "pending"
    ? "bg-amber-400"
    : midiStatus === "error"
    ? "bg-rose-500"
    : "bg-slate-500";

  const providerLabel = midiProvider === "serial"
    ? "Web Serial"
    : midiProvider === "usb"
    ? "WebUSB"
    : "Web MIDI";

  const midiStatusLabel = !midiSupported
    ? "No Web MIDI, Web Serial, or WebUSB support detected."
    : midiStatus === "pending"
    ? `Requesting ${providerLabel} permission…`
    : midiStatus === "listening"
    ? `Listening for MIDI input via ${providerLabel}.`
    : midiStatus === "error"
    ? midiError ?? `MIDI permission was blocked for ${providerLabel}.`
    : `Ready to enable MIDI input via ${providerLabel}.`;

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
            onClick={() => handleStepSelect(idx)}
            className={`
              px-2 py-1 rounded-md border flex items-center gap-1 transition-colors
              ${
                idx === activeIndex
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-100"
                  : "bg-slate-900 border-slate-700 hover:border-slate-500 hover:text-slate-100"
              }
              ${
                midiFocusIndex === idx
                  ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-900"
                  : ""
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

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={handleExportMidi}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-slate-100 hover:border-emerald-400 hover:text-emerald-100"
          >
            <Download className="h-4 w-4" /> Export MIDI
          </button>
          <button
            onClick={handleExportMp3}
            disabled={exportingMp3}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-slate-900 text-slate-100 transition-colors ${
              exportingMp3
                ? "opacity-70 cursor-wait border-slate-700"
                : "border-slate-800 hover:border-emerald-400 hover:text-emerald-100"
            }`}
          >
            <Music2 className="h-4 w-4" />
            {exportingMp3 ? "Rendering…" : "Export MP3"}
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-slate-100">
            <Radio className="h-4 w-4 text-emerald-300" />
            <label className="text-[11px] uppercase tracking-wide text-slate-400">
              Instrument
            </label>
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value as InstrumentKey)}
              className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-400"
            >
              {INSTRUMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setMuted((val) => !val)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              muted
                ? "bg-rose-900/40 border-rose-500/60 text-rose-100"
                : "bg-slate-900 border-slate-800 text-slate-100 hover:border-emerald-400"
            }`}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {muted ? "Muted" : "Sound on"}
          </button>
          <button
            onClick={() => setShowExplain((val) => !val)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              showExplain
                ? "bg-indigo-600/20 border-indigo-400 text-indigo-100"
                : "bg-slate-900 border-slate-800 text-slate-100 hover:border-indigo-400"
            }`}
          >
            <Lightbulb className="h-4 w-4" /> Explain this progression
          </button>
        </div>

        {mp3Error && (
          <div className="flex items-center gap-2 text-rose-300 text-xs px-3">
            <AlertTriangle className="h-4 w-4" />
            <span>{mp3Error}</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-slate-200">
            <span className={`h-2.5 w-2.5 rounded-full ${midiStatusColor}`} />
            <RadioReceiver className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">MIDI input</span>
            <span className="text-slate-400">{midiStatusLabel}</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setMidiEnabled(!midiEnabled)}
              disabled={!midiSupported}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                midiEnabled
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-100 hover:border-emerald-400"
                  : "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-600"
              } ${!midiSupported ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Power className="h-4 w-4" />
              {midiEnabled ? "Disable input" : "Enable MIDI"}
            </button>

            <select
              className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 text-xs disabled:opacity-50"
              value={midiInputId ?? ""}
              onChange={(event) =>
                setMidiInputId(event.target.value || null)
              }
              disabled={!midiEnabled || midiInputs.length === 0}
            >
              {midiInputs.length === 0 && (
                <option value="">No inputs detected</option>
              )}
              {midiInputs.length > 0 && <option value="">All inputs</option>}
              {midiInputs.map((input) => (
                <option key={input.id} value={input.id}>
                  {input.manufacturer ? `${input.manufacturer} — ` : ""}
                  {input.name ?? input.id}
                </option>
              ))}
            </select>

            {midiError && (
              <div className="flex items-center gap-1 text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>{midiError}</span>
              </div>
            )}

            {!midiSupported && (
              <div className="flex items-center gap-1 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Web MIDI/Serial/USB input requires a secure, modern browser
                  (Chrome/Edge recommended).
                </span>
              </div>
            )}
          </div>
        </div>
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

      {showExplain && (
        <div className="mb-4 bg-indigo-950/40 border border-indigo-700/50 rounded-lg p-4 text-xs md:text-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-100 font-semibold">
            <Lightbulb className="h-4 w-4" /> Annotated theory breakdown
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {explanations.map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-indigo-700/50 bg-indigo-900/40 p-3"
              >
                <p className="font-mono text-indigo-100 text-sm">
                  {item.title}
                </p>
                <p className="text-slate-200 mt-1 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2 text-slate-200 text-sm mb-2">
          <Keyboard className="h-4 w-4 text-emerald-400" />
          Playable keyboard (two octaves)
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Z–M for C4–B4, Q–U with 2/3/5/6/7 for C5–B5
          </span>
        </div>
        <InteractiveKeyboard
          instrument={instrument}
          muted={muted}
          onNoteStart={handleKeyboardNoteStart}
          onNoteEnd={handleKeyboardNoteEnd}
        />
        <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-3 items-center">
          <span>
            Click or use the bindings to trigger the sampler; callbacks fire for loop
            recorders.
          </span>
          {lastPlayedNote && (
            <span className="text-emerald-200 font-semibold">
              Last note: {lastPlayedNote}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-200 text-sm mb-2">
          <Keyboard className="h-4 w-4 text-emerald-400" />
          Keyboard overlay
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Press Q–P or MIDI C4–D5 to trigger steps
          </span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {KEY_BINDINGS.map((key, idx) => {
            const midiActive = midiFocusIndex === idx;
            const fallbackActive =
              idx === activeIndex &&
              pressedKey === null &&
              midiFocusIndex === null;
            const isActive = pressedKey === key || fallbackActive || midiActive;
            return (
              <div
                key={key}
                className={`text-center border rounded-md px-2 py-2 text-xs font-mono transition-colors ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                    : "border-slate-800 bg-slate-950 text-slate-300"
                } ${
                  midiActive
                    ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-900"
                    : ""
                }`}
              >
                <div className="font-bold">{key.toUpperCase()}</div>
                <div className="text-[10px] text-slate-400">{`Step ${
                  idx + 1
                }`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
