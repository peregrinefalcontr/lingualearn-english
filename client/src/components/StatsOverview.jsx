import React from 'react';
import { Award, BookOpen, BrainCircuit, CheckCircle2, Flame, Layers } from 'lucide-react';

export default function StatsOverview({ stats, selectedBox, setSelectedBox }) {
  if (!stats) return null;

  const boxColors = [
    { num: 1, label: 'Kutu 1', sub: 'Yeni / Tekrar', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', countBg: 'bg-rose-500/20' },
    { num: 2, label: 'Kutu 2', sub: 'Başlangıç', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', countBg: 'bg-amber-500/20' },
    { num: 3, label: 'Kutu 3', sub: 'Gelişme', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', countBg: 'bg-sky-500/20' },
    { num: 4, label: 'Kutu 4', sub: 'İleri Seviye', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', countBg: 'bg-indigo-500/20' },
    { num: 5, label: 'Kutu 5', sub: 'Öğrenildi (Hafızada)', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', countBg: 'bg-emerald-500/20' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Toplam Kelime</p>
            <p className="text-xl font-bold text-white">{stats.totalWords || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Öğrenilmekte</p>
            <p className="text-xl font-bold text-sky-300">{stats.learningWords || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Kalıcı Hafızada (K5)</p>
            <p className="text-xl font-bold text-teal-300">{stats.masteredWords || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Başarı Oranı</p>
            <p className="text-xl font-bold text-amber-300">%{stats.accuracy || 0}</p>
          </div>
        </div>
      </div>

      {/* 5 Leitner Boxes Row */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-300">Leitner 5 Kutu Aralıklı Tekrar Dağılımı</h3>
          </div>
          {selectedBox && (
            <button
              onClick={() => setSelectedBox(null)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-2"
            >
              Filtreyi Temizle (Tümünü Göster)
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {boxColors.map((box) => {
            const count = (stats.boxCounts && stats.boxCounts[box.num]) || 0;
            const isSelected = selectedBox === box.num;

            return (
              <button
                key={box.num}
                onClick={() => setSelectedBox(isSelected ? null : box.num)}
                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border transition-all duration-200 text-center ${box.bg} ${box.border} ${
                  isSelected ? 'ring-2 ring-emerald-400 scale-[1.03] shadow-lg' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <span className={`text-[11px] sm:text-sm font-bold ${box.text}`}>{box.label}</span>
                </div>
                <div className={`text-base sm:text-2xl font-black ${box.text}`}>
                  {count}
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline-block mt-0.5">
                  {box.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
