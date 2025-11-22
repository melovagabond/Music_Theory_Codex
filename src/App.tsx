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
import { phases } from "./data/phases";
import { Genre, Phase } from "./types/codex";

/* ---------- SIDEBAR ---------- */

interface SidebarProps {
  activeView: "home" | "genre" | "circle";
  setActiveView: (view: "home" | "genre" | "circle") => void;
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
  const [activeView, setActiveView] = useState<"home" | "genre" | "circle">(
    "home"
  );
  const [activeGenre, setActiveGenre] = useState<Genre>(
    phases[3].genres[0] // Default to City Pop
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chordsForActive = useMemo(
    () => deriveProgressionChords(activeGenre),
    [activeGenre]
  );

  const activePhase = useMemo<Phase | undefined>(
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
        ) : activeView === "home" ? (
          <div className="pt-20 md:pt-10 px-3 sm:px-6 lg:px-10 w-full max-w-screen-2xl mx-auto space-y-8 lg:space-y-10">
            {/* Hero */}
            <section className="bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-amber-500/30 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] uppercase font-semibold text-white/90">
                    <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono">Docs-as-code</span>
                    <span>Open Source Music Theory Codex</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    The Open Source Music Theory Codex: Jazz to City Pop, Fifty Genres, One Learning Workstation
                  </h1>
                  <p className="text-sm sm:text-base text-indigo-50/90 leading-relaxed max-w-3xl">
                    A dynamic, version-controlled cheat sheet for harmonic and structural analysis across fifty genres. Treat musical knowledge like software: reproducible, searchable, and ready for pull requests.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {["Triad of accompaniment: Piano · Guitar · Ukulele", "Guided by harmonic DNA: ii–V–I, secondary dominants, modal color", "Built for contribution: MkDocs + Material theme, DRY Markdown partials"].map((pill) => (
                      <span
                        key={pill}
                        className="px-3 py-2 bg-slate-950/70 border border-white/10 rounded-lg text-xs sm:text-sm text-indigo-50/90"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 w-full lg:w-80 space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <BookOpen className="h-6 w-6" />
                    <div>
                      <p className="text-[11px] uppercase font-semibold tracking-wide text-indigo-200">Phase Map</p>
                      <p className="text-sm">From Ragtime to Future Funk</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {phases.map((phase) => (
                      <div key={phase.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <p className="text-[11px] uppercase text-indigo-100/80 font-semibold flex items-center gap-2">
                          <GitBranch className="h-3 w-3" /> {phase.title}
                        </p>
                        <p className="text-[12px] text-slate-200/90 mt-1 leading-snug">
                          {phase.learning[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveView("genre")}
                    className="w-full bg-white text-indigo-900 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                    Dive into the Genres
                  </button>
                </div>
              </div>
            </section>

            {/* Architecture */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Rocket className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-amber-200/80">Architecture</p>
                    <h2 className="text-xl font-bold">React, Vite, and Typed Data</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  A lightweight React + TypeScript SPA rendered by Vite and styled with Tailwind CSS. Chord shapes, genres, and phases live in typed data modules, so every update is versioned and diffable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ title: "Typed Components", body: "Shared codex types keep the data model consistent across views." }, { title: "Data-Driven UI", body: "Genre and chord visualizers read straight from JSON/TS sources." }, { title: "Circle of Fifths", body: "Interactive SVG component built with reusable utility hooks." }, { title: "Tailwind Styling", body: "Utility classes keep the docs-like layout lean and themeable." }].map((card) => (
                    <div key={card.title} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                      <p className="text-[11px] uppercase text-indigo-200/80 font-semibold">{card.title}</p>
                      <p className="text-[13px] text-slate-300 leading-snug mt-1">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <FolderTree className="h-6 w-6 text-emerald-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-emerald-200/80">Repository Layout</p>
                    <h2 className="text-xl font-bold">Organized for Seventy+ Genres</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Core app shell, data modules, and styling live side by side so additions stay discoverable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
                  {[{ path: "src/App.tsx", detail: "Landing shell, layout cards, and navigation between tools." }, { path: "src/CircleOfFifthsTool.tsx", detail: "SVG-driven Circle of Fifths selection logic." }, { path: "src/InstrumentVisualizer.tsx", detail: "Piano, guitar, and ukulele voicing grids." }, { path: "src/data/phases.ts", detail: "Seventy-plus genre entries grouped by historical phase." }, { path: "src/data/chords.ts", detail: "Shared chord shape data for the visualizer." }, { path: "src/types/codex.ts", detail: "TypeScript interfaces for phases, genres, and chords." }].map((item) => (
                    <div key={item.path} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                      <p className="font-mono text-xs text-emerald-200">{item.path}</p>
                      <p className="text-[13px] text-slate-300 leading-snug mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Rendering + Contribution */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <Plug className="h-6 w-6 text-indigo-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-indigo-200/80">Rendering Stack</p>
                    <h2 className="text-xl font-bold">Notation Without Bloat</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[{ title: "abcjs", desc: "Browser-rendered staff notation from lightweight ABC text." }, { title: "markdown-it-chords", desc: "Inline chord symbols above lyrics or rhythm charts for cheat-sheet speed." }, { title: "Mermaid.js", desc: "Genre lineage trees from Blues to City Pop and Future Funk." }].map((tool) => (
                    <div key={tool.title} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                      <p className="text-[11px] uppercase text-indigo-200/80 font-semibold">{tool.title}</p>
                      <p className="text-[13px] text-slate-300 leading-snug mt-1">{tool.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  These plugins keep the repository lean—notation, chord grips, and diagrams render from plain text, so every contribution diff is human-readable.
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <Lightbulb className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-amber-200/80">Contribution Workflow</p>
                    <h2 className="text-lg font-bold">Ship theory like code</h2>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Fork → branch → Markdown edits → pull request with automated checks.</li>
                  <li>Keep audio/images in assets; reuse DRY partials for core theory topics.</li>
                  <li>Use mkdocs.yml to register new sections and keep navigation coherent.</li>
                  <li>Favor concise progressions (Royal Road, ii–V–I, slash chords) with instrument grips for piano/guitar/ukulele.</li>
                </ul>
              </div>
            </section>

            {/* Instrument Cheat Sheets */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Headphones className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="text-[11px] uppercase font-semibold text-emerald-200/80">Triad of Accompaniment</p>
                  <h2 className="text-xl font-bold">Instrument Quick References</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[{ title: "Piano", bullets: ["Jazz: shells in LH, syncopated RH stabs for swing", "Funk: clavinet-style octaves and percussive clusters", "City Pop: spread voicings (root–5th–10th) on backbeats", "Reggae/Ska: bubble + bang split between hands"] }, { title: "Guitar", bullets: ["Hendrix grip lets bass + embellishments coexist", "Nile Rodgers strum: constant 16ths, left-hand squeezes on accents", "Freddie Green: short quarter-note shells for swing", "City Pop/Yacht Rock: Mu-major, add9, 11th slash chords"] }, { title: "Ukulele", bullets: ["Jazz: movable diminished 7th slides every 3 frets", "Funk: scratch strum as a percussion layer", "Bossa/Samba: clave-aware syncopation with light touch", "Lo-Fi/Neo-Soul: thumb-only broken chords for warmth"] }].map((instrument) => (
                  <div key={instrument.title} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                    <p className="text-[11px] uppercase text-emerald-200/80 font-semibold">{instrument.title}</p>
                    <ul className="mt-2 space-y-1 text-[13px] text-slate-300 leading-snug list-disc pl-4">
                      {instrument.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Sample Markdown Spec */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-white">
                <FileText className="h-6 w-6 text-indigo-300" />
                <div>
                  <p className="text-[11px] uppercase font-semibold text-indigo-200/80">Markdown Specification</p>
                  <h2 className="text-xl font-bold">Cheat-Sheet Friendly Charts</h2>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Keep charts human-readable: small tables, ABC snippets, chord grids, and inline annotations. Below is a mini template modeled after the codex briefing.
              </p>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-100 space-y-2 overflow-auto">
                <div>Plastic Love — Progression Analysis</div>
                <div>Genre: City Pop | BPM: 105 | Key: D Minor</div>
                <div className="grid grid-cols-4 gap-2 pt-2 text-emerald-300">
                  <span>Bar</span>
                  <span>Chord</span>
                  <span>Voicing (Piano)</span>
                  <span>Function</span>
                </div>
                {["1 | Gm9 | G–Bb–D–F–A | iv7 (Dorian)", "2 | C13 | C–E–Bb–D–A | V7 of III", "3 | Am7 | A–C–E–G | v7", "4 | Dm7 | D–F–A–C | i7"].map((line) => (
                  <div key={line} className="grid grid-cols-4 gap-2 text-slate-200">
                    {line.split(" | ").map((cell, idx) => (
                      <span key={`${line}-${idx}`}>{cell}</span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-slate-400 leading-snug">
                Add a YAML front matter block to register new pages in <code>mkdocs.yml</code>, and keep assets referenced from <code>docs/assets</code> to stay modular.
              </p>
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
