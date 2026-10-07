import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Lock, Star, Sparkles, Play, Award, RotateCcw, Volume2 } from 'lucide-react';
import { APP_LEVELS } from '../../data/levelsData';
import { ARABIC_LETTERS } from '../../data/lettersData';
import { ALL_NUMBERS, toArabicDigits, getArabicNumberName } from '../../data/numbersData';
import { ChildProfile, LevelDefinition } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface LevelsRoadmapViewProps {
  child: ChildProfile;
  onNavigateToContent: (tab: 'letters' | 'numbers' | 'games') => void;
}

interface ExamQuestion {
  question: string;
  audioPrompt: string;
  choices: { text: string; isCorrect: boolean }[];
}

export const LevelsRoadmapView: React.FC<LevelsRoadmapViewProps> = ({
  child,
  onNavigateToContent,
}) => {
  const [examLevel, setExamLevel] = useState<LevelDefinition | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

  // Generate dynamic questions based on level
  const generateLevelExam = (level: LevelDefinition): ExamQuestion[] => {
    if (level.id === 1) {
      // First 10 letters
      const sample = ARABIC_LETTERS.slice(0, 10).sort(() => 0.5 - Math.random()).slice(0, 5);
      return sample.map((l) => {
        const wrong1 = ARABIC_LETTERS[(l.id + 2) % 28];
        const wrong2 = ARABIC_LETTERS[(l.id + 4) % 28];
        return {
          question: `أين هو حرف الـ«${l.name}»؟`,
          audioPrompt: `أين هو حرف الـ${l.name}؟`,
          choices: [
            { text: l.letter, isCorrect: true },
            { text: wrong1.letter, isCorrect: false },
            { text: wrong2.letter, isCorrect: false },
          ].sort(() => 0.5 - Math.random()),
        };
      });
    } else if (level.id === 2) {
      // Letters 11-28
      const sample = ARABIC_LETTERS.slice(10, 28).sort(() => 0.5 - Math.random()).slice(0, 5);
      return sample.map((l) => {
        const wrong = ARABIC_LETTERS[(l.id + 3) % 28];
        return {
          question: `أي صورة تبدأ بحرف الـ«${l.name}»؟`,
          audioPrompt: `أي صورة تبدأ بحرف الـ${l.name}؟`,
          choices: [
            { text: `${l.example.emoji} ${l.example.wordTashkeel}`, isCorrect: true },
            { text: `${wrong.example.emoji} ${wrong.example.wordTashkeel}`, isCorrect: false },
          ].sort(() => 0.5 - Math.random()),
        };
      });
    } else if (level.id === 4) {
      // Numbers 0-10
      const nums = [1, 3, 5, 7, 9].sort(() => 0.5 - Math.random()).slice(0, 5);
      return nums.map((n) => {
        const w1 = (n + 1) % 11;
        const w2 = (n + 2) % 11;
        return {
          question: `أين هو الرقم «${getArabicNumberName(n)}»؟`,
          audioPrompt: `أين هو الرقم: ${getArabicNumberName(n)}؟`,
          choices: [
            { text: toArabicDigits(n), isCorrect: true },
            { text: toArabicDigits(w1), isCorrect: false },
            { text: toArabicDigits(w2), isCorrect: false },
          ].sort(() => 0.5 - Math.random()),
        };
      });
    } else {
      // General mixed questions
      return [
        {
          question: 'ما هو أول حرف في الأبجدية العربية؟',
          audioPrompt: 'ما هو أول حرف في الأبجدية العربية؟',
          choices: [
            { text: 'أ', isCorrect: true },
            { text: 'ب', isCorrect: false },
            { text: 'ت', isCorrect: false },
          ],
        },
        {
          question: 'أي عدد هو الأكبر؟',
          audioPrompt: 'أي عدد هو الأكبر بين هذه الأعداد؟',
          choices: [
            { text: '١٠ (عشرة)', isCorrect: true },
            { text: '٥ (خمسة)', isCorrect: false },
            { text: '٢ (اثنان)', isCorrect: false },
          ],
        },
        {
          question: 'كلمة «أَسَد» تبدأ بحرف:',
          audioPrompt: 'كلمة أسد تبدأ بحرف ماذا؟',
          choices: [
            { text: 'أ', isCorrect: true },
            { text: 'س', isCorrect: false },
            { text: 'د', isCorrect: false },
          ],
        },
        {
          question: 'كم عدد النجوم في: ⭐ ⭐ ⭐؟',
          audioPrompt: 'كم عدد النجوم الظاهرة أمامك؟',
          choices: [
            { text: '٣ (ثلاثة)', isCorrect: true },
            { text: '٢ (اثنان)', isCorrect: false },
            { text: '٤ (أربعة)', isCorrect: false },
          ],
        },
        {
          question: 'شكل حرف الباء في أول الكلمة:',
          audioPrompt: 'كيف يُكتب حرف الباء في أول الكلمة؟',
          choices: [
            { text: 'بـ', isCorrect: true },
            { text: 'ـب', isCorrect: false },
            { text: 'ـبـ', isCorrect: false },
          ],
        },
      ];
    }
  };

  const startLevelExam = (level: LevelDefinition) => {
    audioService.playTap();
    const qs = generateLevelExam(level);
    setExamQuestions(qs);
    setCurrentQIndex(0);
    setCorrectCount(0);
    setExamSubmitted(false);
    setExamLevel(level);

    audioService.speakArabic(`اختبار ${level.titleArabic}. أجب عن 5 أسئلة بتركيز لتحصل على 80% وتفتح المستوى التالي!`);
  };

  const handleSelectAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      audioService.playCorrect();
      setCorrectCount((c) => c + 1);
    } else {
      audioService.playWrong();
    }

    if (currentQIndex + 1 < examQuestions.length) {
      setCurrentQIndex((idx) => idx + 1);
      const nextQ = examQuestions[currentQIndex + 1];
      setTimeout(() => {
        audioService.speakArabic(nextQ.audioPrompt);
      }, 300);
    } else {
      // Exam finished
      setExamSubmitted(true);
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const scorePercent = Math.round((finalCorrect / examQuestions.length) * 100);
      const passed = scorePercent >= (examLevel?.minExamScorePercent ?? 80);

      storageService.recordQuizAttempt({
        category: 'level_exam',
        title: `اختبار ${examLevel?.name}`,
        totalQuestions: examQuestions.length,
        correctAnswers: finalCorrect,
        scorePercent,
        passed,
      });

      if (passed) {
        audioService.playLevelUp();
        confetti({ particleCount: 70, spread: 80 });
        audioService.speakArabic(`مبارك يا بطل! حققت نسبة ${scorePercent} بالمئة واجتزت المستوى بنجاح باهر!`);
      } else {
        audioService.speakArabic(`حققت نسبة ${scorePercent} بالمئة. أنت قريب جداً من النجاح (80%)! راجع الحروف وأعد الاختبار`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-amber-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>🏆</span>
            <span>خريطة المستويات الستة</span>
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            تدرج من الحروف الأولى وحتى القراءة السريعة والأرقام الكبيرة
          </p>
        </div>

        {/* Current Level Pill */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-900">
            أنت في المستوى {child?.currentLevelId || 1}: {APP_LEVELS[(child?.currentLevelId || 1) - 1]?.name}
          </span>
        </div>
      </div>

      {/* Levels Path Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APP_LEVELS.map((level) => {
          const currentLevel = child?.currentLevelId || 1;
          const isUnlocked = level.id <= currentLevel;
          const isCurrent = level.id === currentLevel;
          const isCompleted = level.id < currentLevel;

          return (
            <div
              key={level.id}
              className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 shadow-md ring-2 ring-amber-300'
                  : isCompleted
                  ? 'bg-white border-emerald-300 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-3xl">
                    {level.icon}
                  </div>

                  {isCompleted && (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>مكتمل</span>
                    </span>
                  )}

                  {isCurrent && (
                    <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>مستواك الحالي</span>
                    </span>
                  )}

                  {!isUnlocked && (
                    <span className="flex items-center gap-1 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مغلق</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1">
                  {level.titleArabic}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  {level.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/80 space-y-2">
                {isUnlocked ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        audioService.playTap();
                        if (level.id <= 3) onNavigateToContent('letters');
                        else onNavigateToContent('numbers');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>دخول الدروس</span>
                    </button>

                    <button
                      onClick={() => startLevelExam(level)}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>اختبار المستوى</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-slate-400">
                    اجتز المستوى السابق بنسبة 80% لفتح هذا المستوى
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Exam Modal */}
      {examLevel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border-2 border-amber-300 shadow-2xl space-y-6 text-center animate-scale-up">
            {!examSubmitted ? (
              <>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    {examLevel.titleArabic}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    السؤال {currentQIndex + 1} من {examQuestions.length}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  {examQuestions[currentQIndex]?.question}
                </h3>

                <button
                  onClick={() => {
                    audioService.playChime();
                    audioService.speakArabic(examQuestions[currentQIndex]?.audioPrompt || '');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>أعد قراءة السؤال صوتياً</span>
                </button>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {examQuestions[currentQIndex]?.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(choice.isCorrect)}
                      className="py-4 px-6 rounded-2xl bg-amber-50/60 hover:bg-amber-100 border-2 border-amber-200 text-xl font-black text-slate-800 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setExamLevel(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    إلغاء الاختبار والخروج
                  </button>
                </div>
              </>
            ) : (
              /* Exam Result */
              <div className="space-y-4 py-4">
                {Math.round((correctCount / examQuestions.length) * 100) >= examLevel.minExamScorePercent ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-4xl mx-auto shadow-sm">
                      🎉
                    </div>
                    <h3 className="text-2xl font-black text-emerald-800">
                      مبارك! اجتزت الاختبار بنجاح باهر!
                    </h3>
                    <p className="text-base text-slate-700 font-bold">
                      أجبت على {correctCount} من {examQuestions.length} بنسبة{' '}
                      {Math.round((correctCount / examQuestions.length) * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      تم فتح المستوى التالي وإضافة 10 نجوم ذهبية إلى حسابك!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-4xl mx-auto shadow-sm">
                      💪
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">
                      محاولة جيدة يا بطل!
                    </h3>
                    <p className="text-base text-slate-700 font-bold">
                      أجبت على {correctCount} من {examQuestions.length} بنسبة{' '}
                      {Math.round((correctCount / examQuestions.length) * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      تحتاج إلى 80% لاجتياز المستوى. راجع الدروس السابقة وأعد الاختبار في أي وقت!
                    </p>
                  </>
                )}

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => startLevelExam(examLevel)}
                    className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار</span>
                  </button>

                  <button
                    onClick={() => setExamLevel(null)}
                    className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer"
                  >
                    العودة للخريطة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
