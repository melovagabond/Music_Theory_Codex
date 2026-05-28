import 'dart:async';

import 'package:flutter/material.dart';

import '../audio/codex_sampler.dart';
import '../models/codex.dart';
import 'codex_widgets.dart';

const List<({String value, String label, IconData icon})> instrumentOptions = [
  (value: 'piano', label: 'Piano', icon: Icons.piano),
  (value: 'guitar', label: 'Guitar', icon: Icons.graphic_eq),
  (value: 'ukulele', label: 'Ukulele', icon: Icons.music_note),
  (value: 'bass', label: 'Bass', icon: Icons.speaker),
  (value: 'drums', label: 'Drums', icon: Icons.radio_button_checked),
];

const List<({String label, int midi})> drumPads = [
  (label: 'Kick', midi: 36),
  (label: 'Snare', midi: 38),
  (label: 'Hi-hat', midi: 42),
  (label: 'Low tom', midi: 45),
  (label: 'Mid tom', midi: 47),
  (label: 'High tom', midi: 50),
];

class ProgressionLooper extends StatefulWidget {
  const ProgressionLooper({
    required this.chords,
    required this.sampler,
    super.key,
  });

  final List<ProgressionChord> chords;
  final CodexSampler sampler;

  @override
  State<ProgressionLooper> createState() => _ProgressionLooperState();
}

class _ProgressionLooperState extends State<ProgressionLooper> {
  String _instrument = 'piano';
  double _bpm = 112;
  int _currentStep = -1;
  bool _playing = false;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _togglePlayback() {
    if (_playing) {
      _stop();
      return;
    }
    if (widget.chords.isEmpty) return;

    setState(() {
      _playing = true;
      _currentStep = 0;
    });
    _fireCurrentChord();

    final step = Duration(milliseconds: ((60 / _bpm) * 1000).round() * 2);
    _timer = Timer.periodic(step, (_) {
      if (!mounted) return;
      setState(() {
        _currentStep = (_currentStep + 1) % widget.chords.length;
      });
      _fireCurrentChord();
    });
  }

  void _fireCurrentChord() {
    final index = _currentStep;
    if (index < 0 || index >= widget.chords.length) return;
    unawaited(
      widget.sampler.playProgressionChord(widget.chords[index], _instrument),
    );
  }

  void _stop() {
    _timer?.cancel();
    _timer = null;
    widget.sampler.stopAll();
    if (!mounted) return;
    setState(() {
      _playing = false;
      _currentStep = -1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(
            icon: Icons.repeat,
            title: 'Progression Looper',
            subtitle:
                'Step through the active chords with the selected sample set.',
            color: emerald300,
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _InstrumentMenu(
                value: _instrument,
                onChanged: (value) => setState(() => _instrument = value),
              ),
              SizedBox(
                width: 220,
                child: Row(
                  children: [
                    const Text('BPM', style: TextStyle(color: slate400)),
                    Expanded(
                      child: Slider(
                        value: _bpm,
                        min: 70,
                        max: 180,
                        divisions: 55,
                        label: _bpm.round().toString(),
                        onChanged: (value) => setState(() => _bpm = value),
                      ),
                    ),
                    SizedBox(
                      width: 38,
                      child: Text(
                        _bpm.round().toString(),
                        textAlign: TextAlign.end,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              CodexActionButton(
                icon: _playing ? Icons.stop : Icons.play_arrow,
                label: _playing ? 'Stop' : 'Play loop',
                onPressed: _togglePlayback,
                primary: !_playing,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final entry in widget.chords.indexed)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 9,
                  ),
                  decoration: BoxDecoration(
                    color: entry.$1 == _currentStep
                        ? emerald300.withValues(alpha: 0.18)
                        : slate950.withValues(alpha: 0.72),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: entry.$1 == _currentStep ? emerald300 : slate800,
                    ),
                  ),
                  child: Text(
                    '${entry.$2.degree}  ${entry.$2.symbol}',
                    style: TextStyle(
                      color: entry.$1 == _currentStep ? emerald300 : slate300,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class InstrumentVisualizer extends StatefulWidget {
  const InstrumentVisualizer({
    required this.genre,
    required this.chords,
    required this.chordShapes,
    required this.sampler,
    super.key,
  });

  final Genre genre;
  final List<ProgressionChord> chords;
  final Map<String, ChordShape> chordShapes;
  final CodexSampler sampler;

  @override
  State<InstrumentVisualizer> createState() => _InstrumentVisualizerState();
}

class _InstrumentVisualizerState extends State<InstrumentVisualizer> {
  String _instrument = 'piano';

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 16,
            runSpacing: 14,
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              const SizedBox(
                width: 330,
                child: SectionTitle(
                  icon: Icons.headphones,
                  title: 'Instrument Lab',
                  subtitle:
                      'Audition the progression and inspect voicing shapes.',
                  color: indigo300,
                ),
              ),
              _InstrumentMenu(
                value: _instrument,
                onChanged: (value) => setState(() => _instrument = value),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _InstrumentNotes(genre: widget.genre),
          const SizedBox(height: 18),
          if (_instrument == 'drums')
            _DrumPadGrid(sampler: widget.sampler)
          else
            LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 980;
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: widget.chords.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: wide ? 2 : 1,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    mainAxisExtent: 265,
                  ),
                  itemBuilder: (context, index) {
                    final chord = widget.chords[index];
                    final shape =
                        widget.chordShapes[chord.shape] ??
                        widget.chordShapes['Maj7'];

                    return _ChordCard(
                      chord: chord,
                      instrument: _instrument,
                      shape: shape,
                      sampler: widget.sampler,
                    );
                  },
                );
              },
            ),
        ],
      ),
    );
  }
}

class _InstrumentMenu extends StatelessWidget {
  const _InstrumentMenu({required this.value, required this.onChanged});

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: [
        for (final option in instrumentOptions)
          ChoiceChip(
            selected: value == option.value,
            onSelected: (_) => onChanged(option.value),
            avatar: Icon(
              option.icon,
              size: 16,
              color: value == option.value ? slate950 : slate300,
            ),
            label: Text(option.label),
            labelStyle: TextStyle(
              color: value == option.value ? slate950 : slate300,
              fontWeight: FontWeight.w800,
            ),
            selectedColor: amber300,
            backgroundColor: slate950,
            side: BorderSide(
              color: value == option.value ? amber300 : slate800,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
      ],
    );
  }
}

class _InstrumentNotes extends StatelessWidget {
  const _InstrumentNotes({required this.genre});

  final Genre genre;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 780;
        final notes = [
          (label: 'Piano', value: genre.instruments.piano, icon: Icons.piano),
          (
            label: 'Guitar',
            value: genre.instruments.guitar,
            icon: Icons.graphic_eq,
          ),
          (
            label: 'Ukulele',
            value: genre.instruments.ukulele,
            icon: Icons.music_note,
          ),
        ];

        return GridView.count(
          crossAxisCount: wide ? 3 : 1,
          childAspectRatio: wide ? 3.2 : 6,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          children: [
            for (final note in notes)
              Container(
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  color: slate950.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: slate800),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(note.icon, color: emerald300, size: 19),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            note.label.toUpperCase(),
                            style: const TextStyle(
                              color: emerald300,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            note.value,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: slate300,
                              fontSize: 12,
                              height: 1.25,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }
}

class _ChordCard extends StatelessWidget {
  const _ChordCard({
    required this.chord,
    required this.instrument,
    required this.shape,
    required this.sampler,
  });

  final ProgressionChord chord;
  final String instrument;
  final ChordShape? shape;
  final CodexSampler sampler;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: slate950.withValues(alpha: 0.62),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: slate800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chord.degree,
                      style: const TextStyle(
                        color: slate400,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      chord.symbol,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton.filled(
                tooltip: 'Play chord',
                onPressed: () =>
                    sampler.playProgressionChord(chord, instrument),
                icon: const Icon(Icons.play_arrow),
                style: IconButton.styleFrom(
                  backgroundColor: amber300,
                  foregroundColor: slate950,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          CodexPill(label: chord.shape, color: indigo300),
          const SizedBox(height: 14),
          Expanded(
            child: _ShapeDiagram(shape: shape, instrument: instrument),
          ),
          const SizedBox(height: 10),
          Text(
            chord.note,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: slate400, fontSize: 12, height: 1.3),
          ),
        ],
      ),
    );
  }
}

class _ShapeDiagram extends StatelessWidget {
  const _ShapeDiagram({required this.shape, required this.instrument});

  final ChordShape? shape;
  final String instrument;

  @override
  Widget build(BuildContext context) {
    final selectedShape = shape;
    if (selectedShape == null) {
      return const Center(
        child: Text('No shape data', style: TextStyle(color: slate500)),
      );
    }

    return switch (instrument) {
      'guitar' => FretboardDiagram(frets: selectedShape.guitarFrets),
      'ukulele' => FretboardDiagram(frets: selectedShape.ukeFrets),
      'bass' => _BassIntervals(intervals: selectedShape.pianoIntervals),
      _ => PianoDiagram(intervals: selectedShape.pianoIntervals),
    };
  }
}

class _BassIntervals extends StatelessWidget {
  const _BassIntervals({required this.intervals});

  final List<int> intervals;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          for (final interval in intervals)
            Container(
              width: 48,
              height: 48,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: emerald300.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: emerald300.withValues(alpha: 0.58)),
              ),
              child: Text(
                '+$interval',
                style: const TextStyle(
                  color: emerald300,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _DrumPadGrid extends StatelessWidget {
  const _DrumPadGrid({required this.sampler});

  final CodexSampler sampler;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 720;
        return GridView.count(
          crossAxisCount: wide ? 3 : 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: wide ? 2.7 : 2.2,
          children: [
            for (final pad in drumPads)
              FilledButton(
                onPressed: () => sampler.playDrumNote(pad.midi),
                style: FilledButton.styleFrom(
                  backgroundColor: slate950,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: slate800),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.radio_button_checked, color: amber300),
                    const SizedBox(height: 6),
                    Text(
                      pad.label,
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(
                      'MIDI ${pad.midi}',
                      style: const TextStyle(color: slate500, fontSize: 11),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }
}
