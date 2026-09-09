class WordModel {
  final String id;
  final String word;
  final String meaning;
  final String partOfSpeech;
  final String sentenceEn;
  final String sentenceTr;
  int box;
  int successCount;
  int failCount;
  DateTime? lastReviewed;
  DateTime? createdAt;

  WordModel({
    required this.id,
    required this.word,
    required this.meaning,
    required this.partOfSpeech,
    required this.sentenceEn,
    required this.sentenceTr,
    this.box = 1,
    this.successCount = 0,
    this.failCount = 0,
    this.lastReviewed,
    this.createdAt,
  });

  factory WordModel.fromMap(Map<String, dynamic> map) {
    return WordModel(
      id: map['id']?.toString() ?? '',
      word: map['word']?.toString() ?? '',
      meaning: map['meaning']?.toString() ?? '',
      partOfSpeech: map['part_of_speech']?.toString() ?? 'verb',
      sentenceEn: map['sentence_en']?.toString() ?? '',
      sentenceTr: map['sentence_tr']?.toString() ?? '',
      box: map['box'] is int ? map['box'] : int.tryParse(map['box']?.toString() ?? '1') ?? 1,
      successCount: map['success_count'] is int ? map['success_count'] : 0,
      failCount: map['fail_count'] is int ? map['fail_count'] : 0,
      lastReviewed: map['last_reviewed'] != null ? DateTime.tryParse(map['last_reviewed'].toString()) : null,
      createdAt: map['created_at'] != null ? DateTime.tryParse(map['created_at'].toString()) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'word': word,
      'meaning': meaning,
      'part_of_speech': partOfSpeech,
      'sentence_en': sentenceEn,
      'sentence_tr': sentenceTr,
      'box': box,
      'success_count': successCount,
      'fail_count': failCount,
      'last_reviewed': lastReviewed?.toIso8601String(),
      'created_at': createdAt?.toIso8601String(),
    };
  }
}
