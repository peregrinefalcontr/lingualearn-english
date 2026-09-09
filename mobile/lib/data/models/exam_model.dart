import 'lesson_model.dart';

class ExamModel {
  final String level;
  final String title;
  final int passingScore;
  final List<QuizQuestion> questions;

  ExamModel({
    required this.level,
    required this.title,
    required this.passingScore,
    required this.questions,
  });

  factory ExamModel.fromMap(Map<String, dynamic> map) {
    final rawQuestions = map['questions'] as List<dynamic>? ?? [];
    return ExamModel(
      level: map['level']?.toString() ?? 'A1',
      title: map['title']?.toString() ?? '',
      passingScore: map['passing_score'] is int ? map['passing_score'] : 70,
      questions: rawQuestions.map((e) => QuizQuestion.fromMap(e as Map<String, dynamic>)).toList(),
    );
  }
}
