import React, { useState, useEffect, useRef } from 'react';
import { Volume2, RotateCw, Check, X, Sparkles, RefreshCw, HelpCircle, Layers, Mic, MicOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '../services/speech';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/recognition';
import { incrementTodayActivity, addMistake } from '../services/progressTracker';

export default function FlashcardStudy({ words, onReview, onRefresh }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState('card'); // 'card' or 'quiz'
  const [completed, setCompleted] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Pronunciation Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState(null);
  const recognizerRef = useRef(null);

  // Filter study deck
  const currentWord = words[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setSpeechFeedback(null);
  }, [words]);

  // Generate quiz options when current word changes or in quiz mode
  useEffect(() => {
    if (!currentWord || words.length === 0) return;

    if (studyMode === 'quiz') {
      const correct = currentWord.meaning;
      // Pick 3 random wrong meanings from other words
      const otherMeanings = words
        .filter(w => w.id !== currentWord.id)
        .map(w => w.meaning);
      
      const shuffledOthers = otherMeanings.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
      setQuizOptions(allOptions);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    }
  }, [currentIndex, studyMode, currentWord, words]);

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setSpeechFeedback(null);
    if (recognizerRef.current) {
      try { recognizerRef.current.abort(); } catch (e) {}
      setIsListening(false);
    }

    if (currentIndex + 1 < words.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReviewAction = async (isCorrect) => {
    if (!currentWord) return;
    incrementTodayActivity(1);
    if (!isCorrect) {
      addMistake({
        id: `card-${currentWord.id}`,
        title: `Kelime Kartı: ${currentWord.word}`,
        question: `"${currentWord.word}" kelimesinin anlamı nedir?`,
        meaning: currentWord.meaning,
        explanation: `${currentWord.word} = ${currentWord.meaning} (${currentWord.sentenceEn || ''})`,
        type: 'flashcard'
      });
    }
    await onReview(currentWord.id, isCorrect);
    handleNext();
  };

  const handleSelectQuizOption = async (option) => {
    if (isAnswerChecked || !currentWord) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    incrementTodayActivity(1);

    const isCorrect = option === currentWord.meaning;
    if (isCorrect) {
      speak(currentWord.word);
    } else {
      addMistake({
        id: `card-quiz-${currentWord.id}`,
        title: `Kelime Testi: ${currentWord.word}`,
        question: `"${currentWord.word}" kelimesinin Türkçe anlamı nedir?`,
        options: quizOptions,
        answerIndex: quizOptions.indexOf(currentWord.meaning),
        meaning: currentWord.meaning,
        explanation: `Doğru cevap: ${currentWord.meaning}`,
        type: 'word-quiz'
      });
    }

    await onReview(currentWord.id, isCorrect);

    // Auto next after 1.3 seconds
    setTimeout(() => {
      handleNext();
    }, 1300);
  };

  const handleListenPronunciation = (e) => {
    e.stopPropagation();
    if (!currentWord) return;

    if (!isSpeechRecognitionSupported()) {
      setSpeechFeedback({
        type: 'error',
        text: 'Tarayıcınız ses tanıma desteklemiyor (Chrome/Edge önerilir).'
      });
      return;
    }

    if (isListening) {
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch (err) {}
      }
      setIsListening(false);
      return;
    }

    setSpeechFeedback({ type: 'info', text: 'Dinleniyor... Şimdi mikrofona konuşun 🎙️' });
    setIsListening(true);

    try {
      const recognizer = createSpeechRecognizer(
        currentWord.word,
        (res) => {
          setIsListening(false);
          incrementTodayActivity(1);
          if (res.accuracyScore >= 70 || res.isMatch) {
            setSpeechFeedback({
              type: 'success',
              text: `🎯 Harika Telaffuz! (%${res.accuracyScore}): "${res.spokenText}"`
            });
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
          } else {
            setSpeechFeedback({
              type: 'warning',
              text: `💡 Algılanan: "${res.spokenText}" (%${res.accuracyScore}). Tekrar deneyin!`
            });
          }
        },
        (errMsg) => {
          setIsListening(false);
          setSpeechFeedback({ type: 'error', text: errMsg });
        }
      );

      recognizerRef.current = recognizer;
      recognizer.start();
    } catch (err) {
      setIsListening(false);
      setSpeechFeedback({ type: 'error', text: 'Mikrofon başlatılamadı.' });
    }
  };

  const getPosBadge = (pos) => {
    const map = {
      verb: { label: 'Fiil (Verb)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
      noun: { label: 'İsim (Noun)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      adjective: { label: 'Sıfat (Adj)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      adverb: { label: 'Zarf (Adv)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      idiom: { label: 'Deyim (Idiom)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    };
    const current = map[pos] || { label: pos || 'Kelime', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${current.color}`}>
        {current.label}
      </span>
    );
  };

  if (!words || words.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
        <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Bu kategoride kelime bulunamadı</h3>
        <p className="text-sm text-slate-400 mb-6">
          Seçtiğiniz filtreye uygun kelime yok veya listeniz henüz boş. Filtreyi değiştirebilir veya yeni kelime ekleyebilirsiniz.
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
        <h2 className="text-2xl font-black text-white mb-2">Tebrikler! Seans Tamamlandı!</h2>
        <p className="text-slate-300 text-sm mb-6">
          Seçili gruptaki <span className="font-bold text-emerald-400">{words.length}</span> kelimenin tamamını çalıştınız. Leitner kutularınız başarı durumunuza göre güncellendi.
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Switcher & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setStudyMode('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              studyMode === 'card'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcard (3D)
          </button>
          <button
            onClick={() => setStudyMode('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              studyMode === 'quiz'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Şıklı Quiz
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Kutu {currentWord.box || 1}</span>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {currentIndex + 1} / {words.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {studyMode === 'card' ? (
        /* 3D Flip Card */
        <div className="relative min-h-[380px] perspective-1000">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[380px] rounded-3xl cursor-pointer p-8 flex flex-col justify-between transition-all duration-500 transform-style-preserve-3d relative shadow-2xl border ${
              isFlipped
                ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-teal-500/40'
                : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {/* Top Row on Card */}
            <div className="flex items-center justify-between">
              {getPosBadge(currentWord.partOfSpeech)}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentWord.word);
                  }}
                  className="p-2.5 rounded-full bg-slate-800/90 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 transition"
                  title="Sesli Dinle"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleListenPronunciation}
                  className={`p-2.5 rounded-full border transition ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/50'
                      : 'bg-slate-800/90 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border-slate-700'
                  }`}
                  title="Mikrofon ile Telaffuzunu Test Et"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Çevir</span>
                </div>
              </div>
            </div>

            {/* Middle Content */}
            <div className="my-auto py-6 text-center">
              {!isFlipped ? (
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                    {currentWord.word}
                  </h2>
                  <p className="text-slate-400 text-sm mb-3">
                    (Kartı çevirmek için herhangi bir yere tıklayın)
                  </p>

                  {/* Speech Feedback Banner */}
                  {speechFeedback && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold animate-fadeIn mt-1 shadow-md ${
                        speechFeedback.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : speechFeedback.type === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : speechFeedback.type === 'error'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                      }`}
                    >
                      <span>{speechFeedback.text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                      Türkçe Karşılığı
                    </span>
                    <h3 className="text-3xl font-extrabold text-emerald-300">
                      {currentWord.meaning}
                    </h3>
                  </div>

                  {currentWord.sentenceEn && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-left">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-200">
                          {currentWord.sentenceEn}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(currentWord.sentenceEn);
                          }}
                          className="text-slate-400 hover:text-emerald-400 p-1"
                          title="Cümleyi Dinle"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {currentWord.sentenceTr && (
                        <p className="text-xs text-slate-400 italic">
                          {currentWord.sentenceTr}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
              <span>Mevcut Kutu: <b className="text-slate-200">Kutu {currentWord.box || 1}</b></span>
              <span>Başarı: <b className="text-emerald-400">{currentWord.successCount || 0}</b> / Hata: <b className="text-rose-400">{currentWord.failCount || 0}</b></span>
            </div>
          </div>

          {/* SRS Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
            <button
              onClick={() => handleReviewAction(false)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 px-3 sm:px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs sm:text-sm transition transform active:scale-95"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Zorlandı (Kutu 1'e Al)</span>
              <span className="sm:hidden">Zorlandım</span>
            </button>
            <button
              onClick={() => handleReviewAction(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 px-3 sm:px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Biliyorum (Kutu Yükselt)</span>
              <span className="sm:hidden">Biliyorum</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4-Choice Quiz Mode */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            {getPosBadge(currentWord.partOfSpeech)}
            <button
              onClick={() => speak(currentWord.word)}
              className="p-2.5 rounded-full bg-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
              title="Kelimeyi Dinle"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center my-6">
            <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">
              Doğru Türkçe Karşılığı Seçin:
            </span>
            <h2 className="text-4xl font-extrabold text-white">{currentWord.word}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {quizOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentWord.meaning;
              
              let btnStyle = 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/70';
              if (isAnswerChecked) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'opacity-40 bg-slate-800/40 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`p-4 rounded-2xl border text-sm text-left transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswerChecked && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                  {isAnswerChecked && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
