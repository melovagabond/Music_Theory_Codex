import 'dart:async';
import 'dart:math' as math;

import 'package:audioplayers/audioplayers.dart';

import '../models/codex.dart';

const Map<String, int> noteBase = {
  'C': 60,
  'C#': 61,
  'Db': 61,
  'D': 62,
  'D#': 63,
  'Eb': 63,
  'E': 64,
  'F': 65,
  'F#': 66,
  'Gb': 66,
  'G': 67,
  'G#': 68,
  'Ab': 68,
  'A': 69,
  'A#': 70,
  'Bb': 70,
  'B': 71,
};

const Map<String, String> _sampleAssets = {
  'piano': 'audio/piano_C4.wav',
  'guitar': 'audio/guitar_C4.wav',
  'ukulele': 'audio/ukulele_C4.wav',
  'bass': 'audio/bass_C2.wav',
};

const Map<String, int> _sampleRoots = {
  'piano': 60,
  'guitar': 60,
  'ukulele': 60,
  'bass': 48,
};

const Map<int, String> _drumAssets = {
  36: 'audio/drum_kick.wav',
  38: 'audio/drum_snare.wav',
  42: 'audio/drum_hihat.wav',
  45: 'audio/drum_tom_low.wav',
  47: 'audio/drum_tom_mid.wav',
  50: 'audio/drum_tom_high.wav',
};

const List<({int midi, Duration offset})> _drumPattern = [
  (midi: 36, offset: Duration.zero),
  (midi: 42, offset: Duration.zero),
  (midi: 42, offset: Duration(milliseconds: 190)),
  (midi: 38, offset: Duration(milliseconds: 330)),
  (midi: 47, offset: Duration(milliseconds: 540)),
];

class CodexSampler {
  CodexSampler(this.chordShapes);

  final Map<String, ChordShape> chordShapes;
  final List<AudioPlayer> _activePlayers = [];

  int? parseRootMidi(String symbol) {
    final normalized = symbol.replaceAll('♯', '#').replaceAll('♭', 'b');
    final match = RegExp(r'^([A-Ga-g])(#|b)?').firstMatch(normalized);
    if (match == null) return null;

    final key = '${match.group(1)!.toUpperCase()}${match.group(2) ?? ''}';
    return noteBase[key];
  }

  Future<void> playProgressionChord(
    ProgressionChord chord,
    String instrument,
  ) async {
    await playChord(chord.shape, parseRootMidi(chord.symbol) ?? 60, instrument);
  }

  Future<void> playChord(
    String shapeKey,
    int rootMidi,
    String instrument,
  ) async {
    if (instrument == 'drums') {
      await playDrumPattern();
      return;
    }

    final asset = _sampleAssets[instrument];
    final base = _sampleRoots[instrument];
    if (asset == null || base == null) return;

    final intervals =
        chordShapes[shapeKey]?.pianoIntervals ??
        chordShapes['Maj7']?.pianoIntervals ??
        const [0, 4, 7, 11];

    await Future.wait([
      for (final interval in intervals)
        _playAsset(
          asset,
          playbackRate: math
              .pow(2, (rootMidi + interval - base) / 12)
              .toDouble(),
          volume: instrument == 'bass' ? 0.9 : 0.7,
        ),
    ]);
  }

  Future<void> playNote(int midiNote, String instrument) async {
    if (instrument == 'drums') {
      await playDrumNote(midiNote);
      return;
    }

    final asset = _sampleAssets[instrument];
    final base = _sampleRoots[instrument];
    if (asset == null || base == null) return;

    await _playAsset(
      asset,
      playbackRate: math.pow(2, (midiNote - base) / 12).toDouble(),
      volume: instrument == 'bass' ? 0.9 : 0.72,
    );
  }

  Future<void> playDrumNote(int midiNote) async {
    final asset = _drumAssets[midiNote];
    if (asset == null) return;
    await _playAsset(asset, volume: 0.88);
  }

  Future<void> playDrumPattern() async {
    for (final hit in _drumPattern) {
      unawaited(Future<void>.delayed(hit.offset, () => playDrumNote(hit.midi)));
    }
  }

  Future<void> stopAll() async {
    final players = List<AudioPlayer>.from(_activePlayers);
    _activePlayers.clear();
    await Future.wait([
      for (final player in players) player.stop().then((_) => player.dispose()),
    ]);
  }

  Future<void> _playAsset(
    String asset, {
    double playbackRate = 1,
    double volume = 0.7,
  }) async {
    final player = AudioPlayer();
    _activePlayers.add(player);
    unawaited(
      player.onPlayerComplete.first.then((_) async {
        _activePlayers.remove(player);
        await player.dispose();
      }),
    );

    await player.setReleaseMode(ReleaseMode.stop);
    await player.setSource(AssetSource(asset));
    await player.setVolume(volume.clamp(0, 1).toDouble());
    await player.setPlaybackRate(playbackRate.clamp(0.25, 4).toDouble());
    await player.resume();
  }
}
