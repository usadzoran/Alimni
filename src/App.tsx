import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/home/HomeView';
import { LettersLearningView } from './components/letters/LettersLearningView';
import { NumbersLearningView } from './components/numbers/NumbersLearningView';
import { GamesHub } from './components/games/GamesHub';
import { LevelsRoadmapView } from './components/levels/LevelsRoadmapView';
import { RewardsView } from './components/rewards/RewardsView';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ParentLockModal } from './components/auth/ParentLockModal';
import { ChildProfilePickerModal } from './components/auth/ChildProfilePickerModal';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { BookOpen, Hash, Gamepad2, Trophy, Sparkles, Home } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'letters' | 'numbers' | 'games' | 'levels' | 'rewards' | 'parent' | 'admin'
  >('home');

  const [activeGameId, setActiveGameId] = useState<string | undefined>(undefined);
  const [parentLockOpen, setParentLockOpen] = useState<boolean>(false);
  const [targetTabAfterUnlock, setTargetTabAfterUnlock] = useState<'parent' | 'admin'>('parent');
  const [profilePickerOpen, setProfilePickerOpen] = useState<boolean>(false);

  // Sync state with storageService
  const [child, setChild] = useState(storageService.getActiveChild());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setChild(storageService.getActiveChild());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Track study time every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      storageService.addStudyTime(1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenParentLock = (target: 'parent' | 'admin' = 'parent') => {
    setTargetTabAfterUnlock(target);
    setParentLockOpen(true);
  };

  const handleParentUnlockSuccess = () => {
    setParentLockOpen(false);
    setActiveTab(targetTabAfterUnlock);
  };

  const handleNavigateFromHome = (
    tab: 'letters' | 'numbers' | 'games' | 'levels' | 'rewards' | 'parent',
    extra?: string
  ) => {
    if (tab === 'parent') {
      handleOpenParentLock('parent');
    } else {
      if (tab === 'games' && extra) {
        setActiveGameId(extra);
      } else {
        setActiveGameId(undefined);
      }
      setActiveTab(tab);
    }
  };

  const currentChild = child || storageService.getActiveChild();

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col selection:bg-amber-200">
      {/* Universal Top Bar */}
      <Header
        activeChild={currentChild}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'parent' || tab === 'admin') {
            handleOpenParentLock(tab);
          } else {
            setActiveGameId(undefined);
            setActiveTab(tab);
          }
        }}
        onOpenParentLock={() => handleOpenParentLock('parent')}
        onOpenProfilePicker={() => setProfilePickerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {activeTab === 'home' && (
          <HomeView
            child={currentChild}
            onNavigate={handleNavigateFromHome}
            onOpenProfilePicker={() => setProfilePickerOpen(true)}
            onOpenParentGate={() => handleOpenParentLock('parent')}
          />
        )}

        {activeTab === 'letters' && <LettersLearningView child={currentChild} />}

        {activeTab === 'numbers' && <NumbersLearningView child={currentChild} />}

        {activeTab === 'games' && (
          <GamesHub
            child={currentChild}
            initialGameId={activeGameId}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'levels' && (
          <LevelsRoadmapView
            child={currentChild}
            onNavigateToContent={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'rewards' && <RewardsView child={currentChild} />}

        {activeTab === 'parent' && (
          <ParentDashboard
            onBackToApp={() => setActiveTab('home')}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onBackToApp={() => setActiveTab('home')} />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation (Touch-Friendly, <= 15% viewport height) */}
      <nav className="lg:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-amber-200 px-2 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] shadow-lg">
        <div className="grid grid-cols-5 gap-1 text-center">
          <button
            onClick={() => {
              audioService.playTap();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-500'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">الرئيسية</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              setActiveTab('letters');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'letters' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">الحروف</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              setActiveTab('numbers');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'numbers' ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-500'
            }`}
          >
            <Hash className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">الأرقام</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              setActiveGameId(undefined);
              setActiveTab('games');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'games' ? 'text-purple-600 font-bold bg-purple-50' : 'text-slate-500'
            }`}
          >
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">الألعاب</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              setActiveTab('levels');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'levels' ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-500'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">المستويات</span>
          </button>
        </div>
      </nav>

      {/* Security & Profile Modals */}
      <ParentLockModal
        isOpen={parentLockOpen}
        onClose={() => setParentLockOpen(false)}
        onSuccess={handleParentUnlockSuccess}
      />

      <ChildProfilePickerModal
        isOpen={profilePickerOpen}
        onClose={() => setProfilePickerOpen(false)}
        activeChildId={child.id}
        onSelectChild={(id) => storageService.setActiveChildId(id)}
      />
    </div>
  );
}
