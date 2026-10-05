import React from 'react';
import { BookOpen, Hash, Sparkles, Trophy, Gamepad2, Play, Flame, ArrowLeft, HeartHandshake, CheckCircle } from 'lucide-react';
import { ChildProfile } from '../../types';
import { MascotGuide } from '../MascotGuide';
import { audioService } from '../../services/audioService';

interface HomeViewProps {
  child: ChildProfile;
  onNavigate: (tab: 'letters' | 'numbers' | 'games' | 'practice' | 'levels' | 'rewards' | 'parent', extra?: string) => void;
  onOpenProfilePicker: () => void;
  onOpenParentGate: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  child,
  onNavigate,
  onOpenProfilePicker,
  onOpenParentGate,
}) => {
  // Calculations with safe fallbacks
  const masteredLetters = Array.isArray(child?.masteredLetters) ? child.masteredLetters : [];
  const masteredNumbers = Array.isArray(child?.masteredNumbers) ? child.masteredNumbers : [];
  const lettersProgressPercent = Math.round((masteredLetters.length / 28) * 100);
  const numbersProgressPercent = Math.round((masteredNumbers.length / 10) * 100); // base 10 for level 1
  const overallProgress = Math.round((lettersProgressPercent + numbersProgressPercent) / 2);

  const handleStartLearning = () => {
    audioService.playTap();
    audioService.speakArabic(`أهلاً بك يا ${child?.name || 'بطلنا'}! هيا نتعلم معاً الحروف والأرقام`);
    // Intelligent continue: if letters < 10, go to letters; otherwise check numbers
    if (masteredLetters.length < 10) {
      onNavigate('letters');
    } else {
      onNavigate('numbers');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 sm:p-6 md:p-10 text-white shadow-lg">
        {/* Playful Floating Decors */}
        <div className="absolute -top-6 -right-6 text-7xl opacity-20 pointer-events-none select-none">
          🎈
        </div>
        <div className="absolute -bottom-6 -left-6 text-8xl opacity-15 pointer-events-none select-none">
          ⭐
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right space-y-2 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-white border border-white/30 mb-1">
              <span>🎉</span>
              <span>أهلاً وسهلاً بك في</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight drop-shadow-xs">
              عالم الحروف والأرقام
            </h1>
            <p className="text-amber-100 font-medium text-sm sm:text-base md:text-lg max-w-xl">
              رحلة مشوقة وتفاعلية بالصوت والألعاب لنتعلم لغتنا العربية الجميلة ونعد الأرقام بمرح!
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center md:justify-start gap-2 sm:gap-3">
              <button
                onClick={handleStartLearning}
                className="bg-white hover:bg-amber-50 text-amber-900 font-black px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base md:text-lg hover:scale-102 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-amber-700 text-amber-700" />
                <span>ابدأ التعلم الآن</span>
              </button>

              <button
                onClick={() => {
                  audioService.playTap();
                  onOpenProfilePicker();
                }}
                className="bg-amber-600/60 hover:bg-amber-700/60 border border-white/40 text-white font-bold px-4 py-3 rounded-2xl backdrop-blur-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span className="text-lg">{child.avatar}</span>
                <span>تبديل الطفل ({child.name})</span>
              </button>

              <button
                onClick={() => {
                  audioService.playTap();
                  onOpenParentGate();
                }}
                className="bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold px-4 py-3 rounded-2xl backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>إشراف ولي الأمر</span>
              </button>
            </div>
          </div>

          {/* Child Card Widget */}
          <div className="w-full md:w-auto shrink-0 bg-white/90 backdrop-blur-md rounded-3xl p-5 text-slate-800 shadow-md border border-white/50 text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-200 to-orange-200 border-4 border-white shadow-sm flex items-center justify-center text-4xl mx-auto">
                {child.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                م {child.currentLevelId}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{child.name}</h3>
              <p className="text-xs text-slate-500 font-medium">الفئة العمرية: {child.ageGroup} سنوات</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="bg-amber-50 p-2 rounded-xl">
                <span className="text-amber-500 text-sm">⭐ النجوم</span>
                <p className="text-lg font-black text-amber-900 tabular-nums">{child.stars}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-xl">
                <span className="text-blue-500 text-sm">🎯 التقدم</span>
                <p className="text-lg font-black text-blue-900 tabular-nums">{overallProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Encouraging Mascot Guide */}
      <MascotGuide mascotId={child.unlockedCharacters[0] || 'farfour_rabbit'} />

      {/* Child Progress Bar Banner */}
      <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-base md:text-lg">
              مستوى تقدم البطل {child.name}
            </h3>
          </div>
          <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {child.masteredLetters.length} حروف · {child.masteredNumbers.length} أرقام
          </span>
        </div>

        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(5, overallProgress)}%` }}
          />
        </div>
      </div>

      {/* 6 Large Illustrated Section Cards */}
      <button
        onClick={() => {
          audioService.playTap();
          onNavigate('practice');
        }}
        className="group relative overflow-hidden rounded-3xl border border-purple-300 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 p-5 text-right text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl md:p-6"
      >
        <div className="absolute -left-4 -top-8 text-8xl opacity-15">🎮</div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl transition-transform group-hover:scale-110">🏆</span>
            <div>
              <span className="text-xs font-bold text-purple-200">مختبر المرح والتحدي</span>
              <h2 className="mt-1 text-2xl font-black">اختبارات وألعاب تعليمية جديدة</h2>
              <p className="mt-1 text-sm text-purple-100">اختبر الحروف والأرقام، العب الذاكرة، وعدّ الأشياء واربح النجوم!</p>
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-purple-700 transition group-hover:bg-purple-50">
            ابدأ التحدي <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* 1. Learn Letters */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('letters');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-blue-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🦁</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
              القسم الأول
            </span>
            <h2 className="text-2xl font-black">تعلم الحروف</h2>
            <p className="text-blue-100 text-sm font-medium">
              نطق الحروف العربية من أ إلى ي بالصوت والكلمات المصورة وأشكال الحرف.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-100 group-hover:text-white">
            <span>ابدأ الآن</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 2. Learn Numbers */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('numbers');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-emerald-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🔢</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Hash className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
              القسم الثاني
            </span>
            <h2 className="text-2xl font-black">تعلم الأرقام</h2>
            <p className="text-emerald-100 text-sm font-medium">
              الأرقام من 0 إلى 100 مع نطق صوتي رائع، عد الفواكه والحيوانات، والمقارنات.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-100 group-hover:text-white">
            <span>ابدأ العد</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 3. Listen and Choose Games */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('games', 'listen_letter');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-purple-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🎧</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Gamepad2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block">
              القسم الثالث
            </span>
            <h2 className="text-2xl font-black">استمع واختر</h2>
            <p className="text-purple-100 text-sm font-medium">
              اسمع صوت الحرف أو الرقم واختر الإجابة الصحيحة واربح نجوماً ذهبية!
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-100 group-hover:text-white">
            <span>العب الآن</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 4. Memory Games */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('games', 'memory');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-amber-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🃏</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider block">
              القسم الرابع
            </span>
            <h2 className="text-2xl font-black">ألعاب الذاكرة</h2>
            <p className="text-amber-100 text-sm font-medium">
              اكشف البطاقات اللطيفة وابحث عن الحروف والصور والأرقام المتطابقة.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-100 group-hover:text-white">
            <span>تحدي الذاكرة</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 5. Daily Challenges */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('games', 'daily_challenge');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-rose-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🔥</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-rose-200 uppercase tracking-wider block">
              القسم الخامس
            </span>
            <h2 className="text-2xl font-black">تحديات يومية</h2>
            <p className="text-rose-100 text-sm font-medium">
              تحديات سريعة تتجدد يومياً لتثبيت المعلومات وتنمية ذكاء الطفل الصغير.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-100 group-hover:text-white">
            <span>ابدأ التحدي اليومي</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 6. Levels and Rewards */}
        <button
          onClick={() => {
            audioService.playTap();
            onNavigate('levels');
          }}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-sky-700 rounded-3xl p-6 text-white text-right shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-indigo-400"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl group-hover:scale-110 transition-transform">🏆</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">
              القسم السادس
            </span>
            <h2 className="text-2xl font-black">مستواي ومكافآتي</h2>
            <p className="text-indigo-100 text-sm font-medium">
              خريطة المستويات الستة، شارات الأبطال، والشخصيات الكرتونية الجديدة القابلة للفتح!
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-100 group-hover:text-white">
            <span>عرض خريطتي</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
