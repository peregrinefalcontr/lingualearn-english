import React, { useState, useEffect } from 'react';
import { Volume2, Check, X, ArrowRight, RotateCcw, Languages, Sparkles, RefreshCw, HelpCircle, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '../services/speech';
import { addMistake, incrementTodayActivity } from '../services/progressTracker';

export default function TranslationPractice({ words, onReview, onRefresh }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('tr-en'); // 'tr-en' or 'en-tr'
  const [inputStyle, setInputStyle] = useState('blocks'); // 'blocks' (Duolingo chips) or 'typing' (Strict text)
  const [completed, setCompleted] = useState(false);

  // For Blocks Mode
  const [availableChips, setAvailableChips] = useState([]);
  const [selectedChips, setSelectedChips] = useState([]);

  // For Typing Mode
  const [typedAnswer, setTypedAnswer] = useState('');

  // Status
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Filter words that have full sentences
  const translationWords = words.filter(w => w.sentenceEn && w.sentenceTr);
  const currentWord = translationWords[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setCompleted(false);
    resetState();
  }, [words, direction, inputStyle]);

  useEffect(() => {
    resetState();
  }, [currentIndex, currentWord, direction, inputStyle]);

  // Clean and tokenize text into clean word chips
  const cleanTokens = (text) => {
    if (!text) return [];
    return text.trim()
      .replace(/[.,!?;:"]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  };

  const resetState = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedChips([]);
    setTypedAnswer('');

    if (!currentWord) return;

    const targetText = direction === 'tr-en' ? currentWord.sentenceEn : currentWord.sentenceTr;
    const tokens = cleanTokens(targetText);

    // Pick 2-3 distractor words from other sentences
    const otherTokens = translationWords
      .filter(w => w.id !== currentWord.id)
      .flatMap(w => cleanTokens(direction === 'tr-en' ? w.sentenceEn : w.sentenceTr))
      .filter(t => !tokens.map(x => x.toLowerCase()).includes(t.toLowerCase()));

    const distractors = otherTokens.sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [...tokens, ...distractors]
      .map((text, idx) => ({ id: `${text}-${idx}-${Math.random()}`, text }))
      .sort(() => 0.5 - Math.random());

    setAvailableChips(combined);
  };

  if (!translationWords || translationWords.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
        <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Çeviri Alıştırması Bulunamadı</h3>
        <p className="text-sm text-slate-400">
          Bu grupta hem İngilizce hem Türkçe cümlesi bulunan kelime yok. Kelimelerim sekmesinden cümle ekleyebilirsiniz.
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
        <h2 className="text-2xl font-black text-white mb-2">Harika! Çeviri Seansı Bitti!</h2>
        <p className="text-slate-300 text-sm mb-6">
          Seçili gruptaki <span className="font-bold text-emerald-400">{translationWords.length}</span> çevirinin tamamını tamamladınız.
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

  const promptText = direction === 'tr-en' ? currentWord.sentenceTr : currentWord.sentenceEn;
  const targetText = direction === 'tr-en' ? currentWord.sentenceEn : currentWord.sentenceTr;

  // Chip selection helpers
  const handleChipClick = (chip) => {
    if (isAnswered) return;
    setAvailableChips(prev => prev.filter(c => c.id !== chip.id));
    setSelectedChips(prev => [...prev, chip]);
  };

  const handleRemoveChip = (chip) => {
    if (isAnswered) return;
    setSelectedChips(prev => prev.filter(c => c.id !== chip.id));
    setAvailableChips(prev => [...prev, chip]);
  };

  const handleClearChips = () => {
    if (isAnswered) return;
    setAvailableChips(prev => [...prev, ...selectedChips]);
    setSelectedChips([]);
  };

  // Evaluation
  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const checkAnswer = async () => {
    if (isAnswered) return;

    let userSentence = '';
    if (inputStyle === 'blocks') {
      userSentence = selectedChips.map(c => c.text).join(' ');
    } else {
      userSentence = typedAnswer;
    }

    const normUser = normalize(userSentence);
    const normTarget = normalize(targetText);

    const correct = normUser === normTarget;
    setIsCorrect(correct);
    setIsAnswered(true);

    incrementTodayActivity(1);

    if (direction === 'tr-en' || correct) {
      speak(currentWord.sentenceEn);
    }

    if (!correct) {
      addMistake({
        id: `trans-${currentWord.id}-${direction}`,
        title: `Çeviri: ${promptText}`,
        question: `Çeviri Sorusu (${direction === 'tr-en' ? 'TR ➔ EN' : 'EN ➔ TR'}): "${promptText}"`,
        explanation: `Doğru Çeviri: "${targetText}"`,
        meaning: currentWord.meaning,
        type: 'translation'
      });
    }

    await onReview(currentWord.id, correct);
  };

  const handleNext = () => {
    if (currentIndex + 1 < translationWords.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
        {/* Direction Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setDirection('tr-en')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              direction === 'tr-en'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Türkçe ➔ İngilizce</span>
            <span className="sm:hidden">TR ➔ EN</span>
          </button>
          <button
            onClick={() => setDirection('en-tr')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              direction === 'en-tr'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">İngilizce ➔ Türkçe</span>
            <span className="sm:hidden">EN ➔ TR</span>
          </button>
        </div>

        {/* Style Switcher: Blocks vs Typing */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setInputStyle('blocks')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputStyle === 'blocks'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Kelime Blokları</span>
            <span className="sm:hidden">Bloklar</span>
          </button>
          <button
            onClick={() => setInputStyle('typing')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputStyle === 'typing'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Katı Yazım Modu</span>
            <span className="sm:hidden">Yazarak</span>
          </button>
        </div>

        <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          {currentIndex + 1} / {translationWords.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / translationWords.length) * 100}%` }}
        />
      </div>

      {/* Main Exercise Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
            {direction === 'tr-en' ? 'İngilizceye Çevirin' : 'Türkçeye Çevirin'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Kelime: <b className="text-emerald-300">{currentWord.word}</b> ({currentWord.meaning})
          </span>
        </div>

        {/* Source Prompt Sentence */}
        <div className="my-5 p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
          <p className="text-lg sm:text-xl font-bold text-white">
            "{promptText}"
          </p>
          {direction === 'en-tr' && (
            <button
              onClick={() => speak(currentWord.sentenceEn)}
              className="p-2 rounded-xl bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 transition ml-3"
              title="Cümleyi Dinle"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Interaction: Blocks or Typing */}
        {inputStyle === 'blocks' ? (
          <div className="space-y-4">
            {/* Assembled sentence line */}
            <div className="min-h-[72px] p-4 rounded-2xl bg-slate-850/80 border-2 border-dashed border-slate-700 flex flex-wrap items-center gap-2">
              {selectedChips.length === 0 ? (
                <span className="text-sm text-slate-500 italic select-none">
                  Aşağıdaki kelime bloklarına tıklayarak çeviriyi oluşturun...
                </span>
              ) : (
                selectedChips.map((chip) => (
                  <button
                    key={chip.id}
                    disabled={isAnswered}
                    onClick={() => handleRemoveChip(chip)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm hover:bg-rose-500/20 hover:border-rose-500 hover:text-rose-300 transition animate-scaleIn"
                  >
                    {chip.text}
                  </button>
                ))
              )}
            </div>

            {/* Clear button */}
            {selectedChips.length > 0 && !isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleClearChips}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>
            )}

            {/* Available Word Chips */}
            {!isAnswered && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-medium mb-2">Kullanılabilir Kelimeler:</p>
                <div className="flex flex-wrap gap-2">
                  {availableChips.map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleChipClick(chip)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-700/80 hover:border-emerald-500/50 hover:text-white transition active:scale-95 shadow-sm"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Check Button for Blocks */}
            {!isAnswered && (
              <button
                onClick={checkAnswer}
                disabled={selectedChips.length === 0}
                className="w-full mt-4 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold text-base transition shadow-lg shadow-emerald-500/20"
              >
                Çeviriyi Kontrol Et
              </button>
            )}
          </div>
        ) : (
          /* Typing Mode */
          <div>
            {!isAnswered ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  checkAnswer();
                }}
                className="space-y-4"
              >
                <textarea
                  rows={3}
                  autoFocus
                  placeholder={direction === 'tr-en' ? 'İngilizce çevirisini harfi harfine yazın...' : 'Türkçe çevirisini yazın...'}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base font-medium resize-none"
                />

                <button
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold text-base transition shadow-lg shadow-emerald-500/20"
                >
                  Birebir Yazımı Kontrol Et
                </button>
              </form>
            ) : null}
          </div>
        )}

        {/* Feedback Section */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border flex items-start justify-between mb-4 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 mt-0.5">
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <X className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-base">
                    {isCorrect ? 'Tebrikler! Doğru Çeviri' : 'Farklı veya Hatalı Çeviri'}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Beklenen Cümle: <span className="font-semibold text-white">"{targetText}"</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speak(currentWord.sentenceEn)}
                  className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 transition"
                  title="İngilizce Telaffuzu Dinle"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-base transition shadow-lg shadow-emerald-500/20"
            >
              <span>Sonraki Çeviriye Geç</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
