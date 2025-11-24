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
  Rocket,
  FolderTree,
  Plug,
  Lightbulb,
} from "lucide-react";
import { CircleOfFifthsTool } from "./CircleOfFifthsTool";
import { InstrumentVisualizer, deriveProgressionChords } from "./InstrumentVisualizer";
import { LooperSequencer } from "./LooperSequencer";
import { phases } from "./data/phases";
import { phaseHistories } from "./data/phaseHistories";
import { genreHistories } from "./data/genreHistories";
import { Genre, Phase } from "./types/codex";

/* ---------- SIDEBAR ---------- */

interface SidebarProps {
  activeView: "home" | "genre" | "circle" | "phase";
  setActiveView: (view: "home" | "genre" | "circle" | "phase") => void;
  activePhaseId: string;
  onPhaseSelect: (phaseId: string) => void;
  activeGenre: Genre;
  onGenreSelect: (genre: Genre) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  activePhaseId,
  onPhaseSelect,
  activeGenre,
  onGenreSelect,
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
              setActiveView("home");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold text-sm transition-all
            ${
              activeView === "home"
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/50 shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Rocket className="h-5 w-5" />
            Overview / Homepage
          </button>

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
              <button
                onClick={() => {
                  onPhaseSelect(phase.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 rounded-md border transition-colors
                ${
                  activePhaseId === phase.id && activeView === "phase"
                    ? "bg-indigo-600/20 text-white border-indigo-500/60"
                    : "text-indigo-400 border-transparent hover:bg-slate-800 hover:text-white"
                }
              `}
              >
                <GitBranch className="h-3 w-3" />
                {phase.title}
              </button>
              <ul className="space-y-1">
                {phase.genres.map((genre) => {
                  const isActive =
                    activeView === "genre" && activeGenre.id === genre.id;
                  return (
                    <li key={genre.id}>
                      <button
                        onClick={() => {
                          onGenreSelect(genre);
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
  const [activeView, setActiveView] = useState<
    "home" | "genre" | "circle" | "phase"
  >("home");
  const [activePhaseId, setActivePhaseId] = useState(phases[3].id);
  const [activeGenre, setActiveGenre] = useState<Genre>(phases[3].genres[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalGenres = useMemo(
    () => phases.reduce((sum, phase) => sum + phase.genres.length, 0),
    []
  );

  const chordsForActive = useMemo(
    () => deriveProgressionChords(activeGenre),
    [activeGenre]
  );

  const activePhase = useMemo<Phase | undefined>(() => {
    const selectedPhase = phases.find((phase) => phase.id === activePhaseId);
    if (selectedPhase) return selectedPhase;
    return phases.find((phase) =>
      phase.genres.some((g) => g.id === activeGenre.id)
    );
  }, [activeGenre, activePhaseId]);

  const activePhaseHistory = useMemo(
    () => (activePhase ? phaseHistories[activePhase.id] : undefined),
    [activePhase]
  );

  const handlePhaseSelect = (phaseId: string) => {
    setActivePhaseId(phaseId);
    setActiveView("phase");
  };

  const handleGenreSelect = (genre: Genre) => {
    setActiveGenre(genre);
    const parentPhase = phases.find((phase) =>
      phase.genres.some((g) => g.id === genre.id)
    );
    if (parentPhase) {
      setActivePhaseId(parentPhase.id);
    }
    setActiveView("genre");
  };

  const genreHistory = useMemo(
    () => genreHistories[activeGenre.id] ?? activeGenre.description,
    [activeGenre]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activePhaseId={activePhaseId}
        onPhaseSelect={(phaseId) => {
          handlePhaseSelect(phaseId);
          setMobileMenuOpen(false);
        }}
        activeGenre={activeGenre}
        onGenreSelect={handleGenreSelect}
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
        ) : activeView === "home" ? (
          <div className="pt-20 md:pt-10 px-3 sm:px-6 lg:px-10 w-full max-w-screen-2xl mx-auto space-y-8 lg:space-y-10">
            {/* Hero */}
            <section className="bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-amber-500/30 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] uppercase font-semibold text-white/90">
                    <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono">Live Toolkit</span>
                    <span>Circle • Phase Maps • Instrument Lab</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    A hands-on harmony workstation for {totalGenres}+ genre studies
                  </h1>
                  <p className="text-sm sm:text-base text-indigo-50/90 leading-relaxed max-w-3xl">
                    Jump between the Circle of Fifths, phase timelines, and chord visualizers without leaving the browser. Each view reads from the same data set so you can audition progressions, compare eras, and grab voicings quickly.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveView("circle")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold text-sm shadow-lg hover:bg-indigo-50"
                    >
                      <Key className="h-4 w-4" /> Open Circle of Fifths
                    </button>
                    <button
                      onClick={() => setActiveView("phase")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/60 border border-white/20 text-white text-sm hover:bg-slate-900"
                    >
                      <GitBranch className="h-4 w-4" /> Browse Phases
                    </button>
                    <button
                      onClick={() => setActiveView("genre")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/60 border border-white/20 text-white text-sm hover:bg-slate-900"
                    >
                      <Headphones className="h-4 w-4" /> See Active Genre
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[{
                      label: "Historical Phases",
                      value: phases.length,
                      icon: GitBranch,
                    },
                    {
                      label: "Genres Mapped",
                      value: totalGenres,
                      icon: FolderTree,
                    },
                    {
                      label: "Chord Shapes",
                      value: "Piano · Guitar · Ukulele",
                      icon: Headphones,
                    },
                    {
                      label: "Built With",
                      value: "React • Vite • Tailwind",
                      icon: Rocket,
                    }].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-slate-950/50 border border-white/15 rounded-xl p-3 flex items-center gap-3"
                      >
                        <span className="p-2 rounded-lg bg-white/10 text-white">
                          <stat.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[11px] uppercase text-indigo-100/80 font-semibold">{stat.label}</p>
                          <p className="text-sm text-slate-100 font-bold">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 w-full lg:w-96 space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <BookOpen className="h-6 w-6" />
                    <div>
                      <p className="text-[11px] uppercase font-semibold tracking-wide text-indigo-200">Current focus</p>
                      <p className="text-sm">{activeGenre.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeGenre.description}
                  </p>
                  <div className="bg-slate-900/70 border border-white/5 rounded-lg p-3 space-y-2">
                    <p className="text-[11px] uppercase text-indigo-200 font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" /> Progression
                    </p>
                    <p className="text-slate-100 font-mono text-sm">
                      {activeGenre.progression}
                    </p>
                    <p className="text-[11px] text-slate-400">{activeGenre.progressionNote}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeGenre.key_traits.slice(0, 4).map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-indigo-100"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveView("genre")}
                    className="w-full bg-white text-indigo-900 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Open genre view
                  </button>
                </div>
              </div>
            </section>

            {/* Workbench overview */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {[{
                title: "Circle of Fifths",
                description:
                  "Transpose or pivot quickly with an interactive wheel that keeps scale degrees and relative minors aligned.",
                icon: Key,
                action: () => setActiveView("circle"),
                cta: "Launch the circle",
              },
              {
                title: "Phase Timeline",
                description:
                  "Move between Ragtime, Swing, Funk, City Pop, and Future Funk without losing the learning pillars for each era.",
                icon: Clock,
                action: () => setActiveView("phase"),
                cta: "View current phase",
              },
              {
                title: "Instrument Lab",
                description:
                  "See piano, guitar, and ukulele shapes for every chord in the active progression to keep arrangements coherent.",
                icon: Headphones,
                action: () => setActiveView("genre"),
                cta: "Show chord grips",
              }].map((card) => (
                <div
                  key={card.title}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3 text-white">
                    <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] uppercase font-semibold text-indigo-200/80">Core View</p>
                      <h2 className="text-xl font-bold">{card.title}</h2>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed flex-1">{card.description}</p>
                  <button
                    onClick={card.action}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-100 font-semibold text-sm hover:bg-indigo-500/30"
                  >
                    <ChevronRight className="h-4 w-4" /> {card.cta}
                  </button>
                </div>
              ))}
            </section>

            {/* Active genre briefing */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <FileText className="h-6 w-6 text-indigo-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-indigo-200/80">Progression Notebook</p>
                    <h2 className="text-xl font-bold">{activeGenre.name}</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-200">
                  {[{ label: "BPM", value: activeGenre.bpm }, { label: "Feel", value: activeGenre.timing }, { label: "Key", value: getCommonKeys(activeGenre)[0] }, { label: "Phase", value: activePhase?.title ?? "" }].map((item) => (
                    <div key={item.label} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <p className="text-[11px] uppercase text-slate-400 font-semibold">{item.label}</p>
                      <p className="text-slate-100 font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
                  <p className="text-[11px] uppercase text-indigo-200 font-semibold flex items-center gap-2">
                    <Plug className="h-4 w-4" /> Chord plan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chordsForActive.map((chord) => (
                      <span
                        key={`${chord.degree}-${chord.symbol}`}
                        className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[12px] text-slate-100 font-mono"
                      >
                        {chord.degree} → {chord.symbol}
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] text-slate-400 leading-snug">{activeGenre.progressionNote}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[{ label: "Piano", value: activeGenre.instruments.piano }, { label: "Guitar", value: activeGenre.instruments.guitar }, { label: "Ukulele", value: activeGenre.instruments.ukulele }].map((instrument) => (
                    <div key={instrument.label} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <p className="text-[11px] uppercase text-emerald-200 font-semibold">{instrument.label}</p>
                      <p className="text-[13px] text-slate-200 leading-snug mt-1">{instrument.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Search className="h-6 w-6 text-emerald-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-emerald-200/80">Phase shortlist</p>
                    <h2 className="text-xl font-bold">Where to explore next</h2>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="bg-slate-950/50 border border-slate-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold">
                          <GitBranch className="h-4 w-4" /> {phase.title}
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-100">
                          {phase.genres.length} genres
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400 mt-1 leading-snug">{phase.learning[0]}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {phase.genres.slice(0, 3).map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => handleGenreSelect(genre)}
                            className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-100 hover:border-indigo-400"
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : activeView === "phase" && activePhase && activePhaseHistory ? (
          <div className="pt-20 md:pt-10 px-3 sm:px-6 lg:px-10 w-full max-w-screen-2xl mx-auto space-y-8 lg:space-y-10">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-slate-500 mb-4 md:mb-6">
              <span>codex</span>
              <ChevronRight className="h-3 w-3" />
              <span>{activePhase.id}</span>
            </div>

            <header className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-100">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-mono tracking-wide text-indigo-200/80">Phase History</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    {activePhase.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
                    {activePhaseHistory.summary}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-[10px] sm:text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  {activePhase.genres.length} genres mapped
                </span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] sm:text-xs font-semibold text-amber-200 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {activePhase.learning.length} theory pillars
                </span>
              </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wide">
                  <Info className="h-4 w-4" />
                  Overview
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {activePhaseHistory.summary}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-100 text-sm">
                  {activePhaseHistory.highlights.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wide">
                  <Lightbulb className="h-4 w-4" />
                  Theory Pillars
                </div>
                <ul className="space-y-2 text-slate-100 text-sm">
                  {activePhase.learning.map((item) => (
                    <li
                      key={item}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-indigo-300" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Featured Genres
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Choose a genre to view its breakdown and chord tools.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {activePhase.genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre)}
                    className="text-left bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/60 hover:bg-slate-900 transition-colors"
                  >
                    <p className="text-[11px] uppercase text-indigo-200/80 font-semibold flex items-center gap-2">
                      <GitBranch className="h-3 w-3" /> {activePhase.title}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-tight mt-1">
                      {genre.name}
                    </h3>
                    <p className="text-[13px] text-slate-300 leading-snug mt-1 line-clamp-3">
                      {genre.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
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
                      <p className="text-[10px] uppercase font-mono tracking-wide text-indigo-100/80">Genre History</p>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                        {activeGenre.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 leading-relaxed">
                        {genreHistory}
                      </p>
                      <button
                        onClick={() => handlePhaseSelect(activePhase.id)}
                        className="mt-3 inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-indigo-50 underline-offset-4 hover:underline"
                      >
                        <GitBranch className="h-3 w-3" />
                        Explore {activePhase.title} history
                      </button>
                    </div>
                  </div>
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

                <LooperSequencer chords={chordsForActive} />

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
