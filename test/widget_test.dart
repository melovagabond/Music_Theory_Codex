import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:music_theory_codex/models/codex.dart';
import 'package:music_theory_codex/ui/app_shell.dart';

void main() {
  testWidgets('loads the Flutter Codex shell', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: CodexAppShell(data: _data)),
    );
    await tester.pump();

    expect(find.text('Theory Codex'), findsWidgets);
    expect(find.textContaining('genre studies'), findsOneWidget);
  });
}

const _chord = ProgressionChord(
  degree: 'I',
  symbol: 'Cmaj7',
  shape: 'Maj7',
  note: 'Tonic chord.',
);

const _genre = Genre(
  id: 'test',
  name: 'Test Genre',
  bpm: '100',
  timing: '4/4',
  description: 'A compact genre fixture.',
  progression: 'I - IV - V',
  progressionNote: 'Functional harmony.',
  progressionChords: [_chord],
  instruments: InstrumentNotes(
    piano: 'Shell voicings.',
    guitar: 'Compact grips.',
    ukulele: 'Open shapes.',
  ),
  visualChord: 'Maj7',
  keyTraits: ['Tonic'],
  theoryNotes: ['Resolve to I.'],
);

const _data = CodexData(
  phases: [
    Phase(
      id: 'phase-test',
      title: 'Fixture Phase',
      learning: ['Learn the fixtures.'],
      genres: [_genre],
    ),
  ],
  phaseHistories: {
    'phase-test': PhaseHistory(
      summary: 'A fixture phase.',
      highlights: ['Fixture highlight.'],
    ),
  },
  genreHistories: {'test': 'A fixture history.'},
  chordShapes: {
    'Maj7': ChordShape(
      name: 'Maj7',
      pianoIntervals: [0, 4, 7, 11],
      guitarFrets: [-1, 3, 2, 0, 0, 0],
      ukeFrets: [0, 0, 0, 2],
    ),
  },
);
