const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'words.json');

app.use(cors());
app.use(express.json());

// Helper function to read words
function readWords() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading words.json:', error);
    return [];
  }
}

// Helper function to write words
function writeWords(words) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(words, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing words.json:', error);
    return false;
  }
}

// Normalize part of speech
function normalizePartOfSpeech(pos) {
  if (!pos) return 'other';
  const clean = pos.toString().trim().toLowerCase();
  if (clean.includes('fiil') || clean === 'verb' || clean === 'v') return 'verb';
  if (clean.includes('isim') || clean === 'noun' || clean === 'n') return 'noun';
  if (clean.includes('sıfat') || clean.includes('sifat') || clean === 'adjective' || clean === 'adj') return 'adjective';
  if (clean.includes('zarf') || clean === 'adverb' || clean === 'adv') return 'adverb';
  if (clean.includes('deyim') || clean.includes('kalıp') || clean === 'idiom' || clean === 'phrase') return 'idiom';
  return clean;
}

// 1. GET /api/words - List with optional filters
app.get('/api/words', (req, res) => {
  let words = readWords();
  const { partOfSpeech, box, search } = req.query;

  if (partOfSpeech && partOfSpeech !== 'all') {
    const normalized = normalizePartOfSpeech(partOfSpeech);
    words = words.filter(w => normalizePartOfSpeech(w.partOfSpeech) === normalized);
  }

  if (box && box !== 'all') {
    const boxNum = parseInt(box, 10);
    words = words.filter(w => (w.box || 1) === boxNum);
  }

  if (search && search.trim() !== '') {
    const query = search.trim().toLowerCase();
    words = words.filter(w => 
      (w.word && w.word.toLowerCase().includes(query)) ||
      (w.meaning && w.meaning.toLowerCase().includes(query)) ||
      (w.sentenceEn && w.sentenceEn.toLowerCase().includes(query)) ||
      (w.sentenceTr && w.sentenceTr.toLowerCase().includes(query))
    );
  }

  res.json({ success: true, count: words.length, data: words });
});

// 2. GET /api/stats - Leitner boxes & categories summary
app.get('/api/stats', (req, res) => {
  const words = readWords();
  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const posCounts = { verb: 0, noun: 0, adjective: 0, adverb: 0, idiom: 0, other: 0 };
  let totalSuccess = 0;
  let totalFail = 0;

  words.forEach(w => {
    const b = w.box && w.box >= 1 && w.box <= 5 ? w.box : 1;
    boxCounts[b] = (boxCounts[b] || 0) + 1;

    const pos = normalizePartOfSpeech(w.partOfSpeech);
    posCounts[pos] = (posCounts[pos] || 0) + 1;

    totalSuccess += (w.successCount || 0);
    totalFail += (w.failCount || 0);
  });

  const totalWords = words.length;
  const masteredWords = boxCounts[5] || 0;
  const learningWords = totalWords - masteredWords;

  res.json({
    success: true,
    totalWords,
    masteredWords,
    learningWords,
    boxCounts,
    posCounts,
    totalSuccess,
    totalFail,
    accuracy: (totalSuccess + totalFail) > 0 ? Math.round((totalSuccess / (totalSuccess + totalFail)) * 100) : 0
  });
});

// 3. POST /api/words - Add a single word
app.post('/api/words', (req, res) => {
  const { word, meaning, partOfSpeech, sentenceEn, sentenceTr } = req.body;

  if (!word || !meaning) {
    return res.status(400).json({ success: false, message: 'İngilizce kelime ve Türkçe anlamı zorunludur.' });
  }

  const words = readWords();
  const normalizedWord = word.trim();
  
  // Check for duplicate
  const existingIndex = words.findIndex(w => w.word.toLowerCase() === normalizedWord.toLowerCase());
  if (existingIndex !== -1) {
    return res.status(409).json({ success: false, message: `"${normalizedWord}" kelimesi zaten listenizde mevcut.` });
  }

  const newWord = {
    id: 'word-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    word: normalizedWord,
    meaning: meaning.trim(),
    partOfSpeech: normalizePartOfSpeech(partOfSpeech || 'verb'),
    sentenceEn: sentenceEn ? sentenceEn.trim() : `I need to remember the word "${normalizedWord}".`,
    sentenceTr: sentenceTr ? sentenceTr.trim() : `"${normalizedWord}" kelimesini hatırlamam gerekiyor.`,
    box: 1,
    lastReviewed: null,
    successCount: 0,
    failCount: 0,
    createdAt: new Date().toISOString()
  };

  words.push(newWord);
  writeWords(words);

  res.status(201).json({ success: true, data: newWord, message: 'Kelime başarıyla eklendi.' });
});

// 4. POST /api/words/batch - Batch import
app.post('/api/words/batch', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Geçerli bir kelime listesi gönderilmedi.' });
  }

  const words = readWords();
  let addedCount = 0;
  let updatedCount = 0;

  items.forEach(item => {
    if (!item.word || !item.meaning) return;
    const cleanWord = item.word.trim();
    const existingIndex = words.findIndex(w => w.word.toLowerCase() === cleanWord.toLowerCase());

    if (existingIndex !== -1) {
      words[existingIndex].meaning = item.meaning.trim();
      if (item.partOfSpeech) words[existingIndex].partOfSpeech = normalizePartOfSpeech(item.partOfSpeech);
      if (item.sentenceEn) words[existingIndex].sentenceEn = item.sentenceEn.trim();
      if (item.sentenceTr) words[existingIndex].sentenceTr = item.sentenceTr.trim();
      updatedCount++;
    } else {
      words.push({
        id: 'word-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        word: cleanWord,
        meaning: item.meaning.trim(),
        partOfSpeech: normalizePartOfSpeech(item.partOfSpeech || 'verb'),
        sentenceEn: item.sentenceEn ? item.sentenceEn.trim() : `Example usage of ${cleanWord}.`,
        sentenceTr: item.sentenceTr ? item.sentenceTr.trim() : `${cleanWord} kullanım örneği.`,
        box: item.box || 1,
        lastReviewed: item.lastReviewed || null,
        successCount: item.successCount || 0,
        failCount: item.failCount || 0,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  writeWords(words);
  res.json({
    success: true,
    addedCount,
    updatedCount,
    total: words.length,
    message: `${addedCount} kelime eklendi, ${updatedCount} kelime güncellendi.`
  });
});

// 5. POST /api/words/:id/review - Leitner 5-Box SRS progression
app.post('/api/words/:id/review', (req, res) => {
  const { id } = req.params;
  const { isCorrect } = req.body;

  const words = readWords();
  const index = words.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Kelime bulunamadı.' });
  }

  const word = words[index];
  const currentBox = word.box || 1;

  if (isCorrect) {
    word.box = Math.min(5, currentBox + 1);
    word.successCount = (word.successCount || 0) + 1;
  } else {
    word.box = 1; // Incorrect goes back to Box 1 for spaced repetition
    word.failCount = (word.failCount || 0) + 1;
  }

  word.lastReviewed = new Date().toISOString();
  writeWords(words);

  res.json({
    success: true,
    data: word,
    oldBox: currentBox,
    newBox: word.box,
    message: isCorrect ? `Tebrikler! Kelime Kutu ${word.box}'e yükseldi.` : 'Kelime tekrar için Kutu 1\'e alındı.'
  });
});

// 6. PUT /api/words/:id - Update word
app.put('/api/words/:id', (req, res) => {
  const { id } = req.params;
  const { word, meaning, partOfSpeech, sentenceEn, sentenceTr, box } = req.body;

  const words = readWords();
  const index = words.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Kelime bulunamadı.' });
  }

  if (word) words[index].word = word.trim();
  if (meaning) words[index].meaning = meaning.trim();
  if (partOfSpeech) words[index].partOfSpeech = normalizePartOfSpeech(partOfSpeech);
  if (sentenceEn !== undefined) words[index].sentenceEn = sentenceEn.trim();
  if (sentenceTr !== undefined) words[index].sentenceTr = sentenceTr.trim();
  if (box && box >= 1 && box <= 5) words[index].box = box;

  writeWords(words);
  res.json({ success: true, data: words[index], message: 'Kelime güncellendi.' });
});

// 7. DELETE /api/words/:id - Delete word
app.delete('/api/words/:id', (req, res) => {
  const { id } = req.params;
  const words = readWords();
  const filtered = words.filter(w => w.id !== id);

  if (filtered.length === words.length) {
    return res.status(404).json({ success: false, message: 'Kelime bulunamadı.' });
  }

  writeWords(filtered);
  res.json({ success: true, message: 'Kelime silindi.' });
});

// --- A1 & A2 ACADEMY LESSONS & EXAMS ---
const LESSONS_FILE = path.join(__dirname, 'data', 'lessons.json');

function readLessonsData() {
  try {
    if (!fs.existsSync(LESSONS_FILE)) return { lessons: [], exams: {} };
    const data = fs.readFileSync(LESSONS_FILE, 'utf8');
    return JSON.parse(data || '{"lessons":[],"exams":{}}');
  } catch (error) {
    console.error('Error reading lessons.json:', error);
    return { lessons: [], exams: {} };
  }
}

function writeLessonsData(data) {
  try {
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing lessons.json:', error);
    return false;
  }
}

// 8. GET /api/lessons - List lessons with optional level filter
app.get('/api/lessons', (req, res) => {
  const data = readLessonsData();
  let list = data.lessons || [];
  const { level } = req.query;

  if (level && (level.toUpperCase() === 'A1' || level.toUpperCase() === 'A2')) {
    list = list.filter(l => l.level.toUpperCase() === level.toUpperCase());
  }

  const completedCount = list.filter(l => l.completed).length;
  res.json({
    success: true,
    total: list.length,
    completedCount,
    progressPercentage: list.length > 0 ? Math.round((completedCount / list.length) * 100) : 0,
    data: list
  });
});

// 9. GET /api/lessons/:id - Get single lesson
app.get('/api/lessons/:id', (req, res) => {
  const data = readLessonsData();
  const lesson = (data.lessons || []).find(l => l.id === req.params.id);

  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Ders bulunamadı.' });
  }

  res.json({ success: true, data: lesson });
});

// 10. POST /api/lessons/:id/complete - Mark lesson completed with quiz score
app.post('/api/lessons/:id/complete', (req, res) => {
  const { score } = req.body;
  const data = readLessonsData();
  const index = (data.lessons || []).findIndex(l => l.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Ders bulunamadı.' });
  }

  data.lessons[index].completed = true;
  data.lessons[index].quizScore = typeof score === 'number' ? score : 100;
  data.lessons[index].completedAt = new Date().toISOString();

  writeLessonsData(data);

  res.json({
    success: true,
    data: data.lessons[index],
    message: 'Tebrikler! Ünite başarıyla tamamlandı.'
  });
});

// 11. GET /api/exams/:level - Get exam questions (answers omitted for honest testing)
app.get('/api/exams/:level', (req, res) => {
  const levelKey = (req.params.level || '').toUpperCase();
  const data = readLessonsData();
  const exam = (data.exams || {})[levelKey];

  if (!exam) {
    return res.status(404).json({ success: false, message: `${levelKey} seviye sınavı bulunamadı.` });
  }

  // Return questions with options but hide answers
  const safeQuestions = (exam.questions || []).map((q, idx) => ({
    id: idx + 1,
    question: q.q,
    options: q.options
  }));

  res.json({
    success: true,
    title: exam.title,
    description: exam.description,
    passingScore: exam.passingScore || 70,
    questionCount: safeQuestions.length,
    questions: safeQuestions
  });
});

// 12. POST /api/exams/:level/submit - Grade exam and return certificate/score
app.post('/api/exams/:level/submit', (req, res) => {
  const levelKey = (req.params.level || '').toUpperCase();
  const { userAnswers } = req.body; // array of selected indices or { questionId: selectedIndex }
  const data = readLessonsData();
  const exam = (data.exams || {})[levelKey];

  if (!exam) {
    return res.status(404).json({ success: false, message: `${levelKey} seviye sınavı bulunamadı.` });
  }

  const questions = exam.questions || [];
  let correctCount = 0;
  const detailedResults = [];

  questions.forEach((q, idx) => {
    const userAnswer = userAnswers && userAnswers[idx] !== undefined ? userAnswers[idx] : -1;
    const isCorrect = userAnswer === q.a;
    if (isCorrect) correctCount++;

    detailedResults.push({
      questionNumber: idx + 1,
      question: q.q,
      userAnswer,
      correctAnswer: q.a,
      isCorrect
    });
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= (exam.passingScore || 70);

  res.json({
    success: true,
    level: levelKey,
    score,
    correctCount,
    totalQuestions,
    passed,
    message: passed 
      ? `Tebrikler! %${score} başarı puanı ile ${levelKey} Seviye Sınavını geçtiniz!` 
      : `%${score} puan aldınız. Seviyeyi geçmek için en az %${exam.passingScore || 70} gereklidir. Konuları tekrar edip yeniden deneyebilirsiniz.`,
    detailedResults
  });
});

// --- REAL-LIFE CONVERSATION SCENARIOS ---
const SCENARIOS_FILE = path.join(__dirname, 'data', 'scenarios.json');

function readScenarios() {
  try {
    if (!fs.existsSync(SCENARIOS_FILE)) return [];
    const data = fs.readFileSync(SCENARIOS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading scenarios.json:', error);
    return [];
  }
}

app.get('/api/scenarios', (req, res) => {
  const list = readScenarios();
  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/scenarios/:id', (req, res) => {
  const list = readScenarios();
  const item = list.find(s => s.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Senaryo bulunamadı.' });
  res.json({ success: true, data: item });
});

app.listen(PORT, () => {
  console.log(`English Learning Server is running on http://localhost:${PORT}`);
});
