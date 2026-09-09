import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/mistake_repository.dart';

class MistakeNotebookScreen extends StatefulWidget {
  const MistakeNotebookScreen({super.key});

  @override
  State<MistakeNotebookScreen> createState() => _MistakeNotebookScreenState();
}

class _MistakeNotebookScreenState extends State<MistakeNotebookScreen> {
  List<MistakeItem> _mistakes = [];
  bool _loading = true;
  final Map<String, int> _reAnswers = {};
  final Map<String, bool> _reResults = {};

  @override
  void initState() {
    super.initState();
    _loadMistakes();
  }

  Future<void> _loadMistakes() async {
    setState(() => _loading = true);
    final list = await MistakeRepository.getMistakes();
    setState(() {
      _mistakes = list;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hata Defterim', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (_mistakes.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded),
              tooltip: 'Tümünü Temizle',
              onPressed: () async {
                await MistakeRepository.clearAll();
                _loadMistakes();
              },
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _mistakes.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_outline_rounded, size: 64, color: AppColors.primary.withValues(alpha: 0.5)),
                      const SizedBox(height: 16),
                      const Text(
                        'Hata Defteriniz Tertemiz! 🌟',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Testlerde yanlış yaptığınız sorular buraya kaydedilir.',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _mistakes.length,
                  itemBuilder: (context, idx) {
                    final item = _mistakes[idx];
                    final selectedOpt = _reAnswers[item.id];
                    final isSolved = _reResults.containsKey(item.id);
                    final isCorrect = _reResults[item.id] == true;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isSolved
                              ? (isCorrect ? AppColors.primary : AppColors.error)
                              : AppColors.cardBorder,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                              IconButton(
                                icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.textSecondary),
                                onPressed: () async {
                                  await MistakeRepository.removeMistake(item.id);
                                  _loadMistakes();
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(item.question, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                          const SizedBox(height: 12),
                          ...item.options.asMap().entries.map((optEntry) {
                            final optIdx = optEntry.key;
                            final optText = optEntry.value;
                            final isThisSelected = selectedOpt == optIdx;

                            Color borderC = AppColors.cardBorder;
                            Color bgC = Colors.transparent;

                            if (isSolved) {
                              if (optIdx == item.answerIndex) {
                                borderC = AppColors.primary;
                                bgC = AppColors.primary.withValues(alpha: 0.15);
                              } else if (isThisSelected) {
                                borderC = AppColors.error;
                                bgC = AppColors.error.withValues(alpha: 0.15);
                              }
                            } else if (isThisSelected) {
                              borderC = AppColors.accent;
                              bgC = AppColors.accent.withValues(alpha: 0.1);
                            }

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: InkWell(
                                onTap: isSolved
                                    ? null
                                    : () {
                                        setState(() {
                                          _reAnswers[item.id] = optIdx;
                                          final correctNow = optIdx == item.answerIndex;
                                          _reResults[item.id] = correctNow;
                                          if (correctNow) {
                                            // After mastering, auto-remove after delay
                                            Future.delayed(const Duration(seconds: 1), () async {
                                              await MistakeRepository.removeMistake(item.id);
                                              if (mounted) _loadMistakes();
                                            });
                                          }
                                        });
                                      },
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: bgC,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: borderC),
                                  ),
                                  child: Row(
                                    children: [
                                      Text(
                                        '${String.fromCharCode(65 + optIdx)}.',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: isThisSelected ? AppColors.primary : AppColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          optText,
                                          style: TextStyle(
                                            color: isThisSelected ? Colors.white : AppColors.textPrimary,
                                            fontWeight: isThisSelected ? FontWeight.bold : FontWeight.normal,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }),
                          if (item.explanation.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.background,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                'Açıklama: ${item.explanation}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontStyle: FontStyle.italic),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
