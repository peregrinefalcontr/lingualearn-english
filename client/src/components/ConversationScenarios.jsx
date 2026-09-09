import React, { useState, useEffect, useRef } from 'react';
import { Plane, Coffee, Building, ShoppingBag, HeartPulse, Volume2, CheckCircle, ArrowRight, X, Sparkles, HelpCircle, Award, RotateCcw, Mic, MicOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchScenarios } from '../services/api';
import { speak } from '../services/speech';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/recognition';
import { addMistake, incrementTodayActivity } from '../services/progressTracker';

export default function ConversationScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeTab, setActiveTab] = useState('dialogue'); // 'dialogue' or 'quiz'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Pronunciation practice per dialogue line
  const [listeningLineIdx, setListeningLineIdx] = useState(null);
  const [speechFeedback, setSpeechFeedback] = useState({});
  const recognizerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchScenarios();
        setScenarios(res.data || []);
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Plane': return <Plane className="w-6 h-6 text-emerald-400" />;
      case 'Coffee': return <Coffee className="w-6 h-6 text-amber-400" />;
      case 'Building': return <Building className="w-6 h-6 text-sky-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6 text-purple-400" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-rose-400" />;
      default: return <Sparkles className="w-6 h-6 text-emerald-400" />;
    }
  };

  const handleOpenScenario = (item) => {
    setActiveScenario(item);
    setActiveTab('dialogue');
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (isQuizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    const questions = activeScenario?.quiz || [];
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correct++;
      } else {
        addMistake({
          id: `scenario-${activeScenario.id}-q-${idx}`,
          title: `Senaryo Sorusu: ${activeScenario.title}`,
          question: q.question,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation || 'Senaryodaki diyalog kalıplarını tekrar inceleyin.',
          type: 'scenario-quiz'
        });
      }
    });

    incrementTodayActivity(questions.length);

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= 60) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleListenLine = (idx, textEn) => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechFeedback(prev => ({
        ...prev,
        [idx]: { type: 'error', text: 'Tarayıcınız ses tanıma desteklemiyor (Chrome/Edge önerilir).' }
      }));
      return;
    }

    if (listeningLineIdx === idx) {
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch (e) {}
      }
      setListeningLineIdx(null);
      return;
    }

    setListeningLineIdx(idx);
    setSpeechFeedback(prev => ({
      ...prev,
      [idx]: { type: 'info', text: 'Dinleniyor... Şimdi konuşun 🎙️' }
    }));

    try {
      const recognizer = createSpeechRecognizer(
        textEn,
        (res) => {
          setListeningLineIdx(null);
          incrementTodayActivity(1);
          if (res.accuracyScore >= 70 || res.isMatch) {
            setSpeechFeedback(prev => ({
              ...prev,
              [idx]: { type: 'success', text: `🎯 Harika Telaffuz! (%${res.accuracyScore})` }
            }));
            confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
          } else {
            setSpeechFeedback(prev => ({
              ...prev,
              [idx]: { type: 'warning', text: `💡 Algılanan: "${res.spokenText}" (%${res.accuracyScore}). Tekrar deneyin!` }
            }));
          }
        },
        (errMsg) => {
          setListeningLineIdx(null);
          setSpeechFeedback(prev => ({ ...prev, [idx]: { type: 'error', text: errMsg } }));
        }
      );

      recognizerRef.current = recognizer;
      recognizer.start();
    } catch (err) {
      setListeningLineIdx(null);
      setSpeechFeedback(prev => ({ ...prev, [idx]: { type: 'error', text: 'Mikrofon başlatılamadı.' } }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Gerçek Hayat Pratikleri
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Günlük Yaşam Konuşma Senaryoları & Diyalog Simülatörü
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
          Havalimanından otele, restorandan hastaneye kadar en sık karşılaşılan 5 temel yaşam senaryosunda konuşma kalıplarını sesli dinleyin ve durumsal testlerle pekiştirin.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all duration-200 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  {getIcon(item.icon)}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {item.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-0.5">{item.title}</h3>
              <p className="text-xs font-semibold text-emerald-400 mb-2">{item.englishTitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Sample phrases preview */}
              <div className="space-y-1 mb-4">
                {(item.keyPhrases || []).slice(0, 2).map((kp, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                    <b className="text-emerald-400">{kp.phrase}</b> ({kp.meaning})
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenScenario(item)}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10 transition flex items-center justify-center gap-1.5"
            >
              <span>Diyaloğu Başlat & Dinle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Scenario Detail Modal */}
      {activeScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                  {getIcon(activeScenario.icon)}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{activeScenario.title}</h3>
                  <p className="text-xs text-slate-400">{activeScenario.englishTitle}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveScenario(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: Karşılıklı Diyalog vs Durum Testi */}
            <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('dialogue')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                  activeTab === 'dialogue'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Karşılıklı Diyalog & Sesli Telaffuz</span>
                <span className="sm:hidden">Diyaloglar</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                  activeTab === 'quiz'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Durum Testi (5 Soru)</span>
                <span className="sm:hidden">Test (5 Soru)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {activeTab === 'dialogue' ? (
                <div className="space-y-6">
                  {/* Key Phrases Box */}
                  <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                      💡 Bu Senaryoda Hayat Kurtaran Kalıplar:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeScenario.keyPhrases?.map((kp, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-white font-semibold">{kp.phrase}</span>
                          <span className="text-slate-400 italic text-[11px] ml-2">{kp.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Lines */}
                  <div className="space-y-3">
                    {activeScenario.dialogues?.map((d, idx) => {
                      const isFirstSpeaker = idx % 2 === 0;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                            isFirstSpeaker
                              ? 'bg-slate-800/80 border-slate-700/80 ml-0 sm:mr-8'
                              : 'bg-slate-850/80 border-teal-500/20 mr-0 sm:ml-8'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                              {d.speaker}:
                            </span>
                            <p className="text-sm sm:text-base font-semibold text-white">
                              {d.textEn}
                            </p>
                            <p className="text-xs text-slate-400 italic">
                              {d.textTr}
                            </p>
                            {/* Speech Feedback for line */}
                            {speechFeedback[idx] && (
                              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                                speechFeedback[idx].type === 'success'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : speechFeedback[idx].type === 'warning'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : speechFeedback[idx].type === 'error'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                              }`}>
                                <span>{speechFeedback[idx].text}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => speak(d.textEn)}
                              className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 transition"
                              title="Sesli Dinle"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleListenLine(idx, d.textEn)}
                              className={`p-2.5 rounded-xl border transition ${
                                listeningLineIdx === idx
                                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                                  : 'bg-slate-900 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border-slate-700'
                              }`}
                              title="Mikrofonla Cümleyi Seslendir"
                            >
                              {listeningLineIdx === idx ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
                    >
                      <span>Durum Testine Geç (5 Soru)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Scenario Quiz */
                <div className="space-y-6">
                  {isQuizSubmitted && (
                    <div className={`p-6 rounded-3xl border text-center ${
                      quizScore >= 60
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      <Award className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                      <h4 className="text-xl font-bold">
                        {quizScore >= 60 ? 'Tebrikler! Senaryoyu Başarıyla Tamamladınız!' : 'Senaryoyu Tekrar İnceleyin'}
                      </h4>
                      <p className="text-3xl font-black text-white my-2">%{quizScore}</p>
                      <p className="text-xs text-slate-300">
                        {activeScenario.quiz?.length || 5} soru üzerinden değerlendirildi.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeScenario.quiz?.map((q, qIdx) => {
                      const selected = quizAnswers[qIdx];
                      const isCorrect = isQuizSubmitted && selected === q.answerIndex;

                      return (
                        <div key={qIdx} className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                          <h5 className="text-sm sm:text-base font-bold text-white">
                            <span className="text-emerald-400 mr-2">{qIdx + 1}.</span> {q.question}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selected === optIdx;
                              const isCorrectOption = isQuizSubmitted && optIdx === q.answerIndex;

                              let btnClass = 'bg-slate-900 border-slate-700/80 text-slate-200 hover:bg-slate-850';
                              if (isSelected) btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500';
                              if (isQuizSubmitted) {
                                if (isCorrectOption) btnClass = 'bg-emerald-500/30 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500';
                                else if (isSelected && !isCorrectOption) btnClass = 'bg-rose-500/30 border-rose-500 text-rose-300 line-through';
                                else btnClass = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={isQuizSubmitted}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`p-3 rounded-xl border text-xs sm:text-sm text-left transition ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isQuizSubmitted && q.explanation && (
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                              💡 <b>Açıklama:</b> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    {isQuizSubmitted ? (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setIsQuizSubmitted(false);
                          setQuizScore(0);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Testi Tekrar Çöz</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < (activeScenario.quiz?.length || 5)}
                        className="ml-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
                      >
                        Testi Tamamla ve Puanla
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
