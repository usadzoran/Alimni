import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, Gamepad2, RotateCcw, Sparkles, Star, Volume2, XCircle } from 'lucide-react';
import { ARABIC_LETTERS } from '../../data/lettersData';
import { ALL_NUMBERS, getArabicNumberName, toArabicDigits } from '../../data/numbersData';
import { ChildProfile } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface PracticeHubProps {
  child: ChildProfile;
  onBackToHome: () => void;
}

type PracticeMode = 'letter_quiz' | 'number_quiz' | 'count_game' | 'memory_game';
type RoundStatus = 'idle' | 'correct' | 'wrong' | 'finished';

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const MODES: Array<{ id: PracticeMode; icon: string; title: string; text: string; tone: string }> = [
  { id: 'letter_quiz', icon: '🔤', title: 'اختبار الحروف', text: 'اسمع واختر الحرف الصحيح', tone: 'blue' },
  { id: 'number_quiz', icon: '🔢', title: 'اختبار الأرقام', text: 'استمع للرقم واكتشفه', tone: 'emerald' },
  { id: 'count_game', icon: '🍎', title: 'لعبة العد السريع', text: 'عد الأشياء واربح النجوم', tone: 'orange' },
  { id: 'memory_game', icon: '🃏', title: 'لعبة الذاكرة', text: 'طابق الحرف مع صورته', tone: 'purple' },
];

export const PracticeHub: React.FC<PracticeHubProps> = ({ child, onBackToHome }) => {
  const [mode, setMode] = useState<PracticeMode | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<RoundStatus>('idle');
  const [answered, setAnswered] = useState(false);
  const [targetLetterId, setTargetLetterId] = useState(1);
  const [letterOptions, setLetterOptions] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState(1);
  const [numberOptions, setNumberOptions] = useState<number[]>([]);
  const [countTarget, setCountTarget] = useState(3);
  const [countOptions, setCountOptions] = useState<number[]>([]);
  const [memoryCards, setMemoryCards] = useState<Array<{ id: string; pairId: number; value: string; kind: 'letter' | 'image'; flipped: boolean; matched: boolean }>>([]);
  const [memoryOpen, setMemoryOpen] = useState<string[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  const activeLetter = ARABIC_LETTERS.find((letter) => letter.id === targetLetterId) || ARABIC_LETTERS[0];
  const activeNumber = ALL_NUMBERS[targetNumber] || ALL_NUMBERS[1];
  const countEmoji = useMemo(() => ['🍎', '🧸', '⭐', '🐰'][round % 4], [round]);

  const startMode = (nextMode: PracticeMode) => {
    audioService.playTap();
    setMode(nextMode);
    setRound(0);
    setScore(0);
    setStatus('idle');
    setAnswered(false);
    setMemoryOpen([]);
    setMemoryMatches(0);
    if (nextMode === 'letter_quiz') prepareLetterRound(0);
    if (nextMode === 'number_quiz') prepareNumberRound(0);
    if (nextMode === 'count_game') prepareCountRound(0);
    if (nextMode === 'memory_game') prepareMemoryGame();
  };

  const prepareLetterRound = (nextRound: number) => {
    const target = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    setTargetLetterId(target.id);
    setLetterOptions(shuffle([target.id, ...shuffle(ARABIC_LETTERS.filter((letter) => letter.id !== target.id)).slice(0, 3).map((letter) => letter.id)]));
    setRound(nextRound);
    setStatus('idle');
    setAnswered(false);
    window.setTimeout(() => audioService.playLetterName(target.id, target.name), 100);
  };

  const prepareNumberRound = (nextRound: number) => {
    const target = Math.floor(Math.random() * 11);
    const others = shuffle(ALL_NUMBERS.filter((number) => number.number !== target)).slice(0, 3).map((number) => number.number);
    setTargetNumber(target);
    setNumberOptions(shuffle([target, ...others]));
    setRound(nextRound);
    setStatus('idle');
    setAnswered(false);
    window.setTimeout(() => audioService.playNumberPronunciation(target, getArabicNumberName(target)), 100);
  };

  const prepareCountRound = (nextRound: number) => {
    const target = Math.floor(Math.random() * 7) + 2;
    const wrong = Array.from(new Set([target - 1, target + 1, target + 2].filter((value) => value > 0 && value !== target))).slice(0, 3);
    setCountTarget(target);
    setCountOptions(shuffle([target, ...wrong]));
    setRound(nextRound);
    setStatus('idle');
    setAnswered(false);
    window.setTimeout(() => audioService.speakArabic(`عدّ ${countEmoji} ثم اختر العدد الصحيح`), 100);
  };

  const prepareMemoryGame = () => {
    const sample = shuffle(ARABIC_LETTERS).slice(0, 3);
    const cards = sample.flatMap((letter) => [
      { id: `letter-${letter.id}`, pairId: letter.id, value: letter.letter, kind: 'letter' as const, flipped: false, matched: false },
      { id: `image-${letter.id}`, pairId: letter.id, value: letter.example.emoji, kind: 'image' as const, flipped: false, matched: false },
    ]);
    setMemoryCards(shuffle(cards));
  };

  const saveRoundResult = (finalScore: number, total: number, title: string) => {
    storageService.recordQuizAttempt({
      category: 'game',
      title,
      totalQuestions: total,
      correctAnswers: finalScore,
      scorePercent: Math.round((finalScore / total) * 100),
      passed: finalScore >= Math.ceil(total * 0.6),
    });
  };

  const answerRound = (correct: boolean, type: 'letter' | 'number', selected: number) => {
    if (answered || status === 'finished') return;
    setAnswered(true);
    if (correct) {
      const nextScore = score + 1;
      setScore(nextScore);
      setStatus('correct');
      audioService.playCorrect();
      audioService.playStar();
      confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
      if (type === 'letter') {
        storageService.markLetterMastered(targetLetterId);
        audioService.playLetterName(selected, ARABIC_LETTERS.find((letter) => letter.id === selected)?.name || activeLetter.name);
      } else {
        storageService.markNumberMastered(targetNumber);
        audioService.playNumberPronunciation(selected, getArabicNumberName(selected));
      }
    } else {
      setStatus('wrong');
      audioService.playWrong();
      storageService.recordMistake(type, type === 'letter' ? targetLetterId : targetNumber);
      if (type === 'letter') {
        audioService.playLetterName(selected, ARABIC_LETTERS.find((letter) => letter.id === selected)?.name || '');
      } else {
        audioService.playNumberPronunciation(selected, getArabicNumberName(selected));
      }
    }
  };

  const nextRound = () => {
    if (!mode) return;
    const next = round + 1;
    if (next >= 5) {
      setStatus('finished');
      saveRoundResult(score, 5, mode === 'letter_quiz' ? 'اختبار الحروف' : mode === 'number_quiz' ? 'اختبار الأرقام' : 'لعبة العد');
      audioService.speakArabic(`انتهى التحدي! حصلت على ${score} من 5`);
      return;
    }
    if (mode === 'letter_quiz') prepareLetterRound(next);
    if (mode === 'number_quiz') prepareNumberRound(next);
    if (mode === 'count_game') prepareCountRound(next);
  };

  const handleMemoryCard = (id: string) => {
    if (memoryOpen.length === 2 || memoryCards.find((card) => card.id === id)?.matched || memoryOpen.includes(id)) return;
    audioService.playTap();
    const nextOpen = [...memoryOpen, id];
    setMemoryOpen(nextOpen);
    setMemoryCards((cards) => cards.map((card) => (card.id === id ? { ...card, flipped: true } : card)));
    if (nextOpen.length === 2) {
      const first = memoryCards.find((card) => card.id === nextOpen[0]);
      const second = memoryCards.find((card) => card.id === nextOpen[1]);
      if (first && second && first.pairId === second.pairId) {
        audioService.playCorrect();
        audioService.playStar();
        const matches = memoryMatches + 1;
        setMemoryMatches(matches);
        setMemoryCards((cards) => cards.map((card) => (card.pairId === first.pairId ? { ...card, matched: true } : card)));
        setMemoryOpen([]);
        if (matches === 3) {
          confetti({ particleCount: 60, spread: 70 });
          setStatus('finished');
          setScore(3);
          saveRoundResult(3, 3, 'لعبة الذاكرة');
          audioService.speakArabic('ممتاز! طابقت جميع البطاقات بنجاح');
        }
      } else {
        audioService.playWrong();
        window.setTimeout(() => {
          setMemoryCards((cards) => cards.map((card) => (nextOpen.includes(card.id) ? { ...card, flipped: false } : card)));
          setMemoryOpen([]);
        }, 700);
      }
    }
  };

  const resetCurrent = () => mode && startMode(mode);

  if (!mode) {
    return (
      <div className="space-y-6 pb-12">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg md:p-10">
          <div className="absolute -left-12 -top-12 text-9xl opacity-15">🎮</div>
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Sparkles className="h-4 w-4" /> مختبر المرح والتحدي</div>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">نتعلم، نلعب، ونكتشف!</h2>
              <p className="mt-3 text-sm leading-7 text-purple-100 md:text-base">اختر نشاطاً قصيراً. كل إجابة صحيحة تمنحك نجمة وتساعدك على تثبيت الحروف والأرقام.</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-sm">
              <div className="text-5xl">{child.avatar}</div>
              <p className="mt-2 text-sm font-black">جاهز يا {child.name}؟</p>
              <p className="mt-1 text-xs text-purple-100">⭐ {child.stars} نجمة</p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <div><p className="text-xs font-black text-purple-600">اختر مغامرتك</p><h3 className="mt-1 text-2xl font-black text-slate-900">أنشطة تفاعلية قصيرة</h3></div>
          <button onClick={onBackToHome} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /> العودة</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((item) => (
            <button key={item.id} onClick={() => startMode(item.id)} className="group rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg">
              <div className="flex items-start justify-between"><span className="text-5xl transition group-hover:scale-110">{item.icon}</span><Gamepad2 className="h-6 w-6 text-purple-500" /></div>
              <h4 className="mt-5 text-xl font-black text-slate-900">{item.title}</h4>
              <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-purple-700">ابدأ اللعب <ArrowLeft className="h-4 w-4" /></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'memory_game') {
    return (
      <div className="space-y-6 pb-12">
        <PracticeHeader title="لعبة الذاكرة" subtitle="طابق الحرف مع الصورة التي تبدأ به" score={score} onBack={() => setMode(null)} />
        <div className="mx-auto max-w-2xl rounded-3xl border border-purple-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {memoryCards.map((card) => {
              const visible = card.flipped || card.matched;
              return <button key={card.id} onClick={() => handleMemoryCard(card.id)} className={`aspect-square rounded-2xl border-2 text-4xl font-black transition-all sm:text-6xl ${visible ? 'border-purple-300 bg-purple-50' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-purple-50'} ${card.matched ? 'ring-4 ring-emerald-200' : ''}`}>{visible ? card.value : '؟'}</button>;
            })}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-purple-50 p-4 text-sm font-bold text-purple-900"><span>طابقت {memoryMatches} من 3</span><button onClick={resetCurrent} className="inline-flex items-center gap-1 text-xs text-purple-700"><RotateCcw className="h-4 w-4" /> إعادة اللعبة</button></div>
          {status === 'finished' && <ResultCard score={3} total={3} onRestart={resetCurrent} />}
        </div>
      </div>
    );
  }

  const isLetter = mode === 'letter_quiz';
  const isCount = mode === 'count_game';
  const title = isLetter ? 'اختبار الحروف' : isCount ? 'لعبة العد السريع' : 'اختبار الأرقام';
  const subtitle = isLetter ? 'استمع واختر الحرف الصحيح' : isCount ? 'عد العناصر ثم اختر العدد' : 'استمع واختر الرقم الصحيح';

  return (
    <div className="space-y-6 pb-12">
      <PracticeHeader title={title} subtitle={subtitle} score={score} onBack={() => setMode(null)} />
      {status === 'finished' ? <ResultCard score={score} total={5} onRestart={resetCurrent} /> : <div className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between"><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">السؤال {round + 1} من 5</span><span className="text-xs font-bold text-slate-500">⭐ {score} صحيحة</span></div>
        <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 p-8 text-center">
          {isCount ? <><div className="flex flex-wrap justify-center gap-2 text-5xl">{Array.from({ length: countTarget }, (_, index) => <span key={index}>{countEmoji}</span>)}</div><p className="mt-5 text-sm font-bold text-slate-700">كم عنصراً ترى؟</p></> : <><button onClick={() => isLetter ? audioService.playLetterName(activeLetter.id, activeLetter.name) : audioService.playNumberPronunciation(targetNumber, getArabicNumberName(targetNumber))} className="mx-auto flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-purple-700 shadow-sm"><Volume2 className="h-5 w-5" /> استمع للسؤال</button><div className="mt-5 text-lg font-black text-slate-700">{isLetter ? 'اختر الحرف الذي سمعته' : 'اختر الرقم الذي سمعته'}</div></>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(isLetter ? letterOptions : isCount ? countOptions : numberOptions).map((option) => {
            const label = isLetter ? ARABIC_LETTERS.find((letter) => letter.id === option)?.letter : isCount ? toArabicDigits(option) : toArabicDigits(option);
            const correct = isLetter ? option === targetLetterId : isCount ? option === countTarget : option === targetNumber;
            return <button key={option} disabled={answered} onClick={() => answerRound(correct, isLetter ? 'letter' : 'number', option)} className={`rounded-2xl border-2 p-4 text-3xl font-black transition sm:p-5 ${answered && correct ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50'} ${answered && !correct ? 'opacity-60' : ''}`}>{label}</button>;
          })}
        </div>
        {status !== 'idle' && <div className={`flex items-center justify-between rounded-2xl p-4 text-sm font-black ${status === 'correct' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><span className="inline-flex items-center gap-2">{status === 'correct' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{status === 'correct' ? 'إجابة رائعة!' : 'محاولة جميلة، ركّز وحاول مرة أخرى'}</span><button onClick={nextRound} className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white">{round === 4 ? 'عرض النتيجة' : 'السؤال التالي'}</button></div>}
      </div>}
    </div>
  );
};

const PracticeHeader: React.FC<{ title: string; subtitle: string; score: number; onBack: () => void }> = ({ title, subtitle, score, onBack }) => <div className="flex flex-col gap-4 rounded-3xl border border-purple-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">🎮</div><div><h2 className="text-2xl font-black text-slate-900">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div></div><div className="flex items-center gap-2"><span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">⭐ {score}</span><button onClick={onBack} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">تغيير النشاط</button></div></div>;

const ResultCard: React.FC<{ score: number; total: number; onRestart: () => void }> = ({ score, total, onRestart }) => <div className="mx-auto max-w-xl rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 text-center shadow-sm"><div className="text-6xl">🏆</div><h2 className="mt-4 text-3xl font-black text-slate-900">نتيجة رائعة!</h2><p className="mt-2 text-slate-600">أجبت بشكل صحيح على {score} من {total}</p><div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 text-xl font-black text-amber-800"><Star className="h-6 w-6 fill-amber-500 text-amber-500" /> {score * 2} نجوم تشجيعية</div><button onClick={onRestart} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-700"><RotateCcw className="h-4 w-4" /> العب مرة أخرى</button></div>;
