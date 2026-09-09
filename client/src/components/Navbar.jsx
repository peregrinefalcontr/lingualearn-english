import React, { useState, useEffect } from 'react';
import { BookOpen, CheckSquare, Languages, ListFilter, PlusCircle, Sparkles, GraduationCap, MessageSquareQuote, Sliders, Flame, Target, Compass, BookX } from 'lucide-react';
import { getDailyProgress, getMistakes } from '../services/progressTracker';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedPos,
  setSelectedPos,
  onOpenAddModal,
  onOpenAudioSettings,
  onOpenOnboarding,
  onOpenMistakes
}) {
  const [progress, setProgress] = useState(getDailyProgress());
  const [mistakesCount, setMistakesCount] = useState(getMistakes().length);

  useEffect(() => {
    const update = () => {
      setProgress(getDailyProgress());
      setMistakesCount(getMistakes().length);
    };

    window.addEventListener('lingua_progress_updated', update);
    return () => window.removeEventListener('lingua_progress_updated', update);
  }, []);

  const tabs = [
    { id: 'academy', label: 'A1-A2 Akademi', icon: GraduationCap },
    { id: 'scenarios', label: 'Günlük Senaryolar', icon: MessageSquareQuote },
    { id: 'flashcards', label: 'Kelime Çalışma', icon: BookOpen },
    { id: 'sentences', label: 'Cümle Tamamlama', icon: CheckSquare },
    { id: 'translation', label: 'Çeviri Yapma', icon: Languages },
    { id: 'words', label: 'Kelimelerim & Yönetim', icon: ListFilter },
  ];

  const posOptions = [
    { id: 'all', label: 'Tüm Kelimeler' },
    { id: 'verb', label: 'Fiiller (Verbs)' },
    { id: 'noun', label: 'İsimler (Nouns)' },
    { id: 'adjective', label: 'Sıfatlar (Adjectives)' },
    { id: 'adverb', label: 'Zarflar (Adverbs)' },
    { id: 'idiom', label: 'Deyimler (Idioms)' },
  ];

  const goalReached = (progress.todayCount || 0) >= (progress.goal || 20);

  const showPosFilter = ['flashcards', 'sentences', 'translation', 'words'].includes(activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Tier 1: Brand Logo & User Activity / Utilities Toolbar */}
          <div className="flex items-center justify-between h-14 sm:h-16 border-b border-slate-800/70 gap-2">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => setActiveTab('academy')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-200 to-white bg-clip-text text-transparent tracking-tight">
                    LinguaLearn
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    A1-A2
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                  İnteraktif İngilizce Öğrenim Platformu
                </p>
              </div>
            </div>

            {/* Right Status & Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Daily Streak */}
              <div
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm"
                title={`Günlük Seri: ${progress.streak} gün aralıksız!`}
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
                <span>{progress.streak}g</span>
              </div>

              {/* Daily Goal */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition ${
                  goalReached
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
                title={`Günün Hedefi: ${progress.todayCount} / ${progress.goal} tamamlandı`}
              >
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>{progress.todayCount}/{progress.goal}</span>
              </div>

              {/* Mistake Notebook Button */}
              <button
                onClick={onOpenMistakes}
                className={`relative flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition ${
                  mistakesCount > 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
                title="Akıllı Hata Defterim"
              >
                <BookX className="w-4 h-4 text-rose-400" />
                <span className="hidden md:inline">Hatalar</span>
                {mistakesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[10px]">
                    {mistakesCount}
                  </span>
                )}
              </button>

              {/* Guide Button */}
              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-bold transition"
                title="Nasıl Çalışmalıyım? Başarı Rehberi"
              >
                <Compass className="w-4 h-4" />
                <span className="hidden md:inline">Rehber</span>
              </button>

              {/* Audio Settings */}
              <button
                onClick={onOpenAudioSettings}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
                title="Ses ve Telaffuz Ayarları"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Quick Add Button */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs p-2 sm:px-3.5 sm:py-2 rounded-xl shadow-md shadow-emerald-500/10 transition-all transform active:scale-95"
                title="Yeni Kelime Ekle"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Kelime Ekle</span>
              </button>
            </div>
          </div>

          {/* Tier 2: 6 Learning Mode Tabs & Dynamic Filters */}
          <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-4 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {/* Main Course Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Contextual Category Selector (Only for Vocabulary tabs) */}
            {showPosFilter && (
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 pl-2 sm:pl-3 border-l border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden lg:inline mr-1">
                  Filtre:
                </span>
                {posOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPos(opt.id)}
                    className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedPos === opt.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white'
                    }`}
                  >
                    {opt.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb friendly for phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-lg flex items-center justify-around py-2 px-1 safe-area-bottom shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
