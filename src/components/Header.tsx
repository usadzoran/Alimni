import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, User, Trophy, BookOpen, Hash, Gamepad2, Check } from 'lucide-react';
import { ChildProfile } from '../types';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

export type AppTab =
  | 'home'
  | 'letters'
  | 'numbers'
  | 'games'
  | 'practice'
  | 'stories'
  | 'levels'
  | 'rewards';

interface HeaderProps {
  activeChild?: ChildProfile;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenProfilePicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeChild,
  activeTab,
  onSelectTab,
  onOpenProfilePicker,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(audioService.isSoundEnabled());
  const [soundToast, setSoundToast] = useState<string | null>(null);

  useEffect(() => {
    // Sync initial state with storage
    const settings = storageService.getSettings();
    if (typeof settings.soundEnabled === 'boolean') {
      setSoundEnabled(settings.soundEnabled);
      audioService.setSoundEnabled(settings.soundEnabled);
    }
  }, []);

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioService.unlockAudio();

    if (!soundEnabled) {
      // Turn sound ON
      setSoundEnabled(true);
      audioService.setSoundEnabled(true);
      storageService.updateSettings({ soundEnabled: true });
      audioService.playCorrect();
      audioService.speakArabic('تم تشغيل الصوت بنجاح!');
      setSoundToast('🔊 تم تفعيل الصوت بنجاح');
    } else {
      // Toggle to sound test OR mute
      // If user clicks, play the audio test first!
      audioService.playSoundButtonTest();
      setSoundToast('🔊 الصوت يعمل بشكل ممتاز!');
    }

    setTimeout(() => {
      setSoundToast(null);
    }, 3500);
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.setSoundEnabled(newState);
    storageService.updateSettings({ soundEnabled: newState });

    if (newState) {
      audioService.playCorrect();
      audioService.speakArabic('تم تشغيل الصوت');
      setSoundToast('🔊 تم تشغيل الصوت');
    } else {
      audioService.stopAll();
      setSoundToast('🔇 تم كتم الصوت');
    }

    setTimeout(() => {
      setSoundToast(null);
    }, 2500);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs px-2.5 sm:px-4 md:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 md:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('home');
            }}
            className="flex items-center gap-1.5 sm:gap-2 text-right group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-xl sm:text-2xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
              🎈
            </div>
            <div>
              <span className="text-base sm:text-xl md:text-2xl font-black text-amber-900 tracking-tight block leading-tight">
                عالم الحروف والأرقام
              </span>
              <span className="text-[11px] text-amber-700/80 font-medium hidden md:block">
                مغامرات ممتعة للأذكياء الصغار
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Zone */}
        <nav className="hidden lg:flex items-center gap-2 bg-amber-50/80 p-1.5 rounded-2xl border border-amber-100">
          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('home');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-white text-amber-700 shadow-xs scale-102'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <span>🏠</span>
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('letters');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'letters'
                ? 'bg-blue-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الحروف</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('numbers');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'numbers'
                ? 'bg-emerald-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>الأرقام</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('games');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'bg-purple-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>الألعاب</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('levels');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'levels'
                ? 'bg-amber-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>المستويات</span>
          </button>

          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('rewards');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-rose-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>مكافآتي</span>
          </button>
        </nav>

        {/* Action & Child Zone */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          {/* Child Profile Capsule */}
          {activeChild && (
            <button
              onClick={() => {
                audioService.playTap();
                onOpenProfilePicker();
              }}
              title="تبديل ملف الطفل"
              className="flex items-center gap-1.5 bg-amber-100/90 hover:bg-amber-200/90 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-amber-300 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-lg sm:text-xl shadow-2xs">
                {activeChild.avatar}
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-amber-900 block leading-tight">
                  {[activeChild.name, activeChild.lastName].filter(Boolean).join(' ')}
                </span>
                <span className="text-[10px] text-amber-700">
                  المستوى {activeChild.currentLevelId}
                </span>
              </div>
            </button>
          )}

          {/* Stars Pill */}
          <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl font-black text-amber-900 text-xs sm:text-sm">
            <span className="text-amber-500 text-sm sm:text-base animate-pulse-subtle">⭐</span>
            <span className="tabular-nums font-bold">{activeChild?.stars ?? 0}</span>
          </div>

          {/* Sound Controls with Instant Test and Feedback */}
          <div className="relative flex items-center">
            <button
              onClick={handleSoundToggle}
              title={soundEnabled ? 'انقر لتجربة وفحص الصوت' : 'انقر لتفعيل الصوت'}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-xs active:scale-95'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 active:scale-95'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-pulse" />
                  <span className="text-[11px] font-black hidden md:inline">الصوت</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  <span className="text-[11px] font-black hidden md:inline">مكتوم</span>
                </>
              )}
            </button>

            {/* Quick Mute mini button */}
            {soundEnabled && (
              <button
                onClick={handleMuteToggle}
                title="كتم الصوت تماماً"
                className="mr-1 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Floating Sound Status Toast */}
            {soundToast && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-50 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap animate-fade-in pointer-events-none">
                {soundToast}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
