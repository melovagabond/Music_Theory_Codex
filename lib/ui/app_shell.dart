import 'dart:async';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../audio/codex_sampler.dart';
import '../models/codex.dart';
import 'circle_of_fifths.dart';
import 'codex_widgets.dart';
import 'instrument_visualizer.dart';

enum CodexView { home, phase, genre, circle }

class CodexAppShell extends StatefulWidget {
  const CodexAppShell({required this.data, super.key});

  final CodexData data;

  @override
  State<CodexAppShell> createState() => _CodexAppShellState();
}

class _CodexAppShellState extends State<CodexAppShell> {
  late final CodexSampler _sampler;
  late String _activePhaseId;
  late Genre _activeGenre;
  CodexView _activeView = CodexView.home;

  @override
  void initState() {
    super.initState();
    _sampler = CodexSampler(widget.data.chordShapes);
    final defaultPhaseIndex = widget.data.phases.length > 3 ? 3 : 0;
    _activePhaseId = widget.data.phases[defaultPhaseIndex].id;
    _activeGenre = widget.data.phases[defaultPhaseIndex].genres.first;
  }

  @override
  void dispose() {
    unawaited(_sampler.stopAll());
    super.dispose();
  }

  Phase get _activePhase {
    return widget.data.phases.firstWhere(
      (phase) => phase.id == _activePhaseId,
      orElse: () =>
          widget.data.phaseForGenre(_activeGenre) ?? widget.data.phases.first,
    );
  }

  void _selectPhase(String phaseId) {
    setState(() {
      _activePhaseId = phaseId;
      _activeView = CodexView.phase;
    });
  }

  void _selectGenre(Genre genre) {
    final parent = widget.data.phaseForGenre(genre);
    setState(() {
      _activeGenre = genre;
      if (parent != null) _activePhaseId = parent.id;
      _activeView = CodexView.genre;
    });
  }

  void _selectView(CodexView view) {
    setState(() => _activeView = view);
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final desktop = width >= 920;
    final navigation = _NavigationPanel(
      data: widget.data,
      activeView: _activeView,
      activePhaseId: _activePhaseId,
      activeGenre: _activeGenre,
      onViewSelected: _selectView,
      onPhaseSelected: _selectPhase,
      onGenreSelected: _selectGenre,
    );
    final content = _MainContent(
      data: widget.data,
      activeView: _activeView,
      activePhase: _activePhase,
      activeGenre: _activeGenre,
      sampler: _sampler,
      onViewSelected: _selectView,
      onPhaseSelected: _selectPhase,
      onGenreSelected: _selectGenre,
    );

    if (desktop) {
      return Scaffold(
        backgroundColor: slate950,
        body: Row(
          children: [
            SizedBox(width: 288, child: navigation),
            Expanded(child: content),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: slate950,
      drawer: Drawer(width: 304, child: navigation),
      appBar: AppBar(
        backgroundColor: slate900,
        surfaceTintColor: Colors.transparent,
        title: const Row(
          children: [
            Icon(Icons.menu_book, color: amber400),
            SizedBox(width: 10),
            Text('Theory Codex'),
          ],
        ),
      ),
      body: content,
    );
  }
}

class _NavigationPanel extends StatelessWidget {
  const _NavigationPanel({
    required this.data,
    required this.activeView,
    required this.activePhaseId,
    required this.activeGenre,
    required this.onViewSelected,
    required this.onPhaseSelected,
    required this.onGenreSelected,
  });

  final CodexData data;
  final CodexView activeView;
  final String activePhaseId;
  final Genre activeGenre;
  final ValueChanged<CodexView> onViewSelected;
  final ValueChanged<String> onPhaseSelected;
  final ValueChanged<Genre> onGenreSelected;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: slate900,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: slate950,
                border: Border(bottom: BorderSide(color: slate800)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.menu_book, color: amber400, size: 28),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Theory Codex',
                      style: TextStyle(
                        color: amber400,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  _NavButton(
                    icon: Icons.rocket_launch,
                    label: 'Overview',
                    selected: activeView == CodexView.home,
                    onPressed: () {
                      Navigator.maybePop(context);
                      onViewSelected(CodexView.home);
                    },
                  ),
                  _NavButton(
                    icon: Icons.album,
                    label: 'Circle of Fifths',
                    selected: activeView == CodexView.circle,
                    onPressed: () {
                      Navigator.maybePop(context);
                      onViewSelected(CodexView.circle);
                    },
                  ),
                  const SizedBox(height: 12),
                  for (final phase in data.phases) ...[
                    _PhaseButton(
                      phase: phase,
                      selected:
                          activeView == CodexView.phase &&
                          activePhaseId == phase.id,
                      onPressed: () {
                        Navigator.maybePop(context);
                        onPhaseSelected(phase.id);
                      },
                    ),
                    const SizedBox(height: 4),
                    for (final genre in phase.genres)
                      _GenreButton(
                        genre: genre,
                        selected:
                            activeView == CodexView.genre &&
                            activeGenre.id == genre.id,
                        onPressed: () {
                          Navigator.maybePop(context);
                          onGenreSelected(genre);
                        },
                      ),
                    const SizedBox(height: 10),
                  ],
                ],
              ),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: slate800)),
              ),
              child: const Text(
                'Flutter rebase • v1.0.0',
                textAlign: TextAlign.center,
                style: TextStyle(color: slate500, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FilledButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, size: 18),
        label: Align(alignment: Alignment.centerLeft, child: Text(label)),
        style: FilledButton.styleFrom(
          foregroundColor: selected ? amber300 : slate300,
          backgroundColor: selected
              ? amber300.withValues(alpha: 0.12)
              : Colors.transparent,
          side: BorderSide(
            color: selected
                ? amber300.withValues(alpha: 0.42)
                : Colors.transparent,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}

class _PhaseButton extends StatelessWidget {
  const _PhaseButton({
    required this.phase,
    required this.selected,
    required this.onPressed,
  });

  final Phase phase;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      onPressed: onPressed,
      icon: const Icon(Icons.account_tree, size: 14),
      label: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          phase.title.toUpperCase(),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      style: TextButton.styleFrom(
        foregroundColor: selected ? Colors.white : indigo300,
        backgroundColor: selected
            ? indigo500.withValues(alpha: 0.18)
            : Colors.transparent,
        textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
      ),
    );
  }
}

class _GenreButton extends StatelessWidget {
  const _GenreButton({
    required this.genre,
    required this.selected,
    required this.onPressed,
  });

  final Genre genre;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 3),
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          foregroundColor: selected ? Colors.white : slate300,
          backgroundColor: selected ? indigo600 : Colors.transparent,
          alignment: Alignment.centerLeft,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                genre.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            if (selected) const Icon(Icons.chevron_right, size: 14),
          ],
        ),
      ),
    );
  }
}

class _MainContent extends StatelessWidget {
  const _MainContent({
    required this.data,
    required this.activeView,
    required this.activePhase,
    required this.activeGenre,
    required this.sampler,
    required this.onViewSelected,
    required this.onPhaseSelected,
    required this.onGenreSelected,
  });

  final CodexData data;
  final CodexView activeView;
  final Phase activePhase;
  final Genre activeGenre;
  final CodexSampler sampler;
  final ValueChanged<CodexView> onViewSelected;
  final ValueChanged<String> onPhaseSelected;
  final ValueChanged<Genre> onGenreSelected;

  @override
  Widget build(BuildContext context) {
    final chords = deriveProgressionChords(activeGenre);
    final phaseHistory = data.phaseHistories[activePhase.id];

    Widget page;
    switch (activeView) {
      case CodexView.circle:
        page = CircleOfFifthsTool(
          chordShapes: data.chordShapes,
          sampler: sampler,
        );
      case CodexView.phase:
        page = _PhaseView(
          phase: activePhase,
          history: phaseHistory,
          onGenreSelected: onGenreSelected,
        );
      case CodexView.genre:
        page = _GenreView(
          data: data,
          genre: activeGenre,
          phase: activePhase,
          chords: chords,
          sampler: sampler,
          onPhaseSelected: onPhaseSelected,
        );
      case CodexView.home:
        page = _HomeView(
          data: data,
          activeGenre: activeGenre,
          activePhase: activePhase,
          chords: chords,
          onViewSelected: onViewSelected,
          onGenreSelected: onGenreSelected,
        );
    }

    return Container(
      color: slate950,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            MediaQuery.sizeOf(context).width >= 920 ? 28 : 14,
            MediaQuery.sizeOf(context).width >= 920 ? 28 : 16,
            MediaQuery.sizeOf(context).width >= 920 ? 28 : 14,
            24,
          ),
          child: page,
        ),
      ),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView({
    required this.data,
    required this.activeGenre,
    required this.activePhase,
    required this.chords,
    required this.onViewSelected,
    required this.onGenreSelected,
  });

  final CodexData data;
  final Genre activeGenre;
  final Phase activePhase;
  final List<ProgressionChord> chords;
  final ValueChanged<CodexView> onViewSelected;
  final ValueChanged<Genre> onGenreSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CodexPanel(
            gradient: LinearGradient(
              colors: [
                indigo600.withValues(alpha: 0.48),
                const Color(0xFF6D28D9).withValues(alpha: 0.36),
                amber400.withValues(alpha: 0.24),
              ],
            ),
            padding: const EdgeInsets.all(26),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final wide = constraints.maxWidth >= 920;
                final intro = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const CodexPill(
                      label:
                          'Live Toolkit • Circle • Phase Maps • Instrument Lab',
                      icon: Icons.bolt,
                      color: Colors.white,
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'A hands-on harmony workstation for ${data.totalGenres}+ genre studies',
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        height: 1.05,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Jump between phase timelines, chord diagrams, Circle of Fifths movement, and sample-backed voicings from one Flutter surface.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: const Color(0xFFE0E7FF),
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        CodexActionButton(
                          icon: Icons.album,
                          label: 'Open Circle',
                          primary: true,
                          onPressed: () => onViewSelected(CodexView.circle),
                        ),
                        CodexActionButton(
                          icon: Icons.account_tree,
                          label: 'Browse Phases',
                          onPressed: () => onViewSelected(CodexView.phase),
                        ),
                        CodexActionButton(
                          icon: Icons.headphones,
                          label: 'Active Genre',
                          onPressed: () => onViewSelected(CodexView.genre),
                        ),
                      ],
                    ),
                  ],
                );
                final focus = SizedBox(
                  width: wide ? 390 : double.infinity,
                  child: _CurrentFocusCard(
                    genre: activeGenre,
                    onOpen: () => onViewSelected(CodexView.genre),
                  ),
                );

                if (!wide) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [intro, const SizedBox(height: 20), focus],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: intro),
                    const SizedBox(width: 24),
                    focus,
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 22),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 980;
              return GridView.count(
                crossAxisCount: wide ? 4 : 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: wide ? 2.3 : 1.9,
                children: [
                  StatTile(
                    icon: Icons.account_tree,
                    label: 'Historical phases',
                    value: data.phases.length.toString(),
                  ),
                  StatTile(
                    icon: Icons.folder,
                    label: 'Genres mapped',
                    value: data.totalGenres.toString(),
                  ),
                  const StatTile(
                    icon: Icons.headphones,
                    label: 'Chord shapes',
                    value: 'Piano · Guitar · Ukulele',
                  ),
                  const StatTile(
                    icon: Icons.flutter_dash,
                    label: 'Rebased with',
                    value: 'Flutter',
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 22),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 1020;
              final children = [
                _WorkbenchCard(
                  icon: Icons.album,
                  title: 'Circle of Fifths',
                  description:
                      'Transpose and pivot with tonic, dominant, and relative-minor context visible.',
                  cta: 'Launch circle',
                  onPressed: () => onViewSelected(CodexView.circle),
                ),
                _WorkbenchCard(
                  icon: Icons.timeline,
                  title: 'Phase Timeline',
                  description:
                      'Move from ragtime and swing into funk, fusion, City Pop, Future Funk, and K-Pop.',
                  cta: 'View phase',
                  onPressed: () => onViewSelected(CodexView.phase),
                ),
                _WorkbenchCard(
                  icon: Icons.piano,
                  title: 'Instrument Lab',
                  description:
                      'Inspect chord shapes, play samples, and loop the current progression.',
                  cta: 'Show voicings',
                  onPressed: () => onViewSelected(CodexView.genre),
                ),
              ];

              return GridView.count(
                crossAxisCount: wide ? 3 : 1,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: wide ? 1.6 : 3.1,
                children: children,
              );
            },
          ),
          const SizedBox(height: 22),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 1000;
              final progression = _ProgressionBrief(
                genre: activeGenre,
                phase: activePhase,
                chords: chords,
              );
              final shortlist = _PhaseShortlist(
                data: data,
                onGenreSelected: onGenreSelected,
              );

              if (!wide) {
                return Column(
                  children: [
                    progression,
                    const SizedBox(height: 18),
                    shortlist,
                  ],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: progression),
                  const SizedBox(width: 18),
                  Expanded(child: shortlist),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _CurrentFocusCard extends StatelessWidget {
  const _CurrentFocusCard({required this.genre, required this.onOpen});

  final Genre genre;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: slate950.withValues(alpha: 0.68),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Row(
            children: [
              Icon(Icons.menu_book, color: Colors.white),
              SizedBox(width: 10),
              Text(
                'CURRENT FOCUS',
                style: TextStyle(
                  color: indigo300,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            genre.name,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 21,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            genre.description,
            style: const TextStyle(color: slate300, height: 1.35),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: slate900,
              borderRadius: BorderRadius.circular(9),
              border: Border.all(color: slate800),
            ),
            child: Text(
              genre.progression,
              style: const TextStyle(
                color: emerald300,
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final trait in genre.keyTraits.take(4))
                CodexPill(label: trait, color: indigo300),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: CodexActionButton(
              icon: Icons.chevron_right,
              label: 'Open genre view',
              primary: true,
              onPressed: onOpen,
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkbenchCard extends StatelessWidget {
  const _WorkbenchCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.cta,
    required this.onPressed,
  });

  final IconData icon;
  final String title;
  final String description;
  final String cta;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(icon: icon, title: title, color: indigo300),
          const SizedBox(height: 12),
          Expanded(
            child: Text(
              description,
              style: const TextStyle(color: slate300, height: 1.4),
            ),
          ),
          CodexActionButton(
            icon: Icons.chevron_right,
            label: cta,
            onPressed: onPressed,
          ),
        ],
      ),
    );
  }
}

class _ProgressionBrief extends StatelessWidget {
  const _ProgressionBrief({
    required this.genre,
    required this.phase,
    required this.chords,
  });

  final Genre genre;
  final Phase phase;
  final List<ProgressionChord> chords;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(
            icon: Icons.sticky_note_2,
            title: genre.name,
            subtitle: 'Progression notebook',
            color: indigo300,
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.8,
            children: [
              _Metric(label: 'BPM', value: genre.bpm),
              _Metric(label: 'Feel', value: genre.timing),
              _Metric(label: 'Key', value: commonKeys(genre).first),
              _Metric(label: 'Phase', value: phase.title),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final chord in chords)
                CodexPill(label: '${chord.degree} -> ${chord.symbol}'),
            ],
          ),
        ],
      ),
    );
  }
}

class _PhaseShortlist extends StatelessWidget {
  const _PhaseShortlist({required this.data, required this.onGenreSelected});

  final CodexData data;
  final ValueChanged<Genre> onGenreSelected;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle(
            icon: Icons.search,
            title: 'Where to explore next',
            subtitle: 'Phase shortlist',
            color: emerald300,
          ),
          const SizedBox(height: 14),
          for (final phase in data.phases) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: slate950.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: slate800),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          phase.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      CodexPill(label: '${phase.genres.length} genres'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    phase.learning.first,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: slate400, height: 1.35),
                  ),
                  const SizedBox(height: 9),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final genre in phase.genres.take(3))
                        ActionChip(
                          onPressed: () => onGenreSelected(genre),
                          label: Text(genre.name),
                          labelStyle: const TextStyle(
                            color: slate300,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                          backgroundColor: slate900,
                          side: const BorderSide(color: slate800),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _PhaseView extends StatelessWidget {
  const _PhaseView({
    required this.phase,
    required this.history,
    required this.onGenreSelected,
  });

  final Phase phase;
  final PhaseHistory? history;
  final ValueChanged<Genre> onGenreSelected;

  @override
  Widget build(BuildContext context) {
    final selectedHistory = history;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Breadcrumb(items: ['codex', phase.id]),
          const SizedBox(height: 14),
          CodexPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(
                  icon: Icons.account_tree,
                  title: phase.title,
                  subtitle: selectedHistory?.summary,
                  color: indigo300,
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    CodexPill(
                      icon: Icons.folder,
                      label: '${phase.genres.length} genres mapped',
                    ),
                    CodexPill(
                      icon: Icons.lightbulb,
                      label: '${phase.learning.length} theory pillars',
                      color: amber300,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 980;
              final overview = CodexPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      icon: Icons.info,
                      title: 'Overview',
                      color: indigo300,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      selectedHistory?.summary ?? phase.learning.first,
                      style: const TextStyle(color: slate300, height: 1.45),
                    ),
                    if (selectedHistory != null) ...[
                      const SizedBox(height: 10),
                      for (final highlight in selectedHistory.highlights)
                        _Bullet(highlight),
                    ],
                  ],
                ),
              );
              final pillars = CodexPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      icon: Icons.lightbulb,
                      title: 'Theory Pillars',
                      color: amber300,
                    ),
                    const SizedBox(height: 12),
                    for (final item in phase.learning) _Bullet(item),
                  ],
                ),
              );

              if (!wide) {
                return Column(
                  children: [overview, const SizedBox(height: 18), pillars],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: overview),
                  const SizedBox(width: 18),
                  Expanded(child: pillars),
                ],
              );
            },
          ),
          const SizedBox(height: 18),
          CodexPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  icon: Icons.headphones,
                  title: 'Featured Genres',
                  subtitle:
                      'Choose a genre to view its breakdown and chord tools.',
                  color: indigo300,
                ),
                const SizedBox(height: 14),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final columns = constraints.maxWidth >= 1120
                        ? 3
                        : constraints.maxWidth >= 720
                        ? 2
                        : 1;
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: phase.genres.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: columns,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        mainAxisExtent: 150,
                      ),
                      itemBuilder: (context, index) {
                        final genre = phase.genres[index];
                        return _GenreTile(
                          genre: genre,
                          phaseTitle: phase.title,
                          onTap: () => onGenreSelected(genre),
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GenreView extends StatelessWidget {
  const _GenreView({
    required this.data,
    required this.genre,
    required this.phase,
    required this.chords,
    required this.sampler,
    required this.onPhaseSelected,
  });

  final CodexData data;
  final Genre genre;
  final Phase phase;
  final List<ProgressionChord> chords;
  final CodexSampler sampler;
  final ValueChanged<String> onPhaseSelected;

  @override
  Widget build(BuildContext context) {
    final history = data.genreHistories[genre.id] ?? genre.description;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Breadcrumb(items: ['codex', genre.id]),
          const SizedBox(height: 14),
          _GenreHeader(genre: genre),
          const SizedBox(height: 18),
          CodexPanel(
            gradient: LinearGradient(
              colors: [
                indigo600.withValues(alpha: 0.48),
                const Color(0xFF7C3AED).withValues(alpha: 0.30),
                amber400.withValues(alpha: 0.22),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        genre.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        history,
                        style: const TextStyle(
                          color: Color(0xFFE0E7FF),
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextButton.icon(
                        onPressed: () => onPhaseSelected(phase.id),
                        icon: const Icon(Icons.account_tree, size: 16),
                        label: Text('Explore ${phase.title} history'),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 1120;
              final mainColumn = Column(
                children: [
                  _HarmonicAnalysis(genre: genre, chords: chords),
                  const SizedBox(height: 18),
                  if (genre.theoryNotes.isNotEmpty) ...[
                    CodexPanel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionTitle(
                            icon: Icons.lightbulb,
                            title: 'Writing Tips / Theory Notes',
                            color: amber300,
                          ),
                          const SizedBox(height: 12),
                          for (final note in genre.theoryNotes) _Bullet(note),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],
                  ProgressionLooper(chords: chords, sampler: sampler),
                  const SizedBox(height: 18),
                  InstrumentVisualizer(
                    genre: genre,
                    chords: chords,
                    chordShapes: data.chordShapes,
                    sampler: sampler,
                  ),
                ],
              );
              final sideColumn = SizedBox(
                width: wide ? 340 : double.infinity,
                child: Column(
                  children: [
                    _ReferenceLab(genre: genre),
                    const SizedBox(height: 18),
                    _CommonKeys(genre: genre),
                  ],
                ),
              );

              if (!wide) {
                return Column(
                  children: [
                    mainColumn,
                    const SizedBox(height: 18),
                    sideColumn,
                  ],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: mainColumn),
                  const SizedBox(width: 18),
                  sideColumn,
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _GenreHeader extends StatelessWidget {
  const _GenreHeader({required this.genre});

  final Genre genre;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          genre.name,
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            height: 1.05,
          ),
        ),
        const SizedBox(height: 8),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 760),
          child: Text(
            genre.description,
            style: const TextStyle(color: slate400, height: 1.45),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            CodexPill(
              icon: Icons.schedule,
              label: '${genre.bpm} BPM',
              color: amber300,
            ),
            CodexPill(
              icon: Icons.article,
              label: genre.timing,
              color: indigo300,
            ),
            for (final trait in genre.keyTraits) CodexPill(label: '#$trait'),
          ],
        ),
      ],
    );
  }
}

class _HarmonicAnalysis extends StatelessWidget {
  const _HarmonicAnalysis({required this.genre, required this.chords});

  final Genre genre;
  final List<ProgressionChord> chords;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle(
            icon: Icons.search,
            title: 'Harmonic Analysis',
            color: indigo300,
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: slate950,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: slate800),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  genre.progression,
                  style: const TextStyle(
                    color: emerald300,
                    fontFamily: 'monospace',
                    fontSize: 27,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  genre.progressionNote,
                  style: const TextStyle(color: slate400, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const SectionTitle(
            icon: Icons.key,
            title: 'Chord Reference',
            color: emerald300,
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth >= 720 ? 2 : 1;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: chords.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  mainAxisExtent: 128,
                ),
                itemBuilder: (context, index) {
                  final chord = chords[index];
                  return Container(
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: slate950.withValues(alpha: 0.62),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: slate800),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                chord.degree,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            Text(
                              chord.symbol,
                              style: const TextStyle(
                                color: emerald300,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Text(
                          chord.shape.toUpperCase(),
                          style: const TextStyle(
                            color: slate500,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Expanded(
                          child: Text(
                            chord.note,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: slate400,
                              fontSize: 12,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),
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

class _ReferenceLab extends StatelessWidget {
  const _ReferenceLab({required this.genre});

  final Genre genre;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      gradient: const LinearGradient(
        colors: [Color(0xFF4F46E5), Color(0xFF7E22CE)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle(
            icon: Icons.headphones,
            title: 'Reference Lab',
            subtitle: 'Listen while you analyze.',
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          Text(
            'Open a curated search for essential ${genre.name} tracks to hear these progressions in context.',
            style: const TextStyle(color: Color(0xFFE0E7FF), height: 1.4),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: CodexActionButton(
              icon: Icons.play_arrow,
              label: 'Listen on YouTube',
              primary: true,
              onPressed: () {
                final query = Uri.encodeQueryComponent(
                  'best ${genre.name} mix',
                );
                launchUrl(
                  Uri.parse(
                    'https://www.youtube.com/results?search_query=$query',
                  ),
                  mode: LaunchMode.externalApplication,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CommonKeys extends StatelessWidget {
  const _CommonKeys({required this.genre});

  final Genre genre;

  @override
  Widget build(BuildContext context) {
    return CodexPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle(icon: Icons.key, title: 'Common Keys'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final key in commonKeys(genre)) CodexPill(label: key),
            ],
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: slate950.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: slate800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: slate500,
              fontSize: 10,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _GenreTile extends StatelessWidget {
  const _GenreTile({
    required this.genre,
    required this.phaseTitle,
    required this.onTap,
  });

  final Genre genre;
  final String phaseTitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: slate950.withValues(alpha: 0.62),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: slate800),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              phaseTitle.toUpperCase(),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: indigo300,
                fontSize: 10,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              genre.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              genre.description,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: slate400, height: 1.3),
            ),
          ],
        ),
      ),
    );
  }
}

class _Breadcrumb extends StatelessWidget {
  const _Breadcrumb({required this.items});

  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (final item in items.indexed) ...[
          if (item.$1 > 0)
            const Icon(Icons.chevron_right, size: 14, color: slate500),
          Text(
            item.$2,
            style: const TextStyle(
              color: slate500,
              fontSize: 12,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ],
    );
  }
}

class _Bullet extends StatelessWidget {
  const _Bullet(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 8),
            child: Icon(Icons.circle, color: slate500, size: 6),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: slate300, height: 1.38),
            ),
          ),
        ],
      ),
    );
  }
}
