import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/scenario_model.dart';
import '../../data/repositories/supabase_repository.dart';
import 'scenario_detail_screen.dart';

class ScenarioListScreen extends StatefulWidget {
  const ScenarioListScreen({super.key});

  @override
  State<ScenarioListScreen> createState() => _ScenarioListScreenState();
}

class _ScenarioListScreenState extends State<ScenarioListScreen> {
  List<ScenarioModel> _scenarios = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadScenarios();
  }

  Future<void> _loadScenarios() async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseRepository().getScenarios();
      setState(() => _scenarios = list);
    } catch (_) {}
    setState(() => _loading = false);
  }

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'Plane':
        return Icons.flight_takeoff_rounded;
      case 'Coffee':
        return Icons.local_cafe_rounded;
      case 'Building':
        return Icons.hotel_rounded;
      case 'ShoppingBag':
        return Icons.shopping_bag_rounded;
      case 'HeartPulse':
        return Icons.medical_services_rounded;
      default:
        return Icons.chat_bubble_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Günlük Senaryolar', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _scenarios.length,
              itemBuilder: (context, idx) {
                final s = _scenarios[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(_getIcon(s.icon), color: AppColors.primary, size: 24),
                    ),
                    title: Text(
                      s.title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 2),
                        Text(
                          s.englishTitle,
                          style: const TextStyle(fontSize: 12, color: AppColors.accent, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.cardBorder,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                s.category,
                                style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${s.keyPhrases.length} Kilit Cümle • ${s.dialogues.length} Diyalog',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textSecondary, size: 16),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => ScenarioDetailScreen(scenario: s)),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}
