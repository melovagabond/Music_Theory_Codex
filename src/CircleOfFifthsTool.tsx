import React, { useState } from "react";
import { Compass, Info, Piano, Guitar, Radio } from "lucide-react";

type DiatonicChord = {
  degree: string;   // I, ii, iii...
  quality: string;  // Maj7, min7, etc
  symbol: string;   // Cmaj7
  function: string; // Tonic / Subdominant / Dominant
};

type KeyDetail = {
  name: string;             // C, G, D...
  majorKey: string;         // "C Major"
  relativeMinor: string;    // "A minor"
  accidentals: string;      // "No sharps or flats"
  scale: string[];          // [C, D, E, F, G, A, B]
  diatonicChords: DiatonicChord[];
  commonProgressions: string[];
  usageNotes: string[];
  instrumentTips: {
    piano: string;
    guitar: string;
    ukulele: string;
  };
};

const KEY_ORDER: string[] = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
];

const KEY_DATA: Record<string, KeyDetail> = {
  C: {
    name: "C",
    majorKey: "C Major",
    relativeMinor: "A minor",
    accidentals: "No sharps or flats",
    scale: ["C", "D", "E", "F", "G", "A", "B"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Cmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Dm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Em7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Fmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "G7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Am7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Bm7♭5", function: "Leading-tone" },
    ],
    commonProgressions: [
      "ii – V – I",
      "I – vi – IV – V",
      "IV – V – iii – vi (Royal Road template)",
    ],
    usageNotes: [
      "Neutral, 'home base' key – great for hearing function clearly.",
      "Perfect for practicing ii–V–I and basic jazz voicings.",
      "Many City Pop and AOR tunes can be mentally transposed here.",
    ],
    instrumentTips: {
      piano:
        "Practice shell voicings (3rd + 7th) for Dm7, G7, and Cmaj7 in both hands.",
      guitar:
        "Use simple CAGED shapes for Cmaj7, Dm7, G7, and Am7 around the 3rd and 5th frets.",
      ukulele:
        "Lean on open-position C, F, G7, and Am shapes; focus on clean chord changes in time.",
    },
  },
  G: {
    name: "G",
    majorKey: "G Major",
    relativeMinor: "E minor",
    accidentals: "1 sharp (F#)",
    scale: ["G", "A", "B", "C", "D", "E", "F#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Gmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Am7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Bm7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Cmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "D7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Em7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "F#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: [
      "ii – V – I (Am7 – D7 – Gmaj7)",
      "I – V – vi – IV (G – D – Em – C)",
    ],
    usageNotes: [
      "G is the folk/acoustic comfort zone; great guitar key.",
      "Shares many chords with C major, so modulation between them is easy.",
    ],
    instrumentTips: {
      piano:
        "Explore voicings that keep C and D as common tones between Cmaj7 and Gmaj7.",
      guitar:
        "G, C, D, and Em in open position are classic singer-songwriter territory.",
      ukulele:
        "G, C, D, and Em are all friendly; use them to try I–V–vi–IV pop progressions.",
    },
  },
  D: {
    name: "D",
    majorKey: "D Major",
    relativeMinor: "B minor",
    accidentals: "2 sharps (F#, C#)",
    scale: ["D", "E", "F#", "G", "A", "B", "C#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Dmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Em7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "F#m7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Gmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "A7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Bm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "C#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – V – vi – IV"],
    usageNotes: [
      "Another guitar-friendly key; often used for brighter, open-sounding songs.",
    ],
    instrumentTips: {
      piano:
        "Try Dmaj9, Gmaj9, and A13 for instant 'expensive' harmony in this key.",
      guitar:
        "Use capo tricks: C shapes with capo on 2 to think in C while playing in D.",
      ukulele:
        "D, G, A, and Bm are bread-and-butter pop chords in this key.",
    },
  },
  F: {
    name: "F",
    majorKey: "F Major",
    relativeMinor: "D minor",
    accidentals: "1 flat (Bb)",
    scale: ["F", "G", "A", "Bb", "C", "D", "E"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Fmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Gm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Am7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Bbmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "C7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Dm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Em7♭5", function: "Leading-tone" },
    ],
    commonProgressions: [
      "ii – V – I (Gm7 – C7 – Fmaj7)",
      "IV – V – iii – vi (Bbmaj7 – C7 – Am7 – Dm7)",
    ],
    usageNotes: [
      "F sits just on the 'flat' side – great for soul, R&B, and City Pop flavors.",
    ],
    instrumentTips: {
      piano:
        "Fmaj9 and Bbmaj9 are lush; practice voice-leading between them with common tones.",
      guitar:
        "F is bar-chord heavy; good for practicing clean barring across the neck.",
      ukulele:
        "F, Bb, C, and Dm are classic I–IV–V–vi palette for warm ballads.",
    },
  },
  Bb: {
    name: "Bb",
    majorKey: "Bb Major",
    relativeMinor: "G minor",
    accidentals: "2 flats (Bb, Eb)",
    scale: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Bbmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Cm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Dm7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Ebmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "F7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Gm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Am7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – IV – V"],
    usageNotes: [
      "Bb is a horn-player’s home key; very common in jazz and big band charts.",
    ],
    instrumentTips: {
      piano:
        "Think in terms of Eb and F as subdominant/dominant pillars and decorate around them.",
      guitar:
        "Practice Bbmaj7 as both bar chords and partial triads to avoid fatigue.",
      ukulele:
        "Bb can be awkward at first; break the chord into mini-shapes and add fingers gradually.",
    },
  },
  Eb: {
    name: "Eb",
    majorKey: "Eb Major",
    relativeMinor: "C minor",
    accidentals: "3 flats (Bb, Eb, Ab)",
    scale: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Ebmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Fm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Gm7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Abmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "Bb7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Cm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Dm7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – vi – ii – V"],
    usageNotes: [
      "Eb is lush and 'flat-heavy'; think ballads, jazz standards, and horn arrangements.",
    ],
    instrumentTips: {
      piano:
        "Use wide voicings (10ths) between left and right hand for a big, orchestral feel.",
      guitar:
        "Capo on 3 and think in C to steal C-major licks in Eb.",
      ukulele:
        "Eb, Ab, Bb, and Cm give you a full diatonic palette for slower, emotional tracks.",
    },
  },
  Ab: {
    name: "Ab",
    majorKey: "Ab Major",
    relativeMinor: "F minor",
    accidentals: "4 flats (Bb, Eb, Ab, Db)",
    scale: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Abmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Bbm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Cm7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Dbmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "Eb7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Fm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Gm7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – IV – V"],
    usageNotes: [
      "Ab screams R&B, gospel, and big vocal moments – it sits great for many singers.",
    ],
    instrumentTips: {
      piano:
        "Lean into black keys; Ab is surprisingly ergonomic for many voicings.",
      guitar:
        "Capo on 1 and think in G to leverage friendly open chords.",
      ukulele:
        "Use small, movable triad shapes; don’t torture yourself with full bars if you don’t have to.",
    },
  },
  A: {
    name: "A",
    majorKey: "A Major",
    relativeMinor: "F# minor",
    accidentals: "3 sharps (F#, C#, G#)",
    scale: ["A", "B", "C#", "D", "E", "F#", "G#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Amaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Bm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "C#m7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Dmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "E7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "F#m7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "G#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["I – V – vi – IV", "ii – V – I"],
    usageNotes: ["Bright, present key; common for rock, pop, and worship tunes."],
    instrumentTips: {
      piano:
        "Try Amaj9, Dmaj9, and E13 for big, modern pop/jazz color.",
      guitar:
        "A major plus D and E are your bread-and-butter rock progression friends.",
      ukulele:
        "Transpose G-key shapes up a whole step to think more simply while playing in A.",
    },
  },
  E: {
    name: "E",
    majorKey: "E Major",
    relativeMinor: "C# minor",
    accidentals: "4 sharps (F#, C#, G#, D#)",
    scale: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Emaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "F#m7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "G#m7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Amaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "B7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "C#m7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "D#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["I – IV – V", "ii – V – I"],
    usageNotes: [
      "E is a power-key for guitar (open E string), especially for rock and blues.",
    ],
    instrumentTips: {
      piano:
        "Use strong left-hand octaves on E and B for rock/gospel vibes.",
      guitar:
        "Leverage the low E string for riffs; classic blues boxes live here.",
      ukulele:
        "Consider capo tricks or partial chords if full E-barre voicings are annoying.",
    },
  },
  B: {
    name: "B",
    majorKey: "B Major",
    relativeMinor: "G# minor",
    accidentals: "5 sharps (F#, C#, G#, D#, A#)",
    scale: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Bmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "C#m7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "D#m7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Emaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "F#7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "G#m7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "A#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – vi – IV – V"],
    usageNotes: [
      "Pain in the ass to read, but heavily used when instruments are tuned down or in certain pop keys.",
    ],
    instrumentTips: {
      piano:
        "Use black-key shapes to your advantage; B major can actually feel comfy under the hand.",
      guitar:
        "Use capo and think in A or G to avoid living in bar-chord hell.",
      ukulele:
        "Small, movable triads again – don’t feel obligated to use full six-note shapes.",
    },
  },
  "F#": {
    name: "F#",
    majorKey: "F# Major",
    relativeMinor: "D# minor",
    accidentals: "6 sharps (F#, C#, G#, D#, A#, E#)",
    scale: ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "F#maj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "G#m7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "A#m7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Bmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "C#7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "D#m7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "E#m7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I"],
    usageNotes: [
      "Enharmonic with Gb; used in keys with lots of sharps or for certain modulations.",
    ],
    instrumentTips: {
      piano:
        "Similar ergonomic feel to B major – heavy on black keys, which can be nice.",
      guitar:
        "Capo 2 and think in E or D to make your life easier.",
      ukulele:
        "Again, triad fragments > huge grips; keep it playable.",
    },
  },
  Db: {
    name: "Db",
    majorKey: "Db Major",
    relativeMinor: "Bb minor",
    accidentals: "5 flats (Bb, Eb, Ab, Db, Gb)",
    scale: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    diatonicChords: [
      { degree: "I", quality: "Maj7", symbol: "Dbmaj7", function: "Tonic" },
      { degree: "ii", quality: "min7", symbol: "Ebm7", function: "Pre-dominant" },
      { degree: "iii", quality: "min7", symbol: "Fm7", function: "Tonic color" },
      { degree: "IV", quality: "Maj7", symbol: "Gbmaj7", function: "Subdominant" },
      { degree: "V", quality: "Dom7", symbol: "Ab7", function: "Dominant" },
      { degree: "vi", quality: "min7", symbol: "Bbm7", function: "Relative minor" },
      { degree: "vii°", quality: "m7♭5", symbol: "Cm7♭5", function: "Leading-tone" },
    ],
    commonProgressions: ["ii – V – I", "I – vi – ii – V"],
    usageNotes: [
      "Db is smooth as hell – great for lush, cinematic, R&B, or City Pop type harmony.",
    ],
    instrumentTips: {
      piano:
        "Lots of black keys – chord planing (moving shapes up/down) feels very natural here.",
      guitar:
        "Capo 1 and play in C, or capo 4 and play in A; no need to brute-force Db voicings all day.",
      ukulele:
        "Db, Gb, Ab, and Bbm can be broken into small grips; keep it economical.",
    },
  },
};

const CircleOfFifthsTool: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");

  const data = KEY_DATA[selectedKey];

  const handleKeyClick = (key: string) => {
    if (KEY_DATA[key]) {
      setSelectedKey(key);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40">
          <Compass className="h-6 w-6 text-indigo-300" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Circle of Fifths Lab
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">
            Click around the wheel to explore keys, relative minors, diatonic
            chords, and how they map to your instruments.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
        {/* WHEEL */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[420px] aspect-square">
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full drop-shadow-[0_0_40px_rgba(129,140,248,0.35)]"
              >
                {/* background ring */}
                <defs>
                  <radialGradient id="c-of-outer" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#020617" />
                    <stop offset="60%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                </defs>
                <circle
                  cx={150}
                  cy={150}
                  r={120}
                  fill="url(#c-of-outer)"
                  stroke="#1e293b"
                  strokeWidth={2}
                />

                {/* major keys around the circle */}
                {KEY_ORDER.map((key, i) => {
                  const angle = (i / KEY_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 100;
                  const x = 150 + radius * Math.cos(angle);
                  const y = 150 + radius * Math.sin(angle);

                  const isActive = key === selectedKey;

                  // slightly smaller radius for hit zone circle
                  const hitX = 150 + (radius - 6) * Math.cos(angle);
                  const hitY = 150 + (radius - 6) * Math.sin(angle);

                  return (
                    <g
                      key={key}
                      onClick={() => handleKeyClick(key)}
                      className="cursor-pointer"
                    >
                      {/* hit / highlight circle */}
                      <circle
                        cx={hitX}
                        cy={hitY}
                        r={18}
                        fill={isActive ? "#4f46e5" : "transparent"}
                        stroke={isActive ? "#a5b4fc" : "#475569"}
                        strokeWidth={isActive ? 2.2 : 1}
                        opacity={isActive ? 0.95 : 0.7}
                      />
                      {/* label */}
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isActive ? "#e5e7eb" : "#cbd5f5"}
                        fontSize={isActive ? 16 : 13}
                        fontWeight={isActive ? 700 : 500}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* center display */}
                <circle cx={150} cy={150} r={56} fill="#020617" stroke="#1f2937" />
                <text
                  x={150}
                  y={138}
                  textAnchor="middle"
                  className="font-bold"
                  fill="#e5e7eb"
                  fontSize={20}
                >
                  {data.name}
                </text>
                <text
                  x={150}
                  y={160}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize={11}
                >
                  {data.majorKey}
                </text>
                <text
                  x={150}
                  y={178}
                  textAnchor="middle"
                  fill="#f97316"
                  fontSize={10}
                >
                  Rel. minor: {data.relativeMinor}
                </text>
              </svg>

              <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Moving clockwise adds sharps • counter-clockwise adds flats
                </span>
              </div>
            </div>

            {/* key pills for quick selection */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {KEY_ORDER.map((key) => {
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-400 shadow"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="space-y-5">
          {/* explanation */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Info className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100 mb-1.5">
                  How to use this wheel
                </h2>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  The Circle of Fifths shows which keys are harmonically close,
                  which chords live inside a key, and where the relative minor
                  sits. Click any key on the wheel (or the pills) to pull diatonic
                  chords and writing ideas in that key.
                </p>
              </div>
            </div>
          </div>

          {/* key summary */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Selected key
                </p>
                <p className="text-lg font-semibold text-slate-100">
                  {data.majorKey}
                  <span className="ml-2 text-xs text-orange-400">
                    ({data.relativeMinor})
                  </span>
                </p>
              </div>
              <span className="px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                {data.accidentals}
              </span>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                Scale degrees
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {data.scale.map((note, idx) => (
                  <span
                    key={note}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    {idx + 1}. {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* diatonic chords */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Diatonic chord family
              </h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                I – ii – iii – IV – V – vi – vii°
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] md:text-xs font-mono">
              {data.diatonicChords.map((ch) => (
                <div
                  key={ch.degree}
                  className="flex items-center justify-between gap-2 rounded bg-slate-900/80 border border-slate-800 px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                      {ch.degree}
                    </span>
                    <span className="text-emerald-300">{ch.symbol}</span>
                    <span className="text-slate-500">{ch.quality}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {ch.function}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* progressions + instruments */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                Common progressions
              </p>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                {data.commonProgressions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] md:text-xs text-slate-300">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <Piano className="h-3 w-3" />
                  <span className="font-semibold text-xs">Piano</span>
                </div>
                <p className="text-slate-300 leading-snug">
                  {data.instrumentTips.piano}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <Guitar className="h-3 w-3" />
                  <span className="font-semibold text-xs">Guitar</span>
                </div>
                <p className="text-slate-300 leading-snug">
                  {data.instrumentTips.guitar}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <Radio className="h-3 w-3" />
                  <span className="font-semibold text-xs">Ukulele</span>
                </div>
                <p className="text-slate-300 leading-snug">
                  {data.instrumentTips.ukulele}
                </p>
              </div>
            </div>

            {data.usageNotes.length > 0 && (
              <div className="pt-1 border-t border-slate-800 mt-2">
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                  {data.usageNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CircleOfFifthsTool };
