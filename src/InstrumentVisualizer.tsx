import React from "react";
import { Piano, Guitar, Music2, ChevronRight } from "lucide-react";
import type { Genre, ProgressionChord } from "./App"; // adjust path

interface InstrumentVisualizerProps {
  genre: Genre;
}

const splitProgression = (progression: string): string[] =>
  progression
    .split(/[-–→>/]/)
    .map(p => p.trim())
    .filter(Boolean);

const buildFallbackChords = (genre: Genre): ProgressionChord[] => {
  const pieces = splitProgression(genre.progression);

  if (!pieces.length) {
    return [
      { degree: "I", symbol: "I", shape: "Maj", note: "Tonic / home base." },
      { degree: "V", symbol: "V", shape: "Dom7", note: "Primary dominant." },
    ];
  }

  return pieces.map((deg, idx) => ({
    degree: deg,
    symbol: deg,
    shape: "Functional",
    note:
      idx === 0
        ? "Starting point of the phrase."
        : "Continues the harmonic motion in this style.",
  }));
};

export const InstrumentVisualizer: React.FC<InstrumentVisualizerProps> = ({
  genre,
}) => {
  const chords: ProgressionChord[] =
    genre.progressionChords && genre.progressionChords.length > 0
      ? genre.progressionChords
      : buildFallbackChords(genre);

  const keyLabel = genre.key ?? genre.keys?.[0] ?? "Example Key";

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Piano className="h-5 w-5 text-emerald-400" />
        Progression & Voicing Map
      </h2>

      {/* Roman numeral lane */}
      <div className="mb-4 flex flex-wrap gap-2 items-center text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wide text-slate-500">Flow:</span>
        {chords.map((chord, idx) => (
          <div
            key={idx}
            className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 flex items-center gap-1"
          >
            <span className="text-emerald-300 font-semibold">
              {chord.degree}
            </span>
            <span className="text-slate-500">({chord.symbol})</span>
            {idx < chords.length - 1 && (
              <ChevronRight className="h-3 w-3 text-slate-600 ml-1" />
            )}
          </div>
        ))}
      </div>

      {/* Per-chord cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chords.map((chord, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {keyLabel}
                </div>
                <div className="text-lg font-mono text-emerald-300 font-bold">
                  {chord.symbol}
                </div>
                <div className="text-xs text-slate-500">
                  Roman: {chord.degree} • Shape: {chord.shape}
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                Step {idx + 1}
              </span>
            </div>

            <p className="text-xs text-slate-400 italic">{chord.note}</p>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-start gap-2">
                <Piano className="h-4 w-4 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Piano</div>
                  <div className="text-slate-400">
                    {genre.instruments.piano}
                    {"  "}
                    Focus this chord on 3rd & 7th; treat the root as optional
                    if a bass player is present.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Guitar className="h-4 w-4 text-indigo-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Guitar</div>
                  <div className="text-slate-400">
                    {genre.instruments.guitar}
                    {"  "}
                    Aim to keep common tones between chords to get smooth
                    voice-leading instead of jumping shapes.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Music2 className="h-4 w-4 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Ukulele</div>
                  <div className="text-slate-400">
                    {genre.instruments.ukulele}
                    {"  "}
                    Use close voicings like a piano right hand – let high
                    strings carry the color tones.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};