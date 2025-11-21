import React, { useState } from 'react';
import { 
  Music, GitBranch, BookOpen, Play, Search, Menu, X, 
  ChevronRight, Piano, Guitar, Headphones, Clock, Key, 
  Copy, FileText, Disc, Zap, Info
} from 'lucide-react';

// --- 1. DATA & MUSIC THEORY ENGINE ---

// Chord Shapes Database (Simplified for common jazz/pop voicings)
const chordShapes: Record<string, { piano: number[], guitar: number[], uke: number[] }> = {
  // Piano: [indices of keys to highlight relative to root 0]
  // Guitar/Uke: [string 6,5,4,3,2,1] (-1 = mute, 0 = open)
  "Maj7": {
    piano: [0, 4, 7, 11], 
    guitar: [-1, 0, 2, 1, 0, 0], // A-shape or similar
    uke: [0, 0, 0, 0] 
  },
  "min7": {
    piano: [0, 3, 7, 10],
    guitar: [0, 2, 0, 0, 0, 0], // Em7 shape
    uke: [0, 0, 0, 0] // Open C6/Am7
  },
  "Dom7": {
    piano: [0, 4, 7, 10],
    guitar: [0, 2, 0, 1, 0, 0], // E7 shape
    uke: [0, 1, 0, 0]
  },
  "Dom9": {
    piano: [0, 4, 10, 14],
    guitar: [-1, 2, 1, 2, 2, 2], // B7/C9 shape
    uke: [0, 2, 1, 2]
  },
  "min9": {
    piano: [0, 3, 7, 10, 14],
    guitar: [-1, 0, 2, 0, 0, 0],
    uke: [0, 2, 0, 2]
  },
  "6/9": {
    piano: [0, 4, 7, 9, 14],
    guitar: [-1, 2, 2, 2, 2, 2], // A6/9
    uke: [0, 2, 0, 2]
  }
};

interface Genre {
  id: string;
  name: string;
  bpm: string;
  timing: string;
  description: string;
  progression: string;
  progressionNote: string;
  instruments: {
    piano: string;
    guitar: string;
    ukulele: string;
    [key: string]: string;
  };
  visual_chord: string;
  key_traits: string[];
}

interface Phase {
  id: string;
  title: string;
  genres: Genre[];
}

const phases: Phase[] = [
  {
    id: "phase-1",
    title: "Phase I: The Roots (1900s-1940s)",
    genres: [
      {
        id: "delta-blues",
        name: "Delta Blues",
        bpm: "60-80",
        timing: "12/8 (Shuffle)",
        description: "The raw foundation of modern music. Slide guitar and call-and-response vocals.",
        progression: "I7 – IV7 – I7 – V7 – IV7 – I7",
        progressionNote: "The standard 12-Bar Blues. Often uses Dominant 7ths for all chords.",
        instruments: {
          piano: "Crushed grace notes, tremolo octaves.",
          guitar: "Slide (bottleneck), open tunings (Vestapol).",
          ukulele: "Shuffle strum, blues scale runs."
        },
        visual_chord: "Dom7",
        key_traits: ["12-Bar Structure", "Blue Notes", "Call & Response"]
      },
      {
        id: "ragtime",
        name: "Ragtime",
        bpm: "90-110",
        timing: "2/4",
        description: "Syncopated melody lines against a steady 'stride' bass.",
        progression: "I – VI7 – II7 – V7",
        progressionNote: "Circle of Fifths Turnaround (e.g., C - A7 - D7 - G7).",
        instruments: {
          piano: "Stride: LH root (1/3) then chord (2/4). RH syncopation.",
          guitar: "Alternating bass picking (Travis picking precursor).",
          ukulele: "Split Strum: Down (Low), Up (High)."
        },
        visual_chord: "Dom7",
        key_traits: ["Stride Piano", "Syncopation", "March Feel"]
      },
      {
        id: "swing",
        name: "Swing / Big Band",
        bpm: "120-160",
        timing: "4/4 Swung",
        description: "The dance era. Walking bass lines and 'four-to-the-floor'.",
        progression: "ii7 – V7 – Imaj7",
        progressionNote: "The fundamental unit of Jazz harmony.",
        instruments: {
          piano: "Shell voicings (Root-7 or Root-3). Rhythm guitar emulation.",
          guitar: "Freddie Green style: 3-note chords on lower strings.",
          ukulele: "Triplet strumming, damping strings."
        },
        visual_chord: "Maj7",
        key_traits: ["Walking Bass", "Sectionals", "Lindy Hop"]
      },
      {
        id: "gypsy-jazz",
        name: "Gypsy Jazz (Manouche)",
        bpm: "200+",
        timing: "4/4 (La Pompe)",
        description: "Django Reinhardt's style. Acoustic, percussive, and virtuosic.",
        progression: "i6 – iv6 – V7",
        progressionNote: "Minor tonality focus. Use of m6 chords for tonic.",
        instruments: {
          piano: "Rarely used. Accordion often substitutes.",
          guitar: "La Pompe rhythm: Heavy downstroke accent on 2 & 4.",
          ukulele: "Fast triplets, diminished runs."
        },
        visual_chord: "min7",
        key_traits: ["La Pompe", "Minor 6th", "Chromatic Runs"]
      }
    ]
  },
  {
    id: "phase-2",
    title: "Phase II: Modern Jazz & Soul (50s-60s)",
    genres: [
      {
        id: "bebop",
        name: "Bebop",
        bpm: "200-300",
        timing: "4/4 Fast Swing",
        description: "Complex, art-music jazz. Fast tempos and harmonic substitution.",
        progression: "I – vi – ii – V (Rhythm Changes)",
        progressionNote: "Heavy use of Tritone Substitutions (e.g., Dm7 - Db7 - Cmaj7).",
        instruments: {
          piano: "Bud Powell shells. Sparse LH, rapid RH.",
          guitar: "Single note chromatic lines. Drop-2 chords.",
          ukulele: "Comping only, avoiding full strums."
        },
        visual_chord: "Dom9",
        key_traits: ["Virtuosity", "Tritone Sub", "Extensions"]
      },
      {
        id: "bossa-nova",
        name: "Bossa Nova",
        bpm: "120-140",
        timing: "2/4",
        description: "Brazilian Samba slowed down with Cool Jazz harmony.",
        progression: "Imaj7 – II7 – ii7 – bII7",
        progressionNote: "Jobim changes. The bII7 is a tritone sub for V.",
        instruments: {
          piano: "Dense clusters, rhythm mimics guitar.",
          guitar: "Thumb plays bass on 1 & 3, fingers pluck offbeats.",
          ukulele: "Clave pattern strumming."
        },
        visual_chord: "6/9",
        key_traits: ["Clave", "Nylon String", "Whisper Vocals"]
      },
      {
        id: "motown",
        name: "Motown",
        bpm: "100-130",
        timing: "4/4",
        description: "The Sound of Young America. Pop structures with gospel roots.",
        progression: "I – vi – IV – V",
        progressionNote: "Simple progressions masked by elaborate orchestration.",
        instruments: {
          piano: "Gospel block chords, doubling snare on 2 & 4.",
          guitar: "The 'Chink': percussive backbeat hits.",
          ukulele: "Muted backbeat strikes."
        },
        visual_chord: "Maj7",
        key_traits: ["Melodic Bass", "Tambourine", "Orchestration"]
      }
    ]
  },
  {
    id: "phase-3",
    title: "Phase III: Funk, Fusion & AOR (70s-80s)",
    genres: [
      {
        id: "funk",
        name: "Deep Funk",
        bpm: "90-110",
        timing: "4/4",
        description: "James Brown. Everything is a drum. The 'One' is sacred.",
        progression: "Static I7 or I9",
        progressionNote: "Minimal harmonic movement. Rhythm > Melody.",
        instruments: {
          piano: "Clavinet rhythmic patterns.",
          guitar: "16th note scratching. E9 shape.",
          ukulele: "Ghost note strumming."
        },
        visual_chord: "Dom9",
        key_traits: ["The One", "Ghost Notes", "Syncopated Bass"]
      },
      {
        id: "yacht-rock",
        name: "Yacht Rock / AOR",
        bpm: "75-100",
        timing: "4/4 (Doobie Bounce)",
        description: "Smooth, highly produced soft rock. Steely Dan aesthetics.",
        progression: "I – iii7 – IVmaj7 – V11",
        progressionNote: "Mu-Major chords (add2) and slash chords (F/G).",
        instruments: {
          piano: "Rhodes Electric Piano. Smooth voicing leading.",
          guitar: "Clean compression, phaser effects.",
          ukulele: "Jazz chords, relaxed swing."
        },
        visual_chord: "Maj7",
        key_traits: ["Smoothness", "Backing Vocals", "Studio Perfection"]
      },
      {
        id: "city-pop",
        name: "City Pop",
        bpm: "110-120",
        timing: "4/4",
        description: "Japanese bubble economy soundtrack. AOR meets Disco.",
        progression: "IVmaj7 – V7 – iii7 – vi7",
        progressionNote: "The 'Royal Road' (Oudou Shinkou). Sentimental but driving.",
        instruments: {
          piano: "Stabbing off-beat chords, DX7 synth bells.",
          guitar: "Clean cutting rhythm (Telecaster).",
          ukulele: "Maj7/9 chords, funk strum."
        },
        visual_chord: "Maj7",
        key_traits: ["Urban", "Nostalgia", "FM Synthesis"]
      }
    ]
  },
  {
    id: "phase-4",
    title: "Phase IV: Electronic & Beats (90s-Present)",
    genres: [
      {
        id: "neo-soul",
        name: "Neo-Soul",
        bpm: "80-95",
        timing: "4/4 (Drunk Beat)",
        description: "Soul revival with hip-hop swing (D'Angelo/J Dilla).",
        progression: "min9 – min11 slides",
        progressionNote: "Parallel chord movement. Ambiguous quartal voicings.",
        instruments: {
          piano: "Rhodes with heavy tremolo. Laid back timing.",
          guitar: "Hendrix style hammer-ons, double stops.",
          ukulele: "Fingerstyle soul riffs."
        },
        visual_chord: "min9",
        key_traits: ["Drunk Feel", "Behind the Beat", "Warmth"]
      },
      {
        id: "lo-fi",
        name: "Lo-Fi Hip Hop",
        bpm: "70-90",
        timing: "4/4 Swing",
        description: "Relaxed, dusty beats to study/relax to.",
        progression: "ii9 – V13 – Imaj9",
        progressionNote: "Jazz samples slowed down and looped.",
        instruments: {
          piano: "Detuned, wow/flutter effects.",
          guitar: "Simple jazz shell voicings, neck pickup.",
          ukulele: "Thumb strumming, mellow tone."
        },
        visual_chord: "min9",
        key_traits: ["Vinyl Noise", "Sidechain", "Simplicity"]
      },
      {
        id: "future-funk",
        name: "Future Funk",
        bpm: "120-135",
        timing: "4/4 Hard House",
        description: "Sped up City Pop samples with heavy drums.",
        progression: "Sampled Loops",
        progressionNote: "High pass filtered disco loops.",
        instruments: {
          piano: "Chopped samples.",
          guitar: "Funk loops sped up.",
          ukulele: "N/A (DAW focus)."
        },
        visual_chord: "Dom9",
        key_traits: ["French House", "Anime Aesthetic", "High Energy"]
      }
    ]
  }
];

// --- 2. VISUALIZER COMPONENTS ---

const PianoKeys = ({ highlightIndices }: { highlightIndices: number[] }) => {
  const keys: { i: number; isBlack: boolean; isActive: boolean }[] = [];
  
  // Generate 2 octaves
  for (let i = 0; i < 24; i++) {
    const noteInOctave = i % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
    const isActive = highlightIndices.some(idx => (idx % 12) === noteInOctave);
    keys.push({ i, isBlack, isActive });
  }

  return (
    <div className="relative h-32 w-full max-w-md mx-auto select-none">
      {/* White Keys Layer */}
      <div className="absolute inset-0 flex">
        {keys.filter(k => !k.isBlack).map((k) => (
          <div 
            key={`w-${k.i}`}
            className={`flex-1 border border-slate-400 rounded-b-md mx-[1px] transition-colors duration-300
              ${k.isActive ? 'bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'bg-white'}`}
          />
        ))}
      </div>
      {/* Black Keys Layer */}
      <div className="absolute inset-0 flex pointer-events-none">
        {keys.map((k, idx) => {
          if (!k.isBlack) return <div key={idx} className="flex-1 bg-transparent" />;
          return (
            <div key={idx} className="flex-1 relative">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-b-sm z-10 transition-colors duration-300
                ${k.isActive ? 'bg-indigo-600' : 'bg-slate-900'}`} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TabFretboard = ({ strings }: { strings: number[] }) => {
  const numStrings = strings.length;
  
  return (
    <div className="flex flex-col items-center justify-center py-4 bg-slate-900 rounded-lg">
      <div className="relative w-full max-w-[200px]">
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-600 rounded-t-sm"></div>
        
        <div className="grid grid-cols-1 gap-8 mt-2 border-l border-r border-slate-700 px-4 pb-4">
           {[1,2,3,4].map(fret => (
             <div key={fret} className="relative h-10 border-b border-slate-600 flex justify-between items-center">
               {Array.from({length: numStrings}).map((_, strIdx) => (
                 <div key={strIdx} className="absolute h-full w-[1px] bg-slate-500" style={{left: `${(strIdx / (numStrings-1)) * 100}%`, top: -40}}>
                    {strings[strIdx] === fret && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-lg z-10"></div>
                    )}
                 </div>
               ))}
               <span className="absolute -right-6 text-xs text-slate-500 font-mono">{fret}</span>
             </div>
           ))}
        </div>

        <div className="absolute -top-6 left-0 right-0 flex justify-between px-4">
          {strings.map((val, idx) => (
            <div key={idx} className="w-0 flex justify-center" style={{position: 'absolute', left: `${(idx / (numStrings-1)) * 100}%`}}>
              {val === 0 && <div className="w-3 h-3 rounded-full border-2 border-slate-400"></div>}
              {val === -1 && <div className="text-red-400 font-bold text-xs">X</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CircleOfFifthsTool = () => {
  const [activeKey, setActiveKey] = useState(0);
  const keys = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
  const relatives = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "Bbm", "Fm", "Cm", "Gm", "Dm"];

  const getRotation = (index: number) => {
    return `rotate(${index * 30} 200 200)`;
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
        <Disc className="h-6 w-6 text-amber-400 animate-spin-slow" />
        Interactive Circle of Fifths
      </h2>
      
      <div className="relative w-full max-w-[400px] aspect-square mx-auto mb-8">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle cx="200" cy="200" r="195" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          
          {keys.map((k, i) => {
            const isActive = i === activeKey;
            const isNeighbor = Math.abs(i - activeKey) === 1 || Math.abs(i - activeKey) === 11;
            
            return (
              <g key={k} transform={getRotation(i)} onClick={() => setActiveKey(i)} className="cursor-pointer transition-all duration-300">
                <path 
                  d="M200 200 L200 20 A180 180 0 0 1 290 44 Z" 
                  fill={isActive ? "#4f46e5" : isNeighbor ? "#334155" : "#1e293b"}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-all"
                />
                <text 
                  x="235" 
                  y="60" 
                  fill={isActive ? "#fff" : "#94a3b8"} 
                  fontSize="20" 
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(-${i * 30 + 15} 235 60)`}
                >
                  {k}
                </text>
                <text 
                  x="235" 
                  y="90" 
                  fill={isActive ? "#fbbf24" : "#64748b"} 
                  fontSize="14" 
                  textAnchor="middle"
                  transform={`rotate(-${i * 30 + 15} 235 90)`}
                >
                  {relatives[i]}
                </text>
              </g>
            );
          })}
          
          <circle cx="200" cy="200" r="60" fill="#0f172a" stroke="#475569" />
          <text x="200" y="195" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">SELECTED</text>
          <text x="200" y="220" fill="#fbbf24" textAnchor="middle" fontSize="24" fontWeight="bold">{keys[activeKey]}</text>
        </svg>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl text-left border border-slate-700">
        <h3 className="text-lg font-semibold text-indigo-400 mb-2">How to use this key</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex gap-2"><span className="text-indigo-400 font-bold">I (Tonic):</span> {keys[activeKey]} Major</li>
          <li className="flex gap-2"><span className="text-amber-400 font-bold">vi (Relative Minor):</span> {relatives[activeKey]}</li>
          <li className="flex gap-2"><span className="text-slate-400 font-bold">IV (Subdominant):</span> {keys[(activeKey + 11) % 12]} (Left neighbor)</li>
          <li className="flex gap-2"><span className="text-slate-400 font-bold">V (Dominant):</span> {keys[(activeKey + 1) % 12]} (Right neighbor)</li>
        </ul>
        <p className="mt-4 text-xs text-slate-500 italic">
          Pro Tip: City Pop often borrows chords from the parallel minor key to create a nostalgic feeling. Try swapping {keys[activeKey]} Major for {keys[activeKey]} Minor occasionally.
        </p>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENTS ---

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  activeGenre, 
  setActiveGenre, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: {
  activeView: string;
  setActiveView: (v: string) => void;
  activeGenre: Genre;
  setActiveGenre: (g: Genre) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) => (
  <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
        <BookOpen className="h-6 w-6" />
        <span>Theory Codex</span>
      </div>
      <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
        <X className="h-6 w-6" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-2">
        <button 
          onClick={() => { setActiveView('circle'); setMobileMenuOpen(false); }}
          className={`w-full text-left px-4 py-3 rounded-lg mb-4 flex items-center gap-3 font-semibold transition-all ${activeView === 'circle' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50' : 'text-slate-400 hover:bg-slate-800'}`}
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
                      setActiveView('genre');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors rounded-md mx-1 w-[95%] ${
                      activeView === 'genre' && activeGenre.id === genre.id
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{genre.name}</span>
                    {(activeView === 'genre' && activeGenre.id === genre.id) && <ChevronRight className="h-3 w-3" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
      v2.1.0 • React • Tailwind
    </div>
  </div>
);

const InstrumentVisualizer = ({ genre }: { genre: Genre }) => {
  const [activeTab, setActiveTab] = useState('piano');
  const chordData = chordShapes[genre.visual_chord] || chordShapes["Maj7"];

  const tabs = [
    { id: 'piano', label: 'Piano', icon: Piano },
    { id: 'guitar', label: 'Guitar', icon: Guitar },
    { id: 'uke', label: 'Ukulele', icon: Music },
  ];

  return (
    <div className="mt-6 border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          Visualizer Engine: <span className="font-mono text-indigo-300">{genre.visual_chord} Voicing</span>
        </h3>
        <div className="flex bg-slate-900 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-8 flex justify-center items-center min-h-[200px] bg-slate-900/50">
        {activeTab === 'piano' && (
          <div className="w-full">
            <PianoKeys highlightIndices={chordData.piano} />
            <p className="text-center text-xs text-slate-500 mt-4">Highlighted keys show a typical {genre.visual_chord} voicing rooted on C</p>
          </div>
        )}
        {activeTab === 'guitar' && (
          <div className="w-full">
            <TabFretboard strings={chordData.guitar} />
            <p className="text-center text-xs text-slate-500 mt-4">Standard Tuning (E A D G B e)</p>
          </div>
        )}
        {activeTab === 'uke' && (
          <div className="w-full">
             <TabFretboard strings={chordData.uke} />
             <p className="text-center text-xs text-slate-500 mt-4">Standard Tuning (G C E A)</p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-800/80 p-4 border-t border-slate-700">
        <p className="text-slate-300 text-sm leading-relaxed">
          <span className="text-indigo-400 font-bold">Pro Tip: </span>
          {genre.instruments[activeTab === 'uke' ? 'ukulele' : activeTab]}
        </p>
      </div>
    </div>
  );
};

// --- 4. MAIN APP ---

export default function MusicCodexApp() {
  const [activeView, setActiveView] = useState('genre');
  const [activeGenre, setActiveGenre] = useState(phases[2].genres[2]); // Default City Pop
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900/95 backdrop-blur border-b border-slate-700 p-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <BookOpen className="h-5 w-5" />
          <span>Codex</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="text-white p-1 hover:bg-slate-800 rounded">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-72 min-h-screen transition-all duration-500">
        
        {activeView === 'circle' ? (
          <div className="p-6 md:p-12 pt-24 md:pt-12 flex flex-col justify-center min-h-screen">
             <CircleOfFifthsTool />
          </div>
        ) : (
          <div className="p-6 md:p-12 pt-24 md:pt-12 max-w-5xl mx-auto">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
               <span>codex</span>
               <ChevronRight className="h-3 w-3" />
               <span>{activeGenre.id.split('-')[0]}</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">{activeGenre.id}.md</span>
            </div>

            {/* Genre Header */}
            <header className="mb-8 border-b border-slate-800 pb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                    {activeGenre.name}
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{activeGenre.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                   <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {activeGenre.bpm} BPM
                   </span>
                   <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {activeGenre.timing}
                   </span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {activeGenre.key_traits.map((trait, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-default">
                    #{trait}
                  </span>
                ))}
              </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Theory Info */}
              <div className="lg:col-span-2 space-y-8">
                
                <section>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-indigo-400" />
                    Harmonic Analysis
                  </h2>
                  <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-500 uppercase">Core Progression</span>
                      <Copy className="h-4 w-4 text-slate-600 cursor-pointer hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(activeGenre.progression)} />
                    </div>
                    <div className="p-6">
                      <code className="text-2xl md:text-3xl text-emerald-400 font-mono block mb-4 font-bold">{activeGenre.progression}</code>
                      <div className="flex gap-3 items-start">
                        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-slate-400 text-sm italic leading-relaxed">{activeGenre.progressionNote}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Visualizer Component */}
                <InstrumentVisualizer genre={activeGenre} />
                
              </div>

              {/* Right Column: Audio & Quick Stats */}
              <div className="space-y-6">
                
                {/* Audio Card */}
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
                      Generate a curated playlist of the best {activeGenre.name} tracks.
                    </p>
                    <a 
                      href={`https://www.youtube.com/results?search_query=best+${activeGenre.name.replace(/ /g, '+')}+mix`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-white text-indigo-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Listen on YouTube
                    </a>
                  </div>
                </div>

                {/* Key Keys Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4" /> Common Keys
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["C Major", "Eb Major", "F Minor", "Bb Major"].map(k => (
                      <span key={k} className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded text-sm font-mono border border-slate-800">
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
}
