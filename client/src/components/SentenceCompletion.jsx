import React, { useState, useEffect } from 'react';
import { Volume2, HelpCircle, Check, X, ArrowRight, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '../services/speech';
import { addMistake, incrementTodayActivity } from '../services/progressTracker';

export default function SentenceCompletion({ words, onReview, onRefresh }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState('type'); // 'type' or 'choice'
  const [revealedHintLength, setRevealedHintLength] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState([]);
  const [completed, setCompleted] = useState(false);

  // Filter only words that have sentences
  const sentenceWords = words.filter(w => w.sentenceEn && w.sentenceEn.length > 5);
  const currentWord = sentenceWords[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    resetQuestion();
    setCompleted(false);
  }, [words]);

  useEffect(() => {
    resetQuestion();
  }, [currentIndex, currentWord]);

  const resetQuestion = () => {
    setUserInput('');
    setRevealedHintLength(0);
    setIsAnswered(false);
    setIsCorrect(false);

    if (currentWord && sentenceWords.length > 0) {
      const correctWord = currentWord.word;
      const otherWords = sentenceWords
        .filter(w => w.id !== currentWord.id)
        .map(w => w.word);
      const shuffled = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);
      setChoiceOptions([correctWord, ...shuffled].sort(() => 0.5 - Math.random()));
    }
  };

  if (!sentenceWords || sentenceWords.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
        <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Cümle Alıştırması Bulunamadı</h3>
        <p className="text-sm text-slate-400">
          Bu grupta örnek cümlesi olan kelime bulunmuyor. Kelimelerim sekmesinden kelimelere örnek cümle ekleyebilirsiniz.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-2xl backdrop-blur-md">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Mükemmel! Cümleler Tamamlandı!</h2>
        <p className="text-slate-300 text-sm mb-6">
          Seçili gruptaki <span className="font-bold text-emerald-400">{sentenceWords.length}</span> cümlenin tamamını başarıyla uyguladınız.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setCompleted(false);
            onRefresh && onRefresh();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
        >
          <RefreshCw className="w-5 h-5" />
          Yeniden Başla
        </button>
      </div>
    );
  }

  // Escape special regex characters
  const escapeRegExp = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetWordPart = (currentWord?.word || '').split('(')[0].trim();
  const escapedTarget = escapeRegExp(targetWordPart || (currentWord?.word || ''));
  const targetRegex = new RegExp(`\\b${escapedTarget}\\b`, 'gi');
  const maskedSentence = (currentWord?.sentenceEn || '').replace(targetRegex, '_______');

  const checkAnswer = async (answer) => {
    if (isAnswered) return;
    const cleanAnswer = (answer || '').trim().toLowerCase();
    const cleanTarget = currentWord.word.trim().toLowerCase();
    const cleanPart = targetWordPart.toLowerCase();

    const correct = cleanAnswer === cleanTarget || cleanAnswer === cleanPart;
    setIsCorrect(correct);
    setIsAnswered(true);

    incrementTodayActivity(1);

    if (correct) {
      speak(currentWord.sentenceEn);
    } else {
      addMistake({
        id: `sentence-${currentWord.id}`,
        title: `Cümle Tamamlama: ${currentWord.word}`,
        question: maskedSentence,
        meaning: currentWord.meaning,
        explanation: `Doğru kelime: "${currentWord.word}" (${currentWord.meaning}) - ${currentWord.sentenceTr}`,
        type: 'sentence'
      });
    }

    await onReview(currentWord.id, correct);
  };

  const handleNext = () => {
    if (currentIndex + 1 < sentenceWords.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleGiveHint = () => {
    if (revealedHintLength < currentWord.word.length) {
      setRevealedHintLength(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setInputMode('type')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputMode === 'type'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yazarak Doldur
          </button>
          <button
            onClick={() => setInputMode('choice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputMode === 'choice'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Seçenekli Test
          </button>
        </div>

        <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          {currentIndex + 1} / {sentenceWords.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sentenceWords.length) * 100}%` }}
        />
      </div>

      {/* Exercise Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
            Boşluğu Doğru Kelimeyle Tamamlayın
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Hedef Anlam: <b className="text-slate-200">{currentWord.meaning}</b>
          </span>
        </div>

        {/* English Sentence with Blank */}
        <div className="my-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {isAnswered ? (
              <span>
                {currentWord.sentenceEn.split(new RegExp(`(${escapedTarget})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === escapedTarget.toLowerCase() ? (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-lg ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 underline underline-offset-4 decoration-emerald-400'
                          : 'bg-rose-500/20 text-rose-300 line-through'
                      }`}
                    >
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </span>
            ) : (
              maskedSentence
            )}
          </p>

          {/* Turkish translation hint */}
          {currentWord.sentenceTr && (
            <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <p className="text-sm text-slate-300 italic">
                "{currentWord.sentenceTr}"
              </p>
              {isAnswered && (
                <button
                  onClick={() => speak(currentWord.sentenceEn)}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 transition"
                  title="Cümlenin Tamamını Dinle"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Interaction: Typing Mode */}
        {inputMode === 'type' ? (
          <div>
            {!isAnswered ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  checkAnswer(userInput);
                }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Eksik kelimeyi yazın..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
                  >
                    Kontrol Et
                  </button>
                </div>

                {/* Hint Bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleGiveHint}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>Harf İpucu Al ({revealedHintLength}/{currentWord.word.length})</span>
                  </button>

                  {revealedHintLength > 0 && (
                    <div className="text-sm font-mono tracking-widest text-emerald-400 font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {currentWord.word.slice(0, revealedHintLength)}
                      {'_'.repeat(Math.max(0, currentWord.word.length - revealedHintLength))}
                    </div>
                  )}
                </div>
              </form>
            ) : null}
          </div>
        ) : (
          /* Multiple Choice Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {choiceOptions.map((opt, idx) => {
              const isTarget = opt.toLowerCase() === currentWord.word.toLowerCase();
              let btnClass = 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700';
              if (isAnswered) {
                if (isTarget) {
                  btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else {
                  btnClass = 'opacity-40 bg-slate-800/40 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => checkAnswer(opt)}
                  className={`p-4 rounded-2xl border text-base font-semibold text-center transition ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Section after Answer */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between mb-4 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <X className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-base">
                    {isCorrect ? 'Harika! Doğru Cevap' : 'Yanlış Cevap'}
                  </p>
                  <p className="text-xs text-slate-300">
                    Doğru kelime: <span className="font-bold text-white">{currentWord.word}</span> ({currentWord.meaning})
                  </p>
                </div>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {isCorrect ? `Kutu ${currentWord.box || 1} ➔ ${Math.min(5, (currentWord.box || 1) + 1)}` : 'Tekrar için Kutu 1'}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-base transition shadow-lg shadow-emerald-500/20"
            >
              <span>Sonraki Cümleye Geç</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
