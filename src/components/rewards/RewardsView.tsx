import React from 'react';
import { Sparkles, Trophy, Star, Lock, Volume2 } from 'lucide-react';
import { MASCOT_CHARACTERS, APP_BADGES } from '../../data/badgesData';
import { ChildProfile } from '../../types';
import { audioService } from '../../services/audioService';

interface RewardsViewProps {
  child: ChildProfile;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ child }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>⭐</span>
            <span>صندوق المكافآت والشارات</span>
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            كل حرف ورقم تتعلمه يكافئك بنجوم وشارات وشخصيات لطيفة جديدة!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-5 py-2.5 rounded-2xl">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[10px] text-amber-700 font-bold block">رصيد نجومك:</span>
            <span className="text-xl font-black text-amber-950 tabular-nums">{child.stars} نجمة</span>
          </div>
        </div>
      </div>

      {/* Section 1: Unlockable Cartoon Mascot Friends */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-black text-slate-900">
              أصدقائي المرشدين (شخصيات قابلة للفتح)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            مفتوح: {child.unlockedCharacters.length} من {MASCOT_CHARACTERS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MASCOT_CHARACTERS.map((mascot) => {
            const isUnlocked =
              child.unlockedCharacters.includes(mascot.id) || child.stars >= mascot.unlockStarsRequired;

            return (
              <div
                key={mascot.id}
                className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0 ${
                    isUnlocked ? 'bg-white shadow-xs border border-amber-200' : 'bg-slate-200'
                  }`}
                >
                  {isUnlocked ? mascot.avatarEmoji : '🔒'}
                </div>

                <div className="flex-1 text-right">
                  <h4 className="font-black text-slate-900 text-base">{mascot.name}</h4>
                  <p className="text-xs text-slate-600 font-medium mb-1">{mascot.title}</p>

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        audioService.playTap();
                        audioService.speakArabic(mascot.quote);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>استمع لصوته</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>يتطلب {mascot.unlockStarsRequired} نجمة</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Badges of Honor */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-black text-slate-900">
            لوحة شارات الأبطال
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_BADGES.map((badge) => {
            let isEarned = false;
            if (badge.requiredMetric === 'letters_count' && child.masteredLetters.length >= badge.requiredValue) {
              isEarned = true;
            } else if (badge.requiredMetric === 'numbers_count' && child.masteredNumbers.length >= badge.requiredValue) {
              isEarned = true;
            } else if (badge.requiredMetric === 'stars_count' && child.stars >= badge.requiredValue) {
              isEarned = true;
            }

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                  isEarned
                    ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                    isEarned ? 'bg-amber-400 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isEarned ? badge.icon : '🔒'}
                </div>

                <div className="text-right">
                  <h4 className="font-black text-slate-900 text-base">{badge.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {badge.description}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isEarned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isEarned ? 'تم الحصول عليها ✓' : 'قيد الإنجاز'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
