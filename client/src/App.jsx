import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import FlashcardStudy from './components/FlashcardStudy';
import SentenceCompletion from './components/SentenceCompletion';
import TranslationPractice from './components/TranslationPractice';
import WordManagement from './components/WordManagement';
import AcademyCourse from './components/AcademyCourse';
import ConversationScenarios from './components/ConversationScenarios';
import AudioSettingsModal from './components/AudioSettingsModal';
import OnboardingGuideModal from './components/OnboardingGuideModal';
import MistakeNotebookModal from './components/MistakeNotebookModal';
import { fetchWords, fetchStats, addWord, updateWord, deleteWord, reviewWord, batchImportWords } from './services/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('academy');
  const [selectedPos, setSelectedPos] = useState('all');
  const [selectedBox, setSelectedBox] = useState(null);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMistakesOpen, setIsMistakesOpen] = useState(false);

  const [words, setWords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick Add Modal state managed at top level or triggered via Navbar
  const [openAddTrigger, setOpenAddTrigger] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [wordsRes, statsRes] = await Promise.all([
        fetchWords({ partOfSpeech: selectedPos, box: selectedBox }),
        fetchStats()
      ]);
      setWords(wordsRes.data || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Data load error:', err);
      setError('Sunucuya bağlanılamadı. Lütfen sunucunun (port 3001) çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  }, [selectedPos, selectedBox]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Review handler (SRS Progression)
  const handleReview = async (id, isCorrect) => {
    try {
      await reviewWord(id, isCorrect);
      // Refresh stats in background
      const statsRes = await fetchStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Review update failed:', err);
    }
  };

  // Add word
  const handleAddWord = async (wordData) => {
    await addWord(wordData);
    await loadData();
  };

  // Update word
  const handleUpdateWord = async (id, wordData) => {
    await updateWord(id, wordData);
    await loadData();
  };

  // Delete word
  const handleDeleteWord = async (id) => {
    await deleteWord(id);
    await loadData();
  };

  // Batch import
  const handleBatchImport = async (items) => {
    await batchImportWords(items);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPos={selectedPos}
        setSelectedPos={setSelectedPos}
        onOpenAddModal={() => {
          setActiveTab('words');
        }}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenMistakes={() => setIsMistakesOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Leitner Stats Overview (Shown for Vocabulary and Practice modes) */}
        {['flashcards', 'sentences', 'translation', 'words'].includes(activeTab) && (
          <StatsOverview
            stats={stats}
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Veriler yükleniyor...</p>
          </div>
        )}

        {/* Connection Error Message */}
        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Bağlantı Hatası</h3>
            <p className="text-xs text-rose-300 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Active Tab Content */}
        {!loading && !error && (
          <div>
            {activeTab === 'academy' && (
              <AcademyCourse />
            )}

            {activeTab === 'scenarios' && (
              <ConversationScenarios />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardStudy
                words={words}
                onReview={handleReview}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'sentences' && (
              <SentenceCompletion
                words={words}
                onReview={handleReview}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'translation' && (
              <TranslationPractice
                words={words}
                onReview={handleReview}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'words' && (
              <WordManagement
                words={words}
                onAddWord={handleAddWord}
                onUpdateWord={handleUpdateWord}
                onDeleteWord={handleDeleteWord}
                onBatchImport={handleBatchImport}
                selectedPos={selectedPos}
                setSelectedPos={setSelectedPos}
                selectedBox={selectedBox}
                setSelectedBox={setSelectedBox}
              />
            )}
          </div>
        )}
      </main>

      {/* Audio Settings Modal */}
      {isAudioSettingsOpen && (
        <AudioSettingsModal onClose={() => setIsAudioSettingsOpen(false)} />
      )}

      {/* Onboarding Guide Modal */}
      {isOnboardingOpen && (
        <OnboardingGuideModal
          onClose={() => setIsOnboardingOpen(false)}
          onStartLearning={() => {
            setIsOnboardingOpen(false);
            setActiveTab('academy');
          }}
        />
      )}

      {/* Mistake Notebook Modal */}
      {isMistakesOpen && (
        <MistakeNotebookModal
          onClose={() => setIsMistakesOpen(false)}
          onMistakesUpdated={() => {}}
        />
      )}
    </div>
  );
}
