import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/tts_helper.dart';
import '../../data/models/scenario_model.dart';

class ScenarioDetailScreen extends StatefulWidget {
  final ScenarioModel scenario;

  const ScenarioDetailScreen({super.key, required this.scenario});

  @override
  State<ScenarioDetailScreen> createState() => _ScenarioDetailScreenState();
}

class _ScenarioDetailScreenState extends State<ScenarioDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final Map<int, int> _quizAnswers = {};
  bool _quizSubmitted = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.scenario;

    return Scaffold(
      appBar: AppBar(
        title: Text(s.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [
            Tab(text: 'Diyaloglar'),
            Tab(text: 'Kilit Kalıplar'),
            Tab(text: 'Durum Testi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Dialogues (Chat format)
          ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: s.dialogues.length,
            itemBuilder: (context, idx) {
              final d = s.dialogues[idx];
              final isMe = idx % 2 == 1;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!isMe) ...[
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: AppColors.cardBorder,
                        child: Text(
                          d.speaker.isNotEmpty ? d.speaker[0] : 'S',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isMe ? AppColors.primary.withValues(alpha: 0.2) : AppColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isMe ? AppColors.primary.withValues(alpha: 0.5) : AppColors.cardBorder,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              d.speaker,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isMe ? AppColors.primary : AppColors.accent,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              d.textEn,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              d.textTr,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontStyle: FontStyle.italic),
                            ),
                            const SizedBox(height: 4),
                            InkWell(
                              onTap: () => TtsHelper().speak(d.textEn),
                              child: const Icon(Icons.volume_up_rounded, size: 18, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (isMe) ...[
                      const SizedBox(width: 8),
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                        child: Text(
                          d.speaker.isNotEmpty ? d.speaker[0] : 'U',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),

          // Tab 2: Key Phrases
          ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: s.keyPhrases.length,
            itemBuilder: (context, idx) {
              final kp = s.keyPhrases[idx];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            kp.phrase,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            kp.meaning,
                            style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
                          ),
                          if (kp.situation.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Durum: ${kp.situation}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.volume_up_rounded, color: AppColors.primary),
                      onPressed: () => TtsHelper().speak(kp.phrase),
                    ),
                  ],
                ),
              );
            },
          ),

          // Tab 3: Quiz
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ...s.quiz.asMap().entries.map((entry) {
                final qIdx = entry.key;
                final q = entry.value;
                final selectedOpt = _quizAnswers[qIdx];

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Soru ${qIdx + 1}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      const SizedBox(height: 6),
                      Text(q.question, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 12),
                      ...q.options.asMap().entries.map((optEntry) {
                        final optIdx = optEntry.key;
                        final optText = optEntry.value;
                        final isSelected = selectedOpt == optIdx;

                        Color borderColor = AppColors.cardBorder;
                        Color bgColor = Colors.transparent;

                        if (_quizSubmitted) {
                          if (optIdx == q.answerIndex) {
                            borderColor = AppColors.primary;
                            bgColor = AppColors.primary.withValues(alpha: 0.15);
                          } else if (isSelected) {
                            borderColor = AppColors.error;
                            bgColor = AppColors.error.withValues(alpha: 0.15);
                          }
                        } else if (isSelected) {
                          borderColor = AppColors.primary;
                          bgColor = AppColors.primary.withValues(alpha: 0.1);
                        }

                        return InkWell(
                          onTap: _quizSubmitted ? null : () => setState(() => _quizAnswers[qIdx] = optIdx),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: borderColor),
                            ),
                            child: Text(
                              optText,
                              style: TextStyle(
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        );
                      }),
                      if (_quizSubmitted && q.explanation.isNotEmpty)
                        Text(q.explanation, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
                    ],
                  ),
                );
              }),
              if (!_quizSubmitted)
                ElevatedButton(
                  onPressed: () => setState(() => _quizSubmitted = true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Testi Gönder', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
