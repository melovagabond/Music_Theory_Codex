# Open Source Music Theory Codex

> A **docs-as-code** playground for harmonic archeology — from Ragtime and Bebop to City Pop and Future Funk.

<p align="center">
  <img src="./logo.svg" alt="Open Source Music Theory Codex Logo" width="180" />
</p>

<p align="center">
  <a href="https://github.com/yourusername/music-theory-codex/actions">
    <img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/yourusername/music-theory-codex/ci.yml?label=CI&style=for-the-badge">
  </a>
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=000">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=fff">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=ffd92f">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=fff">
  <img alt="License" src="https://img.shields.io/badge/License-CC0_1.0-1f2937?style=for-the-badge&logo=creative-commons&logoColor=white">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-ff69b4?style=for-the-badge&logo=github">
</p>

---

## 📚 Overview

The **Open Source Music Theory Codex** is a comprehensive, interactive repository for exploring music theory as if it were source code.

This application traces the harmonic lineage of 50+ genres, from the syncopated roots of **Ragtime** and **Jazz**, through the **Funk** and **AOR** era, to the sophisticated urban soundscapes of **City Pop** and **Future Funk**.

Use it as:

- A **theory lab** for chord progressions and voicings.
- A **genre map** for harmonic evolution.
- A **reference codex** you can version, diff, and extend like any other codebase.

---

## 🧭 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [Development Scripts](#-development-scripts)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Theory Credits](#-theory-credits)
- [License](#-license)

---

## 🎵 Features

- **Genre Codex:** Detailed harmonic breakdown of 50+ genres across 5 historical phases:

  - Phase I: Jazz Foundations (1910s–50s)  
  - Phase II: Rhythm Evolution (60s–70s)  
  - Phase III: Fusion & Sophistication (70s–80s)  
  - Phase IV: The Japanese Evolution (70s–90s)  
  - Phase V: Modern Derivatives (90s–Present)

- **Instrument Visualizer Engine:** Dynamic rendering of chord voicings for:
  - 🎹 **Piano:** Highlighted key voicings (Rootless, Shells, Clusters, *So What*).  
  - 🎸 **Guitar:** Fretboard diagrams for specific grips (Hendrix thumb-over, Nile Rodgers-style strum patterns).  
  - 🎻 **Ukulele:** Jazz and Funk voicing charts with re-entrant tuning logic.

- **Interactive Circle of Fifths:** An SVG-based tool to visualize:
  - Key signatures  
  - Relative majors/minors  
  - Modal borrowing and pivot keys  

- **Audio Reference Lab:**
  - One-click generation of curated YouTube search queries for immediate listening examples.
  - Genre + decade + harmonic concept = pre-baked search string.

- **Responsive UI:**
  - Modern Git documentation aesthetic (MkDocs/GitBook vibes).
  - Dark-mode friendly, mobile-friendly, and readable enough to stare at for hours while overthinking a ii–V–I.

---

## 🛠️ Tech Stack

- **Core:** React 18, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Docker (multi-stage Nginx build)
- **Docs-as-Code:** Markdown + JSON/TS data models

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- `npm` or `yarn`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music-theory-codex.git
   cd music-theory-codex
    ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

This project includes a production-ready `Dockerfile` using a multi-stage build process (`node:builder` → `nginx:alpine`).

1. **Build the image**

   ```bash
   docker build -t music-codex .
   ```

2. **Run the container**

   ```bash
   docker run -d -p 8080:80 --name music-codex music-codex
   ```

3. **Access the app**

   Navigate to [http://localhost:8080](http://localhost:8080).

---

## 📂 Project Structure

```text
music-theory-codex/
├── src/
│   ├── App.tsx          # Main application logic & Data Engine (50+ genres)
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind global styles
├── public/              # Static assets (favicon, og images, etc.)
├── Dockerfile           # Multi-stage build configuration
├── nginx.conf           # SPA configuration for Nginx
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler configuration
└── README.md            # Project documentation
```

---

## 📜 Development Scripts

Common scripts (check `package.json` for the full list):

```bash
# Run dev server
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

---

### Circle of Fifths Lab

An interactive Circle of Fifths view designed for writers, not just theory nerds.

- Click any key on the **wheel** (or the key pills under it) to select a tonal center.
- See its **major scale**, **relative minor**, and full **diatonic chord family** (I–ii–iii–IV–V–vi–vii°).
- Get **common progressions** (ii–V–I, I–vi–IV–V, Royal Road-style changes, etc.).
- Per-key **instrument tips** for piano, guitar, and ukulele so you can immediately translate the theory into voicings and patterns.

---

## 🧱 Roadmap (Rough, Like a First Mix)

* [ ] Add saved **“progression presets”** per genre (I–vi–IV–V, Royal Road, Rhythm Changes, etc.).
* [ ] Add **MIDI export** of generated voicings/progressions.
* [ ] Add **keyboard overlay** for real-time highlighting from computer keyboard input.
* [ ] Add **“Explain This Progression”** mode (annotated theory breakdown).
* [ ] Add **offline mode** via service worker + local cache.

If you’re reading this and thinking “I could totally add one of these” — you’re correct, now you have homework.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch:

   ```bash
   git checkout -b feature/my-awesome-thing
   ```
3. Commit your changes with actual messages, not “fix stuff”:

   ```bash
   git commit -m "Add XYZ progression visualizer"
   ```
4. Push and open a Pull Request

Guidelines:

* Keep the code **typed** (TypeScript, not vibescript).
* Keep UI **accessible** (labels, contrast, keyboard navigation).
* If you add a new genre or concept, document it in the Codex.

---

## 🎼 Theory Credits

Data compiled from the **Open Source Music Theory Codex** report, analyzing:

* **The Royal Road (*Ōdō Shinkō*)** progression in City Pop.
* **Tritone Substitutions** in Bebop.
* **The “One”** in Deep Funk.
* **Quartal Harmony** in Modal Jazz and Neo-Soul.

And a whole lot of unnecessary time spent pausing songs on the exact right chord.

## 📄 License

This project is released under the **Creative Commons CC0 1.0 Universal** license.

You can copy, modify, distribute, and use the work — even for commercial purposes — without asking permission.

For details, see:  
**[CC0 1.0 Universal Legal Code](https://creativecommons.org/publicdomain/zero/1.0/legalcode)**
