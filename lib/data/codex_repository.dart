import 'dart:convert';

import 'package:flutter/services.dart';

import '../models/codex.dart';

class CodexRepository {
  CodexRepository({AssetBundle? bundle}) : _bundle = bundle ?? rootBundle;

  final AssetBundle _bundle;

  Future<CodexData> load() async {
    final payloads = await Future.wait([
      _loadJson('assets/data/phases.json'),
      _loadJson('assets/data/phase_histories.json'),
      _loadJson('assets/data/genre_histories.json'),
      _loadJson('assets/data/chord_shapes.json'),
    ]);

    final phaseJson = payloads[0] as List<dynamic>;
    final phaseHistoryJson = payloads[1] as Map<String, dynamic>;
    final genreHistoryJson = payloads[2] as Map<String, dynamic>;
    final chordShapeJson = payloads[3] as Map<String, dynamic>;

    return CodexData(
      phases: [
        for (final item in phaseJson)
          Phase.fromJson(Map<String, dynamic>.from(item as Map)),
      ],
      phaseHistories: phaseHistoryJson.map(
        (key, value) => MapEntry(
          key,
          PhaseHistory.fromJson(Map<String, dynamic>.from(value as Map)),
        ),
      ),
      genreHistories: genreHistoryJson.map(
        (key, value) => MapEntry(key, value.toString()),
      ),
      chordShapes: chordShapeJson.map(
        (key, value) => MapEntry(
          key,
          ChordShape.fromJson(key, Map<String, dynamic>.from(value as Map)),
        ),
      ),
    );
  }

  Future<Object?> _loadJson(String path) async {
    return jsonDecode(await _bundle.loadString(path));
  }
}
