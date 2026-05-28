import 'package:flutter/material.dart';

import 'data/codex_repository.dart';
import 'models/codex.dart';
import 'ui/app_shell.dart';
import 'ui/codex_widgets.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MusicTheoryCodexApp());
}

class MusicTheoryCodexApp extends StatefulWidget {
  const MusicTheoryCodexApp({super.key});

  @override
  State<MusicTheoryCodexApp> createState() => _MusicTheoryCodexAppState();
}

class _MusicTheoryCodexAppState extends State<MusicTheoryCodexApp> {
  late final Future<CodexData> _data = CodexRepository().load();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Music Theory Codex',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: slate950,
        colorScheme: ColorScheme.fromSeed(
          seedColor: indigo500,
          brightness: Brightness.dark,
          surface: slate900,
        ),
        fontFamily: 'Arial',
        textTheme: ThemeData.dark().textTheme.apply(
          bodyColor: slate300,
          displayColor: Colors.white,
        ),
        sliderTheme: const SliderThemeData(
          activeTrackColor: amber300,
          thumbColor: amber300,
        ),
      ),
      home: FutureBuilder<CodexData>(
        future: _data,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return CodexAppShell(data: snapshot.data!);
          }

          if (snapshot.hasError) {
            return _LoadFailure(error: snapshot.error!);
          }

          return const _LoadingScreen();
        },
      ),
    );
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: amber300),
            SizedBox(height: 16),
            Text(
              'Loading Theory Codex',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadFailure extends StatelessWidget {
  const _LoadFailure({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: CodexPanel(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle(
                icon: Icons.error_outline,
                title: 'Failed to load Codex data',
                color: amber300,
              ),
              const SizedBox(height: 12),
              Text('$error', style: const TextStyle(color: slate400)),
            ],
          ),
        ),
      ),
    );
  }
}
