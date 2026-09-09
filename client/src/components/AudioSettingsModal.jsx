import React, { useState, useEffect } from 'react';
import { X, Volume2, Sliders, Check, Globe } from 'lucide-react';
import { getSpeechSettings, saveSpeechSettings, speak } from '../services/speech';

export default function AudioSettingsModal({ onClose }) {
  const [settings, setSettings] = useState(getSpeechSettings());

  const accents = [
    { id: 'en-US', label: 'Amerikan İngilizcesi (US)', flag: '🇺🇸' },
    { id: 'en-GB', label: 'İngiliz İngilizcesi (UK)', flag: '🇬🇧' },
    { id: 'en-AU', label: 'Avustralya İngilizcesi (AU)', flag: '🇦🇺' },
  ];

  const speeds = [
    { rate: 0.75, label: '0.75x (Yavaş - Başlangıç)' },
    { rate: 0.85, label: '0.85x (Öğrenme Hızı - Önerilen)' },
    { rate: 1.0, label: '1.0x (Doğal / Normal)' },
    { rate: 1.15, label: '1.15x (Akıcı / Hızlı)' },
  ];

  const handleAccentChange = (lang) => {
    const updated = { ...settings, lang };
    setSettings(updated);
    saveSpeechSettings(updated);
  };

  const handleSpeedChange = (rate) => {
    const updated = { ...settings, rate };
    setSettings(updated);
    saveSpeechSettings(updated);
  };

  const handleTestAudio = () => {
    speak("Hello! This is how I will pronounce English words for you.", settings.lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ses ve Telaffuz Ayarları</h3>
              <p className="text-xs text-slate-400">Aksan ve konuşma hızını özelleştirin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accent Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>İngilizce Aksan Tercihi</span>
          </label>
          <div className="space-y-1.5">
            {accents.map((acc) => {
              const isSelected = settings.lang === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => handleAccentChange(acc.id)}
                  className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{acc.flag}</span>
                    <span>{acc.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Okuma Hızı</span>
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {speeds.map((s) => {
              const isSelected = Math.abs(settings.rate - s.rate) < 0.05;
              return (
                <button
                  key={s.rate}
                  onClick={() => handleSpeedChange(s.rate)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span>{s.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Audio & Close */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleTestAudio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Sesi Test Et</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
