import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/word_model.dart';
import '../models/lesson_model.dart';
import '../models/scenario_model.dart';
import '../models/exam_model.dart';

class SupabaseRepository {
  static final SupabaseRepository _instance = SupabaseRepository._internal();
  factory SupabaseRepository() => _instance;
  SupabaseRepository._internal();

  SupabaseClient get _client => Supabase.instance.client;

  // --- WORDS ---
  Future<List<WordModel>> getWords({String? pos, int? box, String? search}) async {
    var query = _client.from('words').select();

    if (pos != null && pos != 'all' && pos.isNotEmpty) {
      query = query.eq('part_of_speech', pos.toLowerCase());
    }
    if (box != null && box > 0 && box <= 5) {
      query = query.eq('box', box);
    }
    if (search != null && search.trim().isNotEmpty) {
      final q = search.trim();
      query = query.or('word.ilike.%$q%,meaning.ilike.%$q%,sentence_en.ilike.%$q%,sentence_tr.ilike.%$q%');
    }

    final data = await query.order('created_at', ascending: false);
    return (data as List).map((e) => WordModel.fromMap(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> getWordStats() async {
    final data = await _client.from('words').select('box, part_of_speech, success_count, fail_count');
    final list = data as List;

    final boxCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    final posCounts = {'verb': 0, 'noun': 0, 'adjective': 0, 'adverb': 0, 'idiom': 0, 'other': 0};
    int totalSuccess = 0;
    int totalFail = 0;

    for (final item in list) {
      final b = item['box'] is int && item['box'] >= 1 && item['box'] <= 5 ? item['box'] as int : 1;
      boxCounts[b] = (boxCounts[b] ?? 0) + 1;

      final pos = (item['part_of_speech'] ?? 'other').toString().toLowerCase();
      posCounts[pos] = (posCounts[pos] ?? 0) + 1;

      totalSuccess += (item['success_count'] as int? ?? 0);
      totalFail += (item['fail_count'] as int? ?? 0);
    }

    final totalWords = list.length;
    final masteredWords = boxCounts[5] ?? 0;
    final learningWords = totalWords - masteredWords;

    return {
      'totalWords': totalWords,
      'masteredWords': masteredWords,
      'learningWords': learningWords,
      'boxCounts': boxCounts,
      'posCounts': posCounts,
      'totalSuccess': totalSuccess,
      'totalFail': totalFail,
      'accuracy': (totalSuccess + totalFail) > 0 ? ((totalSuccess / (totalSuccess + totalFail)) * 100).round() : 0,
    };
  }

  Future<WordModel> addWord(WordModel word) async {
    final row = word.toMap();
    final res = await _client.from('words').insert(row).select().single();
    return WordModel.fromMap(res);
  }

  Future<WordModel> updateWord(WordModel word) async {
    final row = word.toMap();
    final res = await _client.from('words').update(row).eq('id', word.id).select().single();
    return WordModel.fromMap(res);
  }

  Future<void> deleteWord(String id) async {
    await _client.from('words').delete().eq('id', id);
  }

  Future<WordModel> reviewWord(String id, bool isCorrect) async {
    final current = await _client.from('words').select().eq('id', id).single();
    final currentWord = WordModel.fromMap(current);

    final currentBox = currentWord.box;
    final newBox = isCorrect ? (currentBox < 5 ? currentBox + 1 : 5) : 1;
    final newSuccess = currentWord.successCount + (isCorrect ? 1 : 0);
    final newFail = currentWord.failCount + (!isCorrect ? 1 : 0);

    final updates = {
      'box': newBox,
      'success_count': newSuccess,
      'fail_count': newFail,
      'last_reviewed': DateTime.now().toUtc().toIso8601String(),
    };

    final res = await _client.from('words').update(updates).eq('id', id).select().single();
    return WordModel.fromMap(res);
  }

  // --- ACADEMY LESSONS ---
  Future<List<LessonModel>> getLessons({String? level}) async {
    var query = _client.from('lessons').select();
    if (level != null && (level.toUpperCase() == 'A1' || level.toUpperCase() == 'A2')) {
      query = query.ilike('level', level);
    }
    final data = await query.order('unit_number', ascending: true);
    return (data as List).map((e) => LessonModel.fromMap(e as Map<String, dynamic>)).toList();
  }

  Future<void> completeLesson(String id, int score) async {
    await _client.from('lessons').update({
      'completed': true,
      'quiz_score': score,
    }).eq('id', id);
  }

  // --- SCENARIOS ---
  Future<List<ScenarioModel>> getScenarios() async {
    final data = await _client.from('scenarios').select();
    return (data as List).map((e) => ScenarioModel.fromMap(e as Map<String, dynamic>)).toList();
  }

  // --- EXAMS ---
  Future<ExamModel> getExam(String level) async {
    final data = await _client.from('exams').select().ilike('level', level.toUpperCase()).single();
    return ExamModel.fromMap(data);
  }
}
