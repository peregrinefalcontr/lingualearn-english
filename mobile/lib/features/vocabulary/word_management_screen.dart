import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/tts_helper.dart';
import '../../data/models/word_model.dart';
import '../../data/repositories/supabase_repository.dart';

class WordManagementScreen extends StatefulWidget {
  const WordManagementScreen({super.key});

  @override
  State<WordManagementScreen> createState() => _WordManagementScreenState();
}

class _WordManagementScreenState extends State<WordManagementScreen> {
  List<WordModel> _words = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedPos = 'all';

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  Future<void> _loadWords() async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseRepository().getWords(
        pos: _selectedPos != 'all' ? _selectedPos : null,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );
      setState(() => _words = list);
    } catch (_) {}
    setState(() => _loading = false);
  }

  void _showAddWordModal({WordModel? editWord}) {
    final wordCtrl = TextEditingController(text: editWord?.word ?? '');
    final meaningCtrl = TextEditingController(text: editWord?.meaning ?? '');
    final sentenceEnCtrl = TextEditingController(text: editWord?.sentenceEn ?? '');
    final sentenceTrCtrl = TextEditingController(text: editWord?.sentenceTr ?? '');
    String pos = editWord?.partOfSpeech ?? 'verb';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    editWord != null ? 'Kelimeyi Düzenle' : 'Yeni Kelime Ekle',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: wordCtrl,
                    decoration: const InputDecoration(
                      labelText: 'İngilizce Kelime',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: meaningCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Türkçe Anlamı',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: pos,
                    decoration: const InputDecoration(
                      labelText: 'Kelime Türü',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'verb', child: Text('Fiil (Verb)')),
                      DropdownMenuItem(value: 'noun', child: Text('İsim (Noun)')),
                      DropdownMenuItem(value: 'adjective', child: Text('Sıfat (Adjective)')),
                      DropdownMenuItem(value: 'adverb', child: Text('Zarf (Adverb)')),
                      DropdownMenuItem(value: 'idiom', child: Text('Kalıp / Deyim')),
                    ],
                    onChanged: (val) {
                      if (val != null) setModalState(() => pos = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: sentenceEnCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Örnek Cümle (İngilizce)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: sentenceTrCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Örnek Cümle Çevirisi (Türkçe)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (wordCtrl.text.trim().isEmpty || meaningCtrl.text.trim().isEmpty) return;

                        final newModel = WordModel(
                          id: editWord?.id ?? 'word-${DateTime.now().millisecondsSinceEpoch}',
                          word: wordCtrl.text.trim(),
                          meaning: meaningCtrl.text.trim(),
                          partOfSpeech: pos,
                          sentenceEn: sentenceEnCtrl.text.trim(),
                          sentenceTr: sentenceTrCtrl.text.trim(),
                          box: editWord?.box ?? 1,
                        );

                        if (editWord != null) {
                          await SupabaseRepository().updateWord(newModel);
                        } else {
                          await SupabaseRepository().addWord(newModel);
                        }

                        if (context.mounted) Navigator.pop(context);
                        _loadWords();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text(
                        editWord != null ? 'Güncelle' : 'Kaydet',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelimelerim & Yönetim', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddWordModal(),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Kelime Ekle', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          // Search & Filter Box
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) {
                    _searchQuery = val;
                    _loadWords();
                  },
                  decoration: InputDecoration(
                    hintText: 'Kelime veya anlam ara...',
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary),
                    filled: true,
                    fillColor: AppColors.card,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppColors.cardBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppColors.cardBorder),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildPosChip('all', 'Tümü'),
                      const SizedBox(width: 8),
                      _buildPosChip('verb', 'Fiiller'),
                      const SizedBox(width: 8),
                      _buildPosChip('noun', 'İsimler'),
                      const SizedBox(width: 8),
                      _buildPosChip('adjective', 'Sıfatlar'),
                      const SizedBox(width: 8),
                      _buildPosChip('idiom', 'Kalıplar'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Words List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _words.isEmpty
                    ? const Center(child: Text('Kelime bulunamadı.', style: TextStyle(color: AppColors.textSecondary)))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _words.length,
                        itemBuilder: (context, idx) {
                          final w = _words[idx];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      'K${w.box}',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        w.word,
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                                      ),
                                      Text(
                                        w.meaning,
                                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.volume_up_rounded, color: AppColors.primary, size: 20),
                                  onPressed: () => TtsHelper().speak(w.word),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, color: AppColors.textSecondary, size: 20),
                                  onPressed: () => _showAddWordModal(editWord: w),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                                  onPressed: () async {
                                    await SupabaseRepository().deleteWord(w.id);
                                    _loadWords();
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildPosChip(String posKey, String label) {
    final isSelected = _selectedPos == posKey;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedPos = posKey);
        _loadWords();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.cardBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
