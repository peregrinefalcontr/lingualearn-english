import 'lesson_model.dart';

class ScenarioKeyPhrase {
  final String phrase;
  final String meaning;
  final String situation;

  ScenarioKeyPhrase({
    required this.phrase,
    required this.meaning,
    required this.situation,
  });

  factory ScenarioKeyPhrase.fromMap(Map<String, dynamic> map) {
    return ScenarioKeyPhrase(
      phrase: map['phrase']?.toString() ?? '',
      meaning: map['meaning']?.toString() ?? '',
      situation: map['situation']?.toString() ?? '',
    );
  }
}

class ScenarioModel {
  final String id;
  final String title;
  final String englishTitle;
  final String category;
  final String icon;
  final String description;
  final List<ScenarioKeyPhrase> keyPhrases;
  final List<LessonDialogue> dialogues;
  final List<QuizQuestion> quiz;

  ScenarioModel({
    required this.id,
    required this.title,
    required this.englishTitle,
    required this.category,
    required this.icon,
    required this.description,
    required this.keyPhrases,
    required this.dialogues,
    required this.quiz,
  });

  factory ScenarioModel.fromMap(Map<String, dynamic> map) {
    final rawPhrases = map['key_phrases'] as List<dynamic>? ?? [];
    final rawDialogues = map['dialogues'] as List<dynamic>? ?? [];
    final rawQuiz = map['quiz'] as List<dynamic>? ?? [];

    return ScenarioModel(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      englishTitle: map['english_title']?.toString() ?? '',
      category: map['category']?.toString() ?? 'Genel',
      icon: map['icon']?.toString() ?? 'Sparkles',
      description: map['description']?.toString() ?? '',
      keyPhrases: rawPhrases.map((e) => ScenarioKeyPhrase.fromMap(e as Map<String, dynamic>)).toList(),
      dialogues: rawDialogues.map((e) => LessonDialogue.fromMap(e as Map<String, dynamic>)).toList(),
      quiz: rawQuiz.map((e) => QuizQuestion.fromMap(e as Map<String, dynamic>)).toList(),
    );
  }
}
