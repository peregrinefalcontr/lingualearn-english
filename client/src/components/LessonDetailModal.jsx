import React, { useState, useMemo } from 'react';
import { X, Volume2, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ArrowLeft, Award, Sparkles, BookOpen, RotateCcw, Filter, Check, ListChecks } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak } from '../services/speech';
import { addMistake, incrementTodayActivity } from '../services/progressTracker';

export default function LessonDetailModal({ lesson, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' or 'quiz'
  const [testLimit, setTestLimit] = useState(100); // 10, 25, 50, 100
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const allQuestions = lesson?.quiz || [];

  // Active question slice based on selected limit
  const activeQuestions = useMemo(() => {
    return allQuestions.slice(0, testLimit);
  }, [allQuestions, testLimit]);

  const totalPages = Math.ceil(activeQuestions.length / pageSize);

  const displayedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeQuestions.slice(start, start + pageSize);
  }, [activeQuestions, currentPage, pageSize]);

  if (!lesson) return null;

  const handleSelectAnswer = (qGlobalIndex, optIndex) => {
    if (isQuizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qGlobalIndex]: optIndex }));
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correct++;
      } else {
        // Record into Mistake Notebook
        addMistake({
          id: `${lesson.id}-q-${idx}`,
          title: `${lesson.title} (Soru ${idx + 1})`,
          question: q.question,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation,
          type: 'lesson-quiz'
        });
      }
    });

    incrementTodayActivity(activeQuestions.length);

    const calculatedScore = activeQuestions.length > 0 ? Math.round((correct / activeQuestions.length) * 100) : 100;
    setQuizScore(calculatedScore);
    setIsQuizSubmitted(true);

    if (calculatedScore >= 60) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }

    if (onComplete) {
      await onComplete(lesson.id, calculatedScore);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setQuizScore(0);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setTestLimit(newLimit);
    setCurrentPage(1);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
  };

  const answeredCount = Object.keys(quizAnswers).filter(k => Number(k) < activeQuestions.length).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                lesson.level === 'A1'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
              }`}>
                {lesson.level} Seviyesi • Ünite {lesson.unitNumber}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                📚 100 Soruluk Ünite Soru Havuzu
              </span>
              {lesson.completed && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tamamlandı ({lesson.quizScore}%)</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{lesson.title}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{lesson.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Tabs (Konu Anlatımı vs 100 Soruluk Kavrama Testi) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/60 gap-2">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'lesson'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Konu Anlatımı & Diyaloglar</span>
              <span className="sm:hidden">Konu & Diyalog</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'quiz'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Ünite Testi (100 Soru Havuzu)</span>
              <span className="sm:hidden">Test (100 Soru)</span>
            </button>
          </div>

          {/* If on Quiz tab, show question count filter */}
          {activeTab === 'quiz' && (
            <div className="flex items-center gap-1 sm:gap-1.5 pb-2 text-xs overflow-x-auto no-scrollbar">
              <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Soru:</span>
              {[10, 25, 50, 100].map((lim) => (
                <button
                  key={lim}
                  onClick={() => handleLimitChange(lim)}
                  className={`px-2 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition ${
                    testLimit === lim
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lim === 100 ? '100 Soru' : `${lim} Soru`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'lesson' ? (
            <div className="space-y-6">
              {/* 1. Formula Box */}
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Cümle Kurulum Formülü ve Gramer Mantığı</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm font-mono">
                  {lesson.formula.positive && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-emerald-300">
                      <b className="text-white font-sans">Olumlu (+):</b> {lesson.formula.positive}
                    </div>
                  )}
                  {lesson.formula.negative && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-rose-300">
                      <b className="text-white font-sans">Olumsuz (-):</b> {lesson.formula.negative}
                    </div>
                  )}
                  {lesson.formula.question && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-sky-300">
                      <b className="text-white font-sans">Soru (?):</b> {lesson.formula.question}
                    </div>
                  )}
                </div>

                {lesson.formula.ruleNote && (
                  <p className="text-xs sm:text-sm text-slate-300 mt-3 pt-3 border-t border-slate-700/60 leading-relaxed font-sans">
                    💡 <b>Önemli Kural:</b> {lesson.formula.ruleNote}
                  </p>
                )}
              </div>

              {/* 2. Common Pitfalls / Tuzak Hatalar */}
              {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                <div className="bg-slate-800/60 border border-rose-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>⚠️ Dikkat! En Sık Yapılan Tuzak Hatalar</span>
                  </div>

                  <div className="space-y-3">
                    {lesson.commonMistakes.map((mistake, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
                          <span className="text-rose-400 line-through">❌ {mistake.wrong}</span>
                          <span className="text-emerald-400">✔️ {mistake.correct}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {mistake.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Audio Dialogues */}
              {lesson.dialogues && lesson.dialogues.length > 0 && (
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <Volume2 className="w-4 h-4" />
                      <span>Gerçek Hayat Diyaloğu & Sesli Telaffuz</span>
                    </div>
                    <span className="text-[11px] text-slate-400">(Hoparlör simgesine basarak dinleyin)</span>
                  </div>

                  <div className="space-y-3">
                    {lesson.dialogues.map((d, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{d.speaker}:</span>
                          <p className="text-sm font-semibold text-white">{d.textEn}</p>
                          <p className="text-xs text-slate-400 italic">{d.textTr}</p>
                        </div>

                        <button
                          onClick={() => speak(d.textEn)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 transition flex-shrink-0"
                          title="Cümleyi Dinle"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button: Start 100 Questions */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
                >
                  <span>100 Soruluk Ünite Testine Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* 100-Question Quiz Tab */
            <div className="space-y-6">
              {/* Mobile Question Limit Filter */}
              <div className="flex sm:hidden items-center justify-between bg-slate-800/80 p-2 rounded-xl text-xs">
                <span className="text-slate-300 font-medium">Soru Sayısı:</span>
                <div className="flex gap-1">
                  {[10, 25, 50, 100].map((lim) => (
                    <button
                      key={lim}
                      onClick={() => handleLimitChange(lim)}
                      className={`px-2 py-1 rounded-lg font-bold transition ${
                        testLimit === lim
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {lim}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Result Banner */}
              {isQuizSubmitted && (
                <div className={`p-6 rounded-3xl border text-center ${
                  quizScore >= 60
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-2 bg-slate-900 border border-slate-800">
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-black">
                    {quizScore >= 60 ? 'Tebrikler! Üniteyi Başarıyla Tamamladınız!' : 'Tekrar Çalışmanız Önerilir'}
                  </h4>
                  <p className="text-3xl font-black text-emerald-400 my-2">%{quizScore}</p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {activeQuestions.length} soru üzerinden değerlendirildi. (Geçme notu: %60)
                  </p>
                </div>
              )}

              {/* Progress & Quick Navigation Grid */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    <span>Cevaplanan: <b className="text-emerald-400">{answeredCount}</b> / {activeQuestions.length}</span>
                  </div>
                  <span>Sayfa: {currentPage} / {totalPages} (Sorular {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, activeQuestions.length)})</span>
                </div>

                {/* Question Numbers Mini Grid (Jump to question) */}
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-900/80 rounded-xl border border-slate-800 no-scrollbar">
                  {activeQuestions.map((_, qIdx) => {
                    const isAnswered = quizAnswers[qIdx] !== undefined;
                    const pageOfQ = Math.floor(qIdx / pageSize) + 1;
                    const isCurrentPage = pageOfQ === currentPage;

                    let btnClass = 'bg-slate-800 text-slate-400 border-slate-700';
                    if (isAnswered) btnClass = 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40';
                    if (isCurrentPage) btnClass += ' ring-1 ring-white/50';

                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentPage(pageOfQ)}
                        className={`w-7 h-7 rounded-lg text-[11px] border flex items-center justify-center transition ${btnClass}`}
                        title={`Soru ${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Page 10 Questions */}
              <div className="space-y-4">
                {displayedQuestions.map((q, localIdx) => {
                  const qGlobalIndex = (currentPage - 1) * pageSize + localIdx;
                  const selected = quizAnswers[qGlobalIndex];
                  const isAnswerSelected = selected !== undefined;
                  const isCorrect = isQuizSubmitted && selected === q.answerIndex;

                  return (
                    <div key={qGlobalIndex} className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3 shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-sm sm:text-base font-bold text-white">
                          <span className="text-emerald-400 mr-2">Soru {qGlobalIndex + 1}:</span>
                          {q.question}
                        </h5>
                        {isAnswerSelected && !isQuizSubmitted && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-emerald-300 flex-shrink-0">
                            İşaretlendi
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isOptionCorrectAnswer = isQuizSubmitted && optIdx === q.answerIndex;

                          let btnStyle = 'bg-slate-900 border-slate-700/80 text-slate-200 hover:bg-slate-850';
                          if (isOptionSelected) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/40';
                          }
                          if (isQuizSubmitted) {
                            if (isOptionCorrectAnswer) {
                              btnStyle = 'bg-emerald-500/30 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500';
                            } else if (isOptionSelected && !isOptionCorrectAnswer) {
                              btnStyle = 'bg-rose-500/30 border-rose-500 text-rose-300 line-through';
                            } else {
                              btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isQuizSubmitted}
                              onClick={() => handleSelectAnswer(qGlobalIndex, optIdx)}
                              className={`p-3 rounded-xl border text-xs sm:text-sm text-left transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isOptionSelected && !isQuizSubmitted && <Check className="w-4 h-4 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isQuizSubmitted && q.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                          💡 <b>Açıklama:</b> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki 10 Soru</span>
                </button>

                <span className="text-xs font-bold text-slate-400">
                  Sayfa {currentPage} / {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    <span>Sonraki 10 Soru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div></div>
                )}
              </div>

              {/* Submit / Reset Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {isQuizSubmitted ? (
                  <button
                    onClick={handleResetQuiz}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Testi Yeniden Çöz</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-400">
                      {answeredCount} / {activeQuestions.length} soru işaretlendi
                    </span>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={answeredCount === 0}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition"
                    >
                      Testi Tamamla ve Puanla ({activeQuestions.length} Soru)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
