import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivitySquare,
  Circle,
  CircleOff,
  Clock3,
  Drum,
  Guitar,
  Repeat2,
  Timer,
  Pause,
  Play,
  RadioTower,
  RefreshCw,
  Square,
  Trash2,
} from "lucide-react";
import type { ProgressionChord } from "./types/codex";
import { CHORD_SHAPES, ChordShapeKey } from "./data/chordShapes";
import { InstrumentKey, playChord, warmupSamples } from "./audio/sampler";

const NOTE_BASE: Record<string, number> = {
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

const parseRootMidi = (symbol: string): number | null => {
  const match = symbol.match(/^([A-Ga-g])(#{1}|b)?/);
  if (!match) return null;
  const [, root, accidental] = match;
  const key = `${root.toUpperCase()}${accidental ?? ""}`;
  return NOTE_BASE[key] ?? null;
};

type DrumType = "kick" | "snare" | "hat";

type StepEvent =
  | { type: "chord"; chord: ProgressionChord }
  | { type: "drum"; drum: DrumType };

type TimelineEvent = { time: number; event: StepEvent };

let drumContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (drumContext) return drumContext;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  drumContext = AudioCtx ? new AudioCtx() : null;
  return drumContext;
};

const drumPlayers: Record<DrumType, () => void> = {
  kick: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  },
  snare: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2000;

    const gain = ctx.createGain();
    const now = ctx.currentTime;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.2);
  },
  hat: () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 8000;

    const gain = ctx.createGain();
    const now = ctx.currentTime;

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.1);
  },
};

const resolveShape = (shape: string): ChordShapeKey => {
  if (shape in CHORD_SHAPES) return shape as ChordShapeKey;
  return "Maj7";
};

const quantizeTime = (time: number, bpm: number, subdivision: number) => {
  const beatSeconds = 60 / bpm;
  const step = beatSeconds / (subdivision / 4);
  return Math.round(time / step) * step;
};

interface LooperSequencerProps {
  chords: ProgressionChord[];
}

export const LooperSequencer: React.FC<LooperSequencerProps> = ({ chords }) => {
  const [instrument, setInstrument] = useState<InstrumentKey>("piano");
  const [bpm, setBpm] = useState(112);
  const [quantization, setQuantization] = useState(8);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sequencerPlaying, setSequencerPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepCount, setStepCount] = useState<8 | 16>(16);
  const [steps, setSteps] = useState<Array<StepEvent | null>>(
    Array.from({ length: 16 }, () => null)
  );
  const [inputTarget, setInputTarget] = useState<"looper" | "sequencer" | null>(
    null
  );

  const recordStartRef = useRef<number | null>(null);
  const playbackTimers = useRef<number[]>([]);
  const sequencerTimer = useRef<number | null>(null);

  useEffect(() => {
    warmupSamples();
  }, []);

  useEffect(() => {
    return () => {
      playbackTimers.current.forEach((t) => window.clearTimeout(t));
      if (sequencerTimer.current) window.clearInterval(sequencerTimer.current);
    };
  }, []);

  useEffect(() => {
    setSteps((prev) => {
      const next = Array.from({ length: stepCount }, (_, idx) => prev[idx] ?? null);
      return next;
    });
  }, [stepCount]);

  const stepDuration = useMemo(() => (60 / bpm) * (4 / stepCount), [bpm, stepCount]);

  const triggerChord = useCallback(
    async (chord: ProgressionChord) => {
      const root = parseRootMidi(chord.symbol) ?? 60;
      const shape = resolveShape(chord.shape);
      await playChord(shape, root, instrument);
    },
    [instrument]
  );

  const triggerDrum = (drum: DrumType) => {
    drumPlayers[drum]();
  };

  const handleTrigger = useCallback(
    (event: StepEvent) => {
      if (event.type === "chord") {
        triggerChord(event.chord);
      } else {
        triggerDrum(event.drum);
      }

      if (recording && recordStartRef.current !== null) {
        const now = performance.now();
        const elapsedSeconds = (now - recordStartRef.current) / 1000;
        const snapped = quantizeTime(elapsedSeconds, bpm, quantization);
        setTimeline((prev) =>
          [...prev, { time: snapped, event }].sort((a, b) => a.time - b.time)
        );
      }
    },
    [bpm, quantization, recording, triggerChord]
  );

  const startRecording = () => {
    setTimeline([]);
    setRecording(true);
    recordStartRef.current = performance.now();
  };

  const stopRecording = () => {
    setRecording(false);
    recordStartRef.current = null;
  };

  const startPlayback = () => {
    if (timeline.length === 0) return;
    setPlaying(true);
    const start = performance.now();
    const timers = timeline.map((item) =>
      window.setTimeout(() => {
        handleTrigger(item.event);
      }, Math.max(0, item.time * 1000 - (performance.now() - start)))
    );

    const endTimer = window.setTimeout(() => {
      setPlaying(false);
    }, (timeline[timeline.length - 1].time + 0.25) * 1000);

    playbackTimers.current = [...timers, endTimer];
  };

  const stopPlayback = () => {
    setPlaying(false);
    playbackTimers.current.forEach((t) => window.clearTimeout(t));
  };

  const clearTimeline = () => {
    stopPlayback();
    setTimeline([]);
  };

  const toggleSequencer = () => {
    if (sequencerPlaying) {
      setSequencerPlaying(false);
      return;
    }

    setCurrentStep(0);
    setSequencerPlaying(true);
  };

  useEffect(() => {
    if (!sequencerPlaying) {
      if (sequencerTimer.current) {
        window.clearInterval(sequencerTimer.current);
        sequencerTimer.current = null;
      }
      return;
    }

    if (sequencerTimer.current) {
      window.clearInterval(sequencerTimer.current);
    }

    const timer = window.setInterval(() => {
      setCurrentStep((prev) => {
        const event = steps[prev];
        if (event) handleTrigger(event);
        return (prev + 1) % stepCount;
      });
    }, stepDuration * 1000);
    sequencerTimer.current = timer;

    return () => {
      window.clearInterval(timer);
      sequencerTimer.current = null;
    };
  }, [handleTrigger, sequencerPlaying, stepDuration, stepCount, steps]);

  const updateStepEvent = useCallback((index: number, event: StepEvent | null) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = event;
      return copy;
    });
  }, []);

  const handleInputFocus = (target: "looper" | "sequencer") => {
    setInputTarget(target);
  };

  const handleInputBlur = (
    event: React.FocusEvent<HTMLElement>,
    target: "looper" | "sequencer"
  ) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (inputTarget !== target) return;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setInputTarget(null);
    }
  };

  useEffect(() => {
    const looperChordKeys = ["1", "2", "3", "4", "5", "6"];
    const drumKeys: Record<string, DrumType> = {
      q: "kick",
      w: "snare",
      e: "hat",
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inputTarget === "looper") {
        const chordIndex = looperChordKeys.indexOf(event.key);
        if (chordIndex !== -1 && chords[chordIndex]) {
          event.preventDefault();
          handleTrigger({ type: "chord", chord: chords[chordIndex] });
          return;
        }

        const drum = drumKeys[event.key.toLowerCase()];
        if (drum) {
          event.preventDefault();
          handleTrigger({ type: "drum", drum });
          return;
        }
      }

      if (inputTarget === "sequencer") {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setCurrentStep((prev) => (prev + 1) % stepCount);
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCurrentStep((prev) => (prev - 1 + stepCount) % stepCount);
          return;
        }

        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          const nextEvent = steps[currentStep]
            ? null
            : ({ type: "drum", drum: "hat" } as StepEvent);
          updateStepEvent(currentStep, nextEvent);
          if (nextEvent) {
            handleTrigger(nextEvent);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chords, currentStep, handleTrigger, inputTarget, stepCount, steps, updateStepEvent]);

  const instrumentLabel: Record<InstrumentKey, string> = {
    piano: "Piano",
    guitar: "Guitar",
    ukulele: "Ukulele",
    bass: "Bass",
    drums: "Drum kit",
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300">
            <Repeat2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Looper & Step Sequencer
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Capture live hits, quantize them, and loop programmed patterns.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
          <Timer className="h-4 w-4" />
          <span>{bpm} BPM</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <Clock3 className="h-4 w-4" />
              <span>Quantization</span>
            </div>
            <select
              value={quantization}
              onChange={(e) => setQuantization(Number(e.target.value))}
              className="bg-slate-950 text-slate-100 text-xs rounded-lg px-3 py-1 border border-slate-800"
            >
              <option value={4}>Quarter</option>
              <option value={8}>Eighth</option>
              <option value={16}>Sixteenth</option>
            </select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <ActivitySquare className="h-4 w-4" />
              <span>Instrument</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(instrumentLabel) as InstrumentKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setInstrument(key)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    instrument === key
                      ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                      : "border-slate-700 text-slate-300 hover:border-emerald-400/60"
                  }`}
                >
                  <Guitar className="inline h-3 w-3 mr-1" /> {instrumentLabel[key]}
                </button>
              ))}
            </div>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            tabIndex={0}
            role="group"
            aria-label="Live chord and drum pads"
            onFocusCapture={() => handleInputFocus("looper")}
            onBlurCapture={(event) => handleInputBlur(event, "looper")}
          >
            {chords.slice(0, 6).map((chord, idx) => (
              <button
                key={`${chord.symbol}-${idx}`}
                onClick={() => handleTrigger({ type: "chord", chord })}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-400/50 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-xs text-slate-400">Chord</p>
                <p className="text-sm font-semibold text-emerald-200">{chord.symbol}</p>
                <p className="text-[10px] text-slate-500">{chord.shape}</p>
              </button>
            ))}
            {(["kick", "snare", "hat"] as DrumType[]).map((drum) => (
              <button
                key={drum}
                onClick={() => handleTrigger({ type: "drum", drum })}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-400/50 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-xs text-slate-400">Drum</p>
                <p className="text-sm font-semibold text-indigo-200 flex items-center gap-2 capitalize">
                  <Drum className="h-4 w-4" /> {drum}
                </p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!recording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/40"
              >
                <Circle className="h-4 w-4" /> Record
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white"
              >
                <CircleOff className="h-4 w-4" /> Stop Recording
              </button>
            )}

            <button
              onClick={playing ? stopPlayback : startPlayback}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                playing
                  ? "bg-slate-800 text-white border-slate-700"
                  : "bg-emerald-500/20 text-emerald-100 border-emerald-500/40"
              }`}
              disabled={timeline.length === 0}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} Playback
            </button>

            <button
              onClick={clearTimeline}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white border border-slate-700"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <RadioTower className="h-4 w-4 text-emerald-300" /> Recorded Timeline
              </span>
              <span>{timeline.length} events</span>
            </div>
            {timeline.length === 0 ? (
              <p className="text-[11px] text-slate-500">No captured hits yet. Record to build a loop.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {timeline.map((item, idx) => (
                  <div
                    key={`${item.time}-${idx}`}
                    className="flex items-center justify-between text-xs bg-slate-900 rounded-md px-3 py-2"
                  >
                    <span className="text-slate-200">
                      {item.event.type === "chord" ? item.event.chord.symbol : item.event.drum}
                    </span>
                    <span className="text-slate-500 font-mono">{item.time.toFixed(2)}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <Repeat2 className="h-4 w-4" /> Step Sequencer
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400">BPM</label>
              <input
                type="number"
                value={bpm}
                min={60}
                max={200}
                onChange={(e) => setBpm(Number(e.target.value) || 1)}
                className="w-20 bg-slate-950 text-slate-100 text-xs rounded-lg px-3 py-1 border border-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStepCount(8)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                stepCount === 8
                  ? "bg-indigo-500/20 text-indigo-100 border-indigo-400/50"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              8 Steps
            </button>
            <button
              onClick={() => setStepCount(16)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                stepCount === 16
                  ? "bg-indigo-500/20 text-indigo-100 border-indigo-400/50"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              16 Steps
            </button>

            <button
              onClick={toggleSequencer}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                sequencerPlaying
                  ? "bg-slate-800 text-white border-slate-700"
                  : "bg-emerald-500/20 text-emerald-100 border-emerald-500/40"
              }`}
            >
              {sequencerPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />} {" "}
              {sequencerPlaying ? "Stop" : "Play"} Loop
            </button>
          </div>

          <div
            className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-950 border border-slate-800 rounded-lg p-3"
            tabIndex={0}
            role="grid"
            aria-label="Step sequencer grid"
            onFocusCapture={() => handleInputFocus("sequencer")}
            onBlurCapture={(event) => handleInputBlur(event, "sequencer")}
          >
            {steps.map((event, idx) => {
              const isSelected = currentStep === idx;
              const isActiveStep = sequencerPlaying && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStep(idx);
                    updateStepEvent(
                      idx,
                      event
                        ? null
                        : { type: "drum", drum: "hat" }
                    );
                  }}
                  className={`relative h-16 rounded-lg border text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                    isActiveStep
                      ? "border-emerald-400 shadow-lg shadow-emerald-500/30"
                      : isSelected
                        ? "border-indigo-400/70"
                        : "border-slate-800"
                  } ${event ? "bg-indigo-500/20 text-indigo-50" : "bg-slate-900 text-slate-400"}`}
                >
                  <span className="font-mono text-[10px] text-slate-500">{idx + 1}</span>
                  {event ? (
                    <>
                      <span className="font-semibold">
                        {event.type === "chord"
                          ? event.chord.symbol
                          : event.drum.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-indigo-100">Tap to clear</span>
                    </>
                  ) : (
                    <span className="text-[10px]">Empty</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <RefreshCw className="h-4 w-4" />
              <span>Program Steps</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chords.slice(0, 6).map((chord, idx) => (
                <button
                  key={`${chord.symbol}-program-${idx}`}
                  onClick={() => updateStepEvent(currentStep, { type: "chord", chord })}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-400/50 rounded-lg p-3 text-left"
                >
                  <p className="text-xs text-slate-400">Chord</p>
                  <p className="text-sm font-semibold text-emerald-200">{chord.symbol}</p>
                  <p className="text-[10px] text-slate-500">Set at step {currentStep + 1}</p>
                </button>
              ))}
              {(["kick", "snare", "hat"] as DrumType[]).map((drum) => (
                <button
                  key={`prog-${drum}`}
                  onClick={() => updateStepEvent(currentStep, { type: "drum", drum })}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-400/50 rounded-lg p-3 text-left"
                >
                  <p className="text-xs text-slate-400">Drum</p>
                  <p className="text-sm font-semibold text-indigo-200 flex items-center gap-2 capitalize">
                    <Drum className="h-4 w-4" /> {drum}
                  </p>
                  <p className="text-[10px] text-slate-500">Set at step {currentStep + 1}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LooperSequencer;
