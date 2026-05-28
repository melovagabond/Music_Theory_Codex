import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../audio/codex_sampler.dart';
import '../models/codex.dart';
import 'codex_widgets.dart';

const List<CircleKey> circleKeys = [
  CircleKey(name: 'C', relativeMinor: 'Am', accidentals: '0'),
  CircleKey(name: 'G', relativeMinor: 'Em', accidentals: '1#'),
  CircleKey(name: 'D', relativeMinor: 'Bm', accidentals: '2#'),
  CircleKey(name: 'A', relativeMinor: 'F#m', accidentals: '3#'),
  CircleKey(name: 'E', relativeMinor: 'C#m', accidentals: '4#'),
  CircleKey(name: 'B', relativeMinor: 'G#m', accidentals: '5#'),
  CircleKey(name: 'F#', relativeMinor: 'D#m', accidentals: '6#'),
  CircleKey(name: 'Db', relativeMinor: 'Bbm', accidentals: '5b'),
  CircleKey(name: 'Ab', relativeMinor: 'Fm', accidentals: '4b'),
  CircleKey(name: 'Eb', relativeMinor: 'Cm', accidentals: '3b'),
  CircleKey(name: 'Bb', relativeMinor: 'Gm', accidentals: '2b'),
  CircleKey(name: 'F', relativeMinor: 'Dm', accidentals: '1b'),
];

const Map<String, int> noteToSemitone = {
  'C': 0,
  'B#': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'Fb': 4,
  'E#': 5,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11,
  'Cb': 11,
};

const sharpNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
const flatNames = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

class CircleKey {
  const CircleKey({
    required this.name,
    required this.relativeMinor,
    required this.accidentals,
  });

  final String name;
  final String relativeMinor;
  final String accidentals;
}

class CircleChord {
  const CircleChord({
    required this.degree,
    required this.symbol,
    required this.shape,
    required this.note,
  });

  final String degree;
  final String symbol;
  final String shape;
  final String note;
}

class CircleOfFifthsTool extends StatefulWidget {
  const CircleOfFifthsTool({
    required this.chordShapes,
    required this.sampler,
    super.key,
  });

  final Map<String, ChordShape> chordShapes;
  final CodexSampler sampler;

  @override
  State<CircleOfFifthsTool> createState() => _CircleOfFifthsToolState();
}

class _CircleOfFifthsToolState extends State<CircleOfFifthsTool> {
  int _selectedIndex = 0;
  String _mode = 'major';

  CircleKey get _selectedKey => circleKeys[_selectedIndex];

  @override
  Widget build(BuildContext context) {
    final keyRoot = _noteToSemitone(_selectedKey.name);
    final minorRoot = _noteToSemitone(_selectedKey.relativeMinor);
    final chords = _mode == 'major'
        ? _majorChords(_selectedKey)
        : _minorChords(_selectedKey);
    final preferSharps = _selectedIndex <= 6;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CodexPanel(
            gradient: LinearGradient(
              colors: [
                indigo600.withValues(alpha: 0.42),
                slate900,
                amber400.withValues(alpha: 0.18),
              ],
            ),
            child: Wrap(
              spacing: 18,
              runSpacing: 14,
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                SizedBox(
                  width: 520,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const CodexPill(
                        label: 'Circle of Fifths',
                        icon: Icons.album,
                        color: amber300,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${_selectedKey.name} major / ${_selectedKey.relativeMinor}',
                        style: Theme.of(context).textTheme.displaySmall
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Map tonic, subdominant, dominant, and relative minor movement while keeping voicing shapes visible.',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: slate300,
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: 'major',
                      icon: Icon(Icons.wb_sunny_outlined),
                      label: Text('Major'),
                    ),
                    ButtonSegment(
                      value: 'minor',
                      icon: Icon(Icons.nightlight_round),
                      label: Text('Minor'),
                    ),
                  ],
                  selected: {_mode},
                  onSelectionChanged: (selection) {
                    setState(() => _mode = selection.first);
                  },
                  style: ButtonStyle(
                    foregroundColor: WidgetStateProperty.resolveWith(
                      (states) => states.contains(WidgetState.selected)
                          ? slate950
                          : slate300,
                    ),
                    backgroundColor: WidgetStateProperty.resolveWith(
                      (states) => states.contains(WidgetState.selected)
                          ? amber300
                          : slate950,
                    ),
                    side: WidgetStateProperty.resolveWith(
                      (states) => BorderSide(
                        color: states.contains(WidgetState.selected)
                            ? amber300
                            : slate800,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 980;
              final wheel = SizedBox(
                width: wide ? 460 : double.infinity,
                child: CodexPanel(
                  child: Column(
                    children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: LayoutBuilder(
                          builder: (context, circleConstraints) {
                            final size = Size(
                              circleConstraints.maxWidth,
                              circleConstraints.maxHeight,
                            );
                            return GestureDetector(
                              onTapDown: (details) {
                                final local = details.localPosition;
                                final center = Offset(
                                  size.width / 2,
                                  size.height / 2,
                                );
                                final angle =
                                    math.atan2(
                                      local.dy - center.dy,
                                      local.dx - center.dx,
                                    ) +
                                    math.pi / 2;
                                final normalized =
                                    (angle + math.pi * 2) % (math.pi * 2);
                                final index =
                                    (normalized / (math.pi * 2) * 12).round() %
                                    12;
                                setState(() => _selectedIndex = index);
                              },
                              child: CustomPaint(
                                painter: _CirclePainter(
                                  selectedIndex: _selectedIndex,
                                  mode: _mode,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          for (final entry in circleKeys.indexed)
                            ChoiceChip(
                              selected: entry.$1 == _selectedIndex,
                              onSelected: (_) {
                                setState(() => _selectedIndex = entry.$1);
                              },
                              label: Text(entry.$2.name),
                              selectedColor: amber300,
                              backgroundColor: slate950,
                              side: BorderSide(
                                color: entry.$1 == _selectedIndex
                                    ? amber300
                                    : slate800,
                              ),
                              labelStyle: TextStyle(
                                color: entry.$1 == _selectedIndex
                                    ? slate950
                                    : slate300,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              );

              final details = Column(
                children: [
                  CodexPanel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SectionTitle(
                          icon: Icons.key,
                          title: _mode == 'major'
                              ? '${_selectedKey.name} major functions'
                              : '${_selectedKey.relativeMinor} functions',
                          subtitle:
                              '${_selectedKey.accidentals} accidentals. Relative pair shares the same key signature.',
                          color: amber300,
                        ),
                        const SizedBox(height: 18),
                        for (final chord in chords) ...[
                          _CircleChordRow(
                            chord: chord,
                            rootSemitone: _chordRootSemitone(
                              chord.degree,
                              keyRoot,
                              minorRoot,
                              _mode,
                            ),
                            preferSharps: preferSharps,
                            sampler: widget.sampler,
                            shape: widget.chordShapes[chord.shape],
                          ),
                          const SizedBox(height: 12),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  CodexPanel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionTitle(
                          icon: Icons.route,
                          title: 'Pivot Memory',
                          subtitle:
                              'Adjacent keys move by fifths clockwise and fourths counter-clockwise.',
                          color: indigo300,
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            CodexPill(
                              label:
                                  'Previous: ${circleKeys[(_selectedIndex - 1) % 12].name}',
                            ),
                            CodexPill(label: 'Home: ${_selectedKey.name}'),
                            CodexPill(
                              label:
                                  'Next: ${circleKeys[(_selectedIndex + 1) % 12].name}',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              );

              if (!wide) {
                return Column(
                  children: [wheel, const SizedBox(height: 18), details],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  wheel,
                  const SizedBox(width: 18),
                  Expanded(child: details),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _CircleChordRow extends StatelessWidget {
  const _CircleChordRow({
    required this.chord,
    required this.rootSemitone,
    required this.preferSharps,
    required this.sampler,
    required this.shape,
  });

  final CircleChord chord;
  final int rootSemitone;
  final bool preferSharps;
  final CodexSampler sampler;
  final ChordShape? shape;

  @override
  Widget build(BuildContext context) {
    final rootName = _semitoneToNote(rootSemitone, preferSharps);
    final selectedShape = shape;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: slate950.withValues(alpha: 0.62),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: slate800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${chord.degree}  $rootName ${chord.symbol}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton.filled(
                tooltip: 'Play piano voicing',
                onPressed: () =>
                    sampler.playChord(chord.shape, 60 + rootSemitone, 'piano'),
                icon: const Icon(Icons.play_arrow),
                style: IconButton.styleFrom(
                  backgroundColor: amber300,
                  foregroundColor: slate950,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            chord.note,
            style: const TextStyle(color: slate400, height: 1.35),
          ),
          if (selectedShape != null) ...[
            const SizedBox(height: 14),
            PianoDiagram(
              intervals: selectedShape.pianoIntervals,
              root: rootSemitone,
              height: 76,
            ),
          ],
        ],
      ),
    );
  }
}

class _CirclePainter extends CustomPainter {
  const _CirclePainter({required this.selectedIndex, required this.mode});

  final int selectedIndex;
  final String mode;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = math.min(size.width, size.height) / 2 - 12;
    final segmentPaint = Paint()..style = PaintingStyle.fill;
    final borderPaint = Paint()
      ..color = slate700
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4;

    for (final entry in circleKeys.indexed) {
      final startAngle = -math.pi / 2 + entry.$1 * math.pi * 2 / 12;
      final sweep = math.pi * 2 / 12;
      final selected = entry.$1 == selectedIndex;
      segmentPaint.color = selected
          ? amber300.withValues(alpha: 0.95)
          : (entry.$1.isEven ? slate800 : slate850);

      final path = Path()
        ..moveTo(center.dx, center.dy)
        ..arcTo(
          Rect.fromCircle(center: center, radius: radius),
          startAngle,
          sweep,
          false,
        )
        ..close();
      canvas.drawPath(path, segmentPaint);
      canvas.drawPath(path, borderPaint);

      final angle = startAngle + sweep / 2;
      final majorPoint = Offset(
        center.dx + math.cos(angle) * radius * 0.73,
        center.dy + math.sin(angle) * radius * 0.73,
      );
      final minorPoint = Offset(
        center.dx + math.cos(angle) * radius * 0.46,
        center.dy + math.sin(angle) * radius * 0.46,
      );

      _paintText(
        canvas,
        entry.$2.name,
        majorPoint,
        selected ? slate950 : Colors.white,
        selected ? 26 : 20,
        FontWeight.w900,
      );
      _paintText(
        canvas,
        entry.$2.relativeMinor,
        minorPoint,
        selected ? slate800 : slate400,
        13,
        FontWeight.w800,
      );
    }

    canvas.drawCircle(center, radius * 0.28, Paint()..color = slate950);
    canvas.drawCircle(center, radius * 0.28, borderPaint);
    _paintText(
      canvas,
      mode == 'major' ? 'Major' : 'Minor',
      center.translate(0, -9),
      amber300,
      18,
      FontWeight.w900,
    );
    _paintText(
      canvas,
      'tonal map',
      center.translate(0, 14),
      slate400,
      12,
      FontWeight.w700,
    );
  }

  void _paintText(
    Canvas canvas,
    String text,
    Offset center,
    Color color,
    double size,
    FontWeight weight,
  ) {
    final painter = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(color: color, fontSize: size, fontWeight: weight),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    painter.paint(
      canvas,
      center - Offset(painter.width / 2, painter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant _CirclePainter oldDelegate) {
    return oldDelegate.selectedIndex != selectedIndex ||
        oldDelegate.mode != mode;
  }
}

List<CircleChord> _majorChords(CircleKey key) {
  return [
    CircleChord(
      degree: 'I',
      symbol: 'maj7',
      shape: 'Maj7',
      note:
          'Tonic chord of ${key.name} major. Start and resolve here for a stable center.',
    ),
    CircleChord(
      degree: 'IV',
      symbol: 'maj7',
      shape: 'Maj7',
      note:
          'Subdominant color in ${key.name} major. It moves away from home and prepares dominant motion.',
    ),
    CircleChord(
      degree: 'V',
      symbol: '7',
      shape: 'Dom7',
      note:
          'Dominant tension in ${key.name} major. It wants to resolve back to I.',
    ),
  ];
}

List<CircleChord> _minorChords(CircleKey key) {
  return [
    CircleChord(
      degree: 'i',
      symbol: 'm7',
      shape: 'min7',
      note:
          'Tonic of ${key.relativeMinor}. Same pitch collection as ${key.name} major with a different center.',
    ),
    CircleChord(
      degree: 'iv',
      symbol: 'm7',
      shape: 'min7',
      note: 'Subdominant minor color for darker pre-dominant movement.',
    ),
    CircleChord(
      degree: 'V',
      symbol: '7',
      shape: 'Dom7',
      note:
          'Dominant borrowed from harmonic minor for a stronger pull back to i.',
    ),
  ];
}

int _chordRootSemitone(String degree, int keyRoot, int minorRoot, String mode) {
  final base = mode == 'major' ? keyRoot : minorRoot;
  return switch (degree.toLowerCase()) {
    'iv' => (base + 5) % 12,
    'v' => (base + 7) % 12,
    _ => base,
  };
}

int _noteToSemitone(String note) {
  final normalized = note
      .replaceAll('♯', '#')
      .replaceAll('♭', 'b')
      .replaceFirst(RegExp(r'm$'), '');
  return noteToSemitone[normalized] ?? 0;
}

String _semitoneToNote(int value, bool preferSharps) {
  final table = preferSharps ? sharpNames : flatNames;
  return table[((value % 12) + 12) % 12];
}
