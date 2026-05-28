class CodexData {
  const CodexData({
    required this.phases,
    required this.phaseHistories,
    required this.genreHistories,
    required this.chordShapes,
  });

  final List<Phase> phases;
  final Map<String, PhaseHistory> phaseHistories;
  final Map<String, String> genreHistories;
  final Map<String, ChordShape> chordShapes;

  int get totalGenres =>
      phases.fold<int>(0, (total, phase) => total + phase.genres.length);

  Phase? phaseForGenre(Genre genre) {
    for (final phase in phases) {
      if (phase.genres.any((candidate) => candidate.id == genre.id)) {
        return phase;
      }
    }
    return null;
  }
}

class Phase {
  const Phase({
    required this.id,
    required this.title,
    required this.learning,
    required this.genres,
  });

  factory Phase.fromJson(Map<String, dynamic> json) {
    return Phase(
      id: _string(json, 'id'),
      title: _string(json, 'title'),
      learning: _stringList(json['learning']),
      genres: _objectList(json['genres']).map(Genre.fromJson).toList(),
    );
  }

  final String id;
  final String title;
  final List<String> learning;
  final List<Genre> genres;
}

class PhaseHistory {
  const PhaseHistory({required this.summary, required this.highlights});

  factory PhaseHistory.fromJson(Map<String, dynamic> json) {
    return PhaseHistory(
      summary: _string(json, 'summary'),
      highlights: _stringList(json['highlights']),
    );
  }

  final String summary;
  final List<String> highlights;
}

class Genre {
  const Genre({
    required this.id,
    required this.name,
    required this.bpm,
    required this.timing,
    required this.description,
    required this.progression,
    required this.progressionNote,
    required this.instruments,
    required this.visualChord,
    required this.keyTraits,
    required this.progressionChords,
    required this.theoryNotes,
    this.key,
    this.keys = const [],
  });

  factory Genre.fromJson(Map<String, dynamic> json) {
    return Genre(
      id: _string(json, 'id'),
      name: _string(json, 'name'),
      bpm: _string(json, 'bpm'),
      timing: _string(json, 'timing'),
      description: _string(json, 'description'),
      progression: _string(json, 'progression'),
      progressionNote: _string(json, 'progressionNote'),
      key: json['key']?.toString(),
      keys: _stringList(json['keys']),
      progressionChords: _objectList(
        json['progressionChords'],
      ).map(ProgressionChord.fromJson).toList(),
      instruments: InstrumentNotes.fromJson(
        Map<String, dynamic>.from(json['instruments'] as Map? ?? const {}),
      ),
      visualChord: _string(json, 'visual_chord', fallback: 'Maj7'),
      keyTraits: _stringList(json['key_traits']),
      theoryNotes: _stringList(json['theoryNotes']),
    );
  }

  final String id;
  final String name;
  final String bpm;
  final String timing;
  final String description;
  final String progression;
  final String progressionNote;
  final String? key;
  final List<String> keys;
  final List<ProgressionChord> progressionChords;
  final InstrumentNotes instruments;
  final String visualChord;
  final List<String> keyTraits;
  final List<String> theoryNotes;
}

class ProgressionChord {
  const ProgressionChord({
    required this.degree,
    required this.symbol,
    required this.shape,
    required this.note,
  });

  factory ProgressionChord.fromJson(Map<String, dynamic> json) {
    return ProgressionChord(
      degree: _string(json, 'degree'),
      symbol: _string(json, 'symbol'),
      shape: _string(json, 'shape', fallback: 'Maj7'),
      note: _string(json, 'note'),
    );
  }

  final String degree;
  final String symbol;
  final String shape;
  final String note;
}

class InstrumentNotes {
  const InstrumentNotes({
    required this.piano,
    required this.guitar,
    required this.ukulele,
  });

  factory InstrumentNotes.fromJson(Map<String, dynamic> json) {
    return InstrumentNotes(
      piano: _string(json, 'piano'),
      guitar: _string(json, 'guitar'),
      ukulele: _string(json, 'ukulele'),
    );
  }

  final String piano;
  final String guitar;
  final String ukulele;
}

class ChordShape {
  const ChordShape({
    required this.name,
    required this.pianoIntervals,
    required this.guitarFrets,
    required this.ukeFrets,
  });

  factory ChordShape.fromJson(String name, Map<String, dynamic> json) {
    return ChordShape(
      name: name,
      pianoIntervals: _intList(json['pianoIntervals']),
      guitarFrets: _intList(json['guitarFrets']),
      ukeFrets: _intList(json['ukeFrets']),
    );
  }

  final String name;
  final List<int> pianoIntervals;
  final List<int> guitarFrets;
  final List<int> ukeFrets;
}

List<ProgressionChord> deriveProgressionChords(Genre genre) {
  if (genre.progressionChords.isNotEmpty) return genre.progressionChords;

  final pieces = genre.progression
      .split(RegExp(r'[-–→>/]'))
      .map((piece) => piece.trim())
      .where((piece) => piece.isNotEmpty)
      .toList();

  return [
    for (final entry in pieces.indexed)
      ProgressionChord(
        degree: entry.$2.toUpperCase(),
        symbol: entry.$2,
        shape: guessShapeFromToken(entry.$2),
        note: entry.$1 == 0
            ? 'Fallback from the raw progression string.'
            : 'Auto-derived from progression text.',
      ),
  ];
}

String guessShapeFromToken(String token) {
  final normalized = token.toLowerCase();

  if (RegExp(r'm7b5|ø').hasMatch(normalized)) return 'm7b5';
  if (RegExp(r'dim|°').hasMatch(normalized)) return 'dim7';
  if (normalized.contains('sus')) return 'Sus4';
  if (normalized.contains('6/9')) return '6/9';
  if (normalized.contains('11')) return '11th';
  if (normalized.contains('9')) {
    return RegExp(r'm|min|ii|iii|vi').hasMatch(normalized) ? 'min9' : 'Dom9';
  }
  if (normalized.contains('v7')) return 'Dom7';
  if (RegExp(r'ii|iii|iv|vi').hasMatch(normalized)) return 'min7';
  return normalized.contains('v') ? 'Dom7' : 'Maj7';
}

List<String> commonKeys(Genre genre) {
  if (genre.keys.isNotEmpty) return genre.keys;
  if (genre.key != null && genre.key!.isNotEmpty) return [genre.key!];
  return const ['C Major', 'G Major', 'F Major'];
}

String _string(Map<String, dynamic> json, String key, {String fallback = ''}) {
  return json[key]?.toString() ?? fallback;
}

List<Map<String, dynamic>> _objectList(Object? value) {
  if (value is! List) return const [];
  return [
    for (final item in value)
      if (item is Map) Map<String, dynamic>.from(item),
  ];
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.map((item) => item.toString()).toList();
}

List<int> _intList(Object? value) {
  if (value is! List) return const [];
  return value.map((item) => (item as num).toInt()).toList();
}
