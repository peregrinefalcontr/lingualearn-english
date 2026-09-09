import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchExam, submitExam } from '../services/api';

export default function LevelExamModal({ level, onClose }) {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const data = await fetchExam(level);
        setExamData(data);
      } catch (err) {
        console.error('Failed to load exam:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [level]);

  const handleSelectOption = (qIdx, optIdx) => {
    if (examResult) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (!examData || submitting) return;
    setSubmitting(true);
    try {
      // Map answers to array of 20 elements
      const answersArray = (examData.questions || []).map((_, idx) =>
        answers[idx] !== undefined ? answers[idx] : -1
      );
      const result = await submitExam(level, answersArray);
      setExamResult(result);

      if (result.passed) {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Submit exam error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setExamResult(null);
    setCurrentQIndex(0);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-300">
          <p className="text-sm">Sınav soruları hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!examData) return null;

  const questions = examData.questions || [];
  const currentQuestion = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{examData.title}</h3>
              <p className="text-xs text-slate-400">
                {questions.length} Soru • Geçme Notu: %{examData.passingScore}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!examResult ? (
            /* Question Active Mode */
            <div className="space-y-6">
              {/* Question Navigation Bar (1 to 20) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                {questions.map((_, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const isCurrent = currentQIndex === idx;

                  let pillStyle = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (isCurrent) pillStyle = 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-400';
                  else if (isAnswered) pillStyle = 'bg-slate-700 text-emerald-300 font-semibold border-emerald-500/40';

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center flex-shrink-0 transition ${pillStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cevaplanan: <b className="text-emerald-400">{answeredCount}</b> / {questions.length}</span>
                <span>Soru: {currentQIndex + 1} / {questions.length}</span>
              </div>

              {/* Current Question Box */}
              {currentQuestion && (
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-5">
                  <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    <span className="text-emerald-400 mr-2">Soru {currentQIndex + 1}:</span>
                    {currentQuestion.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQIndex] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQIndex, optIdx)}
                          className={`p-4 rounded-xl border text-sm text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500'
                              : 'bg-slate-900 border-slate-700/70 text-slate-200 hover:bg-slate-850'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki Soru</span>
                </button>

                {currentQIndex + 1 < questions.length ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition"
                  >
                    <span>Sonraki Soru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition"
                  >
                    {submitting ? 'Değerlendiriliyor...' : 'Sınavı Tamamla ve Gönder'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Result Screen / Detailed Report Card */
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-8 rounded-3xl border text-center relative overflow-hidden ${
                examResult.passed
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40'
                  : 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
              }`}>
                {examResult.passed && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Resmi Seviye Başarı Sertifikası Rozeti</span>
                  </div>
                )}

                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 bg-slate-800/80 border border-slate-700">
                  {examResult.passed ? (
                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-rose-400" />
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  {examResult.passed ? `Tebrikler! ${level} Seviyesini Geçtiniz!` : `${level} Seviyesi Tamamlanamadı`}
                </h3>

                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 my-4">
                  %{examResult.score}
                </div>

                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {examResult.message}
                </p>

                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-800">
                  <span>Doğru: <b className="text-emerald-400 text-sm">{examResult.correctCount}</b></span>
                  <span>Yanlış / Boş: <b className="text-rose-400 text-sm">{examResult.totalQuestions - examResult.correctCount}</b></span>
                  <span>Toplam Soru: <b className="text-white text-sm">{examResult.totalQuestions}</b></span>
                </div>
              </div>

              {/* Detailed Review Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Soru İnceleme ve Cevap Anahtarı
                </h4>
                <div className="space-y-2.5">
                  {(examResult.detailedResults || []).map((res) => (
                    <div
                      key={res.questionNumber}
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        res.isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-200'
                          : 'bg-rose-950/20 border-rose-500/20 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {res.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span><b>Soru {res.questionNumber}:</b> {res.question}</span>
                      </div>
                      <span className={`font-bold whitespace-nowrap ${res.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {res.isCorrect ? 'Doğru' : 'Hatalı'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Sınavı Tekrar Çöz</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold transition"
                >
                  Kapat ve Derslere Dön
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
