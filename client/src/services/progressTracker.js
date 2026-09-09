// Progress tracker: Daily Streaks, Daily Goals & Mistake Notebook

const STREAK_KEY = 'lingua_daily_streak';
const MISTAKES_KEY = 'lingua_mistake_notebook';
const DAILY_GOAL = 20;

export function getDailyProgress() {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const data = raw ? JSON.parse(raw) : null;

    if (!data) {
      const initial = {
        lastDate: todayStr,
        streak: 1,
        todayCount: 0,
        goal: DAILY_GOAL
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
      return initial;
    }

    // Check date difference
    const lastDate = new Date(data.lastDate);
    const today = new Date(todayStr);
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { ...data, goal: DAILY_GOAL };
    } else if (diffDays === 1) {
      // Continuous streak!
      data.lastDate = todayStr;
      data.todayCount = 0;
      data.streak = (data.streak || 0) + 1;
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return { ...data, goal: DAILY_GOAL };
    } else {
      // Streak broken, reset to 1
      data.lastDate = todayStr;
      data.todayCount = 0;
      data.streak = 1;
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return { ...data, goal: DAILY_GOAL };
    }
  } catch (e) {
    return { lastDate: todayStr, streak: 1, todayCount: 0, goal: DAILY_GOAL };
  }
}

export function incrementTodayActivity(count = 1) {
  const progress = getDailyProgress();
  progress.todayCount = (progress.todayCount || 0) + count;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(progress));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lingua_progress_updated'));
    }
  } catch (e) {}
  return progress;
}

// --- MISTAKE NOTEBOOK (Hata Defteri) ---
export function getMistakes() {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addMistake(mistakeObj) {
  try {
    const list = getMistakes();
    // Avoid duplicates by question or word
    const exists = list.some(m => m.id === mistakeObj.id || (m.question && m.question === mistakeObj.question));
    if (!exists) {
      list.unshift({
        id: mistakeObj.id || 'mistake-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        title: mistakeObj.title || 'Alıştırma Sorusu',
        question: mistakeObj.question || mistakeObj.word,
        options: mistakeObj.options || [],
        answerIndex: mistakeObj.answerIndex !== undefined ? mistakeObj.answerIndex : -1,
        explanation: mistakeObj.explanation || '',
        meaning: mistakeObj.meaning || '',
        type: mistakeObj.type || 'quiz',
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lingua_progress_updated'));
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function removeMistake(id) {
  try {
    const list = getMistakes().filter(m => m.id !== id);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lingua_progress_updated'));
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function clearMistakes() {
  try {
    localStorage.removeItem(MISTAKES_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lingua_progress_updated'));
    }
  } catch (e) {}
}

