// Chord Shapes Database (Mapped to Visualizer)
const chordShapes: Record<string, { piano: number[], guitar: number[], uke: number[] }> = {
  "Maj7": { piano: [0, 4, 7, 11], guitar: [-1, 0, 2, 1, 0, 0], uke: [0, 0, 0, 0] },
  "min7": { piano: [0, 3, 7, 10], guitar: [0, 2, 0, 0, 0, 0], uke: [0, 0, 0, 0] },
  "Dom7": { piano: [0, 4, 7, 10], guitar: [0, 2, 0, 1, 0, 0], uke: [0, 1, 0, 0] },
  "Dom9": { piano: [0, 4, 10, 14], guitar: [-1, 2, 1, 2, 2, 2], uke: [0, 2, 1, 2] },
  "min9": { piano: [0, 3, 7, 10, 14], guitar: [-1, 0, 2, 0, 0, 0], uke: [0, 2, 0, 2] },
  "6/9": { piano: [0, 4, 7, 9, 14], guitar: [-1, 2, 2, 2, 2, 2], uke: [0, 2, 0, 2] },
  "m7b5": { piano: [0, 3, 6, 10], guitar: [-1, 1, 2, 1, 2, -1], uke: [0, 1, 0, 1] },
  "dim7": { piano: [0, 3, 6, 9], guitar: [-1, 1, 2, 0, 2, -1], uke: [2, 3, 2, 3] },
  "Sus4": { piano: [0, 5, 7], guitar: [0, 0, 2, 2, 3, 0], uke: [0, 2, 3, 3] },
  "Maj6": { piano: [0, 4, 7, 9], guitar: [2, 1, 3, 1, 2, 1], uke: [0, 2, 0, 2] },
  "11th": { piano: [0, 7, 10, 14, 17], guitar: [1, 1, 1, 1, 1, 1], uke: [0, 0, 1, 0] }, // F/G style
};