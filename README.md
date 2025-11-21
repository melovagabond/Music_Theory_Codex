# Open Source Music Theory Codex

A comprehensive, interactive "docs-as-code" repository for exploring music theory. This application traces the harmonic lineage of 50+ genres, from the syncopated roots of Ragtime and Jazz, through the Funk and AOR era, to the sophisticated urban soundscapes of City Pop and Future Funk.

## 🎵 Features

- **Genre Codex:** Detailed harmonic breakdown of 50+ genres across 5 historical phases:

    - Phase I: Jazz Foundations (1910s-50s)

    - Phase II: Rhythm Evolution (60s-70s)

    - Phase III: Fusion & Sophistication (70s-80s)

    - Phase IV: The Japanese Evolution (70s-90s)

    - Phase V: Modern Derivatives (90s-Present)

- **Instrument Visualizer Engine:** Dynamic rendering of chord voicings for:

    - 🎹 Piano: Highlighted key voicings (Rootless, Shells, Clusters, So What).

    - 🎸 Guitar: Fretboard diagrams for specific grips (Hendrix thumb-over, Nile Rodgers strum).

    - 🎻 Ukulele: Jazz and Funk voicing charts with re-entrant tuning logic.

- **Interactive Circle of Fifths:** An SVG-based tool to visualize key signatures, relative minors, and modal borrowing.

- **Audio Reference Lab:** One-click generation of curated YouTube search queries for immediate listening examples.

- **Responsive UI:** Styled like a modern Git documentation site (MkDocs/GitBook aesthetic) with a focus on readability and mobile access.

## 🛠️ Tech Stack

- **Core:** React 18, TypeScript

- **Build Tool:** Vite

- **Styling:** Tailwind CSS

- **Icons:** Lucide React

- **Deployment:** Docker (Multi-stage Nginx build)

## 🚀 Getting Started

**Prerequisites**

- Node.js (v18+)

- npm or yarn

**Local Development**

1. Clone the repository
```
git clone [https://github.com/yourusername/music-theory-codex.git](https://github.com/yourusername/music-theory-codex.git)
cd music-theory-codex
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

Open http://localhost:5173 in your browser.

## 🐳 Docker Deployment

This project includes a production-ready Dockerfile using a multi-stage build process (Node.js builder -> Nginx Alpine).

1. Build the Image
```
docker build -t music-codex .
```

2. Run the Container
```
docker run -d -p 8080:80 music-codex
```

3. Access the App
Navigate to http://localhost:8080.

## 📂 Project Structure
```
music-theory-codex/
├── src/
│   ├── App.tsx          # Main application logic & Data Engine (50+ genres)
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind global styles
├── public/              # Static assets
├── Dockerfile           # Multi-stage build configuration
├── nginx.conf           # SPA configuration for Nginx
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler configuration
└── README.md            # Project documentation
```

## 🎼 Theory Credits

Data compiled from the "Open Source Music Theory Codex" report, analyzing:

- **The Royal Road (Oudou Shinkou)** progression in City Pop.

- **Tritone Substitutions** in Bebop.

- **The "One"** in Deep Funk.

- **Quartal Harmony** in Modal Jazz and Neo-Soul.
