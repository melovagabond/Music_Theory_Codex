import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Menu,
  X,
  GitBranch,
  ChevronRight,
  Clock,
  FileText,
  Search,
  Info,
  Headphones,
  Play,
  Key,
} from "lucide-react";
import { CircleOfFifthsTool } from "./CircleOfFifthsTool";
import { InstrumentVisualizer, deriveProgressionChords } from "./InstrumentVisualizer";

/* ---------- TYPES ---------- */

export interface ProgressionChord {
  degree: string; // "I", "ii7", "bVII"...
  symbol: string; // "Cmaj7"
  shape: string; // "Maj7" | "min7" | "Dom7" etc
  note: string; // explanation / usage
}

export interface Genre {
  id: string;
  name: string;
  bpm: string;
  timing: string;
  description: string;
  progression: string;
  progressionNote: string;
  key?: string; // example primary key
  keys?: string[]; // list of common keys
  progressionChords?: ProgressionChord[];
  instruments: {
    piano: string;
    guitar: string;
    ukulele: string;
  };
  visual_chord: string;
  key_traits: string[];
  theoryNotes?: string[]; // extra educational bullets
}

export interface Phase {
  id: string;
  title: string;
  learning: string[];
  genres: Genre[];
}

/* ---------- GENRE DATA (TRIMMED BUT STRUCTURED) ---------- */
/* You can extend this with more genres from your doc – just follow the same shape. */

const phases: Phase[] = [
  {
    id: "phase-1",
    title: "Phase I: Jazz Foundations (1910s–50s)",
    learning: [
      "Jazz harmony establishes the ii–V–I tension–release loop and the chromatic secondary dominants that power the Circle of Fifths.",
      "The \"triad of accompaniment\" (piano, guitar, ukulele) evolves from stride and four-to-the-bar comping to walking bass plus shell voicings.",
      "Rhythmic feel shifts from march-time Ragtime to swung eighths, codifying the ride-cymbal lilt and quarter-note bass lineage for later styles.",
    ],
    genres: [
      {
        id: "ragtime",
        name: "Ragtime",
        bpm: "90–110",
        timing: "2/4 (March)",
        description:
          "The rhythmic precursor to jazz. Syncopated right hand over a steady 'stride' left hand.",
        key: "C Major (example)",
        progression: "I – VI7 – II7 – V7",
        progressionNote:
          "Classic Circle-of-Fifths turnaround using secondary dominants (C–A7–D7–G7 → C).",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Home base tonic. Often voiced as C6/CΔ for period-correct color.",
          },
          {
            degree: "VI7",
            symbol: "A7",
            shape: "Dom7",
            note: "Secondary dominant (V/V of V); pulls strongly toward D7.",
          },
          {
            degree: "II7",
            symbol: "D7",
            shape: "Dom7",
            note: "Secondary dominant (V/V); sets up the true dominant G7.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Primary dominant resolving back to C; completes the circle.",
          },
        ],
        instruments: {
          piano:
            "Stride: LH alternates low bass note (1 & 3) and mid-range chord (2 & 4).",
          guitar:
            "Bass–chord pattern: thumb hits roots, fingers strum chords on off-beats.",
          ukulele:
            "Split-strum: down on G/C, up on E/A to fake stride separation.",
        },
        visual_chord: "Dom7",
        key_traits: ["Syncopation", "Stride", "Secondary Dominants"],
        theoryNotes: [
          "Right hand often outlines chord tones with chromatic passing notes.",
          "Left hand is basically an entire rhythm section – bass + comping.",
          "Secondary dominants are your friend when you want motion without full modulation.",
        ],
      },
      {
        id: "swing",
        name: "Swing",
        bpm: "120–160",
        timing: "4/4 (Swung 8ths)",
        description:
          "The dance era. Walking bass, swung 8ths, and the standard jazz ii–V–I grammar.",
        key: "C Major (example)",
        progression: "ii7 – V7 – Imaj7",
        progressionNote:
          "The fundamental jazz phrase: functional harmony with root movement by 5ths.",
        progressionChords: [
          {
            degree: "ii7",
            symbol: "Dm7",
            shape: "min7",
            note: "Pre-dominant; smooth step up from I or vi.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Dominant that wants to resolve; often extended (9, 13).",
          },
          {
            degree: "Imaj7",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Tonic resolution; can be voiced as C6 or Cmaj9.",
          },
        ],
        instruments: {
          piano: "Shell voicings (3rd + 7th) with LH, fills in RH.",
          guitar:
            "Freddie Green style: short, muted quarter-note chords on each beat.",
          ukulele:
            "Triplet feel: down-up-down on each beat to imply swing subdivision.",
        },
        visual_chord: "Maj7",
        key_traits: ["Walking Bass", "Swing Feel", "ii–V–I"],
        theoryNotes: [
          "Bass usually walks in quarter notes outlining chord tones.",
          "The drummer rides on cymbal with a 'ding-ding-da-ding' pattern.",
          "ii–V–I is the default move: if you’re lost, aim for it.",
        ],
      },
      {
        id: "bebop",
        name: "Bebop",
        bpm: "200+",
        timing: "4/4 (Fast Swing)",
        description:
          "Virtuosic, harmonically dense jazz. Fast ii–V chains and tritone substitutions.",
        key: "C Major (example Rhythm Changes key)",
        progression: "I – bIII7 – ii7 – bII7",
        progressionNote:
          "Tritone substitutions and chromatic bass movement; almost every beat has a new tension.",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Key center – but often quickly embellished or side-stepped.",
          },
          {
            degree: "bIII7",
            symbol: "Eb7",
            shape: "Dom7",
            note: "Tritone sub; creates chromatic motion toward Dm7.",
          },
          {
            degree: "ii7",
            symbol: "Dm7",
            shape: "min7",
            note: "Standard pre-dominant.",
          },
          {
            degree: "bII7",
            symbol: "Db7",
            shape: "Dom7",
            note: "Tritone sub for G7, resolving back to I with maximum spice.",
          },
        ],
        instruments: {
          piano:
            "Left hand plays sparse shells, right hand runs long 8th-note lines.",
          guitar:
            "Single-note chromatic lines, enclosures around chord tones.",
          ukulele: "Comp lightly; leave the shred to horns/piano.",
        },
        visual_chord: "Dom9",
        key_traits: ["Chromaticism", "Tritone Subs", "Fast ii–V Chains"],
      },
      {
        id: "modal-jazz",
        name: "Modal Jazz",
        bpm: "Various",
        timing: "4/4",
        description:
          "Fewer chords, more space. Harmony lingers on modes instead of constant ii–V–I.",
        key: "D Dorian (So What example)",
        progression: "i7 (D Dorian) – i7 (Eb Dorian)",
        progressionNote:
          "The interest comes from modal color and phrasing, not chord changes.",
        progressionChords: [
          {
            degree: "i7",
            symbol: "Dm7",
            shape: "min7",
            note: "D Dorian center; use D–E–F–G–A–B–C.",
          },
          {
            degree: "i7 (♭II move)",
            symbol: "Ebm7",
            shape: "min7",
            note: "Side-step up a half-step for contrast; then back to Dm7.",
          },
        ],
        instruments: {
          piano:
            "Quartal 'So What' voicings (stacked 4ths) that slide around.",
          guitar: "Long modal lines, less worry about changes.",
          ukulele: "Open-string drones + modal riffs.",
        },
        visual_chord: "Sus4",
        key_traits: ["Modes", "Quartal Harmony", "Static Vamps"],
      },
      {
        id: "bossa-nova",
        name: "Bossa Nova",
        bpm: "120–140",
        timing: "2/4 (Clave)",
        description:
          "Cool jazz harmony on Brazilian rhythms. Essential DNA for City Pop and fusion.",
        key: "F Major (example)",
        progression: "Imaj7 – II7 – ii7 – bII7",
        progressionNote:
          "Jobim-style motion: II7 and ♭II7 act as secondary and tritone dominants.",
        progressionChords: [
          {
            degree: "Imaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Tonal center; voiced with 9/13 for lushness.",
          },
          {
            degree: "II7",
            symbol: "G7",
            shape: "Dom7",
            note: "Secondary dominant hinting at modulation but often redirected.",
          },
          {
            degree: "ii7",
            symbol: "Gm7",
            shape: "min7",
            note: "Soft pre-dominant; very 'bossa' flavor.",
          },
          {
            degree: "♭II7",
            symbol: "Gb7",
            shape: "Dom7",
            note: "Tritone sub functioning as dominant back to I.",
          },
        ],
        instruments: {
          piano: "Syncopated voicings, 9ths and 13ths, soft dynamics.",
          guitar:
            "Thumb on beats 1 & 3 (bass), fingers syncopate chords on &-of-2 and &-of-4.",
          ukulele: "Clave-aware patterns with light syncopation.",
        },
        visual_chord: "6/9",
        key_traits: ["Clave Rhythm", "Lush Extensions", "Soft Dynamics"],
      },
    ],
  },
  {
    id: "phase-2",
    title: "Phase II: Rhythm Evolution (50s–70s)",
    learning: [
      "Groove moves from triplet shuffle to straight or syncopated 16ths, centering the backbeat and \"The One\" as the primary driver of feel.",
      "Bass becomes melodic (Motown) or hypnotically repetitive (deep funk), while guitars adopt percussive chanks and scratch patterns.",
      "Harmonic motion often simplifies to vamps so rhythmic complexity and production layers can take the spotlight, paving the way for disco and boogie.",
    ],
    genres: [
      {
        id: "early-rnb",
        name: "Early R&B",
        bpm: "Medium",
        timing: "12/8 or 4/4 Shuffle",
        description:
          "Bridge from swing to rock. Triplet shuffle grooves and blues forms.",
        progression: "I7 – IV7 – V7 (12-bar Blues)",
        progressionNote:
          "Standard 12-bar form using dominant chords on I, IV, and V.",
        progressionChords: [
          {
            degree: "I7",
            symbol: "A7",
            shape: "Dom7",
            note: "Bluesy tonic; doesn’t resolve like a normal major I.",
          },
          {
            degree: "IV7",
            symbol: "D7",
            shape: "Dom7",
            note: "Subdominant blues color.",
          },
          {
            degree: "V7",
            symbol: "E7",
            shape: "Dom7",
            note: "Dominant setting up either turnaround or tag.",
          },
        ],
        key: "A Mixolydian / A Blues",
        instruments: {
          piano: "Rolling triplets in RH, bass figures in LH.",
          guitar: "Double-stops, Chuck Berry-style riffs.",
          ukulele: "Shuffle strum, accenting backbeats.",
        },
        visual_chord: "Dom7",
        key_traits: ["Shuffle", "12-bar Blues", "Triplets"],
      },
      {
        id: "motown",
        name: "Motown",
        bpm: "100–130",
        timing: "4/4",
        description:
          "Pop songs with gospel harmony and hyper-melodic bass lines.",
        key: "Eb Major (example)",
        progression: "I – vi – IV – V",
        progressionNote:
          "Pop-gospel classic; extremely singable voice-leading.",
        progressionChords: [
          {
            degree: "I",
            symbol: "Eb",
            shape: "Maj7",
            note: "Home base; often voiced as Eb6/Ebmaj9.",
          },
          {
            degree: "vi",
            symbol: "Cm7",
            shape: "min7",
            note: "Relative minor; smooth drop from I.",
          },
          {
            degree: "IV",
            symbol: "Abmaj7",
            shape: "Maj7",
            note: "Lifts harmony; feels hopeful.",
          },
          {
            degree: "V",
            symbol: "Bb7",
            shape: "Dom7",
            note: "Dominant; pushes back to I or into pre-chorus.",
          },
        ],
        instruments: {
          piano: "Block chords with rhythmic stabs supporting drums.",
          guitar: "Clean, choked chords on 2 and 4.",
          ukulele: "Backbeat-focused pop strum.",
        },
        visual_chord: "Maj7",
        key_traits: ["Melodic Bass", "Backbeat", "Gospel DNA"],
      },
      {
        id: "deep-funk",
        name: "Deep Funk",
        bpm: "90–110",
        timing: "4/4",
        description:
          "James Brown style. Everything revolves around ‘The One’.",
        key: "E Mixolydian (example)",
        progression: "Static I7 / I9 vamp",
        progressionNote:
          "Harmony barely moves so rhythm, subdivision, and dynamics take over.",
        progressionChords: [
          {
            degree: "I9",
            symbol: "E9",
            shape: "Dom9",
            note: "Funk grip. Played staccato, often with muted ghost notes.",
          },
        ],
        instruments: {
          piano: "Clavinet-like stabs, rhythmic more than harmonic.",
          guitar:
            "16th-note 'scratch' patterns with E9 at the core of the groove.",
          ukulele: "Muted percussive hits on off-beats.",
        },
        visual_chord: "Dom9",
        key_traits: ["The One", "Ghost Notes", "Static Harmony"],
        theoryNotes: [
          "Kick drum and bass both slam beat 1; everything orbits that accent.",
          "Space (rests) is as important as the notes.",
        ],
      },
      {
        id: "disco",
        name: "Disco",
        bpm: "110–130",
        timing: "4/4 (Four-on-the-Floor)",
        description:
          "Hi-hat, strings, four-on-the-floor kick, and octave bass lines.",
        key: "F# Minor (example)",
        progression: "i7 – VImaj7 – VII7 – i7",
        progressionNote:
          "Minor key with bright borrowed major chords for lift.",
        progressionChords: [
          {
            degree: "i7",
            symbol: "F#m7",
            shape: "min7",
            note: "Minor tonic, often with 9/11 for lushness.",
          },
          {
            degree: "VImaj7",
            symbol: "Dmaj7",
            shape: "Maj7",
            note: "Relative major color; brings light into the progression.",
          },
          {
            degree: "VII7",
            symbol: "E7",
            shape: "Dom7",
            note: "Dominant pulling back to i or to a new section.",
          },
        ],
        instruments: {
          piano: "Octave stabs and syncopated chord hits.",
          guitar: "Nile Rodgers-style constant 16th-note groove.",
          ukulele: "Fast, light 8th/16th strums with strong accents.",
        },
        visual_chord: "min7",
        key_traits: ["Four-on-the-Floor", "Octave Bass", "Strings"],
      },
    ],
  },
  {
    id: "phase-3",
    title: "Phase III: Fusion & Sophistication (70s–80s)",
    learning: [
      "Jazz harmony electrifies: slash chords, 11ths, and lush maj7/9 colors sit over rock drums and odd meters.",
      "Studio polish and Rhodes textures define the West Coast / Yacht Rock aesthetic—smooth voice-leading with pop songcraft.",
      "These harmonic palettes flow directly into City Pop and AOR, teaching how to keep complex chords listener-friendly.",
    ],
    genres: [
      {
        id: "jazz-fusion",
        name: "Jazz Fusion",
        bpm: "Varies",
        timing: "Odd meters (5/4, 7/8) & 4/4",
        description:
          "Electrified jazz: complex harmony and time over rock volumes.",
        key: "G Mixolydian / modal centers",
        progression: "Slash Chords (e.g. F/G → G11)",
        progressionNote:
          "Upper-structure triads over bass notes create dense, modern sonorities.",
        progressionChords: [
          {
            degree: "V11",
            symbol: "F/G",
            shape: "11th",
            note: "F major triad over G bass; functions as G11 with suspended sound.",
          },
        ],
        instruments: {
          piano: "Fender Rhodes or synth leads with extensions.",
          guitar: "Overdriven solos, jazz vocabulary over rock backbeat.",
          ukulele: "High chord voicings; texture over lead.",
        },
        visual_chord: "11th",
        key_traits: ["Virtuosity", "Electric", "Complex Harmony"],
      },
      {
        id: "soft-rock",
        name: "Soft Rock",
        bpm: "70–100",
        timing: "4/4",
        description:
          "Radio-friendly rock: vocals and chords over less aggressive drums.",
        key: "G Major (example)",
        progression: "I – V – vi – IV",
        progressionNote:
          "The 'axis of awesome' pop progression. Works in many styles.",
        progressionChords: [
          {
            degree: "I",
            symbol: "G",
            shape: "Maj7",
            note: "Tonic; may be voiced as Gadd9 or G6.",
          },
          {
            degree: "V",
            symbol: "D",
            shape: "Maj7",
            note: "Dominant function but often kept 'nice' (sus2, add9).",
          },
          {
            degree: "vi",
            symbol: "Em7",
            shape: "min7",
            note: "Relative minor; emotional but not heavy.",
          },
          {
            degree: "IV",
            symbol: "Cadd9",
            shape: "Maj7",
            note: "Subdominant with pop-friendly add-9 color.",
          },
        ],
        instruments: {
          piano: "Arpeggiated triads or block chords under vocal.",
          guitar: "Strummed open chords, often with add9 and sus2.",
          ukulele: "Straight pop strum, accenting 2 & 4.",
        },
        visual_chord: "Maj7",
        key_traits: ["Melodic", "Radio-Friendly", "Diatonic"],
      },
      {
        id: "yacht-rock",
        name: "Yacht Rock",
        bpm: "70–100",
        timing: "4/4 (Doobie Bounce)",
        description:
          "West-Coast studio perfection: rich jazz-pop chords and smooth grooves.",
        key: "C Major (example)",
        progression: "I – iii – IV – V",
        progressionNote:
          "Common-tone voice leading keeps everything ultra smooth and floaty.",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Tonic, often extended to Cmaj9.",
          },
          {
            degree: "iii",
            symbol: "Em7",
            shape: "min7",
            note: "Shares 3 notes with Cmaj7; super smooth move.",
          },
          {
            degree: "IV",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Subdominant with a soft lift.",
          },
          {
            degree: "V",
            symbol: "G13",
            shape: "Dom9",
            note: "Dominant with 9 and 13 – lush but still functional.",
          },
        ],
        instruments: {
          piano: "Rhodes comping with syncopated broken chords.",
          guitar: "Clean, chorus-y triads and partials.",
          ukulele: "Extended chords (maj7, 9) where possible.",
        },
        visual_chord: "Maj7",
        key_traits: ["Doobie Bounce", "Maj7/9", "Studio Polish"],
      },
    ],
  },
  {
    id: "phase-4",
    title: "Phase IV: Japanese Evolution (70s–90s)",
    learning: [
      "Kayōkyoku and New Music morph into City Pop by fusing AOR, funk, disco, and bossa nova rhythms with high-fidelity production.",
      "The Royal Road (IVmaj7–V7–iii7–vi) supplies endless sentimental motion; FM synths and slap bass modernize the jazz vocabulary.",
      "Technopop, anime themes, and Shibuya-kei lean on precise sequencing, secondary dominants, and bold modulations for dramatic lift.",
    ],
    genres: [
      {
        id: "city-pop",
        name: "City Pop",
        bpm: "100–120",
        timing: "4/4 (Mid-tempo Funk)",
        description:
          "Bubble-era Japanese sound: AOR + funk + disco + bossa harmony.",
        key: "C Major (Royal Road example)",
        progression: "IVmaj7 – V7 – iii7 – vi",
        progressionNote:
          "The Royal Road (Oudou Shinkou): emotionally charged, endlessly loopable.",
        progressionChords: [
          {
            degree: "IVmaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Starts away from tonic; feels like you entered mid-journey.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Forward motion and brightness.",
          },
          {
            degree: "iii7",
            symbol: "Em7",
            shape: "min7",
            note: "Tonic substitute – shares many tones with Cmaj7.",
          },
          {
            degree: "vi",
            symbol: "Am7",
            shape: "min7",
            note: "Melancholic landing spot that begs to loop back.",
          },
        ],
        instruments: {
          piano: "FM synths + electric piano stabs on off-beats.",
          guitar: "Crisp single-coil funk chords.",
          ukulele: "Maj7/Maj9 shapes with syncopated strum.",
        },
        visual_chord: "Maj7",
        key_traits: ["Royal Road", "FM Synths", "Slap Bass"],
        theoryNotes: [
          "Royal Road is functionally IV–V–iii–vi; try it in any key.",
          "Bass often outlines chord tones with disco/funk rhythms.",
        ],
      },
      {
        id: "technopop",
        name: "Technopop",
        bpm: "120–140",
        timing: "4/4 (Machine)",
        description:
          "YMO-style computerized pop. Extremely tight timing and synth textures.",
        progression: "Simple diatonic loops + pentatonics",
        progressionNote:
          "Harmony stays relatively simple so sound design can shine.",
        instruments: {
          piano: "Mostly sequenced synth parts and arps.",
          guitar: "Sometimes absent or heavily processed.",
          ukulele: "More of a texture than a core instrument here.",
        },
        visual_chord: "Sus4",
        key_traits: ["Synths", "Arpeggiators", "Precision"],
      },
      {
        id: "anime-music",
        name: "Anime Music (Anison)",
        bpm: "Fast",
        timing: "4/4",
        description:
          "High-energy intros and themes with modulations and big melodies.",
        key: "E Major (example)",
        progression: "I – V – vi – III – IV – I – IV – V",
        progressionNote:
          "Diatonic with occasional secondary dominants; modulations common at last chorus.",
        instruments: {
          piano: "Driving rhythmic support, octave figures, and countermelodies.",
          guitar: "Rock rhythm + melodic leads.",
          ukulele: "Melodic support or simplified chords.",
        },
        visual_chord: "Maj7",
        key_traits: ["Modulation", "Big Hooks", "Fusion of Styles"],
      },
    ],
  },
  {
    id: "phase-5",
    title: "Phase V: Modern Derivatives (90s–Present)",
    learning: [
      "Neo-soul, lo-fi hip hop, and future funk recycle jazz extensions (9/11/13) with swung or \"drunk\" drums for warm nostalgia.",
      "Sampling culture reframes ii–V–I cells into static loops, while sidechain compression and vinyl grit become rhythmic instruments.",
      "Modern producers continue the City Pop lineage—sped-up Royal Road chops, lush pads, and relaxed humanized timing keep the sound alive.",
    ],
    genres: [
      {
        id: "neo-soul",
        name: "Neo-Soul",
        bpm: "80–95",
        timing: "4/4 (Drunk Feel)",
        description:
          "Dilla-influenced drums, Rhodes keys, and min9 / min11 harmony.",
        key: "F Minor (example)",
        progression: "i9 – iv11",
        progressionNote:
          "Two-chord vamps with heavy color tones. Feel > complexity.",
        progressionChords: [
          {
            degree: "i9",
            symbol: "Fm9",
            shape: "min9",
            note: "Warm tonic, often voiced very close with clustered tones.",
          },
          {
            degree: "iv11",
            symbol: "Bbm11",
            shape: "min9",
            note: "Subdominant color, keeps things floating and unresolved.",
          },
        ],
        instruments: {
          piano: "Rhodes with tremolo, lazy behind-the-beat comping.",
          guitar: "Thumb-over bass chords, lots of 9/11/13.",
          ukulele: "Min9/min11 shapes where possible; soft fingerstyle.",
        },
        visual_chord: "min9",
        key_traits: ["Drunk Groove", "Extended Minor Chords", "Warmth"],
        theoryNotes: [
          "Kick and snare feel late; don’t quantize everything to the grid.",
          "Tensions (9, 11, 13) are basically mandatory.",
        ],
      },
      {
        id: "lofi",
        name: "Lo-Fi Hip Hop",
        bpm: "70–90",
        timing: "4/4 (Swing)",
        description:
          "Study beats: dusty jazz chords, low-passed drums, vinyl textures.",
        key: "C Minor (example)",
        progression: "iiø7 – V7 – i9",
        progressionNote:
          "Jazz minor ii–V–i, but often looped without strong resolution.",
        progressionChords: [
          {
            degree: "iiø7",
            symbol: "Dm7♭5",
            shape: "m7b5",
            note: "Half-diminished ii; built from the Locrian mode.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Can be altered (♭9/#9/♭13) or left plain.",
          },
          {
            degree: "i9",
            symbol: "Cm9",
            shape: "min9",
            note: "Minor tonic with rich color tones; classic lofi pad voicing.",
          },
        ],
        instruments: {
          piano: "Detuned, low-passed chords with soft attacks.",
          guitar: "Very simple shell voicings, lots of space.",
          ukulele: "Soft thumb-only strums or broken chords.",
        },
        visual_chord: "min9",
        key_traits: ["Vinyl Crackle", "Low-Pass", "Simple Loops"],
      },
      {
        id: "future-funk",
        name: "Future Funk",
        bpm: "120–130",
        timing: "4/4 (Dance)",
        description:
          "Sped-up City Pop samples with sidechain compression and bright mix.",
        key: "A Minor (example Royal Road source)",
        progression: "Sample-based Royal Road loops",
        progressionNote:
          "Often chopped directly from City Pop Royal Road progressions and looped.",
        progressionChords: [
          {
            degree: "IVmaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Bright source chord from original City Pop tracks.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Drives the dance energy forward.",
          },
          {
            degree: "iii7",
            symbol: "Em7",
            shape: "min7",
            note: "Connective glue in the loop.",
          },
          {
            degree: "vi",
            symbol: "Am7",
            shape: "min7",
            note: "Minor home base; often heavily sidechained.",
          },
        ],
        instruments: {
          piano: "Mostly sampled; new parts are usually synth stabs.",
          guitar: "Chopped Nile Rodgers-style loops.",
          ukulele: "If used, keeps to rhythmic comping.",
        },
        visual_chord: "Maj7",
        key_traits: ["Sidechain", "Samples", "High Energy"],
      },
    ],
  },
];

/* ---------- SIDEBAR ---------- */

interface SidebarProps {
  activeView: "genre" | "circle";
  setActiveView: (view: "genre" | "circle") => void;
  activeGenre: Genre;
  setActiveGenre: (genre: Genre) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  activeGenre,
  setActiveGenre,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
      ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}
    >
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
          <BookOpen className="h-6 w-6" />
          <span>Theory Codex</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-4">
          <button
            onClick={() => {
              setActiveView("circle");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold text-sm transition-all 
            ${
              activeView === "circle"
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/50 shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-mono">
              12
            </span>
            Circle of Fifths
          </button>

          {phases.map((phase) => (
            <div key={phase.id} className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="h-3 w-3" />
                {phase.title}
              </div>
              <ul className="space-y-1">
                {phase.genres.map((genre) => {
                  const isActive =
                    activeView === "genre" && activeGenre.id === genre.id;
                  return (
                    <li key={genre.id}>
                      <button
                        onClick={() => {
                          setActiveGenre(genre);
                          setActiveView("genre");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{genre.name}</span>
                        {isActive && (
                          <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        v3.2.0 • Workstation Layout
      </div>
    </div>
  );
};

/* ---------- HELPERS ---------- */

const getCommonKeys = (genre: Genre): string[] => {
  if (genre.keys && genre.keys.length > 0) return genre.keys;
  if (genre.key) return [genre.key];
  // sane, non-dumb defaults
  return ["C Major", "G Major", "F Major"];
};

/* ---------- MAIN APP ---------- */

const MusicCodexApp: React.FC = () => {
  const [activeView, setActiveView] = useState<"genre" | "circle">("genre");
  const [activeGenre, setActiveGenre] = useState<Genre>(
    phases[3].genres[0] // Default to City Pop
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chordsForActive = useMemo(
    () => deriveProgressionChords(activeGenre),
    [activeGenre]
  );

  const activePhase = useMemo(
    () => phases.find((phase) => phase.genres.some((g) => g.id === activeGenre.id)),
    [activeGenre]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeGenre={activeGenre}
        setActiveGenre={setActiveGenre}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <BookOpen className="h-5 w-5" />
          <span>Codex</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-slate-100 p-1 rounded hover:bg-slate-800"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <main className="md:ml-72 min-h-screen transition-all duration-500">
        {activeView === "circle" ? (
          <div className="pt-20 md:pt-10 px-3 sm:px-6 lg:px-10 w-full max-w-screen-2xl mx-auto flex items-stretch">
            <CircleOfFifthsTool />
          </div>
        ) : (
          <div className="pt-20 md:pt-10 px-3 sm:px-6 lg:px-10 w-full max-w-screen-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-slate-500 mb-4 md:mb-6">
              <span>codex</span>
              <ChevronRight className="h-3 w-3" />
              <span>{activeGenre.id}</span>
            </div>

            {/* Header */}
            <header className="mb-6 md:mb-8 border-b border-slate-800 pb-6 md:pb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight leading-tight">
                    {activeGenre.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                    {activeGenre.description}
                  </p>

                  {activeGenre.key && (
                    <p className="mt-3 text-xs sm:text-sm font-mono text-slate-300">
                      Primary key:{" "}
                      <span className="text-indigo-300">{activeGenre.key}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activeGenre.bpm} BPM
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] sm:text-xs font-bold text-purple-300 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {activeGenre.timing}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {activeGenre.key_traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] sm:text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-default"
                  >
                    #{trait}
                  </span>
                ))}
              </div>
            </header>

            {activePhase && (
              <section className="mb-6 lg:mb-8">
                <div className="bg-gradient-to-r from-indigo-600/50 via-purple-600/40 to-amber-500/40 border border-indigo-500/40 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-900/40 border border-white/10 text-white">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wide text-indigo-100/80">Phase Learning Capsule</p>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                        {activePhase.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
                        Quick takeaways lifted from the Open Source Music Theory Codex briefing for this era.
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-slate-100 text-xs sm:text-sm">
                    {activePhase.learning.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Main layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)] gap-6 lg:gap-8">
              {/* Left: theory + visualizer */}
              <div className="space-y-6 lg:space-y-8">
                {/* Harmonic Analysis */}
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-400" />
                    Harmonic Analysis
                  </h2>
                  <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                    <div className="bg-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase">
                        Core Progression
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            activeGenre.progression
                          )
                        }
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy progression"
                      >
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs">
                          <span>copy</span>
                          <Key className="h-3 w-3" />
                        </span>
                      </button>
                    </div>
                    <div className="p-4 sm:p-6 space-y-3">
                      <code className="text-xl sm:text-2xl md:text-3xl text-emerald-400 font-mono block font-bold">
                        {activeGenre.progression}
                      </code>
                      <div className="flex gap-3 items-start">
                        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-slate-400 text-xs sm:text-sm italic leading-relaxed">
                          {activeGenre.progressionNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Chord Reference */}
                <section>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-400" />
                    Chord Reference
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Quick lookup for the degrees, chord symbols, and suggested shapes inside the current progression.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {chordsForActive.map((chord, idx) => (
                        <div
                          key={`${chord.degree}-${idx}`}
                          className="border border-slate-800 rounded-lg p-3 bg-slate-950/60 shadow-inner"
                        >
                          <div className="flex items-center justify-between text-slate-100 font-mono text-sm">
                            <span>{chord.degree}</span>
                            <span className="text-emerald-300">{chord.symbol}</span>
                          </div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">{chord.shape}</p>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {chord.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Theory Notes */}
                {activeGenre.theoryNotes && activeGenre.theoryNotes.length > 0 && (
                  <section>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                      Writing Tips / Theory Notes
                    </h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-slate-400 text-xs sm:text-sm">
                      {activeGenre.theoryNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Instrument Visualizer */}
                <InstrumentVisualizer genre={activeGenre} chords={chordsForActive} />
              </div>

              {/* Right: Reference lab + keys */}
              <aside className="space-y-5 lg:space-y-6">
                {/* Reference Lab */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Headphones className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="font-bold text-base sm:text-lg">
                          Reference Lab
                        </span>
                        <p className="text-[10px] text-indigo-100/80">
                          Listen while you analyze.
                        </p>
                      </div>
                    </div>
                    <p className="text-indigo-100 text-xs sm:text-sm">
                      Open a curated search for essential{" "}
                      <span className="font-semibold">
                        {activeGenre.name}
                      </span>{" "}
                      tracks to hear these progressions in the wild.
                    </p>
                    <a
                      href={`https://www.youtube.com/results?search_query=best+${activeGenre.name.replace(
                        / /g,
                        "+"
                      )}+mix`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-indigo-900 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Listen on YouTube
                    </a>
                  </div>
                </div>

                {/* Common Keys */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
                  <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4" /> Common Keys
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getCommonKeys(activeGenre).map((k) => (
                      <span
                        key={k}
                        className="bg-slate-950 text-slate-200 px-2.5 py-1 rounded text-[10px] sm:text-xs font-mono border border-slate-700"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MusicCodexApp;
