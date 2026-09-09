import 'package:flutter_test/flutter_test.dart';
import 'package:lingualearn/data/models/word_model.dart';
import 'package:lingualearn/data/models/lesson_model.dart';
import 'package:lingualearn/data/models/scenario_model.dart';
import 'package:lingualearn/data/models/exam_model.dart';

void main() {
  group('Data Models Unit Tests', () {
    test('WordModel serialization and deserialization', () {
      final map = {
        'id': 'word-test-1',
        'word': 'achieve',
        'meaning': 'başarmak',
        'part_of_speech': 'verb',
        'sentence_en': 'She will achieve her goals.',
        'sentence_tr': 'Hedeflerini başaracak.',
        'box': 2,
        'success_count': 3,
        'fail_count': 1,
        'created_at': '2026-09-09T00:00:00.000Z',
      };

      final word = WordModel.fromMap(map);
      expect(word.id, 'word-test-1');
      expect(word.word, 'achieve');
      expect(word.meaning, 'başarmak');
      expect(word.partOfSpeech, 'verb');
      expect(word.box, 2);
      expect(word.successCount, 3);
      expect(word.failCount, 1);

      final toMap = word.toMap();
      expect(toMap['word'], 'achieve');
      expect(toMap['box'], 2);
    });

    test('LessonModel serialization with 100 questions format', () {
      final map = {
        'id': 'a1-1',
        'unit_number': 1,
        'level': 'A1',
        'title': 'To Be (am / is / are)',
        'subtitle': 'Introductory grammar',
        'formula': {'positive': 'S + am/is/are'},
        'common_mistakes': [
          {'wrong': 'I am agree', 'correct': 'I agree', 'explanation': 'Agree is a verb'}
        ],
        'dialogue': [
          {'speaker': 'Alex', 'textEn': 'Hello', 'textTr': 'Merhaba'}
        ],
        'quiz': [
          {'q': 'I ___ a student.', 'options': ['am', 'is', 'are', 'be'], 'a': 0, 'explanation': 'I takes am'}
        ],
        'completed': true,
        'quiz_score': 95,
      };

      final lesson = LessonModel.fromMap(map);
      expect(lesson.id, 'a1-1');
      expect(lesson.unitNumber, 1);
      expect(lesson.level, 'A1');
      expect(lesson.commonMistakes.length, 1);
      expect(lesson.dialogues.length, 1);
      expect(lesson.quiz.length, 1);
      expect(lesson.quiz[0].question, 'I ___ a student.');
      expect(lesson.quiz[0].answerIndex, 0);
      expect(lesson.completed, true);
      expect(lesson.quizScore, 95);
    });

    test('ExamModel serialization and scoring logic', () {
      final map = {
        'level': 'A1',
        'title': 'A1 Seviye Bitirme Sınavı',
        'passing_score': 70,
        'questions': [
          {'q': 'Question 1', 'options': ['A', 'B', 'C', 'D'], 'a': 1, 'explanation': 'Option B is correct'}
        ]
      };

      final exam = ExamModel.fromMap(map);
      expect(exam.level, 'A1');
      expect(exam.passingScore, 70);
      expect(exam.questions.length, 1);
      expect(exam.questions[0].answerIndex, 1);
    });
  });
}
