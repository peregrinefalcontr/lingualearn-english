import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/lesson_model.dart';
import '../../data/repositories/supabase_repository.dart';
import 'lesson_detail_screen.dart';
import '../exams/level_exam_screen.dart';

class AcademyScreen extends StatefulWidget {
  const AcademyScreen({super.key});

  @override
  State<AcademyScreen> createState() => _AcademyScreenState();
}

class _AcademyScreenState extends State<AcademyScreen> {
  String _selectedLevel = 'all'; // 'all', 'A1', 'A2'
  List<LessonModel> _lessons = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadLessons();
  }

  Future<void> _loadLessons() async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseRepository().getLessons();
      setState(() => _lessons = list);
    } catch (_) {}
    setState(() => _loading = false);
  }

  List<LessonModel> get _filteredLessons {
    if (_selectedLevel == 'all') return _lessons;
    return _lessons.where((l) => l.level.toUpperCase() == _selectedLevel.toUpperCase()).toList();
  }

  int get _completedCount => _lessons.where((l) => l.completed).length;
  int get _progressPercent => _lessons.isNotEmpty ? ((_completedCount / _lessons.length) * 100).round() : 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('A1-A2 Akademi', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadLessons,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _loadLessons,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Progress Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.card, AppColors.cardBorder.withValues(alpha: 0.5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 54,
                              height: 54,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.primary, width: 3),
                                color: AppColors.background,
                              ),
                              child: Center(
                                child: Text(
                                  '%$_progressPercent',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Genel Müfredat İlerlemesi', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                  Text(
                                    '$_completedCount / ${_lessons.length} Ünite Tamamlandı',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: _lessons.isNotEmpty ? _completedCount / _lessons.length : 0,
                                      backgroundColor: AppColors.background,
                                      color: AppColors.primary,
                                      minHeight: 6,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Level Exams Quick Cards
                  Row(
                    children: [
                      Expanded(
                        child: _buildExamCard(
                          title: 'A1 Bitirme Sınavı',
                          level: 'A1',
                          color: AppColors.primary,
                          icon: Icons.school_rounded,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildExamCard(
                          title: 'A2 Bitirme Sınavı',
                          level: 'A2',
                          color: AppColors.secondary,
                          icon: Icons.workspace_premium_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Filter Chips
                  Row(
                    children: [
                      _buildFilterChip('all', 'Tüm Üniteler (${_lessons.length})'),
                      const SizedBox(width: 8),
                      _buildFilterChip('A1', 'A1 Başlangıç (7)'),
                      const SizedBox(width: 8),
                      _buildFilterChip('A2', 'A2 Temel (7)'),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Units List
                  ..._filteredLessons.map((lesson) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: lesson.completed ? AppColors.primary.withValues(alpha: 0.5) : AppColors.cardBorder,
                        ),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: lesson.completed
                                ? AppColors.primary.withValues(alpha: 0.15)
                                : AppColors.cardBorder.withValues(alpha: 0.3),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: lesson.completed
                                ? const Icon(Icons.check_rounded, color: AppColors.primary, size: 24)
                                : Text(
                                    '${lesson.unitNumber}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                  ),
                          ),
                        ),
                        title: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: lesson.level == 'A1' ? AppColors.primary.withValues(alpha: 0.2) : AppColors.secondary.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                lesson.level,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: lesson.level == 'A1' ? AppColors.primary : AppColors.secondary,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                lesson.title,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            lesson.subtitle,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LessonDetailScreen(
                                lesson: lesson,
                                onCompleted: _loadLessons,
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }

  Widget _buildFilterChip(String levelKey, String label) {
    final isSelected = _selectedLevel == levelKey;
    return GestureDetector(
      onTap: () => setState(() => _selectedLevel = levelKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.circular(20),
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

  Widget _buildExamCard({
    required String title,
    required String level,
    required Color color,
    required IconData icon,
  }) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => LevelExamScreen(level: level)),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: color)),
                  const Text('20 Soru • Sertifika', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
