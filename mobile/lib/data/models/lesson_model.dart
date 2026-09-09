class QuizQuestion {
  final String question;
  final List<String> options;
  final int answerIndex;
  final String explanation;

  QuizQuestion({
    required this.question,
    required this.options,
    required this.answerIndex,
    required this.explanation,
  });

  factory QuizQuestion.fromMap(Map<String, dynamic> map) {
    return QuizQuestion(
      question: map['q']?.toString() ?? map['question']?.toString() ?? '',
      options: (map['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      answerIndex: map['a'] is int ? map['a'] : (map['answerIndex'] is int ? map['answerIndex'] : 0),
      explanation: map['explanation']?.toString() ?? '',
    );
  }
}

class LessonDialogue {
  final String speaker;
  final String textEn;
  final String textTr;

  LessonDialogue({
    required this.speaker,
    required this.textEn,
    required this.textTr,
  });

  factory LessonDialogue.fromMap(Map<String, dynamic> map) {
    return LessonDialogue(
      speaker: map['speaker']?.toString() ?? 'Speaker',
      textEn: map['textEn']?.toString() ?? '',
      textTr: map['textTr']?.toString() ?? '',
    );
  }
}

class CommonMistake {
  final String wrong;
  final String correct;
  final String explanation;

  CommonMistake({
    required this.wrong,
    required this.correct,
    required this.explanation,
  });

  factory CommonMistake.fromMap(Map<String, dynamic> map) {
    return CommonMistake(
      wrong: map['wrong']?.toString() ?? '',
      correct: map['correct']?.toString() ?? '',
      explanation: map['explanation']?.toString() ?? '',
    );
  }
}

class LessonModel {
  final String id;
  final int unitNumber;
  final String level;
  final String title;
  final String subtitle;
  final Map<String, dynamic> formula;
  final List<CommonMistake> commonMistakes;
  final List<LessonDialogue> dialogues;
  final List<QuizQuestion> quiz;
  bool completed;
  int? quizScore;

  LessonModel({
    required this.id,
    required this.unitNumber,
    required this.level,
    required this.title,
    required this.subtitle,
    required this.formula,
    required this.commonMistakes,
    required this.dialogues,
    required this.quiz,
    this.completed = false,
    this.quizScore,
  });

  factory LessonModel.fromMap(Map<String, dynamic> map) {
    final rawMistakes = map['common_mistakes'] as List<dynamic>? ?? [];
    final rawDialogues = (map['dialogue'] ?? map['dialogues']) as List<dynamic>? ?? [];
    final rawQuiz = map['quiz'] as List<dynamic>? ?? [];

    return LessonModel(
      id: map['id']?.toString() ?? '',
      unitNumber: map['unit_number'] is int ? map['unit_number'] : 1,
      level: map['level']?.toString() ?? 'A1',
      title: map['title']?.toString() ?? '',
      subtitle: map['subtitle']?.toString() ?? '',
      formula: (map['formula'] is Map) ? Map<String, dynamic>.from(map['formula']) : {},
      commonMistakes: rawMistakes.map((e) => CommonMistake.fromMap(e as Map<String, dynamic>)).toList(),
      dialogues: rawDialogues.map((e) => LessonDialogue.fromMap(e as Map<String, dynamic>)).toList(),
      quiz: rawQuiz.map((e) => QuizQuestion.fromMap(e as Map<String, dynamic>)).toList(),
      completed: map['completed'] == true,
      quizScore: map['quiz_score'] as int?,
    );
  }
}
