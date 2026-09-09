import React from 'react';
import { X, Sparkles, Compass, CheckCircle2, ArrowRight, Flame, BookOpen, Volume2, Languages, Award } from 'lucide-react';

export default function OnboardingGuideModal({ onClose, onStartLearning }) {
  const steps = [
    {
      num: "1",
      title: "Akademi'den Seviye Üniteleriyle Başlayın",
      desc: "Önce A1 Ünite 1 (To Be) ile başlayın. Renkli formül şemalarını inceleyin ve Türkçeden düşünürken en çok yapılan tuzak hataları öğrenin.",
      icon: BookOpen,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30"
    },
    {
      num: "2",
      title: "Sesli Telaffuzları Dinleyin ve Tekrarlayın",
      desc: "Her ünitedeki gerçek hayat diyaloglarında ve kelimelerde hoparlör butonuna basarak doğru aksanla dinleyin ve sesli olarak tekrar edin.",
      icon: Volume2,
      color: "from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/30"
    },
    {
      num: "3",
      title: "Ünite Testleriyle Bilginizi Sınayın",
      desc: "Her ünite sonunda tam 100 soru bulunur. Hızlı pratik için 10 soru çözün veya 100 soruluk ünite sınavıyla konuyu kalıcı hale getirin.",
      icon: CheckCircle2,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
    },
    {
      num: "4",
      title: "Günlük Senaryolar & Kelime Pratiği Yapın",
      desc: "Havalimanı, kafe veya otel senaryolarını uygulayın; 'Kelime Çalışma' ve 'Çeviri' sekmelerinde Leitner 5 Kutu sistemiyle kelimeleri hafızanıza kazıyın.",
      icon: Languages,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                Başarı Rehberi
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Sıfırdan A1 & A2 İngilizce Nasıl Öğrenilir?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Steps */}
        <div className="space-y-3.5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} border flex items-center justify-center flex-shrink-0 font-black text-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                    <span className="text-emerald-400 mr-1.5">Adım {step.num}:</span>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Motivation tip */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <Flame className="w-6 h-6 flex-shrink-0 text-amber-400" />
          <span>
            <b>Günde Sadece 15 Dakika:</b> Düzenli çalışarak her gün 1 ünite ve 20 soru çözdüğünüzde 14 günde tüm A1-A2 müfredatını tamamlayabilirsiniz!
          </span>
        </div>

        {/* Start button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              onClose();
              onStartLearning && onStartLearning();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Hemen Öğrenmeye Başla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
