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
