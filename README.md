# Open Source Music Theory Codex

A Flutter harmony workstation for exploring genre history, chord progressions,
instrument voicings, and Circle of Fifths movement.

## What Is Here

- Flutter app shell with responsive desktop/mobile navigation.
- Phase and genre browser backed by JSON assets generated from the original
  TypeScript data.
- Interactive Circle of Fifths with major/minor functional chord views.
- Instrument Lab for piano, guitar, ukulele, bass, and drums.
- WAV sample playback using Flutter assets and `audioplayers`.
- Flutter web Docker image served by Nginx.

The legacy React/Vite sources are still present under `src/` for comparison
while the Flutter rebase settles. The active app entrypoint is `lib/main.dart`.

## Requirements

- Flutter 3.44 or newer
- Dart 3.12 or newer

## Local Development

```bash
flutter pub get
flutter run -d chrome
```

For a local web server without launching Chrome:

```bash
flutter run -d web-server --web-port 5173
```

## Verification

```bash
flutter analyze
flutter test
flutter build web
```

## Docker

Build and run the Flutter web container:

```bash
docker build -t music-codex .
docker run --rm -p 8080:80 --name music-codex music-codex
```

Or use Compose:

```bash
docker compose up --build
```

Open `http://localhost:8070`.

## Project Structure

```text
assets/
  audio/                 WAV samples used by the Flutter sampler
  data/                  JSON codex data loaded at runtime
lib/
  audio/codex_sampler.dart
  data/codex_repository.dart
  models/codex.dart
  ui/app_shell.dart
  ui/circle_of_fifths.dart
  ui/codex_widgets.dart
  ui/instrument_visualizer.dart
  main.dart
test/
  widget_test.dart
web/, android/, ios/, macos/
  Flutter platform scaffolding
```

## Data Updates

The Flutter app loads its codex content from `assets/data/*.json`. Update those
JSON assets directly when changing phases, genres, histories, or chord shapes.

## License

See [LICENSE](LICENSE).
