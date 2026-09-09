import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class MistakeItem {
  final String id;
  final String title;
  final String question;
  final List<String> options;
  final int answerIndex;
  final String explanation;
  final DateTime createdAt;

  MistakeItem({
    required this.id,
    required this.title,
    required this.question,
    required this.options,
    required this.answerIndex,
    required this.explanation,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': title,
        'question': question,
        'options': options,
        'answerIndex': answerIndex,
        'explanation': explanation,
        'createdAt': createdAt.toIso8601String(),
      };

  factory MistakeItem.fromMap(Map<String, dynamic> map) => MistakeItem(
        id: map['id']?.toString() ?? '',
        title: map['title']?.toString() ?? '',
        question: map['question']?.toString() ?? '',
        options: (map['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
        answerIndex: map['answerIndex'] is int ? map['answerIndex'] : 0,
        explanation: map['explanation']?.toString() ?? '',
        createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) : null,
      );
}

class MistakeRepository {
  static const String _storageKey = 'lingualearn_mistakes_v1';

  static Future<List<MistakeItem>> getMistakes() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list.map((e) => MistakeItem.fromMap(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> addMistake(MistakeItem item) async {
    final list = await getMistakes();
    list.removeWhere((m) => m.id == item.id);
    list.insert(0, item);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(list.map((e) => e.toMap()).toList()));
  }

  static Future<void> removeMistake(String id) async {
    final list = await getMistakes();
    list.removeWhere((m) => m.id == id);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(list.map((e) => e.toMap()).toList()));
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
