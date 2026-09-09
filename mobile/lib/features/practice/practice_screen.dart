import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/tts_helper.dart';
import '../../data/models/word_model.dart';
import '../../data/repositories/supabase_repository.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({super.key});

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<WordModel> _words = [];
  bool _loading = true;

  // Sentence completion state
  int _sentenceIndex = 0;
  int? _sentenceSelectedOpt;
  bool _sentenceAnswered = false;

  // Translation state
  int _transIndex = 0;
  int? _transSelectedOpt;
  bool _transAnswered = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseRepository().getWords();
      setState(() {
        _words = list.where((w) => w.sentenceEn.isNotEmpty).toList();
        _words.shuffle();
      });
    } catch (_) {}
    setState(() => _loading = false);
  }

  List<String> _generateSentenceOptions(WordModel current) {
    final opts = <String>{current.word};
    final rand = Random();
    while (opts.length < 4 && _words.length >= 4) {
      final pick = _words[rand.nextInt(_words.length)].word;
      opts.add(pick);
    }
    final list = opts.toList();
    list.shuffle(Random(current.id.hashCode));
    return list;
  }

  List<String> _generateTranslationOptions(WordModel current) {
    final opts = <String>{current.meaning};
    final rand = Random();
    while (opts.length < 4 && _words.length >= 4) {
      final pick = _words[rand.nextInt(_words.length)].meaning;
      opts.add(pick);
    }
    final list = opts.toList();
    list.shuffle(Random(current.id.hashCode));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alıştırma & Çeviri', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [
            Tab(text: 'Cümle Tamamlama'),
            Tab(text: 'Çeviri Atölyesi'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _words.length < 4
              ? const Center(child: Text('Yeterli kelime bulunamadı.', style: TextStyle(color: AppColors.textSecondary)))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildSentenceCompletionTab(),
                    _buildTranslationTab(),
                  ],
                ),
    );
  }

  Widget _buildSentenceCompletionTab() {
    final currentWord = _words[_sentenceIndex % _words.length];
    final blankedSentence = currentWord.sentenceEn.replaceAll(RegExp(RegExp.escape(currentWord.word), caseSensitive: false), '______');
    final options = _generateSentenceOptions(currentWord);

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              children: [
                const Text('Boşluğu Doğru Kelimeyle Tamamlayın:', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 16),
                Text(
                  blankedSentence,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  currentWord.sentenceTr,
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          ...options.asMap().entries.map((entry) {
            final idx = entry.key;
            final opt = entry.value;
            final isCorrect = opt.toLowerCase() == currentWord.word.toLowerCase();
            final isSelected = _sentenceSelectedOpt == idx;

            Color borderColor = AppColors.cardBorder;
            Color bgColor = AppColors.card;

            if (_sentenceAnswered) {
              if (isCorrect) {
                borderColor = AppColors.primary;
                bgColor = AppColors.primary.withValues(alpha: 0.15);
              } else if (isSelected) {
                borderColor = AppColors.error;
                bgColor = AppColors.error.withValues(alpha: 0.15);
              }
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: InkWell(
                onTap: _sentenceAnswered
                    ? null
                    : () {
                        setState(() {
                          _sentenceSelectedOpt = idx;
                          _sentenceAnswered = true;
                        });
                        if (isCorrect) {
                          TtsHelper().speak(currentWord.sentenceEn);
                        }
                      },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: borderColor),
                  ),
                  child: Text(
                    opt,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isSelected && !_sentenceAnswered ? AppColors.primary : Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            );
          }),

          const Spacer(),
          if (_sentenceAnswered)
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _sentenceIndex++;
                  _sentenceSelectedOpt = null;
                  _sentenceAnswered = false;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.arrow_forward_rounded),
              label: const Text('Sonraki Cümle', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  Widget _buildTranslationTab() {
    final currentWord = _words[_transIndex % _words.length];
    final options = _generateTranslationOptions(currentWord);

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              children: [
                const Text('Bu Kelimenin Türkçe Karşılığı Nedir?', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      currentWord.word,
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.volume_up_rounded, color: AppColors.primary),
                      onPressed: () => TtsHelper().speak(currentWord.word),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          ...options.asMap().entries.map((entry) {
            final idx = entry.key;
            final opt = entry.value;
            final isCorrect = opt == currentWord.meaning;
            final isSelected = _transSelectedOpt == idx;

            Color borderColor = AppColors.cardBorder;
            Color bgColor = AppColors.card;

            if (_transAnswered) {
              if (isCorrect) {
                borderColor = AppColors.primary;
                bgColor = AppColors.primary.withValues(alpha: 0.15);
              } else if (isSelected) {
                borderColor = AppColors.error;
                bgColor = AppColors.error.withValues(alpha: 0.15);
              }
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: InkWell(
                onTap: _transAnswered
                    ? null
                    : () {
                        setState(() {
                          _transSelectedOpt = idx;
                          _transAnswered = true;
                        });
                      },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: borderColor),
                  ),
                  child: Text(
                    opt,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            );
          }),

          const Spacer(),
          if (_transAnswered)
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _transIndex++;
                  _transSelectedOpt = null;
                  _transAnswered = false;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.arrow_forward_rounded),
              label: const Text('Sonraki Kelime', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }
}
