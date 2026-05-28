import 'dart:math' as math;

import 'package:flutter/material.dart';

const Color slate950 = Color(0xFF020617);
const Color slate900 = Color(0xFF0F172A);
const Color slate850 = Color(0xFF111827);
const Color slate800 = Color(0xFF1E293B);
const Color slate700 = Color(0xFF334155);
const Color slate500 = Color(0xFF64748B);
const Color slate400 = Color(0xFF94A3B8);
const Color slate300 = Color(0xFFCBD5E1);
const Color amber300 = Color(0xFFFCD34D);
const Color amber400 = Color(0xFFFBBF24);
const Color indigo300 = Color(0xFFA5B4FC);
const Color indigo400 = Color(0xFF818CF8);
const Color indigo500 = Color(0xFF6366F1);
const Color indigo600 = Color(0xFF4F46E5);
const Color emerald300 = Color(0xFF6EE7B7);
const Color emerald400 = Color(0xFF34D399);

class CodexPanel extends StatelessWidget {
  const CodexPanel({
    required this.child,
    super.key,
    this.padding = const EdgeInsets.all(20),
    this.gradient,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: gradient == null ? slate900.withValues(alpha: 0.72) : null,
        gradient: gradient,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: slate800),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 24,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: child,
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    required this.icon,
    required this.title,
    super.key,
    this.subtitle,
    this.color = indigo300,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: slate400,
                    height: 1.35,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class CodexPill extends StatelessWidget {
  const CodexPill({
    required this.label,
    super.key,
    this.icon,
    this.color = indigo300,
  });

  final String label;
  final IconData? icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.28)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CodexActionButton extends StatelessWidget {
  const CodexActionButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    super.key,
    this.primary = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final foreground = primary ? slate950 : Colors.white;
    final background = primary ? Colors.white : slate800;

    return FilledButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: FilledButton.styleFrom(
        foregroundColor: foreground,
        backgroundColor: background,
        disabledBackgroundColor: slate800.withValues(alpha: 0.6),
        disabledForegroundColor: slate500,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({
    required this.icon,
    required this.label,
    required this.value,
    super.key,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: slate950.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.11)),
      ),
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: indigo300,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PianoDiagram extends StatelessWidget {
  const PianoDiagram({
    required this.intervals,
    super.key,
    this.root = 0,
    this.height = 92,
  });

  final List<int> intervals;
  final int root;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(
        painter: _PianoPainter(
          activeNotes: {
            for (final interval in intervals) _mod12(interval + root),
          },
        ),
      ),
    );
  }
}

class FretboardDiagram extends StatelessWidget {
  const FretboardDiagram({
    required this.frets,
    super.key,
    this.stringCount = 6,
  });

  final List<int> frets;
  final int stringCount;

  @override
  Widget build(BuildContext context) {
    final numericFrets = frets.where((fret) => fret > 0);
    final minFret = numericFrets.isEmpty ? 1 : numericFrets.reduce(math.min);
    final startFret = math.max(1, minFret);
    final endFret = startFret + 3;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final entry in frets.indexed)
          SizedBox(
            height: 28,
            child: Row(
              children: [
                SizedBox(
                  width: 26,
                  child: Text(
                    entry.$1 == 0 ? 'low' : '',
                    style: const TextStyle(color: slate500, fontSize: 10),
                  ),
                ),
                Expanded(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(height: 2, color: slate500),
                      Row(
                        children: [
                          for (int fret = startFret; fret <= endFret; fret++)
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border(
                                    right: BorderSide(
                                      color: slate400.withValues(alpha: 0.62),
                                      width: fret == startFret ? 4 : 2,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      if (entry.$2 == 0)
                        const Positioned(
                          left: 2,
                          child: Text(
                            '○',
                            style: TextStyle(color: emerald300, fontSize: 20),
                          ),
                        )
                      else if (entry.$2 < 0)
                        const Positioned(
                          left: 3,
                          child: Text(
                            '×',
                            style: TextStyle(color: slate400, fontSize: 18),
                          ),
                        )
                      else
                        _FretDot(
                          leftFactor:
                              ((entry.$2 - startFret).clamp(0, 3) + 0.5) / 4,
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 6),
        Padding(
          padding: const EdgeInsets.only(left: 26),
          child: Row(
            children: [
              for (int fret = startFret; fret <= endFret; fret++)
                Expanded(
                  child: Text(
                    '$fret',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: slate500, fontSize: 11),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _FretDot extends StatelessWidget {
  const _FretDot({required this.leftFactor});

  final double leftFactor;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: FractionallySizedBox(
        alignment: Alignment(leftFactor * 2 - 1, 0),
        widthFactor: 0.16,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: emerald300,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: emerald300.withValues(alpha: 0.48),
                blurRadius: 12,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PianoPainter extends CustomPainter {
  _PianoPainter({required this.activeNotes});

  static const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
  static const blackNotes = [
    (note: 1, afterWhiteIndex: 0),
    (note: 3, afterWhiteIndex: 1),
    (note: 6, afterWhiteIndex: 3),
    (note: 8, afterWhiteIndex: 4),
    (note: 10, afterWhiteIndex: 5),
  ];

  final Set<int> activeNotes;

  @override
  void paint(Canvas canvas, Size size) {
    final whitePaint = Paint()..color = Colors.white;
    final activeWhitePaint = Paint()..color = emerald300;
    final blackPaint = Paint()..color = const Color(0xFF020617);
    final activeBlackPaint = Paint()..color = const Color(0xFF047857);
    final strokePaint = Paint()
      ..color = slate500.withValues(alpha: 0.82)
      ..style = PaintingStyle.stroke;

    final whiteWidth = size.width / whiteNotes.length;
    for (final entry in whiteNotes.indexed) {
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(
          entry.$1 * whiteWidth + 1,
          0,
          whiteWidth - 2,
          size.height,
        ),
        const Radius.circular(5),
      );
      canvas.drawRRect(
        rect,
        activeNotes.contains(entry.$2) ? activeWhitePaint : whitePaint,
      );
      canvas.drawRRect(rect, strokePaint);
    }

    final blackWidth = whiteWidth * 0.62;
    final blackHeight = size.height * 0.62;
    for (final black in blackNotes) {
      final left = (black.afterWhiteIndex + 1) * whiteWidth - blackWidth / 2;
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(left, 0, blackWidth, blackHeight),
        const Radius.circular(5),
      );
      canvas.drawRRect(
        rect,
        activeNotes.contains(black.note) ? activeBlackPaint : blackPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _PianoPainter oldDelegate) {
    return oldDelegate.activeNotes != activeNotes;
  }
}

int _mod12(int value) => ((value % 12) + 12) % 12;
