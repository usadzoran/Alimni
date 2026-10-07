import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { MASCOT_CHARACTERS } from '../data/badgesData';
import { audioService } from '../services/audioService';

interface MascotGuideProps {
  customMessage?: string;
  mascotId?: string;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  customMessage,
  mascotId = 'farfour_rabbit',
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const mascot = MASCOT_CHARACTERS.find((m) => m.id === mascotId) || MASCOT_CHARACTERS[0];
  const message = customMessage || mascot.quote;

  const handleMascotClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
    audioService.playChime();
    audioService.speakArabic(message);
  };

  return (
    <div className="relative flex items-center gap-3 bg-gradient-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 border-2 border-amber-300/80 rounded-3xl p-3 md:p-4 shadow-sm my-4 transition-all">
      {/* Mascot Avatar */}
      <button
        onClick={handleMascotClick}
        title="اضغط لسماع تشجيع المرشد!"
        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl md:text-4xl shadow-sm shrink-0 hover:scale-105 transition-all cursor-pointer ${
          isWiggling ? 'animate-bounce' : 'animate-bounce-gentle'
        }`}
      >
        {mascot.avatarEmoji}
      </button>

      {/* Speech Bubble */}
      <div className="flex-1 text-right">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{mascot.name} ({mascot.title})</span>
        </div>
        <p className="text-sm md:text-base font-bold text-slate-800 leading-snug">
          {message}
        </p>
      </div>

      {/* Audio Play Button */}
      <button
        onClick={handleMascotClick}
        className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
        title="استمع لصوت المرشد"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  );
};
