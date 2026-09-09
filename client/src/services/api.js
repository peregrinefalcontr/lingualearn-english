import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_BASE = 'http://localhost:3001/api';

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

// Db to UI mappers
function mapWordFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    partOfSpeech: row.part_of_speech || 'verb',
    sentenceEn: row.sentence_en || '',
    sentenceTr: row.sentence_tr || '',
    box: row.box || 1,
    successCount: row.success_count || 0,
    failCount: row.fail_count || 0,
    lastReviewed: row.last_reviewed,
    createdAt: row.created_at
  };
}

function mapLessonFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    unitNumber: row.unit_number,
    level: row.level,
    title: row.title,
    subtitle: row.subtitle,
    formula: row.formula,
    commonMistakes: row.common_mistakes || [],
    dialogues: row.dialogue || [],
    quiz: row.quiz || [],
    completed: Boolean(row.completed),
    quizScore: row.quiz_score
  };
}

function mapScenarioFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    englishTitle: row.english_title,
    category: row.category,
    icon: row.icon,
    description: row.description,
    keyPhrases: row.key_phrases || [],
    dialogues: row.dialogues || [],
    quiz: row.quiz || []
  };
}

// 1. GET /words
export async function fetchWords(params = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('words').select('*').order('created_at', { ascending: false });

      if (params.partOfSpeech && params.partOfSpeech !== 'all') {
        const normalized = normalizePartOfSpeech(params.partOfSpeech);
        query = query.eq('part_of_speech', normalized);
      }

      if (params.box && params.box !== 'all') {
        query = query.eq('box', parseInt(params.box, 10));
      }

      if (params.search && params.search.trim() !== '') {
        const q = params.search.trim();
        query = query.or(`word.ilike.%${q}%,meaning.ilike.%${q}%,sentence_en.ilike.%${q}%,sentence_tr.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      const mapped = (data || []).map(mapWordFromDb);
      return { success: true, count: mapped.length, data: mapped };
    } catch (err) {
      console.warn('Supabase fetchWords error, falling back to local API:', err);
    }
  }

  const query = new URLSearchParams();
  if (params.partOfSpeech) query.append('partOfSpeech', params.partOfSpeech);
  if (params.box) query.append('box', params.box);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/words?${query.toString()}`);
  if (!res.ok) throw new Error('Kelimeler getirilemedi');
  return res.json();
}

// 2. GET /stats
export async function fetchStats() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('words').select('box, part_of_speech, success_count, fail_count');
      if (error) throw error;

      const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const posCounts = { verb: 0, noun: 0, adjective: 0, adverb: 0, idiom: 0, other: 0 };
      let totalSuccess = 0;
      let totalFail = 0;

      (data || []).forEach(w => {
        const b = w.box && w.box >= 1 && w.box <= 5 ? w.box : 1;
        boxCounts[b] = (boxCounts[b] || 0) + 1;

        const pos = normalizePartOfSpeech(w.part_of_speech);
        posCounts[pos] = (posCounts[pos] || 0) + 1;

        totalSuccess += (w.success_count || 0);
        totalFail += (w.fail_count || 0);
      });

      const totalWords = (data || []).length;
      const masteredWords = boxCounts[5] || 0;
      const learningWords = totalWords - masteredWords;

      return {
        success: true,
        totalWords,
        masteredWords,
        learningWords,
        boxCounts,
        posCounts,
        totalSuccess,
        totalFail,
        accuracy: (totalSuccess + totalFail) > 0 ? Math.round((totalSuccess / (totalSuccess + totalFail)) * 100) : 0
      };
    } catch (err) {
      console.warn('Supabase fetchStats error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('İstatistikler getirilemedi');
  return res.json();
}

// 3. POST /words
export async function addWord(wordData) {
  if (!wordData.word || !wordData.meaning) {
    throw new Error('İngilizce kelime ve Türkçe anlamı zorunludur.');
  }

  if (isSupabaseConfigured) {
    try {
      const normalizedWord = wordData.word.trim();
      const id = 'word-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const row = {
        id,
        word: normalizedWord,
        meaning: wordData.meaning.trim(),
        part_of_speech: normalizePartOfSpeech(wordData.partOfSpeech || 'verb'),
        sentence_en: wordData.sentenceEn ? wordData.sentenceEn.trim() : `I need to remember the word "${normalizedWord}".`,
        sentence_tr: wordData.sentenceTr ? wordData.sentenceTr.trim() : `"${normalizedWord}" kelimesini hatırlamam gerekiyor.`,
        box: 1,
        success_count: 0,
        fail_count: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('words').insert([row]).select().single();
      if (error) throw error;
      return { success: true, data: mapWordFromDb(data), message: 'Kelime başarıyla eklendi.' };
    } catch (err) {
      console.warn('Supabase addWord error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Kelime eklenirken hata oluştu');
  return data;
}

// 4. PUT /words/:id
export async function updateWord(id, wordData) {
  if (isSupabaseConfigured) {
    try {
      const updates = {};
      if (wordData.word) updates.word = wordData.word.trim();
      if (wordData.meaning) updates.meaning = wordData.meaning.trim();
      if (wordData.partOfSpeech) updates.part_of_speech = normalizePartOfSpeech(wordData.partOfSpeech);
      if (wordData.sentenceEn !== undefined) updates.sentence_en = wordData.sentenceEn.trim();
      if (wordData.sentenceTr !== undefined) updates.sentence_tr = wordData.sentenceTr.trim();
      if (wordData.box && wordData.box >= 1 && wordData.box <= 5) updates.box = wordData.box;

      const { data, error } = await supabase.from('words').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data: mapWordFromDb(data), message: 'Kelime güncellendi.' };
    } catch (err) {
      console.warn('Supabase updateWord error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/words/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Kelime güncellenemedi');
  return data;
}

// 5. DELETE /words/:id
export async function deleteWord(id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('words').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Kelime silindi.' };
    } catch (err) {
      console.warn('Supabase deleteWord error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/words/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Kelime silinemedi');
  return data;
}

// 6. POST /words/:id/review
export async function reviewWord(id, isCorrect) {
  if (isSupabaseConfigured) {
    try {
      const { data: currentWord, error: fetchErr } = await supabase.from('words').select('*').eq('id', id).single();
      if (fetchErr) throw fetchErr;

      const currentBox = currentWord.box || 1;
      const newBox = isCorrect ? Math.min(5, currentBox + 1) : 1;
      const successCount = (currentWord.success_count || 0) + (isCorrect ? 1 : 0);
      const failCount = (currentWord.fail_count || 0) + (!isCorrect ? 1 : 0);

      const updates = {
        box: newBox,
        success_count: successCount,
        fail_count: failCount,
        last_reviewed: new Date().toISOString()
      };

      const { data: updated, error: updateErr } = await supabase.from('words').update(updates).eq('id', id).select().single();
      if (updateErr) throw updateErr;

      return {
        success: true,
        data: mapWordFromDb(updated),
        oldBox: currentBox,
        newBox,
        message: isCorrect ? `Tebrikler! Kelime Kutu ${newBox}'e yükseldi.` : 'Kelime tekrar için Kutu 1\'e alındı.'
      };
    } catch (err) {
      console.warn('Supabase reviewWord error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/words/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCorrect })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Tekrar kaydedilemedi');
  return data;
}

// 7. POST /words/batch
export async function batchImportWords(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Geçerli bir kelime listesi gönderilmedi.');
  }

  if (isSupabaseConfigured) {
    try {
      const rows = items
        .filter(item => item.word && item.meaning)
        .map(item => {
          const cleanWord = item.word.trim();
          return {
            id: 'word-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            word: cleanWord,
            meaning: item.meaning.trim(),
            part_of_speech: normalizePartOfSpeech(item.partOfSpeech || 'verb'),
            sentence_en: item.sentenceEn ? item.sentenceEn.trim() : `Example usage of ${cleanWord}.`,
            sentence_tr: item.sentenceTr ? item.sentenceTr.trim() : `${cleanWord} kullanım örneği.`,
            box: item.box || 1,
            success_count: item.successCount || 0,
            fail_count: item.failCount || 0,
            created_at: new Date().toISOString()
          };
        });

      const { data, error } = await supabase.from('words').insert(rows).select();
      if (error) throw error;

      return {
        success: true,
        addedCount: rows.length,
        updatedCount: 0,
        total: rows.length,
        message: `${rows.length} kelime başarıyla eklendi.`
      };
    } catch (err) {
      console.warn('Supabase batchImportWords error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/words/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Toplu kelime yüklenemedi');
  return data;
}

// 8. GET /lessons
export async function fetchLessons(level) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('lessons').select('*').order('unit_number', { ascending: true });
      if (level && (level.toUpperCase() === 'A1' || level.toUpperCase() === 'A2')) {
        query = query.ilike('level', level);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map(mapLessonFromDb);
      const completedCount = mapped.filter(l => l.completed).length;

      return {
        success: true,
        total: mapped.length,
        completedCount,
        progressPercentage: mapped.length > 0 ? Math.round((completedCount / mapped.length) * 100) : 0,
        data: mapped
      };
    } catch (err) {
      console.warn('Supabase fetchLessons error, falling back to local API:', err);
    }
  }

  const query = level ? `?level=${encodeURIComponent(level)}` : '';
  const res = await fetch(`${API_BASE}/lessons${query}`);
  if (!res.ok) throw new Error('Dersler getirilemedi');
  return res.json();
}

// 9. GET /lessons/:id
export async function fetchLessonById(id) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('lessons').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data: mapLessonFromDb(data) };
    } catch (err) {
      console.warn('Supabase fetchLessonById error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/lessons/${id}`);
  if (!res.ok) throw new Error('Ders detayı getirilemedi');
  return res.json();
}

// 10. POST /lessons/:id/complete
export async function completeLesson(id, score) {
  if (isSupabaseConfigured) {
    try {
      const safeScore = typeof score === 'number' ? score : 100;
      const { data, error } = await supabase
        .from('lessons')
        .update({ completed: true, quiz_score: safeScore })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return {
        success: true,
        data: mapLessonFromDb(data),
        message: 'Tebrikler! Ünite başarıyla tamamlandı.'
      };
    } catch (err) {
      console.warn('Supabase completeLesson error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/lessons/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ders tamamlanamadı');
  return data;
}

// 11. GET /exams/:level
export async function fetchExam(level) {
  const levelKey = (level || '').toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('exams').select('*').ilike('level', levelKey).single();
      if (error) throw error;

      const safeQuestions = (data.questions || []).map((q, idx) => ({
        id: idx + 1,
        question: q.q,
        options: q.options
      }));

      return {
        success: true,
        title: data.title,
        description: data.description,
        passingScore: data.passing_score || 70,
        questionCount: safeQuestions.length,
        questions: safeQuestions
      };
    } catch (err) {
      console.warn('Supabase fetchExam error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/exams/${level}`);
  if (!res.ok) throw new Error(`${level} sınavı getirilemedi`);
  return res.json();
}

// 12. POST /exams/:level/submit
export async function submitExam(level, userAnswers) {
  const levelKey = (level || '').toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('exams').select('*').ilike('level', levelKey).single();
      if (error) throw error;

      const questions = data.questions || [];
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
      const passed = score >= (data.passing_score || 70);

      return {
        success: true,
        level: levelKey,
        score,
        correctCount,
        totalQuestions,
        passed,
        message: passed 
          ? `Tebrikler! %${score} başarı puanı ile ${levelKey} Seviye Sınavını geçtiniz!` 
          : `%${score} puan aldınız. Seviyeyi geçmek için en az %${data.passing_score || 70} gereklidir. Konuları tekrar edip yeniden deneyebilirsiniz.`,
        detailedResults
      };
    } catch (err) {
      console.warn('Supabase submitExam error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/exams/${level}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Sınav gönderilemedi');
  return data;
}

// 13. GET /scenarios
export async function fetchScenarios() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('scenarios').select('*');
      if (error) throw error;

      const mapped = (data || []).map(mapScenarioFromDb);
      return { success: true, count: mapped.length, data: mapped };
    } catch (err) {
      console.warn('Supabase fetchScenarios error, falling back to local API:', err);
    }
  }

  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Senaryolar getirilemedi');
  return res.json();
}



