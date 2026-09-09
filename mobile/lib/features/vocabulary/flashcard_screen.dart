import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/tts_helper.dart';
import '../../data/models/word_model.dart';
import '../../data/repositories/supabase_repository.dart';

class FlashcardScreen extends StatefulWidget {
  const FlashcardScreen({super.key});

  @override
  State<FlashcardScreen> createState() => _FlashcardScreenState();
}

class _FlashcardScreenState extends State<FlashcardScreen> {
  List<WordModel> _words = [];
  int _currentIndex = 0;
  bool _isFlipped = false;
  bool _loading = true;
  int _selectedBox = 0; // 0 = all, 1..5

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  Future<void> _loadWords() async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseRepository().getWords(
        box: _selectedBox > 0 ? _selectedBox : null,
      );
      setState(() {
        _words = list;
        _currentIndex = 0;
        _isFlipped = false;
      });
    } catch (_) {}
    setState(() => _loading = false);
  }

  void _handleReview(bool isCorrect) async {
    if (_words.isEmpty || _currentIndex >= _words.length) return;
    final current = _words[_currentIndex];

    try {
      await SupabaseRepository().reviewWord(current.id, isCorrect);
    } catch (_) {}

    setState(() {
      _isFlipped = false;
      if (_currentIndex < _words.length - 1) {
        _currentIndex++;
      } else {
        _currentIndex = 0;
        _words.shuffle();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasWords = _words.isNotEmpty && _currentIndex < _words.length;
    final currentWord = hasWords ? _words[_currentIndex] : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelime Çalışma (SRS)', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.shuffle_rounded),
            tooltip: 'Kelimeleri Karıştır',
            onPressed: () {
              setState(() {
                _words.shuffle();
                _currentIndex = 0;
                _isFlipped = false;
              });
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : Column(
              children: [
                // Leitner Box Filter Bar
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      _buildBoxChip(0, 'Tümü (${_words.length})'),
                      for (int b = 1; b <= 5; b++) ...[
                        const SizedBox(width: 8),
                        _buildBoxChip(b, 'Kutu $b'),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                // Card Progress
                if (hasWords)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Kelime ${_currentIndex + 1} / ${_words.length}',
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Kutu ${currentWord!.box}',
                            style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),

                // 3D Flip Card Area
                Expanded(
                  child: hasWords
                      ? GestureDetector(
                          onTap: () => setState(() => _isFlipped = !_isFlipped),
                          child: Center(
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 300),
                              transitionBuilder: (child, anim) {
                                return ScaleTransition(scale: anim, child: child);
                              },
                              child: _isFlipped
                                  ? _buildBackCard(currentWord!)
                                  : _buildFrontCard(currentWord!),
                            ),
                          ),
                        )
                      : const Center(
                          child: Text('Bu kutuda henüz kelime bulunmuyor.', style: TextStyle(color: AppColors.textSecondary)),
                        ),
                ),

                // Action Buttons
                if (hasWords)
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _handleReview(false),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.error.withValues(alpha: 0.15),
                              foregroundColor: AppColors.error,
                              side: const BorderSide(color: AppColors.error),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: const Icon(Icons.close_rounded),
                            label: const Text('Hatırlamadım\n(Kutu 1)', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _handleReview(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            icon: const Icon(Icons.check_rounded),
                            label: const Text('Biliyorum\n(Kutu +1)', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }

  Widget _buildFrontCard(WordModel word) {
    return Container(
      key: const ValueKey('front'),
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.cardBorder, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.cardBorder,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              word.partOfSpeech.toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accent),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            word.word,
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          IconButton(
            icon: const Icon(Icons.volume_up_rounded, size: 28, color: AppColors.primary),
            onPressed: () => TtsHelper().speak(word.word),
          ),
          const SizedBox(height: 24),
          const Text(
            'Anlamını görmek için karta dokunun 👆',
            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildBackCard(WordModel word) {
    return Container(
      key: const ValueKey('back'),
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.card, AppColors.cardBorder.withValues(alpha: 0.6)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.5), width: 2),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            word.meaning,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.primary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          const Divider(color: AppColors.cardBorder),
          const SizedBox(height: 16),
          if (word.sentenceEn.isNotEmpty) ...[
            Text(
              word.sentenceEn,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              word.sentenceTr,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontStyle: FontStyle.italic),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            IconButton(
              icon: const Icon(Icons.volume_up_rounded, color: AppColors.accent),
              onPressed: () => TtsHelper().speak(word.sentenceEn),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBoxChip(int boxNum, String label) {
    final isSelected = _selectedBox == boxNum;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedBox = boxNum);
        _loadWords();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
