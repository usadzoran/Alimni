import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Gamepad2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ARABIC_LETTERS } from '../../data/lettersData';
import { ALL_NUMBERS, toArabicDigits, getArabicNumberName } from '../../data/numbersData';
import { ChildProfile, ArabicLetter } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface GamesHubProps {
  child: ChildProfile;
  initialGameId?: string;
  onBackToHome: () => void;
}

type GameKey =
  | 'listen_letter'
  | 'find_letter_image'
  | 'match_pairs'
  | 'order_alphabet'
  | 'complete_word'
  | 'listen_number'
  | 'count_items'
  | 'memory_game'
  | 'daily_challenge'
  | 'mistakes_review';

interface GameMeta {
  id: GameKey;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
}

const GAMES_LIST: GameMeta[] = [
  {
    id: 'listen_letter',
    title: 'اسمع واختر الحرف',
    subtitle: 'استمع لصوت الحرف واختر من بين 3 خيارات',
    icon: '🎧',
    color: 'from-blue-500 to-indigo-600',
    badge: 'حروف',
  },
  {
    id: 'find_letter_image',
    title: 'اكتشف صورة الحرف',
    subtitle: 'أي من الصور تبدأ بالحرف المطلوب؟',
    icon: '🔍',
    color: 'from-purple-500 to-fuchsia-600',
    badge: 'صور',
  },
  {
    id: 'match_pairs',
    title: 'طابق الحروف وأشكالها',
    subtitle: 'صل كل حرف بشكله أو بصورته المطابقة',
    icon: '🧩',
    color: 'from-amber-500 to-orange-600',
    badge: 'مطابقة',
  },
  {
    id: 'order_alphabet',
    title: 'رتب حروف الأبجدية',
    subtitle: 'رتب الحروف بالتسلسل الصحيح من البداية',
    icon: '📚',
    color: 'from-emerald-500 to-teal-600',
    badge: 'ترتيب',
  },
  {
    id: 'complete_word',
    title: 'أكمل الكلمة بالحرف الناقص',
    subtitle: 'اختر الحرف الناقص لتكتمل الكلمة اللطيفة',
    icon: '✏️',
    color: 'from-rose-500 to-red-600',
    badge: 'كلمات',
  },
  {
    id: 'listen_number',
    title: 'اسمع الرقم واختره',
    subtitle: 'استمع لنطق الرقم العربي الصحيح واختره',
    icon: '🔢',
    color: 'from-cyan-500 to-blue-600',
    badge: 'أرقام',
  },
  {
    id: 'count_items',
    title: 'عدّ الأشياء السريعة',
    subtitle: 'عد الحيوانات والفواكه واختر العدد الدقيق',
    icon: '🐰',
    color: 'from-lime-600 to-emerald-700',
    badge: 'عد',
  },
  {
    id: 'memory_game',
    title: 'لعبة بطاقات الذاكرة',
    subtitle: 'اكشف بطاقتين متطابقتين للحروف والصور',
    icon: '🃏',
    color: 'from-violet-500 to-purple-700',
    badge: 'ذاكرة',
  },
  {
    id: 'daily_challenge',
    title: 'تحدي اليوم المتجدد',
    subtitle: '5 أسئلة منوعة للحصول على شعلة الإنجاز',
    icon: '🔥',
    color: 'from-amber-600 to-red-600',
    badge: 'يومي',
  },
  {
    id: 'mistakes_review',
    title: 'صندوق مراجعة الأخطاء',
    subtitle: 'تدرب على الحروف والأرقام التي تحتاج تثبيتاً',
    icon: '💡',
    color: 'from-teal-500 to-cyan-700',
    badge: 'مراجعة',
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({ child, initialGameId, onBackToHome }) => {
  const [selectedGame, setSelectedGame] = useState<GameKey | null>(
    (initialGameId as GameKey) || null
  );

  // Common feedback states
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // -------------------------------------------------------------
  // Game 1: Listen Letter
  // -------------------------------------------------------------
  const [g1Target, setG1Target] = useState<ArabicLetter>(ARABIC_LETTERS[0]);
  const [g1Options, setG1Options] = useState<ArabicLetter[]>([]);
  const [g1Feedback, setG1Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG1 = () => {
    const target = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    const others = ARABIC_LETTERS.filter((l) => l.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setG1Target(target);
    setG1Options([target, ...others].sort(() => 0.5 - Math.random()));
    setG1Feedback(null);
    setTimeout(() => {
      audioService.speakArabic(`اسمع جيداً، أين هو حرف الـ${target.name}؟`);
    }, 200);
  };

  const handleG1Choice = (choice: ArabicLetter) => {
    if (choice.id === g1Target.id) {
      audioService.playCorrect();
      audioService.playStar();
      setG1Feedback('correct');
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      confetti({ particleCount: 30, spread: 50 });
      storageService.markLetterMastered(g1Target.id);
      audioService.speakArabic(`أحسنت يا بطل! هذا هو حرف الـ${g1Target.name}`);
    } else {
      audioService.playWrong();
      setG1Feedback('wrong');
      setStreak(0);
      storageService.recordMistake('letter', g1Target.id);
      audioService.speakArabic('حاول ثانية، استمع جيداً للحرف المطلوبة');
    }
  };

  // -------------------------------------------------------------
  // Game 2: Find Letter Image
  // -------------------------------------------------------------
  const [g2Target, setG2Target] = useState<ArabicLetter>(ARABIC_LETTERS[0]);
  const [g2Options, setG2Options] = useState<ArabicLetter[]>([]);
  const [g2Feedback, setG2Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG2 = () => {
    const target = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    const others = ARABIC_LETTERS.filter((l) => l.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setG2Target(target);
    setG2Options([target, ...others].sort(() => 0.5 - Math.random()));
    setG2Feedback(null);
    setTimeout(() => {
      audioService.speakArabic(`أي من هذه الصور تبدأ بحرف الـ${target.name}؟`);
    }, 200);
  };

  const handleG2Choice = (choice: ArabicLetter) => {
    if (choice.id === g2Target.id) {
      audioService.playCorrect();
      audioService.playStar();
      setG2Feedback('correct');
      setScore((s) => s + 1);
      confetti({ particleCount: 30, spread: 50 });
      audioService.speakArabic(`ممتاز! ${choice.example.wordTashkeel} تبدأ بحرف الـ${g2Target.name}`);
    } else {
      audioService.playWrong();
      setG2Feedback('wrong');
      storageService.recordMistake('letter', g2Target.id);
      audioService.speakArabic('ليست هذه الصورة، فكر في الحرف الأول');
    }
  };

  // -------------------------------------------------------------
  // Game 3: Match Pairs (Letter to Isolated Shape or Emoji)
  // -------------------------------------------------------------
  const [g3Pairs, setG3Pairs] = useState<{ id: number; letter: string; emoji: string; word: string }[]>([]);
  const [g3SelectedLetter, setG3SelectedLetter] = useState<number | null>(null);
  const [g3MatchedIds, setG3MatchedIds] = useState<number[]>([]);

  const initG3 = () => {
    const sample = [...ARABIC_LETTERS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((l) => ({ id: l.id, letter: l.letter, emoji: l.example.emoji, word: l.example.wordTashkeel }));
    setG3Pairs(sample);
    setG3SelectedLetter(null);
    setG3MatchedIds([]);
    audioService.speakArabic('اضغط على الحرف أولاً ثم اضغط على الصورة التي تناسبه');
  };

  const handleG3LetterClick = (id: number) => {
    setG3SelectedLetter(id);
    const letterObj = ARABIC_LETTERS.find((l) => l.id === id);
    if (letterObj) audioService.playLetterName(letterObj.id, letterObj.name);
  };

  const handleG3EmojiClick = (id: number) => {
    if (g3SelectedLetter === null) {
      audioService.playTap();
      audioService.speakArabic('اختر حرفاً أولاً من الصف العلوي');
      return;
    }

    if (g3SelectedLetter === id) {
      audioService.playCorrect();
      audioService.playStar();
      const nextMatched = [...g3MatchedIds, id];
      setG3MatchedIds(nextMatched);
      setG3SelectedLetter(null);
      if (nextMatched.length === g3Pairs.length) {
        confetti({ particleCount: 50, spread: 70 });
        audioService.speakArabic('رائع جداً! طابقت جميع الحروف والصور بنجاح!');
      }
    } else {
      audioService.playWrong();
      audioService.speakArabic('هذه الصورة لا تناسب الحرف المحدد، حاول مجدداً');
      setG3SelectedLetter(null);
    }
  };

  // -------------------------------------------------------------
  // Game 4: Order Alphabet
  // -------------------------------------------------------------
  const [g4Letters, setG4Letters] = useState<ArabicLetter[]>([]);
  const [g4UserOrdered, setG4UserOrdered] = useState<ArabicLetter[]>([]);
  const [g4Feedback, setG4Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG4 = () => {
    const startIdx = Math.floor(Math.random() * 24); // take consecutive 4 letters
    const consecutive = ARABIC_LETTERS.slice(startIdx, startIdx + 4);
    const shuffled = [...consecutive].sort(() => 0.5 - Math.random());
    setG4Letters(shuffled);
    setG4UserOrdered([]);
    setG4Feedback(null);
    audioService.speakArabic('رتب هذه الحروف أبجدياً بالترتيب الصحيح');
  };

  const handleG4TapLetter = (letter: ArabicLetter) => {
    if (g4UserOrdered.some((l) => l.id === letter.id)) return;
    audioService.playLetterName(letter.id, letter.name);
    const updated = [...g4UserOrdered, letter];
    setG4UserOrdered(updated);

    if (updated.length === g4Letters.length) {
      const sortedIds = [...g4Letters].map((l) => l.id).sort((a, b) => a - b);
      const isCorrect = updated.every((l, idx) => l.id === sortedIds[idx]);
      if (isCorrect) {
        audioService.playCorrect();
        audioService.playStar();
        setG4Feedback('correct');
        confetti({ particleCount: 50, spread: 60 });
      } else {
        audioService.playWrong();
        setG4Feedback('wrong');
      }
    }
  };

  // -------------------------------------------------------------
  // Game 5: Complete Word (Missing Letter)
  // -------------------------------------------------------------
  const [g5Target, setG5Target] = useState<ArabicLetter>(ARABIC_LETTERS[0]);
  const [g5Options, setG5Options] = useState<ArabicLetter[]>([]);
  const [g5Feedback, setG5Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG5 = () => {
    const target = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    const others = ARABIC_LETTERS.filter((l) => l.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    setG5Target(target);
    setG5Options([target, ...others].sort(() => 0.5 - Math.random()));
    setG5Feedback(null);
    setTimeout(() => {
      audioService.speakArabic(`ما هو الحرف الناقص في كلمة ${target.example.wordTashkeel}؟`);
    }, 200);
  };

  const handleG5Choice = (chosen: ArabicLetter) => {
    if (chosen.id === g5Target.id) {
      audioService.playCorrect();
      audioService.playStar();
      setG5Feedback('correct');
      confetti({ particleCount: 40, spread: 60 });
      audioService.speakArabic(`أحسنت! الحرف الناقص هو الـ${g5Target.name}، فتكتمل كلمة ${g5Target.example.wordTashkeel}`);
    } else {
      audioService.playWrong();
      setG5Feedback('wrong');
      storageService.recordMistake('letter', g5Target.id);
      audioService.speakArabic('حرف غير مطابق، انظر للكلمة والصورة جيداً');
    }
  };

  // -------------------------------------------------------------
  // Game 6: Listen Number
  // -------------------------------------------------------------
  const [g6Target, setG6Target] = useState<number>(3);
  const [g6Options, setG6Options] = useState<number[]>([1, 3, 5]);
  const [g6Feedback, setG6Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG6 = () => {
    const target = Math.floor(Math.random() * 20); // 0 to 19
    const opt1 = (target + 1 + Math.floor(Math.random() * 3)) % 21;
    const opt2 = (target - 1 - Math.floor(Math.random() * 3) + 21) % 21;
    const opts = Array.from(new Set([target, opt1, opt2])).slice(0, 3);
    while (opts.length < 3) opts.push((opts[0] + 4) % 21);
    setG6Target(target);
    setG6Options(opts.sort(() => 0.5 - Math.random()));
    setG6Feedback(null);
    setTimeout(() => {
      audioService.speakArabic(`استمع جيداً، أين هو الرقم: ${getArabicNumberName(target)}؟`);
    }, 200);
  };

  const handleG6Choice = (chosen: number) => {
    if (chosen === g6Target) {
      audioService.playCorrect();
      audioService.playStar();
      setG6Feedback('correct');
      confetti({ particleCount: 30, spread: 50 });
      storageService.markNumberMastered(g6Target);
      audioService.playNumberPronunciation(chosen, getArabicNumberName(chosen));
    } else {
      audioService.playWrong();
      setG6Feedback('wrong');
      storageService.recordMistake('number', g6Target);
      audioService.playNumberPronunciation(chosen, getArabicNumberName(chosen));
    }
  };

  // -------------------------------------------------------------
  // Game 7: Count Items Fast
  // -------------------------------------------------------------
  const [g7Count, setG7Count] = useState<number>(4);
  const [g7Options, setG7Options] = useState<number[]>([3, 4, 5]);
  const [g7Feedback, setG7Feedback] = useState<'correct' | 'wrong' | null>(null);

  const initG7 = () => {
    const target = Math.floor(Math.random() * 8) + 1; // 1 to 8
    const wrong1 = target > 1 ? target - 1 : target + 2;
    const wrong2 = target < 8 ? target + 1 : target - 2;
    setG7Count(target);
    setG7Options([target, wrong1, wrong2].sort(() => 0.5 - Math.random()));
    setG7Feedback(null);
    audioService.speakArabic('عد الحيوانات اللطيفة واختر العدد الصحيح');
  };

  const handleG7Choice = (chosen: number) => {
    if (chosen === g7Count) {
      audioService.playCorrect();
      audioService.playStar();
      setG7Feedback('correct');
      confetti({ particleCount: 40, spread: 60 });
      storageService.markNumberMastered(g7Count);
      audioService.playNumberPronunciation(chosen, getArabicNumberName(chosen));
    } else {
      audioService.playWrong();
      setG7Feedback('wrong');
      audioService.playNumberPronunciation(chosen, getArabicNumberName(chosen));
    }
  };

  // -------------------------------------------------------------
  // Game 8: Memory Card Game
  // -------------------------------------------------------------
  interface MemoryCard {
    uid: string;
    pairId: number;
    label: string;
    emoji?: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);

  const initMemoryGame = () => {
    const sample = [...ARABIC_LETTERS].sort(() => 0.5 - Math.random()).slice(0, 3);
    const cards: MemoryCard[] = [];

    sample.forEach((item) => {
      cards.push({
        uid: `${item.id}_letter`,
        pairId: item.id,
        label: item.letter,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        uid: `${item.id}_image`,
        pairId: item.id,
        label: item.example.wordTashkeel,
        emoji: item.example.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    setMemoryCards(cards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    audioService.speakArabic('لعبة الذاكرة! اكشف بطاقتين للبحث عن الحرف وصورته المطابقة');
  };

  const handleCardClick = (card: MemoryCard) => {
    if (card.isFlipped || card.isMatched || selectedCards.length >= 2) return;
    audioService.playTap();

    const flipped = memoryCards.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c));
    setMemoryCards(flipped);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId) {
        audioService.playCorrect();
        audioService.playStar();
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.pairId === newSelected[0].pairId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);
        }, 500);
      } else {
        audioService.playWrong();
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.uid === newSelected[0].uid || c.uid === newSelected[1].uid
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // -------------------------------------------------------------
  // Game 9: Daily Challenge
  // -------------------------------------------------------------
  const [dailyIndex, setDailyIndex] = useState<number>(0);
  const [dailyQuestions, setDailyQuestions] = useState<
    { q: string; target: ArabicLetter; choices: ArabicLetter[] }[]
  >([]);
  const [dailyFeedback, setDailyFeedback] = useState<'correct' | 'wrong' | null>(null);

  const initDailyChallenge = () => {
    const list = [...ARABIC_LETTERS].sort(() => 0.5 - Math.random()).slice(0, 3);
    const qs = list.map((item) => {
      const others = ARABIC_LETTERS.filter((l) => l.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      return {
        q: `اختر حرف الـ«${item.name}» الصحيح`,
        target: item,
        choices: [item, ...others].sort(() => 0.5 - Math.random()),
      };
    });
    setDailyQuestions(qs);
    setDailyIndex(0);
    setDailyFeedback(null);
    audioService.speakArabic('مرحباً بك في تحدي اليوم! أجب عن الأسئلة اليومية لتحصل على نجوم إضافية');
  };

  const handleDailyAnswer = (choice: ArabicLetter) => {
    const currentQ = dailyQuestions[dailyIndex];
    if (choice.id === currentQ.target.id) {
      audioService.playCorrect();
      audioService.playStar();
      setDailyFeedback('correct');
      confetti({ particleCount: 30, spread: 50 });
      audioService.speakArabic('إجابة صحيحة يا بطل اليوم!');

      setTimeout(() => {
        if (dailyIndex + 1 < dailyQuestions.length) {
          setDailyIndex((idx) => idx + 1);
          setDailyFeedback(null);
        } else {
          storageService.markLessonComplete('daily_challenge', 5);
          audioService.playLevelUp();
          audioService.speakArabic('مبارك! أكملت تحدي اليوم وحصلت على 5 نجوم ذهبية!');
        }
      }, 1200);
    } else {
      audioService.playWrong();
      setDailyFeedback('wrong');
      audioService.speakArabic('فكر جيداً وحاول مرة أخرى');
    }
  };

  // -------------------------------------------------------------
  // Game 10: Mistakes Review Smart Tray
  // -------------------------------------------------------------
  const troubled = Array.isArray(child?.troubledItems) ? child.troubledItems : [];
  const troubledLetters = troubled
    .filter((t) => t && t.type === 'letter')
    .map((t) => ARABIC_LETTERS.find((l) => l.id === t.id))
    .filter((l): l is ArabicLetter => !!l);

  const initGameByKey = (key: GameKey) => {
    setSelectedGame(key);
    if (key === 'listen_letter') initG1();
    else if (key === 'find_letter_image') initG2();
    else if (key === 'match_pairs') initG3();
    else if (key === 'order_alphabet') initG4();
    else if (key === 'complete_word') initG5();
    else if (key === 'listen_number') initG6();
    else if (key === 'count_items') initG7();
    else if (key === 'memory_game') initMemoryGame();
    else if (key === 'daily_challenge') initDailyChallenge();
  };

  useEffect(() => {
    if (initialGameId) {
      initGameByKey(initialGameId as GameKey);
    }
  }, [initialGameId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-purple-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedGame ? (
            <button
              onClick={() => {
                audioService.playTap();
                setSelectedGame(null);
              }}
              className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>قائمة الألعاب</span>
            </button>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl">
              🎮
            </div>
          )}

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              {selectedGame
                ? GAMES_LIST.find((g) => g.id === selectedGame)?.title
                : 'مدينة الألعاب والتحديات'}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              10 ألعاب وتحديات تفاعلية تثبت الحروف والأرقام بطريقة ممتعة
            </p>
          </div>
        </div>

        {/* Child Score Badge */}
        <div className="flex items-center gap-2">
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-2xl text-xs font-black animate-pulse">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>متتالية {streak}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl text-purple-900 font-bold text-xs md:text-sm">
            <span>⭐</span>
            <span>نجوم طفلي: {child.stars}</span>
          </div>
        </div>
      </div>

      {/* Main Games Grid if no game selected */}
      {!selectedGame && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {GAMES_LIST.map((game, index) => (
            <button
              key={game.id}
              onClick={() => {
                audioService.playTap();
                initGameByKey(game.id);
              }}
              className="group relative overflow-hidden bg-white hover:bg-purple-50/40 rounded-3xl p-6 text-right border-2 border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-2xs">
                    {game.icon}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {game.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-purple-600 block">
                    اللعبة 0{index + 1}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {game.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-purple-600">
                <span>العب التحدي الآن</span>
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 1. Game 1: Listen Letter */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'listen_letter' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-blue-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              تحدي الاستماع للحروف
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اضغط على زر الصوت ثم اختر الحرف الصحيح
            </h3>
          </div>

          {/* Sound trigger */}
          <button
            onClick={() => {
              audioService.playLetterName(g1Target.id, g1Target.name);
            }}
            className="w-24 h-24 mx-auto rounded-3xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-4xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Volume2 className="w-12 h-12" />
          </button>

          {/* 3 Choices */}
          <div className="grid grid-cols-3 gap-4">
            {g1Options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleG1Choice(opt)}
                className="py-6 rounded-3xl bg-blue-50/70 hover:bg-blue-100 border-2 border-blue-200 text-4xl font-black text-blue-900 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {opt.letter}
              </button>
            ))}
          </div>

          {g1Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 رائع! إجابة صحيحة يا بطل</span>
              <button
                onClick={initG1}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                حرف تالٍ
              </button>
            </div>
          )}

          {g1Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              استمع مرة أخرى وحاول!
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 2. Game 2: Find Letter Image */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'find_letter_image' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-purple-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              اكتشف صورة الحرف
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              أي من هذه الصور تبدأ بحرف «{g2Target.letter}» ({g2Target.name})؟
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {g2Options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleG2Choice(opt)}
                className="p-5 rounded-3xl bg-purple-50/60 hover:bg-purple-100 border-2 border-purple-200 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <span className="text-5xl">{opt.example.emoji}</span>
                <span className="text-base font-black text-slate-800">{opt.example.wordTashkeel}</span>
              </button>
            ))}
          </div>

          {g2Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 ممتاز! إجابة صحيحة</span>
              <button
                onClick={initG2}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                سؤال تالٍ
              </button>
            </div>
          )}

          {g2Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              ليست هذه الكلمة، حاول مرة ثانية يا شجاع
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 3. Game 3: Match Pairs */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'match_pairs' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-amber-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              مطابقة الحرف والصورة
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اضغط على الحرف في الصف الأول، ثم اضغط على صورته في الصف الثاني
            </h3>
          </div>

          {/* Row 1: Letters */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">اختر الحرف:</span>
            <div className="grid grid-cols-3 gap-4">
              {g3Pairs.map((p) => {
                const matched = g3MatchedIds.includes(p.id);
                const selected = g3SelectedLetter === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={matched}
                    onClick={() => handleG3LetterClick(p.id)}
                    className={`py-5 rounded-3xl text-4xl font-black border-2 transition-all cursor-pointer ${
                      matched
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-60'
                        : selected
                        ? 'bg-amber-400 border-amber-500 text-white scale-105 shadow-md'
                        : 'bg-white border-amber-200 text-amber-900 hover:scale-102'
                    }`}
                  >
                    {p.letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Images */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">اختر الصورة المطابقة:</span>
            <div className="grid grid-cols-3 gap-4">
              {[...g3Pairs].reverse().map((p) => {
                const matched = g3MatchedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={matched}
                    onClick={() => handleG3EmojiClick(p.id)}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      matched
                        ? 'bg-emerald-100 border-emerald-300 opacity-60'
                        : 'bg-white border-amber-200 hover:border-amber-400 hover:scale-102 shadow-xs'
                    }`}
                  >
                    <span className="text-4xl">{p.emoji}</span>
                    <span className="text-xs font-black text-slate-700">{p.word}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {g3MatchedIds.length === g3Pairs.length && g3Pairs.length > 0 && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 أحسنت! طابقت كل الحروف مع صورها بنجاح</span>
              <button
                onClick={initG3}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                جولة جديدة
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 4. Game 4: Order Alphabet */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'order_alphabet' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-emerald-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              ترتيب الأبجدية
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اضغط على الحروف بالتسلسل الأبجدي الصحيح
            </h3>
          </div>

          {/* Sorted Basket */}
          <div className="bg-emerald-50/60 p-4 rounded-3xl border-2 border-dashed border-emerald-300 min-h-[90px] flex items-center justify-center gap-3">
            {g4UserOrdered.length === 0 ? (
              <span className="text-emerald-700 font-bold text-sm">
                ابدأ بالحرف الأول في الترتيب الأبجدي...
              </span>
            ) : (
              g4UserOrdered.map((l, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-2xl bg-emerald-600 text-white text-3xl font-black flex items-center justify-center shadow-xs"
                >
                  {l.letter}
                </div>
              ))
            )}
          </div>

          {/* Choices */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {g4Letters.map((letter) => {
              const used = g4UserOrdered.some((l) => l.id === letter.id);
              return (
                <button
                  key={letter.id}
                  disabled={used}
                  onClick={() => handleG4TapLetter(letter)}
                  className={`w-16 h-16 rounded-3xl text-3xl font-black border-2 transition-all cursor-pointer ${
                    used
                      ? 'bg-slate-200 border-slate-300 text-slate-400 opacity-40 cursor-not-allowed'
                      : 'bg-white border-emerald-300 text-emerald-950 hover:scale-105 active:scale-95 shadow-xs'
                  }`}
                >
                  {letter.letter}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={initG4}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إعادة الجولة
            </button>
          </div>

          {g4Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 رائع! ترتيب أبجدي ممتاز</span>
              <button
                onClick={initG4}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                تحدٍ جديد
              </button>
            </div>
          )}

          {g4Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              الترتيب يحتاج مراجعة، أعد المحاولة يا عبقري!
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 5. Game 5: Complete Word */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'complete_word' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-rose-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              أكمل الكلمة
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اختر الحرف الناقص في بداية الكلمة
            </h3>
          </div>

          {/* Word display with blank */}
          <div className="py-6 bg-rose-50/70 rounded-3xl border border-rose-200 max-w-md mx-auto space-y-2">
            <span className="text-6xl block">{g5Target.example.emoji}</span>
            <div className="text-4xl font-black text-slate-800 tracking-wider">
              {g5Feedback === 'correct' ? (
                <span className="text-emerald-600">{g5Target.example.wordTashkeel}</span>
              ) : (
                <span>_ {g5Target.example.word.slice(1)}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {g5Options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleG5Choice(opt)}
                className="py-5 rounded-3xl bg-white hover:bg-rose-50 border-2 border-rose-300 text-4xl font-black text-rose-900 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {opt.letter}
              </button>
            ))}
          </div>

          {g5Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 أحسنت! اكتملت الكلمة بنجاح</span>
              <button
                onClick={initG5}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                كلمة أخرى
              </button>
            </div>
          )}

          {g5Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              حرف غير صحيح، استعن بصورة الكلمة!
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 6. Game 6: Listen Number */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'listen_number' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-cyan-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div>
            <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full">
              اسمع الرقم
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اضغط على زر الصوت واستمع للرقم ثم اختره
            </h3>
          </div>

          <button
            onClick={() => {
              audioService.playNumberPronunciation(g6Target, getArabicNumberName(g6Target));
            }}
            className="w-24 h-24 mx-auto rounded-3xl bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center text-4xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Volume2 className="w-12 h-12" />
          </button>

          <div className="grid grid-cols-3 gap-4">
            {g6Options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleG6Choice(opt)}
                className="py-6 rounded-3xl bg-cyan-50/70 hover:bg-cyan-100 border-2 border-cyan-300 text-4xl font-black text-cyan-950 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {toArabicDigits(opt)}
              </button>
            ))}
          </div>

          {g6Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 إجابة صحيحة يا بطل الأرقام!</span>
              <button
                onClick={initG6}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                رقم تالٍ
              </button>
            </div>
          )}

          {g6Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              استمع مرة ثانية بتركيز
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 7. Game 7: Count Items */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'count_items' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-lime-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-lime-900 bg-lime-100 px-3 py-1 rounded-full">
              عد الحيوانات اللطيفة
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              كم أرنباً لطيفاً تراه في الحقل؟
            </h3>
          </div>

          <div className="bg-lime-50/60 p-6 rounded-3xl border-2 border-lime-200 flex flex-wrap items-center justify-center gap-4 min-h-[140px]">
            {Array.from({ length: g7Count }).map((_, i) => (
              <span key={i} className="text-4xl md:text-5xl">🐰</span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {g7Options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleG7Choice(opt)}
                className="py-5 rounded-3xl bg-white hover:bg-lime-50 border-2 border-lime-300 text-4xl font-black text-lime-950 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {toArabicDigits(opt)}
              </button>
            ))}
          </div>

          {g7Feedback === 'correct' && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center justify-between">
              <span>🎉 عد ممتاز وصحيح!</span>
              <button
                onClick={initG7}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                عد جديد
              </button>
            </div>
          )}

          {g7Feedback === 'wrong' && (
            <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-sm font-bold">
              عد الأرانب واحداً واحداً وحاول ثانية
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 8. Game 8: Memory Game */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'memory_game' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-violet-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-xs font-bold text-violet-800 bg-violet-100 px-3 py-1 rounded-full">
              لعبة الذاكرة الذكية
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              اكشف بطاقتين وابحث عن الحرف وصورته المتطابقة
            </h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 max-w-2xl mx-auto">
            {memoryCards.map((card) => {
              const show = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.uid}
                  disabled={card.isMatched}
                  onClick={() => handleCardClick(card)}
                  className={`h-24 sm:h-28 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    card.isMatched
                      ? 'bg-emerald-100 border-emerald-300 opacity-60'
                      : show
                      ? 'bg-white border-violet-400 text-violet-900 shadow-md scale-102'
                      : 'bg-gradient-to-br from-violet-600 to-purple-700 border-violet-800 text-white hover:scale-105'
                  }`}
                >
                  {show ? (
                    <>
                      {card.emoji && <span className="text-2xl">{card.emoji}</span>}
                      <span className="text-xl">{card.label}</span>
                    </>
                  ) : (
                    <span className="text-2xl">❓</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={initMemoryGame}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إعادة توزيع البطاقات
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 9. Game 9: Daily Challenge */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'daily_challenge' && dailyQuestions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-red-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>تحدي اليوم</span>
            </span>

            <span className="text-xs font-bold text-slate-500">
              السؤال {dailyIndex + 1} من {dailyQuestions.length}
            </span>
          </div>

          <h3 className="text-2xl font-black text-slate-900">
            {dailyQuestions[dailyIndex].q}
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {dailyQuestions[dailyIndex].choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleDailyAnswer(choice)}
                className="py-6 rounded-3xl bg-red-50/60 hover:bg-red-100 border-2 border-red-200 text-4xl font-black text-red-950 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                {choice.letter}
              </button>
            ))}
          </div>

          {dailyFeedback === 'correct' && (
            <div className="p-3 bg-emerald-100 text-emerald-900 font-bold rounded-2xl text-sm">
              أحسنت! الانتقال للسؤال التالي...
            </div>
          )}

          {dailyFeedback === 'wrong' && (
            <div className="p-3 bg-rose-100 text-rose-900 font-bold rounded-2xl text-sm">
              حاول ثانية يا بطل
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 10. Game 10: Mistakes Review */}
      {/* ------------------------------------------------------- */}
      {selectedGame === 'mistakes_review' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-teal-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
              صندوق مراجعة الأخطاء الذكي
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              الحروف والأرقام التي تحتاج إلى تثبيت
            </h3>
            <p className="text-xs text-slate-500">
              يتذكر النظام تلقائياً أي حرف أو رقم واجه فيه الطفل صعوبة ليعيد التدرب عليه بذكاء
            </p>
          </div>

          {troubledLetters.length === 0 ? (
            <div className="py-12 text-center bg-teal-50/50 rounded-3xl border-2 border-dashed border-teal-200">
              <span className="text-5xl block mb-2">🌟</span>
              <p className="text-lg font-black text-teal-900">ما شاء الله! لا توجد أخطاء حالياً</p>
              <p className="text-xs text-teal-700">
                أنت تجيب ببراعة فائقة في جميع الحروف والأرقام! استمر في اللعب والتعلم.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {troubledLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="bg-teal-50/40 p-4 rounded-2xl border border-teal-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center">
                      {letter.letter}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-800 block">
                        حرف {letter.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        مثال: {letter.example.wordTashkeel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      audioService.playChime();
                      audioService.speakArabic(`حرف الـ${letter.name}.. ${letter.example.wordTashkeel}`);
                    }}
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
