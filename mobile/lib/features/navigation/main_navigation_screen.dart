import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../academy/academy_screen.dart';
import '../scenarios/scenario_list_screen.dart';
import '../vocabulary/flashcard_screen.dart';
import '../vocabulary/word_management_screen.dart';
import '../practice/practice_screen.dart';
import '../mistakes/mistake_notebook_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    AcademyScreen(),
    ScenarioListScreen(),
    FlashcardScreen(),
    PracticeScreen(),
    WordManagementScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          backgroundColor: AppColors.card,
          indicatorColor: AppColors.primary.withValues(alpha: 0.2),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.school_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.school_rounded, color: AppColors.primary),
              label: 'Akademi',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline_rounded, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.chat_bubble_rounded, color: AppColors.primary),
              label: 'Senaryolar',
            ),
            NavigationDestination(
              icon: Icon(Icons.style_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.style_rounded, color: AppColors.primary),
              label: 'Kelimeler',
            ),
            NavigationDestination(
              icon: Icon(Icons.translate_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.translate_rounded, color: AppColors.primary),
              label: 'Alıştırma',
            ),
            NavigationDestination(
              icon: Icon(Icons.library_books_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.library_books_rounded, color: AppColors.primary),
              label: 'Yönetim',
            ),
          ],
        ),
      ),
      floatingActionButton: _currentIndex == 0 || _currentIndex == 2
          ? FloatingActionButton(
              mini: true,
              backgroundColor: AppColors.cardBorder,
              foregroundColor: AppColors.warning,
              tooltip: 'Hata Defteri',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const MistakeNotebookScreen()),
                );
              },
              child: const Icon(Icons.auto_stories_rounded, size: 20),
            )
          : null,
    );
  }
}
