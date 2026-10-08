import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/home/HomeView';
import { LettersLearningView } from './components/letters/LettersLearningView';
import { NumbersLearningView } from './components/numbers/NumbersLearningView';
import { GamesHub } from './components/games/GamesHub';
import { PracticeHub } from './components/practice/PracticeHub';
import { StoriesSongsHub } from './components/stories/StoriesSongsHub';
import { LevelsRoadmapView } from './components/levels/LevelsRoadmapView';
import { RewardsView } from './components/rewards/RewardsView';
import { PublicContactPage, PublicLibraryPage, SiteFooterLinks, trackSiteVisitOnce } from './components/site/PublicSitePages';
import { ChildProfilePickerModal } from './components/auth/ChildProfilePickerModal';
import { ChildOnboarding } from './components/auth/ChildOnboarding';
import { AgeGroupSelection, FutureGroupPage } from './components/auth/AgeGroupFlow';
import { LearningTrackActionsBar } from './components/auth/LearningTrackActionsBar';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { BookOpen, Hash, Gamepad2, Trophy, Sparkles, Home, ClipboardCheck } from 'lucide-react';
import { LearningTrack } from './types';

type SiteRoute = 'admin' | 'library' | 'contact' | null;

const resolveSiteRoute = (hash: string, search = ''): SiteRoute => {
  if (new URLSearchParams(search).get('alimni-admin') === '1') return 'admin';
  const route = hash.replace(/^#/, '').split('/')[0].split('?')[0];
  if (route === 'admin' || route === 'library' || route === 'contact') return route;
  return null;
};

const LazyAdminPortal = React.lazy(() => import('./components/admin/AdminPortal').then(({ AdminPortal }) => ({ default: AdminPortal })));

export default function App() {
  const [siteRoute, setSiteRoute] = useState<SiteRoute>(() => resolveSiteRoute(window.location.hash, window.location.search));
  const [activeTab, setActiveTab] = useState<
    'home' | 'letters' | 'numbers' | 'games' | 'practice' | 'stories' | 'levels' | 'rewards'
  >('home');

  const [activeGameId, setActiveGameId] = useState<string | undefined>(undefined);
  const [profilePickerOpen, setProfilePickerOpen] = useState<boolean>(false);
  const [ageGroupSelectionOpen, setAgeGroupSelectionOpen] = useState(false);

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
    if (siteRoute || ageGroupSelectionOpen || !child?.learningTrack) return;
    const timer = setInterval(() => {
      storageService.addStudyTime(1);
    }, 60000);
    return () => clearInterval(timer);
  }, [siteRoute, ageGroupSelectionOpen, child?.learningTrack]);

  useEffect(() => {
    const syncSiteRoute = () => setSiteRoute(resolveSiteRoute(window.location.hash, window.location.search));
    window.addEventListener('hashchange', syncSiteRoute);
    window.addEventListener('popstate', syncSiteRoute);
    void trackSiteVisitOnce();
    return () => {
      window.removeEventListener('hashchange', syncSiteRoute);
      window.removeEventListener('popstate', syncSiteRoute);
    };
  }, []);

  const handleNavigateFromHome = (
    tab: 'letters' | 'numbers' | 'games' | 'practice' | 'stories' | 'levels' | 'rewards',
    extra?: string
  ) => {
    if (tab === 'games' && extra) {
      setActiveGameId(extra);
    } else {
      setActiveGameId(undefined);
    }
    setActiveTab(tab);
  };

  const currentChild = child || storageService.getActiveChild();
  const openAgeGroupSelection = () => {
    audioService.playTap();
    setActiveTab('home');
    setActiveGameId(undefined);
    setAgeGroupSelectionOpen(true);
  };

  const closeSiteRoute = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('alimni-admin');
    url.hash = '';
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    setSiteRoute(null);
  };

  if (siteRoute === 'admin') return <React.Suspense fallback={<div dir="rtl" className="grid min-h-screen place-items-center bg-slate-950 text-white">جارٍ فتح لوحة الإدارة...</div>}><LazyAdminPortal onClose={closeSiteRoute} /></React.Suspense>;
  if (siteRoute === 'library') return <PublicLibraryPage onBack={closeSiteRoute} />;
  if (siteRoute === 'contact') return <PublicContactPage onBack={closeSiteRoute} />;

  if (!currentChild.lastName || !currentChild.age || !currentChild.gradeLevel) {
    return (
      <>
        <ChildOnboarding
          child={currentChild}
          onComplete={() => setChild(storageService.getActiveChild())}
        />
        <SiteFooterLinks />
      </>
    );
  }

  const childFullName = [currentChild.name, currentChild.lastName].filter(Boolean).join(' ');

  if (!currentChild.learningTrack || ageGroupSelectionOpen) {
    return (
      <>
        <AgeGroupSelection
          childName={childFullName}
          onSelectGroup={async (group: LearningTrack) => {
            await storageService.saveLearningTrack(currentChild.id, group);
            setAgeGroupSelectionOpen(false);
            setActiveTab('home');
            setActiveGameId(undefined);
          }}
        />
        <SiteFooterLinks />
      </>
    );
  }

  if (currentChild.learningTrack === '5-7') {
    return (
      <FutureGroupPage
        childName={childFullName}
        childAge={currentChild.age ?? 0}
        onBack={openAgeGroupSelection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col selection:bg-amber-200">
      {/* Universal Top Bar */}
      <Header
        activeChild={currentChild}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveGameId(undefined);
          setActiveTab(tab);
        }}
        onOpenProfilePicker={() => setProfilePickerOpen(true)}
      />

      <LearningTrackActionsBar
        track="2-4"
        onChangeGroup={openAgeGroupSelection}
        onExit={openAgeGroupSelection}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {activeTab === 'home' && (
          <HomeView
            child={currentChild}
            onNavigate={handleNavigateFromHome}
            onOpenProfilePicker={() => setProfilePickerOpen(true)}
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

        {activeTab === 'practice' && (
          <PracticeHub child={currentChild} onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'stories' && (
          <StoriesSongsHub child={currentChild} onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'levels' && (
          <LevelsRoadmapView
            child={currentChild}
            onNavigateToContent={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'rewards' && <RewardsView child={currentChild} />}

      </main>

      <SiteFooterLinks />

      {/* Mobile Sticky Bottom Navigation (Touch-Friendly, <= 15% viewport height) */}
      <nav className="lg:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-amber-200 px-2 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] shadow-lg">
        <div className="grid grid-cols-6 gap-1 text-center">
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
              setActiveTab('practice');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'practice' ? 'text-fuchsia-600 font-bold bg-fuchsia-50' : 'text-slate-500'
            }`}
          >
            <ClipboardCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">اختبارات</span>
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
      <ChildProfilePickerModal
        isOpen={profilePickerOpen}
        onClose={() => setProfilePickerOpen(false)}
        activeChildId={child.id}
        onSelectChild={(id) => storageService.setActiveChildId(id)}
      />
    </div>
  );
}
