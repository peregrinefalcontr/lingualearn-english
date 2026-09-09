import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/lesson_model.dart';
import '../../data/repositories/supabase_repository.dart';
import '../../data/repositories/mistake_repository.dart';

class UnitQuizScreen extends StatefulWidget {
  final LessonModel lesson;
  final VoidCallback? onCompleted;

  const UnitQuizScreen({super.key, required this.lesson, this.onCompleted});

  @override
  State<UnitQuizScreen> createState() => _UnitQuizScreenState();
}

class _UnitQuizScreenState extends State<UnitQuizScreen> {
  late ConfettiController _confettiController;
  int _selectedLimit = 100;
  int _currentPage = 1;
  static const int _pageSize = 10;

  final Map<int, int> _answers = {};
  bool _isSubmitted = false;
  int _score = 0;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  List<QuizQuestion> get _activeQuestions {
    final all = widget.lesson.quiz;
    return all.take(_selectedLimit).toList();
  }

  int get _totalPages {
    final total = _activeQuestions.length;
    return (total / _pageSize).ceil().clamp(1, 100);
  }

  List<QuizQuestion> get _pageQuestions {
    final active = _activeQuestions;
    final start = (_currentPage - 1) * _pageSize;
    if (start >= active.length) return [];
    final end = (start + _pageSize).clamp(0, active.length);
    return active.sublist(start, end);
  }

  void _submitQuiz() async {
    final questions = _activeQuestions;
    int correct = 0;

    for (int i = 0; i < questions.length; i++) {
      final q = questions[i];
      final userAns = _answers[i];
      if (userAns == q.answerIndex) {
        correct++;
      } else {
        await MistakeRepository.addMistake(MistakeItem(
          id: '${widget.lesson.id}-q-$i',
          title: '${widget.lesson.title} (Soru ${i + 1})',
          question: q.question,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation,
        ));
      }
    }

    final calculatedScore = questions.isNotEmpty ? ((correct / questions.length) * 100).round() : 100;

    setState(() {
      _score = calculatedScore;
      _isSubmitted = true;
    });

    if (calculatedScore >= 70) {
      _confettiController.play();
    }

    // Save progress to Supabase
    try {
      await SupabaseRepository().completeLesson(widget.lesson.id, calculatedScore);
      widget.lesson.completed = true;
      widget.lesson.quizScore = calculatedScore;
      widget.onCompleted?.call();
    } catch (_) {}
  }

  void _resetQuiz() {
    setState(() {
      _answers.clear();
      _isSubmitted = false;
      _score = 0;
      _currentPage = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final questions = _activeQuestions;
    final pageList = _pageQuestions;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Ünite ${widget.lesson.unitNumber} Testi', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('${questions.length} Soru Havuzu', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
        actions: [
          if (!_isSubmitted)
            PopupMenuButton<int>(
              initialValue: _selectedLimit,
              tooltip: 'Soru Sayısı Seç',
              icon: const Icon(Icons.tune_rounded),
              onSelected: (val) {
                setState(() {
                  _selectedLimit = val;
                  _currentPage = 1;
                  _answers.clear();
                });
              },
              itemBuilder: (context) => [10, 25, 50, 100].map((lim) {
                return PopupMenuItem<int>(
                  value: lim,
                  child: Text('$lim Soru'),
                );
              }).toList(),
            ),
        ],
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Result Card if submitted
              if (_isSubmitted) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: _score >= 70 ? AppColors.primary.withValues(alpha: 0.15) : AppColors.error.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _score >= 70 ? AppColors.primary : AppColors.error),
                  ),
                  child: Column(
                    children: [
                      Text(
                        _score >= 70 ? 'Tebrikler! Üniteyi Geçtiniz! 🎉' : 'Daha Fazla Pratik Yapmalısınız 💪',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _score >= 70 ? AppColors.primary : AppColors.error,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Başarı Oranı: %$_score',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: _resetQuiz,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.cardBorder,
                          foregroundColor: Colors.white,
                        ),
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Testi Yeniden Başlat'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Question Cards
              ...pageList.asMap().entries.map((entry) {
                final pageIdx = entry.key;
                final q = entry.value;
                final globalIdx = (_currentPage - 1) * _pageSize + pageIdx;
                final selectedOpt = _answers[globalIdx];

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
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Soru ${globalIdx + 1}',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ),
                          const Spacer(),
                          if (_isSubmitted)
                            Icon(
                              selectedOpt == q.answerIndex ? Icons.check_circle_rounded : Icons.cancel_rounded,
                              color: selectedOpt == q.answerIndex ? AppColors.primary : AppColors.error,
                              size: 20,
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(q.question, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                      const SizedBox(height: 12),
                      ...q.options.asMap().entries.map((optEntry) {
                        final optIdx = optEntry.key;
                        final optText = optEntry.value;
                        final isSelected = selectedOpt == optIdx;

                        Color borderColor = AppColors.cardBorder;
                        Color bgColor = Colors.transparent;

                        if (_isSubmitted) {
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
                          onTap: _isSubmitted
                              ? null
                              : () {
                                  setState(() {
                                    _answers[globalIdx] = optIdx;
                                  });
                                },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: borderColor),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  '${String.fromCharCode(65 + optIdx)}.',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? AppColors.primary : AppColors.textSecondary,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    optText,
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : AppColors.textPrimary,
                                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                      if (_isSubmitted && q.explanation.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.accent),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(q.explanation, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              }),

              // Pagination Controls
              if (_totalPages > 1) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left_rounded),
                      onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                    ),
                    Text(
                      'Sayfa $_currentPage / $_totalPages',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right_rounded),
                      onPressed: _currentPage < _totalPages ? () => setState(() => _currentPage++) : null,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ],

              // Submit Button
              if (!_isSubmitted)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: ElevatedButton(
                    onPressed: _answers.length >= (_activeQuestions.length * 0.3) ? _submitQuiz : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(
                      'Testi Tamamla (${_answers.length}/${_activeQuestions.length} Cevaplandı)',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [AppColors.primary, AppColors.secondary, AppColors.warning, Colors.white],
            ),
          ),
        ],
      ),
    );
  }
}
