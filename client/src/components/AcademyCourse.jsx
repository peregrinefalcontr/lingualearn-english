import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Award, PlayCircle, Sparkles, ChevronRight, Layers, GraduationCap, ShieldCheck } from 'lucide-react';
import LessonDetailModal from './LessonDetailModal';
import LevelExamModal from './LevelExamModal';
import { fetchLessons, completeLesson } from '../services/api';

export default function AcademyCourse() {
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', 'A1', 'A2'
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeExamLevel, setActiveExamLevel] = useState(null); // 'A1' or 'A2'

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await fetchLessons();
      setLessons(res.data || []);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleCompleteLesson = async (id, score) => {
    try {
      await completeLesson(id, score);
      await loadLessons();
      // Update selectedLesson object as well
      setSelectedLesson(prev => prev ? { ...prev, completed: true, quizScore: score } : null);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const filteredLessons = lessons.filter(l => {
    if (levelFilter === 'all') return true;
    return l.level === levelFilter;
  });

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const a1Completed = lessons.filter(l => l.level === 'A1' && l.completed).length;
  const a2Completed = lessons.filter(l => l.level === 'A2' && l.completed).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Progress */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>A1 & A2 İnteraktif İngilizce Müfredatı</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Sıfırdan İleriye: Konu Anlatımı, Formüller ve Testler
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Her ünitede formül şemalarını inceleyin, Türkçeden düşünme tuzaklarını öğrenin, sesli konuşma diyaloglarını dinleyin ve 5 soruluk kavrama testiyle pekiştirin.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-extrabold text-lg shadow-lg shadow-emerald-500/10">
              %{progressPercent}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Toplam İlerleme</p>
              <p className="text-lg font-black text-white">{completedLessons} / {totalLessons} Ünite</p>
              <p className="text-[11px] text-emerald-400">A1: {a1Completed}/7 • A2: {a2Completed}/7</p>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Level Bitirme Sınavı Aksiyon Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A1 Sınavı Kartı */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Seviye Değerlendirme</span>
              <h3 className="text-base font-bold text-white">🏆 A1 Seviye Bitirme Sınavı</h3>
              <p className="text-xs text-slate-400">20 Soru • Başarı Sertifika Rozeti</p>
            </div>
          </div>

          <button
            onClick={() => setActiveExamLevel('A1')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
          >
            <span>Sınava Gir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* A2 Sınavı Kartı */}
        <div className="bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">İleri Seviye</span>
              <h3 className="text-base font-bold text-white">🏆 A2 Seviye Bitirme Sınavı</h3>
              <p className="text-xs text-slate-400">20 Soru • Başarı Sertifika Rozeti</p>
            </div>
          </div>

          <button
            onClick={() => setActiveExamLevel('A2')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5"
          >
            <span>Sınava Gir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              levelFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Tüm Üniteler (14)
          </button>
          <button
            onClick={() => setLevelFilter('A1')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              levelFilter === 'A1'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            A1 Seviyesi (7)
          </button>
          <button
            onClick={() => setLevelFilter('A2')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              levelFilter === 'A2'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            A2 Seviyesi (7)
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden lg:inline-block flex-shrink-0">
          {filteredLessons.length} ders listeleniyor
        </span>
      </div>

      {/* Lesson Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const isA1 = lesson.level === 'A1';

          return (
            <div
              key={lesson.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-md ${
                lesson.completed
                  ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Level Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isA1
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  }`}>
                    {lesson.level} • Ünite {lesson.unitNumber}
                  </span>

                  {lesson.completed ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tamamlandı ({lesson.quizScore}%)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Henüz Başlanmadı
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-lg font-bold text-white mb-1.5">{lesson.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {lesson.subtitle}
                </p>

                {/* Formula Snippet */}
                {lesson.formula?.positive && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-300 truncate mb-4">
                    <span className="text-emerald-400 font-bold mr-1.5">Kalıp:</span>
                    {lesson.formula.positive}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {lesson.quiz?.length || 5} Test Sorusu • Sesli Diyalog
                </span>

                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    lesson.completed
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{lesson.completed ? 'Tekrar İncele' : 'Dersi Başlat'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Level Final Exam Modal */}
      {activeExamLevel && (
        <LevelExamModal
          level={activeExamLevel}
          onClose={() => setActiveExamLevel(null)}
        />
      )}
    </div>
  );
}
