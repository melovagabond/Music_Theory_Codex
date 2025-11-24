export const CHORD_SHAPES = {
  Maj7: {
    pianoIntervals: [0, 4, 7, 11],
    guitarFrets: [-1, 3, 2, 0, 0, 0],
    ukeFrets: [0, 0, 0, 2],
  },
  min7: {
    pianoIntervals: [0, 3, 7, 10],
    guitarFrets: [-1, 1, 3, 1, 3, 1],
    ukeFrets: [2, 0, 1, 1],
  },
  Dom7: {
    pianoIntervals: [0, 4, 7, 10],
    guitarFrets: [3, 2, 0, 0, 0, 1],
    ukeFrets: [0, 2, 1, 2],
  },
  Dom9: {
    pianoIntervals: [0, 4, 7, 10, 14],
    guitarFrets: [3, 2, 0, 2, 3, 0],
    ukeFrets: [0, 2, 1, 2],
  },
  min9: {
    pianoIntervals: [0, 3, 7, 10, 14],
    guitarFrets: [1, 3, 1, 1, 1, 1],
    ukeFrets: [0, 2, 0, 2],
  },
  "6/9": {
    pianoIntervals: [0, 4, 7, 9, 14],
    guitarFrets: [-1, 3, 2, 2, 3, 3],
    ukeFrets: [0, 2, 2, 2],
  },
  m7b5: {
    pianoIntervals: [0, 3, 6, 10],
    guitarFrets: [1, 2, 1, 2, 1, 1],
    ukeFrets: [1, 1, 0, 1],
  },
  dim7: {
    pianoIntervals: [0, 3, 6, 9],
    guitarFrets: [-1, 1, 2, 0, 2, 0],
    ukeFrets: [2, 3, 2, 3],
  },
  Sus4: {
    pianoIntervals: [0, 5, 7],
    guitarFrets: [3, 3, 5, 5, 3, 3],
    ukeFrets: [0, 2, 3, 3],
  },
  Maj6: {
    pianoIntervals: [0, 4, 7, 9],
    guitarFrets: [-1, 3, 2, 2, 3, -1],
    ukeFrets: [2, 2, 1, 2],
  },
  "11th": {
    pianoIntervals: [0, 7, 10, 14, 17],
    guitarFrets: [-1, 3, 3, 3, 3, 3],
    ukeFrets: [0, 0, 1, 0],
  },
} as const;

export type ChordShapeKey = keyof typeof CHORD_SHAPES;
