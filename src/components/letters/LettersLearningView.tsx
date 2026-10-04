import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Star, Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { ARABIC_LETTERS } from '../../data/lettersData';
import { ChildProfile, ArabicLetter } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface LettersLearningViewProps {
  child: ChildProfile;
  initialLetterId?: number;
}

export const LettersLearningView: React.FC<LettersLearningViewProps> = ({
  child,
  initialLetterId = 1,
}) => {
  const [selectedLetterId, setSelectedLetterId] = useState<number>(initialLetterId);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [activeShapeTab, setActiveShapeTab] = useState<'beginning' | 'middle' | 'ending' | 'isolated'>('beginning');

  const currentLetter: ArabicLetter =
    ARABIC_LETTERS.find((l) => l.id === selectedLetterId) || ARABIC_LETTERS[0];

  const isMastered = child.masteredLetters.includes(currentLetter.id);

  // Generate 3 choices for mini quiz: correct letter + 2 random letters
  const generateChoices = () => {
    const wrongLetters = ARABIC_LETTERS.filter((l) => l.id !== currentLetter.id);
    const shuffled = [...wrongLetters].sort(() => 0.5 - Math.random()).slice(0, 2);
    const all = [currentLetter, ...shuffled].sort(() => 0.5 - Math.random());
    return all;
  };

  const [choices, setChoices] = useState<ArabicLetter[]>(() => generateChoices());

  const handleSelectLetter = (letter: ArabicLetter) => {
    // A child can review any previous mastered letter or the first unmastered letter
    const maxAllowedId = Math.max(1, ...child.masteredLetters, 1) + 1;
    if (letter.id > maxAllowedId && letter.id > 1) {
      audioService.playWrong();
      audioService.speakArabic('أكمل الحروف السابقة أولاً يا بطل لتفتح هذا الحرف!');
      return;
    }

    audioService.playTap();
    setSelectedLetterId(letter.id);
    setQuizAnswered(false);
    setQuizResult(null);

    // Refresh choices for new letter
    const wrongLetters = ARABIC_LETTERS.filter((l) => l.id !== letter.id);
    const shuffled = [...wrongLetters].sort(() => 0.5 - Math.random()).slice(0, 2);
    setChoices([letter, ...shuffled].sort(() => 0.5 - Math.random()));

    // Automatic welcome speech for the letter
    audioService.speakArabic(`حرف الـ${letter.name}. ${letter.soundPhonic}. ${letter.example.wordTashkeel}`);
  };

  const playLetterName = () => {
    audioService.playTap();
    audioService.speakArabic(`حرف الـ${currentLetter.name}`);
  };

  const playLetterSound = () => {
    audioService.playTap();
    audioService.speakArabic(currentLetter.soundPhonicAudioText);
  };

  const playWordAudio = () => {
    audioService.playTap();
    audioService.speakArabic(`${currentLetter.example.wordTashkeel}.. ${currentLetter.example.meaning}`);
  };

  const handleQuizChoice = (chosen: ArabicLetter) => {
    if (quizAnswered && quizResult === 'correct') return;

    if (chosen.id === currentLetter.id) {
      audioService.playCorrect();
      audioService.playStar();
      setQuizResult('correct');
      setQuizAnswered(true);

      // Trigger confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      storageService.markLetterMastered(currentLetter.id);
      audioService.speakArabic(`أحسنت يا ${child.name}! إجابة صحيحة، هذا هو حرف الـ${currentLetter.name}`);
    } else {
      audioService.playWrong();
      setQuizResult('wrong');
      storageService.recordMistake('letter', currentLetter.id);
      audioService.speakArabic(`حاول مرة ثانية يا بطل، ابحث عن حرف الـ${currentLetter.name}`);
    }
  };

  const handleNextLetter = () => {
    if (currentLetter.id < 28) {
      handleSelectLetter(ARABIC_LETTERS[currentLetter.id]);
    }
  };

  const handlePrevLetter = () => {
    if (currentLetter.id > 1) {
      handleSelectLetter(ARABIC_LETTERS[currentLetter.id - 2]);
    }
  };

  const maxAllowedId = Math.max(1, ...child.masteredLetters, 1) + 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-blue-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>🦁</span>
            <span>بستان الحروف العربية</span>
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            استمع للنطق الصحيح واسم وصوت كل حرف بأشكاله وكلماته المصورة
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-blue-900">
            أتقنت {child.masteredLetters.length} من 28 حرفاً
          </span>
        </div>
      </div>

      {/* Horizontal Alphabet Strip */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ARABIC_LETTERS.map((item) => {
            const mastered = child.masteredLetters.includes(item.id);
            const isSelected = item.id === currentLetter.id;
            const isLocked = item.id > maxAllowedId;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectLetter(item)}
                disabled={isLocked}
                className={`relative w-12 h-14 md:w-14 md:h-16 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md scale-105 border-2 border-blue-700'
                    : mastered
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'
                    : isLocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span className="text-xl md:text-2xl leading-none">{item.letter}</span>
                <span className="text-[10px] mt-0.5 opacity-90">{item.name}</span>
                {mastered && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Letter & Audios (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              الحرف {currentLetter.id} من 28
            </span>

            {isMastered && (
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>حرف مُتقن ومحفوظ</span>
              </div>
            )}
          </div>

          {/* Huge Letter Display */}
          <div className="text-center py-4 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 rounded-3xl border border-blue-100">
            <div
              className="text-8xl md:text-9xl font-black text-blue-600 transition-transform hover:scale-105 select-none leading-none mb-2"
              style={{ color: currentLetter.color }}
            >
              {currentLetter.letter}
            </div>
            <p className="text-lg md:text-xl font-bold text-slate-700">
              {currentLetter.description}
            </p>
          </div>

          {/* 3 Real Audio Playback Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Letter Name */}
            <button
              onClick={playLetterName}
              className="flex flex-col items-center justify-center p-3.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-5 h-5" />
                <span className="font-bold text-sm">اسم الحرف</span>
              </div>
              <span className="text-base font-black">«{currentLetter.name}»</span>
            </button>

            {/* 2. Letter Sound (Phonics) */}
            <button
              onClick={playLetterSound}
              className="flex flex-col items-center justify-center p-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-5 h-5" />
                <span className="font-bold text-sm">صوت الحرف</span>
              </div>
              <span className="text-base font-black">«{currentLetter.soundPhonic}»</span>
            </button>

            {/* 3. Illustrated Word */}
            <button
              onClick={playWordAudio}
              className="flex flex-col items-center justify-center p-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-5 h-5" />
                <span className="font-bold text-sm">استمع للكلمة</span>
              </div>
              <span className="text-base font-black">
                {currentLetter.example.emoji} «{currentLetter.example.wordTashkeel}»
              </span>
            </button>
          </div>

          {/* Letter Shapes Across Words */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>أشكال الحرف في الكلمة:</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {/* Isolated */}
              <button
                onClick={() => {
                  audioService.playTap();
                  setActiveShapeTab('isolated');
                  audioService.speakArabic(`شكل حرف الـ${currentLetter.name} منفرداً`);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  activeShapeTab === 'isolated'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl font-black text-blue-700 block mb-0.5">
                  {currentLetter.shapes.isolated}
                </span>
                <span className="text-xs font-bold text-slate-600">منفصل</span>
              </button>

              {/* Beginning */}
              <button
                onClick={() => {
                  audioService.playTap();
                  setActiveShapeTab('beginning');
                  audioService.speakArabic(`شكل حرف الـ${currentLetter.name} في أول الكلمة`);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  activeShapeTab === 'beginning'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl font-black text-blue-700 block mb-0.5">
                  {currentLetter.shapes.beginning}
                </span>
                <span className="text-xs font-bold text-slate-600">أول الكلمة</span>
              </button>

              {/* Middle */}
              <button
                onClick={() => {
                  audioService.playTap();
                  setActiveShapeTab('middle');
                  audioService.speakArabic(`شكل حرف الـ${currentLetter.name} في وسط الكلمة`);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  activeShapeTab === 'middle'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl font-black text-blue-700 block mb-0.5">
                  {currentLetter.shapes.middle}
                </span>
                <span className="text-xs font-bold text-slate-600">وسط الكلمة</span>
              </button>

              {/* Ending */}
              <button
                onClick={() => {
                  audioService.playTap();
                  setActiveShapeTab('ending');
                  audioService.speakArabic(`شكل حرف الـ${currentLetter.name} في آخر الكلمة`);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  activeShapeTab === 'ending'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-2xl font-black text-blue-700 block mb-0.5">
                  {currentLetter.shapes.ending}
                </span>
                <span className="text-xs font-bold text-slate-600">آخر الكلمة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Word Example & Mini Interactive Exercise (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Illustrated Word Showcase Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm text-center space-y-3">
            <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
              كلمة مصورة
            </span>

            <div className="w-28 h-28 mx-auto bg-amber-50 rounded-3xl border-2 border-amber-200 flex items-center justify-center text-6xl shadow-inner">
              {currentLetter.example.emoji}
            </div>

            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {currentLetter.example.wordTashkeel}
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {currentLetter.example.meaning}
              </p>
            </div>

            <button
              onClick={playWordAudio}
              className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>أعد الاستماع للكلمة</span>
            </button>
          </div>

          {/* Interactive Mini Recognition Test */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                تمرين الإتقان
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>+3 نجوم</span>
              </div>
            </div>

            <p className="text-base font-black text-slate-900">
              أين هو حرف الـ«{currentLetter.name}» الصحيح؟
            </p>

            <div className="grid grid-cols-3 gap-3">
              {choices.map((choice) => {
                const isSelected = quizAnswered && choice.id === currentLetter.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleQuizChoice(choice)}
                    className={`py-5 rounded-2xl text-3xl font-black border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-white text-slate-800 border-indigo-100 hover:border-indigo-400 hover:scale-102'
                    }`}
                  >
                    {choice.letter}
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {quizResult === 'correct' && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold flex items-center justify-between">
                <span>🎉 أحسنت يا بطل! تم حفظ الحرف بنجاح</span>
                <span className="text-emerald-700">⭐ +3</span>
              </div>
            )}

            {quizResult === 'wrong' && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>حاول مرة أخرى، اضغط على الحرف الصحيح!</span>
              </div>
            )}
          </div>

          {/* Navigation Between Letters */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevLetter}
              disabled={currentLetter.id <= 1}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentLetter.id <= 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>الحرف السابق</span>
            </button>

            <button
              onClick={handleNextLetter}
              disabled={currentLetter.id >= 28 || (!isMastered && quizResult !== 'correct')}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentLetter.id >= 28 || (!isMastered && quizResult !== 'correct')
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              <span>الحرف التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
