import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit, Volume2, Download, Upload, Filter, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { speak } from '../services/speech';

export default function WordManagement({
  words,
  onAddWord,
  onUpdateWord,
  onDeleteWord,
  onBatchImport,
  selectedPos,
  setSelectedPos,
  selectedBox,
  setSelectedBox
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWord, setEditingWord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formWord, setFormWord] = useState('');
  const [formMeaning, setFormMeaning] = useState('');
  const [formPos, setFormPos] = useState('verb');
  const [formSentenceEn, setFormSentenceEn] = useState('');
  const [formSentenceTr, setFormSentenceTr] = useState('');
  const [formError, setFormError] = useState('');

  // Filter words
  const filteredWords = words.filter(w => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      (w.word && w.word.toLowerCase().includes(term)) ||
      (w.meaning && w.meaning.toLowerCase().includes(term)) ||
      (w.sentenceEn && w.sentenceEn.toLowerCase().includes(term)) ||
      (w.sentenceTr && w.sentenceTr.toLowerCase().includes(term));

    // Pos
    const matchPos = selectedPos === 'all' || w.partOfSpeech === selectedPos;

    // Box
    const matchBox = !selectedBox || (w.box || 1) === selectedBox;

    return matchSearch && matchPos && matchBox;
  });

  const openAddModal = () => {
    setEditingWord(null);
    setFormWord('');
    setFormMeaning('');
    setFormPos(selectedPos !== 'all' ? selectedPos : 'verb');
    setFormSentenceEn('');
    setFormSentenceTr('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (word) => {
    setEditingWord(word);
    setFormWord(word.word || '');
    setFormMeaning(word.meaning || '');
    setFormPos(word.partOfSpeech || 'verb');
    setFormSentenceEn(word.sentenceEn || '');
    setFormSentenceTr(word.sentenceTr || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formWord.trim() || !formMeaning.trim()) {
      setFormError('Lütfen İngilizce kelime ve Türkçe anlam alanlarını doldurun.');
      return;
    }

    try {
      if (editingWord) {
        await onUpdateWord(editingWord.id, {
          word: formWord.trim(),
          meaning: formMeaning.trim(),
          partOfSpeech: formPos,
          sentenceEn: formSentenceEn.trim(),
          sentenceTr: formSentenceTr.trim(),
        });
      } else {
        await onAddWord({
          word: formWord.trim(),
          meaning: formMeaning.trim(),
          partOfSpeech: formPos,
          sentenceEn: formSentenceEn.trim(),
          sentenceTr: formSentenceTr.trim(),
        });
      }
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(words, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ingilizce_kelimelerim_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          await onBatchImport(parsed);
          alert(`${parsed.length} kelime başarıyla yüklendi!`);
        } else {
          alert('Geçersiz JSON formatı.');
        }
      } catch (err) {
        alert('Dosya okunurken hata oluştu: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const getPosBadge = (pos) => {
    const map = {
      verb: { label: 'Fiil', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
      noun: { label: 'İsim', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      adjective: { label: 'Sıfat', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      adverb: { label: 'Zarf', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      idiom: { label: 'Deyim', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    };
    const current = map[pos] || { label: pos || 'Kelime', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${current.color}`}>
        {current.label}
      </span>
    );
  };

  const getBoxBadge = (box) => {
    const colors = {
      1: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      3: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      4: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      5: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${colors[box || 1]}`}>
        Kutu {box || 1}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kelime, anlam veya cümle ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON Yükle</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Dışa Aktar</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kelime</span>
          </button>
        </div>
      </div>

      {/* Word Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Toplam <b>{filteredWords.length}</b> kelime listeleniyor</span>
        {(selectedPos !== 'all' || selectedBox) && (
          <span className="text-emerald-400">
            Filtre aktif: {selectedPos !== 'all' ? selectedPos.toUpperCase() : ''} {selectedBox ? `(Kutu ${selectedBox})` : ''}
          </span>
        )}
      </div>

      {/* Words Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWords.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Header: Badges & Controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPosBadge(item.partOfSpeech)}
                  {getBoxBadge(item.box)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speak(item.word)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                    title="Telaffuz Dinle"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${item.word}" kelimesini silmek istediğinize emin misiniz?`)) {
                        onDeleteWord(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Word & Meaning */}
              <div className="mb-3">
                <h3 className="text-xl font-bold text-white tracking-wide">{item.word}</h3>
                <p className="text-sm font-medium text-emerald-400 mt-0.5">{item.meaning}</p>
              </div>

              {/* Example Sentences */}
              {item.sentenceEn && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-200 font-medium">{item.sentenceEn}</p>
                    <button
                      onClick={() => speak(item.sentenceEn)}
                      className="text-slate-400 hover:text-emerald-400 flex-shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.sentenceTr && (
                    <p className="text-slate-400 italic">{item.sentenceTr}</p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom info: stats */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Başarı: <b className="text-emerald-400">{item.successCount || 0}</b> / Hata: <b className="text-rose-400">{item.failCount || 0}</b></span>
              <span>Son: {item.lastReviewed ? new Date(item.lastReviewed).toLocaleDateString('tr-TR') : 'Henüz çalışılmadı'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingWord ? 'Kelimeyi Düzenle' : 'Yeni Kelime Ekle'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  İngilizce Kelime / Kalıp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: accomplish"
                  value={formWord}
                  onChange={(e) => setFormWord(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Türkçe Anlamı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: başarmak, tamamlamak"
                  value={formMeaning}
                  onChange={(e) => setFormMeaning(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelime Türü (Otomatik İlgili Havuza Gider)
                </label>
                <select
                  value={formPos}
                  onChange={(e) => setFormPos(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="verb">Fiil (Verb)</option>
                  <option value="noun">İsim (Noun)</option>
                  <option value="adjective">Sıfat (Adjective)</option>
                  <option value="adverb">Zarf (Adverb)</option>
                  <option value="idiom">Deyim / Kalıp (Idiom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  İngilizce Örnek Cümle (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: You can accomplish anything with focus."
                  value={formSentenceEn}
                  onChange={(e) => setFormSentenceEn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cümlenin Türkçe Çevirisi (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Odaklanarak her şeyi başarabilirsin."
                  value={formSentenceTr}
                  onChange={(e) => setFormSentenceTr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold transition shadow-md shadow-emerald-500/20"
                >
                  {editingWord ? 'Değişiklikleri Kaydet' : 'Kelimeyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
