import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/exam_model.dart';
import '../../data/models/lesson_model.dart';
import '../../data/repositories/supabase_repository.dart';

class LevelExamScreen extends StatefulWidget {
  final String level; // 'A1' or 'A2'

  const LevelExamScreen({super.key, required this.level});

  @override
  State<LevelExamScreen> createState() => _LevelExamScreenState();
}

class _LevelExamScreenState extends State<LevelExamScreen> {
  late ConfettiController _confettiController;
  ExamModel? _exam;
  bool _loading = true;
  int _currentIndex = 0;
  final Map<int, int> _answers = {};
  bool _isSubmitted = false;
  int _score = 0;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 4));
    _loadExam();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  Future<void> _loadExam() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseRepository().getExam(widget.level);
      setState(() => _exam = data);
    } catch (_) {}
    setState(() => _loading = false);
  }

  void _submitExam() {
    if (_exam == null) return;
    int correct = 0;
    for (int i = 0; i < _exam!.questions.length; i++) {
      if (_answers[i] == _exam!.questions[i].answerIndex) {
        correct++;
      }
    }
    final calculatedScore = ((correct / _exam!.questions.length) * 100).round();
    setState(() {
      _score = calculatedScore;
      _isSubmitted = true;
    });

    if (calculatedScore >= _exam!.passingScore) {
      _confettiController.play();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text('${widget.level} Bitirme Sınavı')),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_exam == null) {
      return Scaffold(
        appBar: AppBar(title: Text('${widget.level} Bitirme Sınavı')),
        body: const Center(child: Text('Sınav yüklenemedi.')),
      );
    }

    final questions = _exam!.questions;
    final isPassed = _score >= _exam!.passingScore;

    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.level} Seviye Bitirme Sınavı', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: Stack(
        children: [
          _isSubmitted
              ? _buildCertificateView(isPassed)
              : _buildQuizRunner(questions),
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

  Widget _buildQuizRunner(List<QuizQuestion> questions) {
    final currentQ = questions[_currentIndex];
    final selectedOpt = _answers[_currentIndex];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Progress Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Soru ${_currentIndex + 1} / ${questions.length}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
              Text('Geçme Notu: %${_exam!.passingScore}', style: const TextStyle(fontSize: 12, color: AppColors.accent)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (_currentIndex + 1) / questions.length,
              backgroundColor: AppColors.cardBorder,
              color: AppColors.primary,
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 24),

          // Question Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Text(
              currentQ.question,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
          const SizedBox(height: 20),

          // Options
          ...currentQ.options.asMap().entries.map((entry) {
            final optIdx = entry.key;
            final optText = entry.value;
            final isSelected = selectedOpt == optIdx;

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: InkWell(
                onTap: () {
                  setState(() => _answers[_currentIndex] = optIdx);
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary.withValues(alpha: 0.15) : AppColors.card,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      Text(
                        '${String.fromCharCode(65 + optIdx)}.',
                        style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? AppColors.primary : AppColors.textSecondary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          optText,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),

          const Spacer(),

          // Navigation Controls
          Row(
            children: [
              if (_currentIndex > 0)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _currentIndex--),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: AppColors.cardBorder),
                    ),
                    child: const Text('Önceki'),
                  ),
                ),
              if (_currentIndex > 0) const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentIndex < questions.length - 1) {
                      setState(() => _currentIndex++);
                    } else {
                      _submitExam();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    _currentIndex < questions.length - 1 ? 'Sonraki' : 'Sınavı Bitir',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateView(bool isPassed) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isPassed
                  ? [AppColors.primary.withValues(alpha: 0.25), AppColors.card]
                  : [AppColors.error.withValues(alpha: 0.25), AppColors.card],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: isPassed ? AppColors.primary : AppColors.error, width: 2),
          ),
          child: Column(
            children: [
              Icon(
                isPassed ? Icons.workspace_premium_rounded : Icons.info_outline_rounded,
                size: 64,
                color: isPassed ? AppColors.primary : AppColors.error,
              ),
              const SizedBox(height: 16),
              Text(
                isPassed ? 'RESMİ BAŞARI SERTİFİKASI' : 'SEVİYE TAMAMLANAMADI',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: isPassed ? AppColors.primary : AppColors.error,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                isPassed ? '${widget.level} Seviyesini Başarıyla Bitirdiniz!' : 'Barajı Geçemediniz',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Sınav Notunuz: %$_score',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              Text(
                'Geçme Notu: %${_exam!.passingScore}',
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              const Divider(color: AppColors.cardBorder),
              const SizedBox(height: 16),
              Text(
                isPassed
                    ? 'Bu sertifika, öğrencinin LinguaLearn platformunda ${widget.level} müfredatını, 14 ünitenin testlerini ve bitirme sınavını başarıyla tamamladığını onaylar.'
                    : 'Konuları ve ünite testlerini tekrar edip sınavı yeniden çözebilirsiniz.',
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: () {
            setState(() {
              _isSubmitted = false;
              _currentIndex = 0;
              _answers.clear();
              _score = 0;
            });
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.card,
            foregroundColor: Colors.white,
            side: const BorderSide(color: AppColors.cardBorder),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: const Text('Sınavı Tekrar Dene', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
