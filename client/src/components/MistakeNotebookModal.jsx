import React, { useState } from 'react';
import { X, BookX, Trash2, CheckCircle2, RotateCcw, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getMistakes, removeMistake, clearMistakes } from '../services/progressTracker';

export default function MistakeNotebookModal({ onClose, onMistakesUpdated }) {
  const [mistakes, setMistakes] = useState(getMistakes());
  const [solvingIndex, setSolvingIndex] = useState(null); // when user clicks to resolve a specific mistake
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleRemove = (id) => {
    const updated = removeMistake(id);
    setMistakes(updated);
    onMistakesUpdated && onMistakesUpdated(updated.length);
  };

  const handleClearAll = () => {
    if (confirm('Tüm hata kayıtlarını temizlemek istediğinize emin misiniz?')) {
      clearMistakes();
      setMistakes([]);
      onMistakesUpdated && onMistakesUpdated(0);
    }
  };

  const currentMistake = solvingIndex !== null ? mistakes[solvingIndex] : null;

  const handleSelectOption = (optIdx) => {
    if (isAnswered || !currentMistake) return;
    setSelectedOption(optIdx);
    setIsAnswered(true);

    const correct = optIdx === currentMistake.answerIndex;
    setIsCorrect(correct);

    if (correct) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => {
        // Auto remove from notebook after 1.5s
        handleRemove(currentMistake.id);
        setSolvingIndex(null);
        setSelectedOption(null);
        setIsAnswered(false);
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <BookX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Akıllı Hata Defterim</h3>
              <p className="text-xs text-slate-400">
                Zorlandığınız ve yanlış yaptığınız sorular burada toplanır
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {mistakes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Hata Defteriniz Bomboş!</h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Harika gidiyorsunuz! Henüz çözemediğiniz veya zorlandığınız bir soru bulunmuyor. Testlerde hata yaptıkça sorular otomatik buraya kaydedilecektir.
            </p>
          </div>
        ) : solvingIndex !== null && currentMistake ? (
          /* Solving Mode */
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Doğru Cevabı Bulun & Defterden Silin:
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {currentMistake.question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(currentMistake.options || []).map((opt, optIdx) => {
                  let btnStyle = 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-850';
                  if (isAnswered) {
                    if (optIdx === currentMistake.answerIndex) {
                      btnStyle = 'bg-emerald-500/30 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500';
                    } else if (selectedOption === optIdx && !isCorrect) {
                      btnStyle = 'bg-rose-500/30 border-rose-500 text-rose-300 line-through';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm text-left transition ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isCorrect
                    ? '🎉 Doğru! Soru hata defterinizden başarıyla siliniyor...'
                    : `❌ Hatalı. Açıklama: ${currentMistake.explanation || 'Doğru kuralı tekrar inceleyin.'}`}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setSolvingIndex(null);
                  setIsAnswered(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Listeye Dön
              </button>
            </div>
          </div>
        ) : (
          /* List of Mistakes */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Toplam <b>{mistakes.length}</b> zorlanılan soru kayıtlı</span>
              <button
                onClick={handleClearAll}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tümünü Temizle</span>
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {mistakes.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3 hover:border-slate-600 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white line-clamp-1">{m.question}</p>
                    {m.explanation && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">💡 {m.explanation}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSolvingIndex(idx);
                        setIsAnswered(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition"
                    >
                      Tekrar Çöz
                    </button>
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Defterden Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
