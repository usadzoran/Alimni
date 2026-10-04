import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Sparkles, User, Trophy, BookOpen, Hash, Gamepad2 } from 'lucide-react';
import { ChildProfile } from '../types';
import { audioService } from '../services/audioService';

interface HeaderProps {
  activeChild?: ChildProfile;
  activeTab: 'home' | 'letters' | 'numbers' | 'games' | 'levels' | 'rewards' | 'parent' | 'admin';
  onSelectTab: (tab: 'home' | 'letters' | 'numbers' | 'games' | 'levels' | 'rewards' | 'parent' | 'admin') => void;
  onOpenParentLock: () => void;
  onOpenProfilePicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeChild,
  activeTab,
  onSelectTab,
  onOpenParentLock,
  onOpenProfilePicker,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(audioService.isSoundEnabled());

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.setSoundEnabled(newState);
    if (newState) {
      audioService.playTap();
      audioService.speakArabic('تم تشغيل الصوت');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs px-4 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playTap();
              onSelectTab('home');
            }}
            className="flex items-center gap-2 text-right group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
              🎈
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black text-amber-900 tracking-tight block leading-tight">
                عالم الحروف والأرقام
              </span>
              <span className="text-xs text-amber-700/80 font-medium hidden sm:block">
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
        <div className="flex items-center gap-2 md:gap-3">
          {/* Child Profile Capsule */}
          {activeChild && (
            <button
              onClick={() => {
                audioService.playTap();
                onOpenProfilePicker();
              }}
              title="تبديل ملف الطفل"
              className="flex items-center gap-2 bg-amber-100/90 hover:bg-amber-200/90 px-3 py-1.5 rounded-2xl border border-amber-300 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xl shadow-2xs">
                {activeChild.avatar}
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-amber-900 block leading-tight">
                  {activeChild.name}
                </span>
                <span className="text-[10px] text-amber-700">
                  المستوى {activeChild.currentLevelId}
                </span>
              </div>
            </button>
          )}

          {/* Stars Pill */}
          <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-300 px-3 py-1.5 rounded-2xl font-black text-amber-900 text-sm">
            <span className="text-amber-500 text-base animate-pulse-subtle">⭐</span>
            <span className="tabular-nums font-bold">{activeChild?.stars ?? 0}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Parent Zone Access */}
          <button
            onClick={() => {
              audioService.playTap();
              onOpenParentLock();
            }}
            title="منطقة ولي الأمر والإدارة"
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">ولي الأمر</span>
          </button>
        </div>
      </div>
    </header>
  );
};
