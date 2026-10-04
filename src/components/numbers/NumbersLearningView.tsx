import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Star, Sparkles, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  ALL_NUMBERS,
  NUMBERS_LEVEL_1,
  NUMBERS_LEVEL_2,
  NUMBERS_LEVEL_3,
  NUMBERS_LEVEL_4,
  toArabicDigits,
  getArabicNumberName,
} from '../../data/numbersData';
import { ChildProfile, NumberItem } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface NumbersLearningViewProps {
  child: ChildProfile;
}

export const NumbersLearningView: React.FC<NumbersLearningViewProps> = ({ child }) => {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<'learn' | 'count_challenge' | 'compare' | 'order'>('learn');

  // Currently selected number in Learn mode
  const currentList =
    activeTier === 1
      ? NUMBERS_LEVEL_1
      : activeTier === 2
      ? NUMBERS_LEVEL_2
      : activeTier === 3
      ? NUMBERS_LEVEL_3
      : NUMBERS_LEVEL_4;

  const [selectedNum, setSelectedNum] = useState<number>(0);
  const currentItem: NumberItem = ALL_NUMBERS[selectedNum] || ALL_NUMBERS[0];

  // Counting sandbox tap tracker
  const [countedItems, setCountedItems] = useState<number>(0);

  // Challenge 1: Count challenge state
  const [targetCount, setTargetCount] = useState<number>(3);
  const [countOptions, setCountOptions] = useState<number[]>([2, 3, 4]);
  const [countFeedback, setCountFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Challenge 2: Compare sets state
  const [leftSetCount, setLeftSetCount] = useState<number>(4);
  const [rightSetCount, setRightSetCount] = useState<number>(2);
  const [compareFeedback, setCompareFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Challenge 3: Ordering state
  const [orderNumbers, setOrderNumbers] = useState<number[]>([2, 5, 1, 4]);
  const [userOrdered, setUserOrdered] = useState<number[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'wrong' | null>(null);

  const playNumberSound = (num: number) => {
    audioService.playTap();
    const name = getArabicNumberName(num);
    const digits = toArabicDigits(num);
    audioService.speakArabic(`الرقم ${name}.. ${digits}`);
  };

  const handleSelectNumber = (numItem: NumberItem) => {
    audioService.playTap();
    setSelectedNum(numItem.number);
    setCountedItems(0);
    playNumberSound(numItem.number);
  };

  const handleTapVisualItem = (index: number) => {
    const nextCount = index + 1;
    setCountedItems(nextCount);
    audioService.playTap();
    audioService.speakArabic(`${getArabicNumberName(nextCount)}`);
    if (nextCount === currentItem.number && currentItem.number > 0) {
      audioService.playStar();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      storageService.markNumberMastered(currentItem.number);
      audioService.speakArabic(`رائع! عدد العناصر هو ${getArabicNumberName(currentItem.number)}`);
    }
  };

  // Helper for starting next count challenge
  const resetCountChallenge = () => {
    const min = activeTier === 1 ? 1 : 11;
    const max = activeTier === 1 ? 10 : 20;
    const target = Math.floor(Math.random() * (max - min + 1)) + min;
    setTargetCount(target);
    const wrong1 = target > min ? target - 1 : target + 2;
    const wrong2 = target < max ? target + 1 : target - 2;
    setCountOptions([target, wrong1, wrong2].sort(() => 0.5 - Math.random()));
    setCountFeedback(null);
    audioService.speakArabic('عُدَّ العناصر الظاهرة على الشاشة ثم اختر الرقم الصحيح');
  };

  const handlePickCountOption = (chosen: number) => {
    if (chosen === targetCount) {
      audioService.playCorrect();
      audioService.playStar();
      setCountFeedback('correct');
      confetti({ particleCount: 40, spread: 60 });
      storageService.markNumberMastered(targetCount);
      audioService.speakArabic(`أحسنت! إجابة صحيحة، عددها هو ${getArabicNumberName(targetCount)}`);
    } else {
      audioService.playWrong();
      setCountFeedback('wrong');
      storageService.recordMistake('number', targetCount);
      audioService.speakArabic('عدها بتمهل يا بطل، وحاول مرة أخرى!');
    }
  };

  // Helper for compare sets
  const resetCompareChallenge = () => {
    const l = Math.floor(Math.random() * 8) + 1;
    let r = Math.floor(Math.random() * 8) + 1;
    if (Math.random() > 0.6) r = l; // some equal sets
    setLeftSetCount(l);
    setRightSetCount(r);
    setCompareFeedback(null);
    audioService.speakArabic('قارن بين المجموعتين: هل المجموعة الأولى أكثر، أم أقل، أم متساوية؟');
  };

  const handlePickCompare = (choice: 'more' | 'less' | 'equal') => {
    let isCorrect = false;
    if (leftSetCount > rightSetCount && choice === 'more') isCorrect = true;
    else if (leftSetCount < rightSetCount && choice === 'less') isCorrect = true;
    else if (leftSetCount === rightSetCount && choice === 'equal') isCorrect = true;

    if (isCorrect) {
      audioService.playCorrect();
      audioService.playStar();
      setCompareFeedback('correct');
      confetti({ particleCount: 40, spread: 60 });
      audioService.speakArabic('ممتاز! مقارنة صحيحة ورائعة يا بطل!');
    } else {
      audioService.playWrong();
      setCompareFeedback('wrong');
      audioService.speakArabic('انظر جيداً للمجموعتين وحاول مجدداً');
    }
  };

  // Order numbers challenge
  const resetOrderChallenge = () => {
    const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    setOrderNumbers(sample);
    setUserOrdered([]);
    setOrderFeedback(null);
    audioService.speakArabic('رتب هذه الأرقام تصاعدياً من الأصغر إلى الأكبر بالضغط عليها بالترتيب');
  };

  const handleTapOrderNumber = (num: number) => {
    if (userOrdered.includes(num)) return;
    audioService.playTap();
    const updated = [...userOrdered, num];
    setUserOrdered(updated);
    audioService.speakArabic(getArabicNumberName(num));

    if (updated.length === orderNumbers.length) {
      // Check if ascending
      const sorted = [...orderNumbers].sort((a, b) => a - b);
      const isSorted = updated.every((val, idx) => val === sorted[idx]);

      if (isSorted) {
        audioService.playCorrect();
        audioService.playStar();
        setOrderFeedback('correct');
        confetti({ particleCount: 50, spread: 70 });
        audioService.speakArabic('عبقري! لقد رتبت الأرقام تصاعدياً بنجاح تام!');
      } else {
        audioService.playWrong();
        setOrderFeedback('wrong');
        audioService.speakArabic('الترتيب غير صحيح، اضغط على زر الإعادة وحاول مرة أخرى');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-emerald-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>🔢</span>
            <span>واحة الأرقام والعد</span>
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            تعلم نطق الأرقام من 0 إلى 100، عد الفواكه والألعاب، والمقارنة والترتيب
          </p>
        </div>

        {/* Level Tiers */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto">
          <button
            onClick={() => {
              setActiveTier(1);
              setSelectedNum(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTier === 1
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المستوى 1 (0-10)
          </button>

          <button
            onClick={() => {
              setActiveTier(2);
              setSelectedNum(11);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTier === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المستوى 2 (11-20)
          </button>

          <button
            onClick={() => {
              setActiveTier(3);
              setSelectedNum(21);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTier === 3
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المستوى 3 (21-50)
          </button>

          <button
            onClick={() => {
              setActiveTier(4);
              setSelectedNum(51);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTier === 4
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المستوى 4 (51-100)
          </button>
        </div>
      </div>

      {/* Mode Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            audioService.playTap();
            setActiveTab('learn');
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'learn'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <span>🎯</span>
          <span>استكشاف الأرقام والعد</span>
        </button>

        <button
          onClick={() => {
            audioService.playTap();
            setActiveTab('count_challenge');
            resetCountChallenge();
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'count_challenge'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <span>🍎</span>
          <span>تحدي عد الأشياء</span>
        </button>

        <button
          onClick={() => {
            audioService.playTap();
            setActiveTab('compare');
            resetCompareChallenge();
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'compare'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <span>⚖️</span>
          <span>مقارنة المجموعات</span>
        </button>

        <button
          onClick={() => {
            audioService.playTap();
            setActiveTab('order');
            resetOrderChallenge();
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'order'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <span>📈</span>
          <span>ترتيب الأرقام تصاعدياً</span>
        </button>
      </div>

      {/* Mode 1: Learn & Count Sandbox */}
      {activeTab === 'learn' && (
        <div className="space-y-6">
          {/* Numbers Grid Strip */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {currentList.map((item) => {
                const isSelected = item.number === currentItem.number;
                const isMastered = Array.isArray(child?.masteredNumbers) && child.masteredNumbers.includes(item.number);

                return (
                  <button
                    key={item.number}
                    onClick={() => handleSelectNumber(item)}
                    className={`relative w-14 h-16 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md scale-105 border-2 border-emerald-700'
                        : isMastered
                        ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span className="text-2xl leading-none">{item.arabicNumeral}</span>
                    <span className="text-[10px] mt-1 opacity-80">{item.number}</span>
                    {isMastered && (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Number Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Big Number Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-200 shadow-sm text-center space-y-6">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  الرقم {currentItem.arabicNumeral}
                </span>

                <button
                  onClick={() => playNumberSound(currentItem.number)}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                  title="استمع للنطق"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Big Numerals */}
              <div className="py-4 bg-gradient-to-b from-emerald-50 to-teal-50/40 rounded-3xl border border-emerald-100">
                <div className="text-8xl md:text-9xl font-black text-emerald-600 mb-1 leading-none select-none">
                  {currentItem.arabicNumeral}
                </div>
                <div className="text-2xl font-black text-slate-800">
                  {currentItem.nameArabic}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  الرقم الإنجليزي: {currentItem.number}
                </div>
              </div>

              {/* Audio Play Button */}
              <button
                onClick={() => playNumberSound(currentItem.number)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>استمع لاسم الرقم «{currentItem.nameArabic}»</span>
              </button>
            </div>

            {/* Interactive Counting Sandbox (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border-2 border-amber-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    حقل العد التفاعلي: {currentItem.counterVisual.itemLabel}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    المس العناصر واحداً تلو الآخر لتعدّها بصوتك مع النظام!
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-amber-700 font-bold block">تم عدّ:</span>
                  <span className="text-2xl font-black text-amber-900 tabular-nums">
                    {toArabicDigits(countedItems)} / {currentItem.arabicNumeral}
                  </span>
                </div>
              </div>

              {/* Zero representation */}
              {currentItem.number === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <span className="text-6xl block mb-2">🧺</span>
                  <p className="text-lg font-black text-slate-700">السلة فارغة!</p>
                  <p className="text-xs text-slate-500">الصفر يعني لا شيء، لا توجد أي عناصر في السلة.</p>
                </div>
              ) : (
                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200 min-h-[220px] flex flex-wrap items-center justify-center gap-4">
                  {Array.from({ length: Math.min(currentItem.number, 50) }).map((_, i) => {
                    const isCounted = i < countedItems;
                    return (
                      <button
                        key={i}
                        onClick={() => handleTapVisualItem(i)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center text-3xl md:text-4xl shadow-xs transition-all cursor-pointer active:scale-90 ${
                          isCounted
                            ? 'bg-amber-400 border-2 border-amber-500 scale-105'
                            : 'bg-white border-2 border-amber-200 hover:scale-105'
                        }`}
                      >
                        <span>{currentItem.counterVisual.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-700">
                          {toArabicDigits(i + 1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reset Count Sandbox */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCountedItems(0)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  إعادة العد من الصفر
                </button>

                {countedItems === currentItem.number && currentItem.number > 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-sm bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300 animate-pulse">
                    <span>🎉 أحسنت! أكملت عد كل الـ{currentItem.counterVisual.itemLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Count Challenge */}
      {activeTab === 'count_challenge' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-emerald-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              تحدي العد الذكي
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              كم عدد الفواكه الظاهرة في الصندوق؟
            </h3>
          </div>

          {/* Items Display Box */}
          <div className="bg-emerald-50/60 p-8 rounded-3xl border-2 border-emerald-200 flex flex-wrap items-center justify-center gap-4 min-h-[160px]">
            {Array.from({ length: targetCount }).map((_, idx) => (
              <div
                key={idx}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-3xl shadow-xs"
              >
                🍎
              </div>
            ))}
          </div>

          {/* 3 Choices */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {countOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePickCountOption(opt)}
                className="py-5 rounded-3xl bg-white hover:bg-emerald-50 border-2 border-emerald-300 text-3xl font-black text-emerald-800 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {toArabicDigits(opt)}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {countFeedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 إجابة صحيحة يا عبقري!</span>
              <button
                onClick={resetCountChallenge}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                سؤال تالٍ
              </button>
            </div>
          )}

          {countFeedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              حاول مرة أخرى، عد التفاحات بهدوء!
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Compare Sets */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-amber-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              مقارنة المجموعات
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              قارن بين المجموعة اليمنى والمجموعة اليسرى
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Right set */}
            <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-800 block mb-2">المجموعة الأولى</span>
              <div className="flex flex-wrap items-center justify-center gap-2 min-h-[100px]">
                {Array.from({ length: leftSetCount }).map((_, i) => (
                  <span key={i} className="text-3xl">⭐</span>
                ))}
              </div>
              <span className="text-xl font-black text-amber-900 block mt-2">
                {toArabicDigits(leftSetCount)}
              </span>
            </div>

            {/* Left set */}
            <div className="bg-blue-50/70 p-6 rounded-3xl border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-800 block mb-2">المجموعة الثانية</span>
              <div className="flex flex-wrap items-center justify-center gap-2 min-h-[100px]">
                {Array.from({ length: rightSetCount }).map((_, i) => (
                  <span key={i} className="text-3xl">⭐</span>
                ))}
              </div>
              <span className="text-xl font-black text-blue-900 block mt-2">
                {toArabicDigits(rightSetCount)}
              </span>
            </div>
          </div>

          {/* Compare Buttons */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <button
              onClick={() => handlePickCompare('more')}
              className="py-4 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-xs hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              أكثر (أكبر) 🔼
            </button>

            <button
              onClick={() => handlePickCompare('equal')}
              className="py-4 px-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-black text-base shadow-xs hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              متساويان ⚖️
            </button>

            <button
              onClick={() => handlePickCompare('less')}
              className="py-4 px-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-base shadow-xs hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              أقل (أصغر) 🔽
            </button>
          </div>

          {/* Feedback */}
          {compareFeedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 رائع! مقارنة صحيحة تماماً</span>
              <button
                onClick={resetCompareChallenge}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                تحدٍ جديد
              </button>
            </div>
          )}

          {compareFeedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              لا بأس، انظر للعددين جيداً وحاول مرة أخرى
            </div>
          )}
        </div>
      )}

      {/* Mode 4: Order Numbers Ascending */}
      {activeTab === 'order' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-indigo-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full">
              ترتيب تصاعدي
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اضغط على الأرقام بالترتيب من الأصغر إلى الأكبر
            </h3>
          </div>

          {/* User's Current Order Basket */}
          <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-300 min-h-[90px] flex items-center justify-center gap-3">
            {userOrdered.length === 0 ? (
              <span className="text-slate-400 font-bold text-sm">
                اضغط على الرقم الأصغر أولاً ليبدأ الترتيب هنا...
              </span>
            ) : (
              userOrdered.map((num, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-xs"
                >
                  {toArabicDigits(num)}
                </div>
              ))
            )}
          </div>

          {/* Available Numbers */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {orderNumbers.map((num) => {
              const used = userOrdered.includes(num);
              return (
                <button
                  key={num}
                  disabled={used}
                  onClick={() => handleTapOrderNumber(num)}
                  className={`w-16 h-16 rounded-2xl text-3xl font-black border-2 transition-all cursor-pointer ${
                    used
                      ? 'bg-slate-200 border-slate-300 text-slate-400 opacity-40 cursor-not-allowed'
                      : 'bg-white border-indigo-300 text-indigo-900 hover:scale-105 active:scale-95 shadow-xs'
                  }`}
                >
                  {toArabicDigits(num)}
                </button>
              );
            })}
          </div>

          {/* Action & Feedback */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetOrderChallenge}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>

          {orderFeedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 أحسنت صنعاً! ترتيب سليم ومرتب</span>
              <button
                onClick={resetOrderChallenge}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                ترتيب جديد
              </button>
            </div>
          )}

          {orderFeedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              الترتيب يحتاج إلى تركيز، اضغط إعادة المحاولة وابدأ بالرقم الأصغر!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
