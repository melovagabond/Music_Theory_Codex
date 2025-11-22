import React, { useState } from "react";
import { InstrumentVisualizer } from "./InstrumentVisualizer";
import { CircleOfFifthsTool } from "./CircleOfFifthsTool";
import {
  GitBranch,
  BookOpen,
  Play,
  Search,
  Menu,
  X,
  ChevronRight,
  Headphones,
  Clock,
  Key,
  Copy,
  FileText,
  Disc,
  Info,
} from "lucide-react";

// -----------------------------------------
// TYPES
// -----------------------------------------

export interface ProgressionChord {
  degree: string; // e.g. "I", "ii7"
  symbol: string; // e.g. "Cmaj7", "Dm7"
  shape: string; // e.g. "Maj7", "min7", "Dom7"
  note: string; // explanation
}

export interface Genre {
  id: string;
  name: string;
  bpm: string;
  timing: string;
  description: string;
  progression: string;
  progressionNote: string;
  key?: string; // example key ("C Major")
  keys?: string[]; // common keys list for UI
  progressionChords?: ProgressionChord[];
  instruments: {
    piano: string;
    guitar: string;
    ukulele: string;
  };
  visual_chord: string;
  key_traits: string[];
  theoryNotes?: string[];
}

export interface Phase {
  id: string;
  title: string;
  genres: Genre[];
}

// -----------------------------------------
// DATA: PHASES / GENRES
// -----------------------------------------

const phases: Phase[] = [
  {
    id: "phase-1",
    title: "Phase I: Jazz Foundations (1910s-50s)",
    genres: [
      {
        id: "ragtime",
        name: "Ragtime",
        bpm: "90-110",
        timing: "2/4 (March)",
        description:
          "The rhythmic precursor to jazz. Syncopated melody lines against a steady 'stride' bass.",
        key: "C Major",
        progression: "I – VI7 – II7 – V7",
        progressionNote:
          "Circle of Fifths Turnaround. A chain of secondary dominants that creates forward momentum (C–A7–D7–G7→C).",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Home base tonic; often voiced as C6/CΔ for period-correct color.",
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
            note: "Primary dominant resolving back to C; classic Circle of Fifths motion.",
          },
        ],
        instruments: {
          piano:
            "Stride: LH alternates low root (beats 1 & 3) and mid-range chord (2 & 4).",
          guitar:
            "Bass-Chord Strum: Thumb plays root, fingers pluck chord on off-beats.",
          ukulele:
            "Split Strum: Down on G/C, up on E/A to simulate stride separation.",
        },
        visual_chord: "Dom7",
        key_traits: ["Syncopation", "Stride Piano", "Secondary Dominants"],
      },
      {
        id: "dixieland",
        name: "Dixieland / Hot Jazz",
        bpm: "160-220",
        timing: "4/4 (Flat-four)",
        description:
          "Ensemble improvisation. Polyphonic 'Hot Jazz' style relying on collective improv.",
        progression: "Dominant 7th Cycles",
        progressionNote:
          "Heavy use of flat-five (blue notes) and Dominant 7ths driving movement.",
        instruments: {
          piano: "Stride bass with rolled octaves.",
          guitar: "Fast, driving quarter notes (flat-four beat).",
          ukulele: "Banjo-style rapid strumming.",
        },
        visual_chord: "Dom7",
        key_traits: ["Polyphony", "Flat-Five", "Collective Improv"],
      },
      {
        id: "swing",
        name: "Swing",
        bpm: "120-160",
        timing: "4/4 (Swung 8ths)",
        description:
          "The dance era. Introduced the 'lilt' and walking bass. 2:1 beat division.",
        key: "C Major (example)",
        progression: "ii7 – V7 – Imaj7",
        progressionNote:
          "The fundamental unit of Jazz harmony. Root movement by 5ths; defines functional resolution.",
        progressionChords: [
          {
            degree: "ii7",
            symbol: "Dm7",
            shape: "min7",
            note: "Pre-dominant; sets up G7 and carries the swung 8th feel.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Dominant creating tension and forward motion toward I.",
          },
          {
            degree: "Imaj7",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Tonic resolution; often voiced as C6/CΔ with added color tones.",
          },
        ],
        instruments: {
          piano: "Shell Voicings: Root, 3rd, 7th (omitting 5th).",
          guitar:
            "Freddie Green Style: Mute everything except 3rd and 7th strings.",
          ukulele: "Triplet feel strumming (Down-up-down).",
        },
        visual_chord: "Maj6",
        key_traits: ["Walking Bass", "Major 6th Chords", "Dominant 9th"],
      },
      {
        id: "bebop",
        name: "Bebop",
        bpm: "200+",
        timing: "4/4 (Fast Swing)",
        description:
          "Art music. Rapid harmonic rhythm and complex substitutions.",
        key: "C Major (example Rhythm Changes key)",
        progression: "Rhythm Changes (Modified)",
        progressionNote:
          "Tritone Subs: I – bIII7 – ii – bII7. Chromatic bass movement and dense ii–V chains.",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Home key center; often ornamented with 9ths and #11.",
          },
          {
            degree: "bIII7",
            symbol: "Eb7",
            shape: "Dom7",
            note: "Tritone substitute that creates chromatic bass motion and altered color.",
          },
          {
            degree: "ii7",
            symbol: "Dm7",
            shape: "min7",
            note: "Standard pre-dominant in ii–V motion.",
          },
          {
            degree: "bII7",
            symbol: "Db7",
            shape: "Dom7",
            note: "Tritone sub for G7; resolves to I with strong chromatic pull.",
          },
        ],
        instruments: {
          piano: "Bud Powell voicings (Root-7th or Root-3rd in LH).",
          guitar: "Single-note chromatic lines. Chromatic enclosures.",
          ukulele: "Rhythmic comping only, no full strums.",
        },
        visual_chord: "Dom9",
        key_traits: ["Tritone Substitution", "Virtuosity", "Complex Improv"],
      },
      {
        id: "cool-jazz",
        name: "Cool Jazz",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Relaxed tempos and lighter tones. Prioritized arrangement over speed.",
        progression: "Rootless Voicings",
        progressionNote:
          "Bill Evans style: Omitting the root (played by bass) to add 9ths/13ths.",
        instruments: {
          piano: "Sparse comping, rootless voicings.",
          guitar: "Soft attack, focus on tone.",
          ukulele: "Fingerstyle arrangements.",
        },
        visual_chord: "min9",
        key_traits: ["Rootless Voicings", "Arrangement", "Lighter Tone"],
      },
      {
        id: "hard-bop",
        name: "Hard Bop",
        bpm: "Medium",
        timing: "4/4",
        description: "Soulful return to blues and gospel roots within jazz.",
        progression: "I7 - IV7 (Blues Vamps)",
        progressionNote:
          "Blues licks over complex changes. #9 tensions on dominants.",
        instruments: {
          piano: "Funky riffs, Gospel influence.",
          guitar: "Blues licks.",
          ukulele: "Blues scale runs.",
        },
        visual_chord: "Dom7",
        key_traits: ["Gospel Roots", "Blues Licks", "Soulful"],
      },
      {
        id: "modal-jazz",
        name: "Modal Jazz",
        bpm: "Various",
        timing: "4/4",
        description: "Static harmony based on modes (Dorian, Phrygian).",
        progression: "Dorian Vamps",
        progressionNote:
          "Quartal harmony (stacked 4ths). Avoids functional resolution.",
        instruments: {
          piano: "So What voicings (two stacked 4ths + major 3rd).",
          guitar: "Modal scale runs over static bass.",
          ukulele: "Open string drones.",
        },
        visual_chord: "Sus4",
        key_traits: ["Quartal Harmony", "Dorian Mode", "Static"],
      },
      {
        id: "bossa-nova",
        name: "Bossa Nova",
        bpm: "120-140",
        timing: "2/4 (Clave)",
        description:
          "Fusion of Samba and Cool Jazz. Critical for City Pop.",
        key: "F Major (example: ‘Girl from Ipanema’ style)",
        progression: "Imaj7 – II7 – ii7 – bII7",
        progressionNote:
          "Jobim changes. II7 and bII7 act as secondary and tritone dominants, creating a floating yet directional feel.",
        progressionChords: [
          {
            degree: "Imaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Tonal center; usually voiced with 9th/13th for smooth color.",
          },
          {
            degree: "II7",
            symbol: "G7",
            shape: "Dom7",
            note: "Secondary dominant that hints at modulation but often sidesteps.",
          },
          {
            degree: "ii7",
            symbol: "Gm7",
            shape: "min7",
            note: "Modal, softer pre-dominant; keeps harmony smooth and lyrical.",
          },
          {
            degree: "bII7",
            symbol: "Gb7",
            shape: "Dom7",
            note: "Tritone substitute functioning as V7; resolves back to I with sophisticated motion.",
          },
        ],
        instruments: {
          piano: "Comping with dense extensions (9ths, 13ths, #11s).",
          guitar: "The 'Stutter' beat: Thumb on 1 & 3, fingers syncopated.",
          ukulele: "Clave-based patterns.",
        },
        visual_chord: "6/9",
        key_traits: ["Clave Rhythm", "Nylon String", "Whisper Vocals"],
      },
      {
        id: "samba",
        name: "Samba",
        bpm: "Fast",
        timing: "2/4",
        description:
          "Energetic parent of Bossa Nova. Communal and percussion-heavy.",
        progression: "ii - V loops",
        progressionNote:
          "Rhythmic ostinatos take precedence over complex harmony.",
        instruments: {
          piano: "Rhythmic ostinato (1-and-2-and).",
          guitar: "Rapid 16th-note strumming.",
          ukulele: "Fast triplets (down-thumb, up-finger, down-finger).",
        },
        visual_chord: "Maj6",
        key_traits: ["Surdo Beat", "Percussive", "High Energy"],
      },
      {
        id: "latin-jazz",
        name: "Latin Jazz / Afro-Cuban",
        bpm: "Various",
        timing: "Clave (2-3 or 3-2)",
        description:
          "Incorporates clave rhythms into jazz harmony. The 'Spanish Tinge'.",
        progression: "Montuno Patterns",
        progressionNote:
          "Arpeggiated syncopated chords. Piano acts as percussion.",
        instruments: {
          piano: "Montuno patterns.",
          guitar: "Syncopated chord stabs.",
          ukulele: "Clave taps.",
        },
        visual_chord: "Dom9",
        key_traits: ["Clave", "Montuno", "Tumbao"],
      },
      {
        id: "soul-jazz",
        name: "Soul Jazz",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Stripped-down, bluesy variant of Hard Bop. Hammond B3 era.",
        progression: "I7 - IV7 Vamps",
        progressionNote:
          "Gospel turnarounds. Organ trio format.",
        instruments: {
          piano: "Hammond B3 style licks.",
          guitar: "Bluesy double-stops.",
          ukulele: "Shuffle strum.",
        },
        visual_chord: "Dom7",
        key_traits: ["Hammond B3", "Bluesy", "Groove"],
      },
      {
        id: "gypsy-jazz",
        name: "Gypsy Jazz (Manouche)",
        bpm: "200+",
        timing: "4/4 (La Pompe)",
        description:
          "Django Reinhardt style. European jazz tradition.",
        progression: "i6 – iv6 – V7",
        progressionNote:
          "Heavy use of Diminished 7th chords as dominant substitutes.",
        instruments: {
          piano: "Rarely used (Accordion substitutes).",
          guitar:
            "La Pompe: Heavy accent on beats 2 & 4. Geometric shapes.",
          ukulele: "Diminished 7th sliding trick.",
        },
        visual_chord: "dim7",
        key_traits: ["La Pompe", "Diminished Subs", "Minor 6th"],
      },
    ],
  },
  {
    id: "phase-2",
    title: "Phase II: Rhythm Evolution (60s-70s)",
    genres: [
      {
        id: "early-rnb",
        name: "Rhythm & Blues (Early)",
        bpm: "Medium",
        timing: "12/8 or 4/4 Shuffle",
        description:
          "Transition from swing to rock. Triplet feel.",
        progression: "Blues forms",
        progressionNote: "Rolling triplets driving the rhythm.",
        instruments: {
          piano: "Fats Domino style rolling triplets.",
          guitar: "Double stops and bending.",
          ukulele: "Shuffle rhythm.",
        },
        visual_chord: "Dom7",
        key_traits: ["Shuffle", "Double Stops", "Triplets"],
      },
      {
        id: "motown",
        name: "Motown (Northern Soul)",
        bpm: "100-130",
        timing: "4/4",
        description:
          "The Sound of Young America. Pop structures with Gospel roots.",
        progression: "I – vi – IV – V",
        progressionNote:
          "Sophisticated arrangements masking simple changes.",
        instruments: {
          piano: "Gospel block chords, doubling snare.",
          guitar: "'Chinks' on the backbeat (2 & 4).",
          ukulele: "Percussive damping on backbeats.",
        },
        visual_chord: "Maj7",
        key_traits: ["Melodic Bass", "Tambourine", "Orchestration"],
      },
      {
        id: "southern-soul",
        name: "Southern Soul (Stax)",
        bpm: "Slow-Medium",
        timing: "4/4",
        description:
          "Grittier, horn-driven soul. Emphasis on the groove.",
        progression: "Soul Ballad changes",
        progressionNote:
          "Economical playing leaving space for vocals.",
        instruments: {
          piano: "Gospel/Church chords.",
          guitar: "Sliding 6ths (Steve Cropper style).",
          ukulele: "Soulful strumming.",
        },
        visual_chord: "Maj6",
        key_traits: ["Grit", "Horns", "Space"],
      },
      {
        id: "deep-funk",
        name: "Deep Funk",
        bpm: "90-110",
        timing: "4/4",
        description:
          "James Brown style. 'The One' is sacred.",
        key: "E Mixolydian (example)",
        progression: "Static I7 / I9",
        progressionNote:
          "Harmonic movement stops for rhythmic movement; everything orbits The One.",
        progressionChords: [
          {
            degree: "I9",
            symbol: "E9",
            shape: "Dom9",
            note: "The classic funk grip; used as a static vamp while rhythm does the work.",
          },
        ],
        instruments: {
          piano: "Clavinet rhythmic patterns.",
          guitar:
            "The 'Scratch': Muted 16th notes. E9 'Funk Grip'.",
          ukulele: "Ghost note scratching.",
        },
        visual_chord: "Dom9",
        key_traits: ["The One", "Syncopated Bass", "Ghost Notes"],
      },
      {
        id: "p-funk",
        name: "P-Funk",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Psychedelic, synthesized funk. Parliament-Funkadelic.",
        progression: "Blues Scales over Synth Bass",
        progressionNote:
          "Heavy squelchy synth bass (Minimoog).",
        instruments: {
          piano: "Synthesizers (Minimoog).",
          guitar: "Wah-wah pedal effects.",
          ukulele: "Psychedelic effects.",
        },
        visual_chord: "Dom7",
        key_traits: ["Synth Bass", "Sci-Fi", "Group Vocals"],
      },
      {
        id: "jazz-funk",
        name: "Jazz-Funk",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Bridge between Jazz complexity and Funk groove.",
        key: "D Dorian (example)",
        progression: "Dorian Vamps",
        progressionNote:
          "Herbie Hancock style: modal vamps with Rhodes textures.",
        progressionChords: [
          {
            degree: "i7 (Dorian)",
            symbol: "Dm7",
            shape: "min7",
            note: "Modal center; often extended to Dm9/Dm11.",
          },
          {
            degree: "IV7",
            symbol: "G7",
            shape: "Dom7",
            note: "Creates a D Dorian ↔ G Mixolydian shuttle; groove more important than resolution.",
          },
        ],
        instruments: {
          piano: "Fender Rhodes electric piano.",
          guitar: "Jazz phrasing with funk rhythm.",
          ukulele: "Complex comping.",
        },
        visual_chord: "min7",
        key_traits: ["Fender Rhodes", "Groove", "Improvisation"],
      },
      {
        id: "brit-funk",
        name: "Brit-Funk",
        bpm: "110-120",
        timing: "4/4",
        description:
          "UK blend of American jazz-funk and Caribbean rhythms.",
        progression: "Slap Bass driven",
        progressionNote:
          "Brighter, trebly tone. Slap bass as lead.",
        instruments: {
          piano: "Bright synth keys.",
          guitar: "Trebly funk strumming.",
          ukulele: "Reggae-influenced strum.",
        },
        visual_chord: "Dom9",
        key_traits: ["Slap Bass", "Bright Tone", "Caribbean"],
      },
      {
        id: "disco",
        name: "Disco",
        bpm: "110-130",
        timing: "4/4 (Four-on-the-floor)",
        description:
          "The dance revolution. Kick on every beat.",
        progression: "iv7 - i7 loops",
        progressionNote:
          "Minor 7th scales and soaring strings.",
        instruments: {
          piano: "Octave bass lines, staccato chords.",
          guitar: "Nile Rodgers Strum: Continuous 16th motion.",
          ukulele: "Fast triplets.",
        },
        visual_chord: "min7",
        key_traits: ["Four-on-the-floor", "Hi-Hat", "Strings"],
      },
      {
        id: "boogie",
        name: "Boogie",
        bpm: "105-115",
        timing: "4/4",
        description:
          "Post-Disco electronic funk. Heavy on synths.",
        progression: "Funk Vamps",
        progressionNote:
          "Synth bass replaces electric bass.",
        instruments: {
          piano: "Synth stabs.",
          guitar: "Clean, chorus-laden rhythm.",
          ukulele: "Percussive comping.",
        },
        visual_chord: "Dom9",
        key_traits: ["Synth Bass", "Slower Tempo", "Electronic"],
      },
      {
        id: "post-disco",
        name: "Post-Disco",
        bpm: "Various",
        timing: "4/4",
        description:
          "Experimental phase following Disco. Dub/New Wave elements.",
        progression: "Minimalist",
        progressionNote:
          "Stripped back arrangements. Drum machines.",
        instruments: {
          piano: "Synth textures.",
          guitar: "Minimalist picking.",
          ukulele: "Dub delays.",
        },
        visual_chord: "min7",
        key_traits: ["Dub Effects", "Drum Machines", "Minimal"],
      },
      {
        id: "go-go",
        name: "Go-Go",
        bpm: "100-110",
        timing: "4/4 (Swing Beat)",
        description:
          "DC's regional funk. The 'Pocket' beat.",
        progression: "Blues Vamps",
        progressionNote:
          "Continuous groove, conga/cowbell patterns.",
        instruments: {
          piano: "Organ pads.",
          guitar: "Rhythmic scratching.",
          ukulele: "Percussive accents.",
        },
        visual_chord: "Dom7",
        key_traits: ["The Pocket", "Rototoms", "Call & Response"],
      },
      {
        id: "blue-eyed-soul",
        name: "Blue-Eyed Soul",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Soul music performed by white artists (Hall & Oates).",
        progression: "Jazz-Pop Fusion",
        progressionNote:
          "Sophisticated changes smoothing out the grit.",
        instruments: {
          piano: "Polished pop chords.",
          guitar: "Clean rhythm.",
          ukulele: "Pop strumming.",
        },
        visual_chord: "Maj7",
        key_traits: ["Polished", "Melodic", "Jazz Harmony"],
      },
      {
        id: "philly-soul",
        name: "Philly Soul",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Orchestral soul. Sweeping strings and vibraphones.",
        progression: "Maj7 and Maj9",
        progressionNote:
          "Lush arrangements influenced Disco.",
        instruments: {
          piano: "Lush voicings.",
          guitar: "Wah-wah or clean accompaniment.",
          ukulele: "Soft strumming.",
        },
        visual_chord: "Maj9",
        key_traits: ["Strings", "Vibraphone", "Lush"],
      },
    ],
  },
  {
    id: "phase-3",
    title: "Phase III: Fusion & Sophistication (70s-80s)",
    genres: [
      {
        id: "jazz-fusion",
        name: "Jazz Fusion",
        bpm: "Various",
        timing: "Odd meters (5/4, 7/8)",
        description:
          "Electrification of jazz. Virtuosity meets volume.",
        key: "G Mixolydian / modal centers",
        progression: "Slash Chords (e.g., F/G)",
        progressionNote:
          "Triads over foreign bass notes creating G11 and other complex upper-structure sounds.",
        progressionChords: [
          {
            degree: "V11",
            symbol: "F/G",
            shape: "11th",
            note: "F major triad over G bass; functions as G11 with strong suspended color.",
          },
        ],
        instruments: {
          piano: "Synthesizer leads, Fender Rhodes.",
          guitar: "Overdriven solos, bebop phrasing.",
          ukulele: "High tension chords.",
        },
        visual_chord: "11th",
        key_traits: ["Virtuosity", "Electric", "Complex Harmony"],
      },
      {
        id: "jazz-rock",
        name: "Jazz-Rock",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Rock song structures with jazz instrumentation (Steely Dan).",
        progression: "Mu Major Chords",
        progressionNote:
          "Add2 chords adding texture without 'jazz' 7ths.",
        instruments: {
          piano: "Mu Major voicings.",
          guitar: "Precise solos.",
          ukulele: "Add9 chords.",
        },
        visual_chord: "Sus4",
        key_traits: ["Mu Major", "Studio Precision", "Verse-Chorus"],
      },
      {
        id: "prog-rock",
        name: "Progressive Rock",
        bpm: "Variable",
        timing: "Odd Meters",
        description:
          "Classical/Jazz influenced rock. Canterbury Scene.",
        progression: "Modulation",
        progressionNote:
          "Modulating between distant keys.",
        instruments: {
          piano: "Virtuosic runs.",
          guitar: "Complex time signatures.",
          ukulele: "N/A",
        },
        visual_chord: "dim7",
        key_traits: ["Odd Time", "Modulation", "Epic"],
      },
      {
        id: "soft-rock",
        name: "Soft Rock",
        bpm: "70-100",
        timing: "4/4",
        description:
          "Radio-friendly rock with de-emphasized beat.",
        progression: "Diatonic",
        progressionNote:
          "Acoustic guitars layered with electric piano.",
        instruments: {
          piano: "Ballad styles.",
          guitar: "Acoustic strumming.",
          ukulele: "Folk strumming.",
        },
        visual_chord: "Maj7",
        key_traits: ["Melody", "Acoustic", "Radio"],
      },
      {
        id: "aor",
        name: "AOR",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Adult Oriented Rock. High-fidelity production.",
        progression: "Polished Rock",
        progressionNote:
          "Sonic perfection. City Pop is 'Japanese AOR'.",
        instruments: {
          piano: "Studio perfect compression.",
          guitar: "Clean solos.",
          ukulele: "Precise rhythm.",
        },
        visual_chord: "Maj9",
        key_traits: ["Hi-Fi", "Production", "Smooth"],
      },
      {
        id: "yacht-rock",
        name: "Yacht Rock",
        bpm: "70-100",
        timing: "4/4 (Doobie Bounce)",
        description:
          "West Coast Sound. Smooth, highly produced.",
        key: "C Major (example)",
        progression: "I – iii – IV – V",
        progressionNote:
          "Michael McDonald chords. Smooth voice leading and luxurious extensions.",
        progressionChords: [
          {
            degree: "I",
            symbol: "Cmaj7",
            shape: "Maj7",
            note: "Smooth tonic; often extended to Cmaj9 for 'yacht' sheen.",
          },
          {
            degree: "iii",
            symbol: "Em7",
            shape: "min7",
            note: "Passing tonic substitute; shares common tones with Cmaj7.",
          },
          {
            degree: "IV",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Warm subdominant; often voiced with 9th for lift.",
          },
          {
            degree: "V",
            symbol: "G7",
            shape: "Dom7",
            note: "Dominant leading back into the loop or to a new section.",
          },
        ],
        instruments: {
          piano: "Heavy rhythmic Rhodes chords.",
          guitar: "Phase shifters, complex triads.",
          ukulele: "Jazz chords, pop strum.",
        },
        visual_chord: "Maj7",
        key_traits: ["Doobie Bounce", "Smooth", "Electric Piano"],
      },
      {
        id: "sophisti-pop",
        name: "Sophisti-pop",
        bpm: "90-110",
        timing: "4/4",
        description:
          "UK blend of jazz, soul, and pop (Sade).",
        progression: "Maj9 and Min9",
        progressionNote: "Cool, detached, stylish.",
        instruments: {
          piano: "Smooth synth pads, DX7.",
          guitar: "Chorus effects.",
          ukulele: "Melodic picking.",
        },
        visual_chord: "Maj7",
        key_traits: ["Stylish", "Synth Strings", "Fretless Bass"],
      },
      {
        id: "smooth-jazz",
        name: "Smooth Jazz",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Radio-format fusion. Melody over improvisation.",
        progression: "In the pocket",
        progressionNote:
          "Less rhythmic complexity than fusion.",
        instruments: {
          piano: "Melodic leads.",
          guitar:
            "Octave playing (Wes Montgomery style).",
          ukulele: "Smooth melody.",
        },
        visual_chord: "Maj7",
        key_traits: ["Radio Friendly", "Melodic", "Groove"],
      },
      {
        id: "quiet-storm",
        name: "Quiet Storm",
        bpm: "Slow",
        timing: "4/4",
        description:
          "R&B equivalent of Smooth Jazz. Slow jams.",
        progression: "Min9 and Min11",
        progressionNote:
          "The foundation of the slow jam.",
        instruments: {
          piano: "Romantic voicings.",
          guitar: "Soft accompaniment.",
          ukulele: "Fingerstyle.",
        },
        visual_chord: "min9",
        key_traits: ["Slow Jam", "Romantic", "R&B"],
      },
    ],
  },
  {
    id: "phase-4",
    title: "Phase IV: The Japanese Evolution (70s-90s)",
    genres: [
      {
        id: "kayokyoku",
        name: "Kayōkyoku (Showa Pop)",
        bpm: "Various",
        timing: "4/4",
        description:
          "Standard Japanese pop before Western branding.",
        progression: "Pentatonic + Western",
        progressionNote:
          "Japanese pentatonic scales (Yonaguki) + dramatic changes.",
        instruments: {
          piano: "Theatrical accompaniment.",
          guitar: "Melodic leads.",
          ukulele: "Folk accompaniment.",
        },
        visual_chord: "Dom7",
        key_traits: ["Theatrical", "Pentatonic", "Key Changes"],
      },
      {
        id: "new-music",
        name: "New Music",
        bpm: "Medium",
        timing: "4/4",
        description:
          "Singer-songwriter movement bridging Folk and Pop.",
        progression: "Folk-Pop",
        progressionNote:
          "Lyrics focused on urban life. Precursor to City Pop.",
        instruments: {
          piano: "Songwriter style.",
          guitar: "Acoustic focus.",
          ukulele: "Strumming.",
        },
        visual_chord: "Maj7",
        key_traits: ["Urban Lyrics", "Singer-Songwriter", "Transition"],
      },
      {
        id: "city-pop",
        name: "City Pop",
        bpm: "100-120",
        timing: "4/4 (Mid-tempo Funk)",
        description:
          "Japan's bubble economy sound. AOR + Funk + Disco.",
        key: "C Major (example Royal Road key)",
        progression: "The Royal Road (Oudou Shinkou)",
        progressionNote:
          "IVmaj7 – V7 – iii7 – vi. Sentimental yet driving; core City Pop DNA.",
        progressionChords: [
          {
            degree: "IVmaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Launches the phrase away from tonic; bright and hopeful.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Classic dominant; provides tension and forward motion.",
          },
          {
            degree: "iii7",
            symbol: "Em7",
            shape: "min7",
            note: "Surprise tonic substitute; smooth voice leading from G7.",
          },
          {
            degree: "vi",
            symbol: "Am7",
            shape: "min7",
            note: "Emotional landing spot; often looped back into IVmaj7.",
          },
        ],
        instruments: {
          piano: "Stabbing off-beat chords, FM Synths.",
          guitar: "Crisp Telecaster rhythm.",
          ukulele: "Maj7/Maj9 funk strum.",
        },
        visual_chord: "Maj7",
        key_traits: ["FM Synths", "Slap Bass", "Royal Road"],
      },
      {
        id: "technopop",
        name: "Technopop",
        bpm: "120-140",
        timing: "4/4 (Machine)",
        description:
          "YMO style. Computerized precision.",
        progression: "Robotic Pentatonics",
        progressionNote:
          "Synth-driven lines over rigid beats.",
        instruments: {
          piano: "Arpeggiators.",
          guitar: "Synth guitar.",
          ukulele: "N/A",
        },
        visual_chord: "Sus4",
        key_traits: ["TR-808", "Vocoders", "Precision"],
      },
      {
        id: "shibuya-kei",
        name: "Shibuya-kei",
        bpm: "Various",
        timing: "Sample-based",
        description:
          "Cut-and-paste aesthetic (Pizzicato Five).",
        progression: "Retro-Chic",
        progressionNote:
          "Maj6 chords, diminished passing. Kitsch.",
        instruments: {
          piano: "Lounge style.",
          guitar: "60s clean strum.",
          ukulele: "Easy listening.",
        },
        visual_chord: "Maj6",
        key_traits: ["Sampling", "French Pop", "Kitsch"],
      },
      {
        id: "j-fusion",
        name: "J-Fusion",
        bpm: "Fast",
        timing: "4/4",
        description:
          "Technical virtuosity meets pop melody (Casiopea).",
        progression: "Mario Cadence",
        progressionNote:
          "bVI – bVII – I. Bright digital piano.",
        instruments: {
          piano: "Bright digital patches.",
          guitar: "High-speed alternate picking.",
          ukulele: "N/A",
        },
        visual_chord: "Sus4",
        key_traits: ["Technical", "Melodic", "Speed"],
      },
      {
        id: "japanese-boogie",
        name: "Japanese Boogie",
        bpm: "105-115",
        timing: "4/4",
        description:
          "The funkier side of City Pop.",
        progression: "Funk Vamps",
        progressionNote:
          "Heavy emphasis on octaves and syncopation.",
        instruments: {
          piano: "Synth bass lines.",
          guitar: "Cutting funk rhythm.",
          ukulele: "Percussive.",
        },
        visual_chord: "Dom9",
        key_traits: ["Octaves", "Syncopation", "Funk"],
      },
      {
        id: "anime-music",
        name: "Anime Music (Anison)",
        bpm: "Fast",
        timing: "4/4",
        description:
          "Harmonic language of 80s/90s themes.",
        progression: "Secondary Dominants",
        progressionNote:
          "Driving modulation. Identical to City Pop/Fusion.",
        instruments: {
          piano: "Driving accompaniment.",
          guitar: "Power chords + Jazz.",
          ukulele: "Melodic.",
        },
        visual_chord: "Maj7",
        key_traits: ["Modulation", "Energy", "Fusion"],
      },
    ],
  },
  {
    id: "phase-5",
    title: "Phase V: Modern Derivatives (90s-Present)",
    genres: [
      {
        id: "acid-jazz",
        name: "Acid Jazz",
        bpm: "100-120",
        timing: "4/4",
        description:
          "Revival of jazz-funk/soul-jazz in UK club scene.",
        progression: "ii7 - V7 loops",
        progressionNote:
          "Altered tensions (V7alt). Sliding Min11 chords.",
        instruments: {
          piano: "Chromatic planing.",
          guitar: "Wah-wah.",
          ukulele: "Jazz chords.",
        },
        visual_chord: "min9",
        key_traits: ["Club Scene", "Altered Tensions", "Loops"],
      },
      {
        id: "new-jack-swing",
        name: "New Jack Swing",
        bpm: "100-110",
        timing: "4/4 (Swing Quantize)",
        description:
          "R&B fused with Hip-Hop swing beats (Teddy Riley).",
        progression: "Orchestral Hits",
        progressionNote:
          "Sharp percussive hits (Orch5). 55-65% swing.",
        instruments: {
          piano: "Staccato synth hits.",
          guitar: "Minimal funk.",
          ukulele: "Swing strum.",
        },
        visual_chord: "Dom7",
        key_traits: ["Swing Quantize", "Orch Hits", "R&B"],
      },
      {
        id: "neo-soul",
        name: "Neo-Soul",
        bpm: "80-95",
        timing: "4/4 (Drunk Beat)",
        description:
          "Hybrid of 70s soul and 90s hip-hop.",
        key: "F Minor (example)",
        progression: "Min9 / Min11 slides",
        progressionNote:
          "Ambiguous quartal voicings and laid-back 'drunk' feel.",
        progressionChords: [
          {
            degree: "i9",
            symbol: "Fm9",
            shape: "min9",
            note: "Warm tonic center; often voiced with clustered inner tones.",
          },
          {
            degree: "iv11",
            symbol: "Bbm11",
            shape: "min9",
            note: "Subdominant color; supports that hazy, suspended quality.",
          },
        ],
        instruments: {
          piano: "Rhodes with tremolo.",
          guitar: "Hendrix Grip (Thumb bass).",
          ukulele: "Fingerstyle soul.",
        },
        visual_chord: "min9",
        key_traits: ["Drunk Feel", "Behind the Grid", "Warmth"],
      },
      {
        id: "hip-hop",
        name: "Hip-Hop (Golden Age)",
        bpm: "90-100",
        timing: "4/4",
        description:
          "Sampling Jazz records (A Tribe Called Quest).",
        progression: "Recontextualization",
        progressionNote:
          "Looping ii-V to create static minor grooves.",
        instruments: {
          piano: "Sampled loops.",
          guitar: "Sampled licks.",
          ukulele: "N/A",
        },
        visual_chord: "min7",
        key_traits: ["Sampling", "Loops", "Jazz Rap"],
      },
      {
        id: "lo-fi",
        name: "Lo-Fi Hip Hop",
        bpm: "70-90",
        timing: "4/4 Swing",
        description:
          "The study beat genre. Jazz samples slowed down.",
        key: "C Minor (example)",
        progression: "ii - V loops",
        progressionNote:
          "Dusty texture. Simple jazz loops that often avoid landing firmly on I.",
        progressionChords: [
          {
            degree: "iiø7",
            symbol: "Dm7b5",
            shape: "m7b5",
            note: "Half-diminished ii; melancholic and unstable.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Dominant often left unresolved or looped for perpetual tension.",
          },
          {
            degree: "i9",
            symbol: "Cm9",
            shape: "min9",
            note: "When used, gives the 'ahh we finally landed' moment.",
          },
        ],
        instruments: {
          piano: "Detuned, wow/flutter.",
          guitar: "Shell voicings.",
          ukulele: "Soft thumb strum.",
        },
        visual_chord: "min9",
        key_traits: ["Vinyl Crackle", "Nostalgia", "Simplicity"],
      },
      {
        id: "future-funk",
        name: "Future Funk",
        bpm: "120-130",
        timing: "4/4 (Dance)",
        description:
          "High-energy dance music built from City Pop.",
        key: "A Minor (Royal Road samples)",
        progression: "Sampled Loops",
        progressionNote:
          "Sidechain compression is the instrument; often based on sped-up City Pop Royal Road.",
        progressionChords: [
          {
            degree: "IVmaj7",
            symbol: "Fmaj7",
            shape: "Maj7",
            note: "Source City Pop flavor; bright and nostalgic.",
          },
          {
            degree: "V7",
            symbol: "G7",
            shape: "Dom7",
            note: "Driving dominant; pushes the loop forward.",
          },
          {
            degree: "iii7",
            symbol: "Em7",
            shape: "min7",
            note: "Keeps motion smooth while feeling slightly bittersweet.",
          },
          {
            degree: "vi",
            symbol: "Am7",
            shape: "min7",
            note: "Minor home; frequently chopped and sidechained.",
          },
        ],
        instruments: {
          piano: "Chopped samples.",
          guitar: "Nile Rodgers loops.",
          ukulele: "N/A",
        },
        visual_chord: "Maj7",
        key_traits: ["Sidechain", "Sped-up", "Anime"],
      },
      {
        id: "vaporwave",
        name: "Vaporwave",
        bpm: "60-80",
        timing: "4/4 (Slowed)",
        description:
          "Surrealist, slowed-down 'Mallsoft'.",
        progression: "Screwed Samples",
        progressionNote:
          "Slowing smooth jazz to reveal grotesque textures.",
        instruments: {
          piano: "Time-stretched.",
          guitar: "Slowed loops.",
          ukulele: "N/A",
        },
        visual_chord: "Maj7",
        key_traits: ["Mallsoft", "Slowed", "Surrealism"],
      },
      {
        id: "nu-jazz",
        name: "Nu-Jazz",
        bpm: "Various",
        timing: "Broken Beats",
        description:
          "Electronic production meets jazz improvisation.",
        progression: "Syncopation",
        progressionNote:
          "Irregular drum patterns + Jazz harmony.",
        instruments: {
          piano: "Electronic keys.",
          guitar: "Effects laden.",
          ukulele: "Experimental.",
        },
        visual_chord: "11th",
        key_traits: ["Broken Beats", "Electronic", "Improv"],
      },
    ],
  },
];

// -----------------------------------------
// HELPERS
// -----------------------------------------

const getCommonKeys = (genre: Genre): string[] => {
  if (genre.keys && genre.keys.length > 0) return genre.keys;
  if (genre.key) return [genre.key];
  return ["C Major", "G Major", "F Major"];
};

// -----------------------------------------
// SIDEBAR
// -----------------------------------------

interface SidebarProps {
  activeView: "genre" | "circle";
  setActiveView: React.Dispatch<React.SetStateAction<"genre" | "circle">>;
  activeGenre: Genre;
  setActiveGenre: React.Dispatch<React.SetStateAction<Genre>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  activeGenre,
  setActiveGenre,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => (
  <div
    className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${
      mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 flex flex-col`}
  >
    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
        <BookOpen className="h-6 w-6" />
        <span>Theory Codex</span>
      </div>
      <button
        onClick={() => setMobileMenuOpen(false)}
        className="md:hidden text-slate-400"
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-2">
        <button
          onClick={() => {
            setActiveView("circle");
            setMobileMenuOpen(false);
          }}
          className={`w-full text-left px-4 py-3 rounded-lg mb-4 flex items-center gap-3 font-semibold transition-all ${
            activeView === "circle"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/50"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <Disc className="h-5 w-5" />
          Circle of Fifths
        </button>

        {phases.map((phase) => (
          <div key={phase.id} className="mb-4">
            <div className="px-3 py-2 text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              {phase.title}
            </div>
            <ul>
              {phase.genres.map((genre) => (
                <li key={genre.id}>
                  <button
                    onClick={() => {
                      setActiveGenre(genre);
                      setActiveView("genre");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors rounded-md mx-1 w-[95%] ${
                      activeView === "genre" && activeGenre.id === genre.id
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{genre.name}</span>
                    {activeView === "genre" &&
                      activeGenre.id === genre.id && (
                        <ChevronRight className="h-3 w-3" />
                      )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
      v3.1.0 • Complete Edition
    </div>
  </div>
);

// -----------------------------------------
// MAIN APP
// -----------------------------------------

const MusicCodexApp: React.FC = () => {
  const [activeView, setActiveView] = useState<"genre" | "circle">("genre");
  const [activeGenre, setActiveGenre] = useState<Genre>(
    phases[3].genres[2] // Default to City Pop
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="md:hidden fixed top-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-700 p-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <BookOpen className="h-5 w-5" />
          <span>Codex</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-white p-1 hover:bg-slate-800 rounded"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <main className="md:ml-72 min-h-screen transition-all duration-500">
        {activeView === "circle" ? (
          <div className="p-6 md:p-12 pt-24 md:pt-12 flex flex-col justify-center min-h-screen">
            <CircleOfFifthsTool />
          </div>
        ) : (
          <div className="p-6 md:p-12 pt-24 md:pt-12 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
              <span>codex</span>
              <ChevronRight className="h-3 w-3" />
              <span>{activeGenre.id}</span>
            </div>

            {/* Header */}
            <header className="mb-8 border-b border-slate-800 pb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                    {activeGenre.name}
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                    {activeGenre.description}
                  </p>

                  {activeGenre.key && (
                    <p className="mt-3 text-sm font-mono text-slate-300">
                      Primary key:{" "}
                      <span className="text-indigo-300">
                        {activeGenre.key}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activeGenre.bpm} BPM
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {activeGenre.timing}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {activeGenre.key_traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-default"
                  >
                    #{trait}
                  </span>
                ))}
              </div>
            </header>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: theory + visualizer */}
              <div className="lg:col-span-2 space-y-8">
                {/* Harmonic Analysis */}
                <section>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-400" />
                    Harmonic Analysis
                  </h2>
                  <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-500 uppercase">
                        Core Progression
                      </span>
                      <Copy
                        className="h-4 w-4 text-slate-600 cursor-pointer hover:text-white transition-colors"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            activeGenre.progression
                          )
                        }
                      />
                    </div>
                    <div className="p-6">
                      <code className="text-2xl md:text-3xl text-emerald-400 font-mono block mb-4 font-bold">
                        {activeGenre.progression}
                      </code>
                      <div className="flex gap-3 items-start">
                        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-slate-400 text-sm italic leading-relaxed">
                          {activeGenre.progressionNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* (Optional) extra educational notes per genre */}
                {activeGenre.theoryNotes && (
                  <section>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">
                      Writing Tips / Theory
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
                      {activeGenre.theoryNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Instrument Visualizer */}
                <InstrumentVisualizer genre={activeGenre} />
              </div>

              {/* Right: Reference lab + keys */}
              <div className="space-y-6">
                {/* Reference Lab */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Headphones className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-lg">Reference Lab</span>
                    </div>
                    <p className="text-indigo-100 text-sm mb-6">
                      Generate a curated playlist of the best{" "}
                      {activeGenre.name} tracks.
                    </p>
                    <a
                      href={`https://www.youtube.com/results?search_query=best+${activeGenre.name.replace(
                        / /g,
                        "+"
                      )}+mix`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-indigo-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Listen on YouTube
                    </a>
                  </div>
                </div>

                {/* Common Keys */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4" /> Common Keys
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getCommonKeys(activeGenre).map((k) => (
                      <span
                        key={k}
                        className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded text-sm font-mono border border-slate-800"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MusicCodexApp;
