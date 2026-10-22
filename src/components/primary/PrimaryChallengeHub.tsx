import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, BookOpen, Calculator, CheckCircle2, Globe2, Languages, RotateCcw, Sparkles, Trophy, XCircle } from 'lucide-react';
import type { ChildProfile } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

type Subject = 'arabic' | 'french' | 'english' | 'math';
type Question = { prompt: string; choices: string[]; answer: number; hint?: string };
const SUBJECTS: Array<{ id: Subject; title: string; subtitle: string; icon: React.ReactNode; tone: string }> = [
  { id: 'arabic', title: 'اللغة العربية', subtitle: 'قراءة، قواعد ومفردات', icon: <Languages className="h-7 w-7" />, tone: 'from-amber-500 to-orange-600' },
  { id: 'french', title: 'Français', subtitle: 'Vocabulaire et grammaire', icon: <Globe2 className="h-7 w-7" />, tone: 'from-blue-500 to-indigo-600' },
  { id: 'english', title: 'English', subtitle: 'Vocabulary and grammar', icon: <BookOpen className="h-7 w-7" />, tone: 'from-emerald-500 to-teal-600' },
  { id: 'math', title: 'الرياضيات', subtitle: 'حساب، كسور وهندسة', icon: <Calculator className="h-7 w-7" />, tone: 'from-purple-500 to-fuchsia-600' },
];
const QUESTIONS: Record<Subject, Question[]> = {
  arabic: [
    { prompt: 'ما مرادف كلمة «سعيد»؟', choices: ['حزين', 'فرح', 'سريع', 'صغير'], answer: 1 },
    { prompt: 'ما نوع كلمة «يكتب»؟', choices: ['اسم', 'فعل', 'حرف', 'صفة'], answer: 1 },
    { prompt: 'اختر الجملة الصحيحة:', choices: ['الطلابُ مجتهدون.', 'الطلابَ مجتهدون.', 'الطلابُ مجتهدين.', 'الطلابِ مجتهدٌ.'], answer: 0 },
    { prompt: 'ما جمع كلمة «كتاب»؟', choices: ['كاتب', 'كتابات', 'كتب', 'مكتبة'], answer: 2 },
    { prompt: 'ما ضد كلمة «قريب»؟', choices: ['جميل', 'بعيد', 'كبير', 'قديم'], answer: 1 },
    { prompt: 'في جملة «قرأَ التلميذُ القصةَ»، ما المفعول به؟', choices: ['قرأ', 'التلميذ', 'القصة', 'لا يوجد'], answer: 2 },
  ],
  french: [
    { prompt: 'Choisis le pluriel de « un livre ».', choices: ['des livres', 'une livre', 'un livres', 'les livr'], answer: 0 },
    { prompt: 'Complète : « Je ___ à l’école. »', choices: ['vas', 'vais', 'va', 'allez'], answer: 1 },
    { prompt: 'Quel est le contraire de « grand » ?', choices: ['long', 'petit', 'joli', 'fort'], answer: 1 },
    { prompt: 'Choisis l’article correct : « ___ maison ».', choices: ['un', 'le', 'une', 'des'], answer: 2 },
    { prompt: '« Bonjour » veut dire :', choices: ['Goodbye', 'Hello', 'Thank you', 'Please'], answer: 1 },
    { prompt: 'Complète : « Nous ___ un exercice. »', choices: ['fait', 'faisons', 'font', 'faire'], answer: 1 },
  ],
  english: [
    { prompt: 'Choose the correct sentence.', choices: ['She play football.', 'She plays football.', 'She playing football.', 'She plays foots.'], answer: 1 },
    { prompt: 'What is the opposite of “hot”?', choices: ['warm', 'big', 'cold', 'fast'], answer: 2 },
    { prompt: 'Complete: “I ___ a student.”', choices: ['is', 'are', 'am', 'be'], answer: 2 },
    { prompt: 'What is the plural of “child”?', choices: ['childs', 'children', 'childes', 'childrens'], answer: 1 },
    { prompt: 'Choose the correct question word: “___ is your name?”', choices: ['Where', 'What', 'When', 'Who'], answer: 1 },
    { prompt: '“Book” means:', choices: ['قلم', 'كرسي', 'كتاب', 'باب'], answer: 2 },
  ],
  math: [
    { prompt: 'احسب: 245 + 137 = ؟', choices: ['372', '382', '392', '362'], answer: 1 },
    { prompt: 'احسب: 600 - 278 = ؟', choices: ['322', '332', '312', '328'], answer: 0 },
    { prompt: 'ما ناتج 8 × 7؟', choices: ['54', '56', '64', '48'], answer: 1 },
    { prompt: 'أي كسر يساوي النصف؟', choices: ['1/3', '2/3', '2/4', '3/4'], answer: 2 },
    { prompt: 'محيط مربع طول ضلعه 5 سم هو:', choices: ['10 سم', '15 سم', '20 سم', '25 سم'], answer: 2 },
    { prompt: 'إذا كان معك 100 دينار واشتريت كتابًا بـ35، فكم يتبقى؟', choices: ['55', '65', '75', '135'], answer: 1 },
  ],
};

export const PrimaryChallengeHub: React.FC<{ child: ChildProfile; onBack: () => void }> = ({ child, onBack }) => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const questions = useMemo(() => subject ? QUESTIONS[subject] : [], [subject]);
  const active = subject ? SUBJECTS.find((item) => item.id === subject) : null;
  const start = (next: Subject) => { setSubject(next); setIndex(0); setScore(0); setAnswered(null); setFinished(false); audioService.playTap(); };
  const answer = (choice: number) => {
    if (answered !== null || !subject) return;
    setAnswered(choice);
    const correct = choice === questions[index].answer;
    if (correct) { setScore((value) => value + 1); audioService.playCorrect(); } else audioService.playWrong();
  };
  const next = () => {
    if (!subject || answered === null) return;
    const finalScore = score + (answered === questions[index].answer ? 1 : 0);
    if (index + 1 >= questions.length) {
      setScore(finalScore); setFinished(true);
      storageService.recordQuizAttempt({ category: 'primary_challenge', title: active?.title ?? 'تحدي ابتدائي', totalQuestions: questions.length, correctAnswers: finalScore, scorePercent: Math.round((finalScore / questions.length) * 100), passed: finalScore >= Math.ceil(questions.length * 0.6) });
      if (finalScore >= Math.ceil(questions.length * 0.6)) { confetti({ particleCount: 90, spread: 75 }); audioService.playLevelUp(); }
      return;
    }
    setIndex((value) => value + 1); setAnswered(null);
  };
  if (!subject) return <main dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-4 py-6"><div className="mx-auto max-w-6xl space-y-6"><header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-indigo-700 to-purple-700 p-6 text-white shadow-lg"><div><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black"><Sparkles className="h-4 w-4" /> المستوى المتقدم</span><h1 className="mt-3 text-3xl font-black">تحديات السنة الرابعة والخامسة ابتدائي</h1><p className="mt-2 text-sm leading-6 text-indigo-100">أهلًا {child.name}، اختر مادة وابدأ تحديًا جديدًا.</p></div><div className="text-6xl">🎓</div></header><div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-900">اختر المادة</h2><button type="button" onClick={onBack} className="inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm"><ArrowRight className="h-4 w-4" /> تغيير المسار</button></div><div className="grid gap-4 sm:grid-cols-2">{SUBJECTS.map((item) => <button type="button" key={item.id} onClick={() => start(item.id)} className={`rounded-3xl bg-gradient-to-br ${item.tone} p-6 text-right text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl`}><div className="flex items-start justify-between"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">{item.icon}</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{QUESTIONS[item.id].length} أسئلة</span></div><h3 className="mt-6 text-2xl font-black">{item.title}</h3><p className="mt-1 text-sm text-white/85">{item.subtitle}</p><span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-800">ابدأ التحدي <ArrowRight className="h-4 w-4" /></span></button>)}</div></div></main>;
  if (finished) return <main dir="rtl" className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4"><section className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-xl"><Trophy className="mx-auto h-16 w-16 text-amber-500" /><h1 className="mt-4 text-3xl font-black">أحسنت يا {child.name}!</h1><p className="mt-3 text-slate-600">نتيجتك في {active?.title}: <strong className="text-indigo-700">{score} / {questions.length}</strong></p><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-purple-600" style={{ width: `${(score / questions.length) * 100}%` }} /></div><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => start(subject)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-black text-white"><RotateCcw className="h-4 w-4" /> إعادة التحدي</button><button type="button" onClick={() => setSubject(null)} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">اختيار مادة أخرى</button></div></section></main>;
  const current = questions[index];
  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-3xl space-y-5"><header className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm"><div><p className="text-xs font-black text-indigo-600">{active?.title}</p><h1 className="mt-1 text-xl font-black">السؤال {index + 1} من {questions.length}</h1></div><button type="button" onClick={() => setSubject(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">المواد</button></header><section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10"><div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-7 text-center"><p className="text-xl font-black leading-10 text-slate-900">{current.prompt}</p>{current.hint && <p className="mt-2 text-xs text-slate-500">{current.hint}</p>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{current.choices.map((choice, choiceIndex) => { const isCorrect = choiceIndex === current.answer; const selected = choiceIndex === answered; return <button type="button" key={choice} disabled={answered !== null} onClick={() => answer(choiceIndex)} className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-lg font-black transition ${answered !== null && isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : selected ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'}`}>{choice}</button>; })}</div>{answered !== null && <div className={`mt-6 flex items-center justify-between rounded-2xl p-4 text-sm font-black ${answered === current.answer ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><span className="inline-flex items-center gap-2">{answered === current.answer ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{answered === current.answer ? 'إجابة صحيحة!' : 'الإجابة الصحيحة ظاهرة باللون الأخضر'}</span><button type="button" onClick={next} className="rounded-xl bg-slate-900 px-4 py-2 text-xs text-white">{index + 1 === questions.length ? 'النتيجة' : 'السؤال التالي'}</button></div>}</section></div></main>;
};
