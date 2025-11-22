import React, { useState } from "react";
import { Info, Piano, Guitar, Music2 } from "lucide-react";

type KeyInfo = {
  name: string;          // "C"
  mode: "major" | "minor";
  relative: string;      // "Am" for C, etc.
  accidentals: string;   // "0 ♯/♭", "2 ♯", etc.
  primaryTriads: string[]; // I, IV, V or i, iv, v symbols
};

const CIRCLE_KEYS: KeyInfo[] = [
  { name: "C",  mode: "major", relative: "Am", accidentals: "0 ♯/♭", primaryTriads: ["C", "F", "G"] },
  { name: "G",  mode: "major", relative: "Em", accidentals: "1 ♯",   primaryTriads: ["G", "C", "D"] },
  { name: "D",  mode: "major", relative: "Bm", accidentals: "2 ♯",   primaryTriads: ["D", "G", "A"] },
  { name: "A",  mode: "major", relative: "F#m",accidentals: "3 ♯",   primaryTriads: ["A", "D", "E"] },
  { name: "E",  mode: "major", relative: "C#m",accidentals: "4 ♯",   primaryTriads: ["E", "A", "B"] },
  { name: "B",  mode: "major", relative: "G#m",accidentals: "5 ♯",   primaryTriads: ["B", "E", "F#"] },
  { name: "F#", mode: "major", relative: "D#m",accidentals: "6 ♯",   primaryTriads: ["F#", "B", "C#"] },
  { name: "Db", mode: "major", relative: "Bbm",accidentals: "5 ♭",   primaryTriads: ["Db", "Gb", "Ab"] },
  { name: "Ab", mode: "major", relative: "Fm", accidentals: "4 ♭",   primaryTriads: ["Ab", "Db", "Eb"] },
  { name: "Eb", mode: "major", relative: "Cm", accidentals: "3 ♭",   primaryTriads: ["Eb", "Ab", "Bb"] },
  { name: "Bb", mode: "major", relative: "Gm", accidentals: "2 ♭",   primaryTriads: ["Bb", "Eb", "F"] },
  { name: "F",  mode: "major", relative: "Dm", accidentals: "1 ♭",   primaryTriads: ["F", "Bb", "C"] },
];

const circleOrder = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];

export const CircleOfFifthsTool: React.FC = () => {
  const [selected, setSelected] = useState<KeyInfo>(CIRCLE_KEYS[0]);

  const handleKeyClick = (name: string) => {
    const k = CIRCLE_KEYS.find(k => k.name === name);
    if (k) setSelected(k);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Explanation */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="h-5 w-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">
            Circle of Fifths – What It Actually Does for You
          </h1>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          The Circle of Fifths is a map of all 12 keys arranged so that each step
          clockwise moves you up a perfect fifth. It tells you which keys are
          harmonically close, which chords live inside a key, and where the
          relative minor sits. It’s the backbone behind ii–V–I in Jazz and the
          Royal Road progression in City Pop (IVmaj7 – V7 – iii7 – vi).:contentReference[oaicite:3]
        </p>
        <ul className="text-sm text-slate-400 space-y-1 list-disc pl-5">
          <li>
            <span className="text-slate-200 font-semibold">Pick a key:</span>{" "}
            choose the center of gravity for your song.
          </li>
          <li>
            <span className="text-slate-200 font-semibold">Grab diatonic chords:</span>{" "}
            the I–ii–iii–IV–V–vi–vii° all come from this key.
          </li>
          <li>
            <span className="text-slate-200 font-semibold">Move in 5ths for strong progressions:</span>{" "}
            ii–V–I (Jazz) or IV–V–iii–vi (City Pop) walk around the circle and
            feel “inevitable”.
          </li>
        </ul>
      </section>

      {/* Circle UI + key info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* "Circle" – simplified radial buttons */}
        <div className="relative flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900">
            {circleOrder.map((name, idx) => {
              const angle = (idx / circleOrder.length) * 2 * Math.PI;
              const radius = 120;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              const isActive = selected.name === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={`absolute flex items-center justify-center w-10 h-10 rounded-full border text-xs font-mono transition
                    ${isActive
                      ? "bg-indigo-500 text-white border-indigo-300 shadow-lg"
                      : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  onClick={() => handleKeyClick(name)}
                >
                  {name}
                </button>
              );
            })}
            <div className="absolute text-[10px] uppercase tracking-wide text-slate-600">
              Fifths →
            </div>
          </div>
        </div>

        {/* Selected key info + usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs uppercase text-slate-500">Key Center</div>
              <div className="text-3xl font-black text-white">
                {selected.name} {selected.mode === "major" ? "Major" : "Minor"}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Relative minor:{" "}
                <span className="font-mono text-emerald-300">
                  {selected.relative}
                </span>{" "}
                • Accidentals: {selected.accidentals}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-300">
            <div className="font-semibold mb-1">Core Progressions in this key</div>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>
                <span className="font-mono text-emerald-300">ii – V – I</span>{" "}
                (Jazz): walk anticlockwise around the circle for strong resolutions.:contentReference[oaicite:4]
              </li>
              <li>
                <span className="font-mono text-emerald-300">
                  IVmaj7 – V7 – iii7 – vi
                </span>{" "}
                (Royal Road / City Pop): emotional, forward-moving chain of
                dominants.:contentReference[oaicite:5]
              </li>
              <li>
                <span className="font-mono text-emerald-300">I – IV – V</span>{" "}
                (Rock / Folk): basic functional harmony for most Western music.
              </li>
            </ul>
          </div>

          <div className="text-xs text-slate-500">
            Tip: if you want a “brighter” sound, move **one step clockwise** (more
            sharps). For darker, one step counter-clockwise (more flats).
          </div>
        </div>
      </section>

      {/* Instrument triad cheat sheets */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Piano */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 mb-1">
            <Piano className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold">Piano – I / IV / V</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Treat left hand as bass (roots) and right hand as close-position
            triads. For jazzier stuff, turn I into <span className="font-mono">IMaj7</span>{" "}
            and V into <span className="font-mono">V7</span>.:contentReference[oaicite:6]
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-200">
            {selected.primaryTriads.map(label => (
              <div
                key={label}
                className="bg-slate-800 rounded-md px-2 py-1 text-center border border-slate-700"
              >
                <div className="text-xs">{label}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  root • 3rd • 5th
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guitar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 mb-1">
            <Guitar className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold">Guitar – Grip Map</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Use small 3-note grips on strings 4-3-2. Think{" "}
            <span className="font-mono">I: 3rd &amp; 7th</span>,{" "}
            <span className="font-mono">IV: 3rd &amp; 7th</span>,{" "}
            <span className="font-mono">V: 3rd &amp; b7</span>. This is the
            Freddie Green / comping approach.:contentReference[oaicite:7]
          </p>
          <ul className="text-[11px] text-slate-300 space-y-1">
            {selected.primaryTriads.map(label => (
              <li key={label} className="flex justify-between">
                <span>{label}</span>
                <span className="text-slate-500">shell chord (3–7)</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ukulele */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 mb-1">
            <Music2 className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold">Ukulele – Close Voicings</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Think of uke as a tiny piano right hand: close voicings and smooth
            motion. In Jazz/Funk, lean on <span className="font-mono">6</span>,{" "}
            <span className="font-mono">7</span>, and{" "}
            <span className="font-mono">9</span> extensions.:contentReference[oaicite:8]
          </p>
          <ul className="text-[11px] text-slate-300 space-y-1">
            {selected.primaryTriads.map(label => (
              <li key={label} className="flex justify-between">
                <span>{label}</span>
                <span className="text-slate-500">use 3- or 4-string shapes</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};