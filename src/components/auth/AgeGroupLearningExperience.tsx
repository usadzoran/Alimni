import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Compass,
  Hash,
  Home,
  Languages,
  Lightbulb,
  Medal,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AGE_PROFILES, type ExerciseQuestion } from '../../data/ageGroupExercises';
import {
  LEARNING_JOURNEY,
  LEARNING_SUBJECTS,
  LESSONS_BY_SUBJECT,
  type ExerciseBankId,
  type LearningLesson,
  type LearningSubject,
  type SubjectId,
  type SubjectTheme,
} from '../../data/ageGroupCurriculum';

interface AgeGroupLearningExperienceProps {
  childName: string;
  childAge: number;
  onBack: () => void;
}

type LearningRoute =
  | { screen: 'home' }
  | { screen: 'subject'; subjectId: SubjectId }
  | { screen: 'lesson'; subjectId: SubjectId; lessonId: string }
  | { screen: 'exercise'; subjectId: SubjectId; lessonId: string };

type LessonLocation = { subjectId: SubjectId; lessonId: string };

const THEME_STYLES: Record<SubjectTheme, { surface: string; text: string; border: string; button: string; pale: string }> = {
  amber: { surface: 'from-amber-400 to-orange-500', text: 'text-amber-800', border: 'border-amber-200', button: 'bg-amber-500 hover:bg-amber-600', pale: 'bg-amber-50' },
  sky: { surface: 'from-sky-400 to-cyan-500', text: 'text-sky-800', border: 'border-sky-200', button: 'bg-sky-600 hover:bg-sky-700', pale: 'bg-sky-50' },
  blue: { surface: 'from-blue-400 to-indigo-500', text: 'text-blue-800', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700', pale: 'bg-blue-50' },
  violet: { surface: 'from-violet-400 to-purple-500', text: 'text-violet-800', border: 'border-violet-200', button: 'bg-violet-600 hover:bg-violet-700', pale: 'bg-violet-50' },
  emerald: { surface: 'from-emerald-400 to-teal-500', text: 'text-emerald-800', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700', pale: 'bg-emerald-50' },
};

const SUBJECT_ICONS: Record<SubjectId, LucideIcon> = {
  arabic: BookOpen,
  math: Hash,
  english: Languages,
  thinking: Brain,
};

const pickSessionQuestions = (bank: ExerciseQuestion[], sessionSize: number): ExerciseQuestion[] => {
  const shuffled = [...bank];
  const count = Math.min(sessionSize, shuffled.length);
  for (let index = 0; index < count; index += 1) {
    const selectedIndex = index + Math.floor(Math.random() * (shuffled.length - index));
    [shuffled[index], shuffled[selectedIndex]] = [shuffled[selectedIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
};

const getRouteHash = (route: LearningRoute): string => {
  if (route.screen === 'home') return '';
  if (route.screen === 'subject') return `#subject/${route.subjectId}`;
  return `#${route.screen}/${route.subjectId}/${route.lessonId}`;
};

const isSubjectId = (value: string): value is SubjectId => LEARNING_SUBJECTS.some((item) => item.id === value);

const resolveHashRoute = (hash: string): LearningRoute => {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
  if (parts[0] === 'subject' && parts[1] && isSubjectId(parts[1])) {
    return { screen: 'subject', subjectId: parts[1] };
  }
  if ((parts[0] === 'lesson' || parts[0] === 'exercise') && parts[1] && parts[2] && isSubjectId(parts[1])) {
    const lessonExists = LESSONS_BY_SUBJECT[parts[1]].some((lesson) => lesson.id === parts[2]);
    if (lessonExists) return { screen: parts[0], subjectId: parts[1], lessonId: parts[2] };
  }
  return { screen: 'home' };
};

const findLesson = (subjectId: SubjectId, lessonId: string): LearningLesson | undefined =>
  LESSONS_BY_SUBJECT[subjectId].find((lesson) => lesson.id === lessonId);

const getExerciseSet = (age: number, bank: ExerciseBankId, questionCategory?: LearningLesson['questionCategory']) => {
  const profile = AGE_PROFILES.find((item) => item.age === age);
  if (!profile) return undefined;
  if (bank === 'arabic') return { questions: profile.arabicQuestions, sessionSize: profile.arabicSessionSize, language: 'ar' as const };
  if (bank === 'math') return { questions: profile.mathQuestions, sessionSize: profile.mathSessionSize, language: 'ar' as const };
  if (bank === 'english') return { questions: profile.englishQuestions, sessionSize: profile.englishSessionSize, language: 'en' as const };
  const questions = profile.thinkingQuestions.filter((question) => question.category === questionCategory);
  return { questions, sessionSize: Math.min(3, questions.length), language: 'ar' as const };
};

const PageFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="learning-page-enter">
    {children}
  </div>
);

const ScreenHeader: React.FC<{
  childName: string;
  age: number;
  backLabel: string;
  onBack: () => void;
  onHome: () => void;
  onChangeGroup: () => void;
}> = ({ childName, age, backLabel, onBack, onHome, onChangeGroup }) => (
  <header className="mb-5 flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onBack} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-sky-300 hover:text-sky-700" aria-label={backLabel} title={backLabel}>
        <ArrowRight className="h-5 w-5" />
      </button>
      <button type="button" onClick={onHome} className="flex min-w-0 items-center gap-2 text-right" aria-label="لوحة التعلم">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-sm"><Sparkles className="h-5 w-5" /></span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-slate-900">عَلِّمني</span>
          <span className="block truncate text-[11px] font-bold text-slate-500">مغامرة التعلّم</span>
        </span>
      </button>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <span className="hidden max-w-40 truncate rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:inline">أهلًا {childName.split(' ')[0]}</span>
      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-black text-sky-800">{age} سنوات</span>
      <button type="button" onClick={onChangeGroup} aria-label="تغيير الفئة العمرية" title="تغيير الفئة العمرية" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100">
        <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">تغيير الفئة</span>
      </button>
    </div>
  </header>
);

const PrimaryButton: React.FC<{ children: React.ReactNode; onClick: () => void; theme?: SubjectTheme; icon?: LucideIcon }> = ({ children, onClick, theme = 'sky', icon: Icon = ArrowLeft }) => (
  <button type="button" onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 ${THEME_STYLES[theme].button}`}>
    {children}<Icon className="h-4 w-4" />
  </button>
);

const LessonProgress: React.FC<{ count: number; total: number }> = ({ count, total }) => (
  <div className="mt-4" aria-label={`أكملت ${count} من ${total} دروس`}>
    <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600"><span>تقدم جلستك</span><span>{count} / {total} دروس</span></div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-sky-500 transition-all duration-500" style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></div>
  </div>
);

const DashboardPage: React.FC<{
  childName: string;
  age: number;
  completedCount: number;
  onOpenSubject: (subjectId: SubjectId) => void;
  onOpenLesson: (location: LessonLocation) => void;
}> = ({ childName, age, completedCount, onOpenSubject, onOpenLesson }) => {
  const allLessons = Object.values(LESSONS_BY_SUBJECT).reduce((count, lessons) => count + lessons.length, 0);
  const firstLesson = { subjectId: 'arabic' as const, lessonId: 'letters' };
  const firstName = childName.split(' ')[0];

  return (
    <PageFrame>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-l from-sky-600 via-blue-600 to-indigo-600 px-5 py-7 text-white shadow-xl shadow-blue-900/10 sm:px-8 sm:py-9">
        <div className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-1/3 h-36 w-36 rounded-full bg-cyan-300/15" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><Sparkles className="h-3.5 w-3.5" /> مسار المستكشفين · {age} سنوات</span>
            <h1 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">جاهز لمغامرة جديدة يا {firstName}؟</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">اختر مادة، افتح درسًا قصيرًا، ثم جرّب تحدّيًا مناسبًا لعمرك. كل خطوة تقرّبك من نجمة جديدة.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={() => onOpenLesson(firstLesson)} theme="amber" icon={ArrowLeft}>ابدأ أول مغامرة</PrimaryButton>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-50"><Star className="h-4 w-4 fill-yellow-300 text-yellow-300" /> {completedCount} نجوم في هذه الجلسة</span>
            </div>
          </div>
          <div className="hidden h-36 w-36 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-7xl shadow-inner md:flex" aria-hidden="true">🚀</div>
        </div>
        <div className="relative mt-7 max-w-xl"><LessonProgress count={completedCount} total={allLessons} /></div>
      </section>

      <section aria-labelledby="subjects-heading" className="mb-7">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><p className="text-xs font-black text-sky-700">اختر وجهتك</p><h2 id="subjects-heading" className="mt-1 text-xl font-black text-slate-950">ماذا نكتشف اليوم؟</h2></div>
          <span className="hidden text-xs font-bold text-slate-500 sm:inline">اضغط على مادة لعرض دروسها</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {LEARNING_SUBJECTS.map((subject, index) => {
            const theme = THEME_STYLES[subject.theme];
            const Icon = SUBJECT_ICONS[subject.id];
            return (
              <button key={subject.id} type="button" onClick={() => onOpenSubject(subject.id)} className={`group flex min-h-36 items-start gap-3 rounded-3xl border ${theme.border} bg-white p-4 text-right shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100`}>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.surface} text-white shadow-sm`}><Icon className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="font-black text-slate-900">{subject.shortTitle}</span><span className={`text-lg font-black ${theme.text}`}>{['١','٢','٣','٤'][index]}</span></span>
                  <span className="mt-2 block text-xs leading-5 text-slate-600">{subject.description}</span>
                  <span className={`mt-3 inline-flex items-center gap-1 text-xs font-black ${theme.text}`}>اكتشف الدروس <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" /></span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="journey-heading" className="mb-7 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-800"><Compass className="h-5 w-5" /></span><div><p className="text-xs font-black text-violet-700">خريطة الطريق</p><h2 id="journey-heading" className="text-lg font-black text-slate-950">ست محطات صغيرة، وإنجازات كبيرة</h2></div></div>
        <p className="mb-4 text-sm leading-6 text-slate-600">اختر محطة لتفتح درسها مباشرة. صُممت المراحل بتدرج يناسب أعمار ٥ و٦ و٧ سنوات.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_JOURNEY.map((stage, index) => {
            const activeForAge = stage.age === age;
            const subject = LEARNING_SUBJECTS.find((item) => item.id === stage.subjectId)!;
            return (
              <button key={stage.id} type="button" onClick={() => onOpenLesson({ subjectId: stage.subjectId, lessonId: stage.lessonId })} className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition hover:-translate-y-0.5 hover:shadow-sm ${activeForAge ? 'border-sky-200 bg-sky-50/70' : 'border-slate-100 bg-slate-50/60 hover:border-sky-100'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${activeForAge ? 'bg-sky-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>{index + 1}</span>
                <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-black text-slate-900">{stage.title}</span>{activeForAge && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">عمرك</span>}</span><span className="mt-1 block truncate text-xs text-slate-500">{stage.summary} · {subject.shortTitle}</span></span>
                <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            );
          })}
        </div>
      </section>

      <aside className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-amber-950">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm leading-6"><strong>تعلّم على راحتك:</strong> لا يوجد مؤقت أو عقوبة على الخطأ؛ جرّب من جديد، وكل إجابة صحيحة تقرّبك من هدفك.</p>
      </aside>
    </PageFrame>
  );
};

const SubjectPage: React.FC<{
  subject: LearningSubject;
  completedIds: Set<string>;
  onOpenLesson: (lessonId: string) => void;
}> = ({ subject, completedIds, onOpenLesson }) => {
  const lessons = LESSONS_BY_SUBJECT[subject.id];
  const theme = THEME_STYLES[subject.theme];
  const done = lessons.filter((lesson) => completedIds.has(`${subject.id}/${lesson.id}`)).length;
  const Icon = SUBJECT_ICONS[subject.id];
  return (
    <PageFrame>
      <section className={`mb-6 overflow-hidden rounded-[1.75rem] border ${theme.border} bg-white shadow-sm`}>
        <div className={`bg-gradient-to-l ${theme.surface} px-5 py-6 text-white sm:px-7`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black"><Icon className="h-4 w-4" /> مسار تعلّم</span>
          <h1 className="mt-3 text-2xl font-black sm:text-3xl">{subject.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">{subject.description} اختر درسًا لتبدأ، ثم انتقل إلى تحدّيه في صفحة خاصة.</p>
        </div>
        <div className="p-5 sm:p-6"><LessonProgress count={done} total={lessons.length} /></div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-black text-slate-500">دروس قصيرة، خطوةً خطوة</p><h2 className="mt-1 text-lg font-black text-slate-950">اختر درسًا</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${theme.pale} ${theme.text}`}>{lessons.length} دروس</span></div>
      <div className="space-y-3">
        {lessons.map((lesson, index) => {
          const completed = completedIds.has(`${subject.id}/${lesson.id}`);
          return (
            <button key={lesson.id} type="button" onClick={() => onOpenLesson(lesson.id)} className={`group flex w-full items-center gap-4 rounded-3xl border ${completed ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'} p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-5`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${completed ? 'bg-emerald-100 text-emerald-800' : `${theme.pale} ${theme.text}`}`}>{completed ? <Check className="h-6 w-6" /> : String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-black text-slate-900">{lesson.title}</span>{completed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">مكتمل</span>}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{lesson.description}</span><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" />{lesson.duration} تقريبًا</span></span>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${theme.text}`}><ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-1" /></span>
            </button>
          );
        })}
      </div>
    </PageFrame>
  );
};

const LessonPage: React.FC<{
  subject: LearningSubject;
  lesson: LearningLesson;
  age: number;
  completed: boolean;
  nextLesson?: LearningLesson;
  onStartExercise: () => void;
  onOpenNext: () => void;
}> = ({ subject, lesson, age, completed, nextLesson, onStartExercise, onOpenNext }) => {
  const theme = THEME_STYLES[subject.theme];
  const Icon = SUBJECT_ICONS[subject.id];
  const ageFocus = lesson.ageFocus[age as 5 | 6 | 7];
  return (
    <PageFrame>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500"><span>{subject.shortTitle}</span><ChevronLeft className="h-3.5 w-3.5" /><span className="text-slate-800">صفحة الدرس</span></div>
      <section className={`mb-5 rounded-[1.75rem] border ${theme.border} bg-white p-5 shadow-sm sm:p-7`}>
        <div className="flex items-start gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.surface} text-white shadow-sm`}><Icon className="h-7 w-7" /></span>
          <div className="min-w-0 flex-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${theme.pale} ${theme.text}`}>{subject.shortTitle} · {lesson.duration}</span><h1 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{lesson.title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{lesson.description}</p></div>
          {completed && <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 sm:inline-flex"><CheckCircle2 className="h-4 w-4" /> أُنجز</span>}
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 font-black text-slate-950"><Target className={`h-5 w-5 ${theme.text}`} /> هدفنا في هذا الدرس</h2>
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lesson.objective}</p>
          <div className={`mt-4 rounded-2xl ${theme.pale} p-4`}><p className={`text-xs font-black ${theme.text}`}>مناسب لعمرك · {age} سنوات</p><p className="mt-1 text-sm leading-6 text-slate-700">{ageFocus}</p></div>
        </article>
        <article className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 font-black text-slate-950"><Sparkles className="h-5 w-5 text-sky-700" /> خطوات المغامرة</h2>
          <ol className="mt-4 space-y-3">{lesson.steps.map((step, index) => <li key={step} className="flex items-center gap-3 text-sm font-bold leading-6 text-slate-700"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-sky-800 shadow-sm">{index + 1}</span>{step}</li>)}</ol>
        </article>
      </section>

      <article className="mb-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6">
        <p className="text-xs font-black text-amber-800">{lesson.exampleTitle}</p><p className="mt-2 text-lg font-black leading-8 text-slate-900">{lesson.example}</p>
        <p className="mt-2 text-sm leading-6 text-amber-950/80">اقرأ المثال بصوتك، ثم جرّب التحدّي. إذا أخطأت، يمكنك المحاولة مرة أخرى بلا استعجال.</p>
      </article>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PrimaryButton onClick={onStartExercise} theme={subject.theme} icon={ArrowLeft}>ابدأ التمرين</PrimaryButton>
        {nextLesson && <button type="button" onClick={onOpenNext} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-800">الدرس التالي: {nextLesson.title}<ArrowLeft className="h-4 w-4" /></button>}
      </div>
    </PageFrame>
  );
};

const ExercisePage: React.FC<{
  lesson: LearningLesson;
  subject: LearningSubject;
  age: number;
  onBackToLesson: () => void;
  onComplete: () => void;
  onOpenNext?: () => void;
}> = ({ lesson, subject, age, onBackToLesson, onComplete, onOpenNext }) => {
  const theme = THEME_STYLES[subject.theme];
  const exerciseSet = useMemo(() => getExerciseSet(age, lesson.exerciseBank, lesson.questionCategory), [age, lesson.exerciseBank, lesson.questionCategory]);
  const [sessionQuestions, setSessionQuestions] = useState<ExerciseQuestion[]>(() => exerciseSet ? pickSessionQuestions(exerciseSet.questions, exerciseSet.sessionSize) : []);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const question = sessionQuestions[questionIndex];
  const isEnglish = exerciseSet?.language === 'en';

  const retry = () => {
    if (!exerciseSet) return;
    setSessionQuestions(pickSessionQuestions(exerciseSet.questions, exerciseSet.sessionSize));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setFinished(false);
  };

  const chooseAnswer = (index: number) => {
    if (isCorrect === true) return;
    setSelectedAnswer(index);
    setIsCorrect(index === question?.answer);
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= sessionQuestions.length) {
      setFinished(true);
      onComplete();
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (!exerciseSet) {
    return <PageFrame><section className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-xl font-black text-amber-950">هذا المسار مناسب لعمر ٥–٧ سنوات</h1><p className="mt-2 text-sm leading-6 text-amber-900">اختر المسار المطابق للعمر المسجّل حتى تظهر التحديات المناسبة.</p><button type="button" onClick={onBackToLesson} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white">العودة إلى الدرس<ArrowRight className="h-4 w-4" /></button></section></PageFrame>;
  }

  if (finished || !question) {
    return (
      <PageFrame>
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-emerald-200 bg-white p-6 text-center shadow-lg shadow-emerald-900/5 sm:p-9">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-md"><Trophy className="h-10 w-10" /></span>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800"><Medal className="h-4 w-4" /> نجمة جديدة في رصيدك</span>
          <h1 className="mt-4 text-2xl font-black text-slate-950">أحسنت! أنهيت التحدّي</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">أكملت {sessionQuestions.length} أسئلة في درس «{lesson.title}». خذ لحظة للاحتفال، ثم اختر خطوتك التالية.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={onBackToLesson} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 ${theme.button}`}>العودة إلى الدرس<ArrowRight className="h-4 w-4" /></button>{onOpenNext && <button type="button" onClick={onOpenNext} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-sky-300 hover:text-sky-800">تابع إلى الدرس التالي<ArrowLeft className="h-4 w-4" /></button>}</div>
          <button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"><RotateCcw className="h-4 w-4" /> أعد التحدّي بأسئلة مختلفة</button>
        </section>
      </PageFrame>
    );
  }

  const progress = Math.round((questionIndex / sessionQuestions.length) * 100);
  return (
    <PageFrame>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500"><span>{subject.shortTitle}</span><ChevronLeft className="h-3.5 w-3.5" /><span>{lesson.title}</span><ChevronLeft className="h-3.5 w-3.5" /><span className="text-slate-800">صفحة التمرين</span></div>
      <section className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className={`text-xs font-black ${theme.text}`}>تحدّي {subject.shortTitle}</p><h1 className="mt-1 text-xl font-black text-slate-950">{lesson.title}</h1></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">السؤال {questionIndex + 1} من {sessionQuestions.length}</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-sky-500 transition-all duration-300" style={{ width: `${Math.max(progress, 8)}%` }} /></div>
        </div>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-md sm:p-7">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Lightbulb className="h-5 w-5" /></span> فكّر بهدوء واختر إجابة واحدة</div>
          <p lang={isEnglish ? 'en' : 'ar'} dir={isEnglish ? 'ltr' : 'rtl'} className={`rounded-2xl ${theme.pale} p-5 text-lg font-black leading-8 text-slate-900 sm:text-xl`}>{question.prompt}</p>
          <div className="mt-4 grid gap-3">
            {question.options.map((option, index) => {
              const chosen = selectedAnswer === index;
              const correctOption = question.answer === index;
              const style = isCorrect === true && correctOption
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                : isCorrect === false && chosen
                  ? 'border-rose-300 bg-rose-50 text-rose-900'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50';
              return (
                <button key={`${questionIndex}-${option}`} type="button" disabled={isCorrect === true} onClick={() => chooseAnswer(index)} lang={isEnglish ? 'en' : 'ar'} dir={isEnglish ? 'ltr' : 'rtl'} className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-lg font-bold transition ${isEnglish ? 'text-left' : 'text-right'} ${style} disabled:cursor-default`}>
                  <span>{option}</span>{isCorrect === true && correctOption && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                </button>
              );
            })}
          </div>
          {isCorrect === false && <p role="status" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">قريب! اقرأ السؤال مرة أخرى وجرّب اختيارًا آخر. لا بأس بالمحاولة.</p>}
          {isCorrect === true && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4"><p role="status" className="flex items-center gap-2 text-sm font-black text-emerald-800"><CheckCircle2 className="h-5 w-5" /> إجابة صحيحة! أحسنت.</p><button type="button" onClick={nextQuestion} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800">{questionIndex + 1 === sessionQuestions.length ? 'أنهِ التحدّي' : 'السؤال التالي'}<ArrowLeft className="h-4 w-4" /></button></div>}
          <p className="mt-4 text-center text-xs font-medium text-slate-400">لا يوجد مؤقت — تعلّم بالسرعة التي تناسبك</p>
        </article>
      </section>
    </PageFrame>
  );
};

export const AgeGroupLearningExperience: React.FC<AgeGroupLearningExperienceProps> = ({ childName, childAge, onBack }) => {
  const [route, setRoute] = useState<LearningRoute>(() => resolveHashRoute(window.location.hash));
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const syncFromAddress = () => setRoute(resolveHashRoute(window.location.hash));
    window.addEventListener('popstate', syncFromAddress);
    window.addEventListener('hashchange', syncFromAddress);
    return () => {
      window.removeEventListener('popstate', syncFromAddress);
      window.removeEventListener('hashchange', syncFromAddress);
    };
  }, []);

  const navigate = (nextRoute: LearningRoute) => {
    const nextHash = getRouteHash(nextRoute);
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      window.history.pushState({ alimniLearning: nextHash }, '', nextUrl);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackTo = (fallbackRoute: LearningRoute) => {
    const currentState = window.history.state as { alimniLearning?: string } | null;
    if (currentState?.alimniLearning) window.history.back();
    else navigate(fallbackRoute);
  };

  const backToAgeGroups = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setRoute({ screen: 'home' });
    onBack();
  };

  const subjectId = route.screen === 'home' ? undefined : route.subjectId;
  const subject = subjectId ? LEARNING_SUBJECTS.find((item) => item.id === subjectId) : undefined;
  const lesson = route.screen === 'lesson' || route.screen === 'exercise' ? findLesson(route.subjectId, route.lessonId) : undefined;
  const allSubjectLessons = subject ? LESSONS_BY_SUBJECT[subject.id] : [];
  const lessonIndex = lesson ? allSubjectLessons.findIndex((item) => item.id === lesson.id) : -1;
  const nextLesson = lessonIndex >= 0 ? allSubjectLessons[lessonIndex + 1] : undefined;
  const backLabel = route.screen === 'home' ? 'تغيير الفئة العمرية' : route.screen === 'subject' ? 'العودة إلى لوحة التعلم' : route.screen === 'lesson' ? 'العودة إلى قائمة المادة' : 'العودة إلى الدرس';
  const completedCount = completedIds.size;

  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-[#f7f8fc] px-3 py-4 text-slate-900 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-6xl">
        <ScreenHeader
          childName={childName}
          age={childAge}
          backLabel={backLabel}
          onBack={() => {
            if (route.screen === 'home') backToAgeGroups();
            else if (route.screen === 'subject') goBackTo({ screen: 'home' });
            else if (route.screen === 'lesson') goBackTo({ screen: 'subject', subjectId: route.subjectId });
            else goBackTo({ screen: 'lesson', subjectId: route.subjectId, lessonId: route.lessonId });
          }}
          onHome={() => navigate({ screen: 'home' })}
          onChangeGroup={backToAgeGroups}
        />

        {route.screen === 'home' && <DashboardPage childName={childName} age={childAge} completedCount={completedCount} onOpenSubject={(id) => navigate({ screen: 'subject', subjectId: id })} onOpenLesson={(location) => navigate({ screen: 'lesson', ...location })} />}

        {route.screen === 'subject' && subject && <SubjectPage subject={subject} completedIds={completedIds} onOpenLesson={(lessonId) => navigate({ screen: 'lesson', subjectId: subject.id, lessonId })} />}

        {route.screen === 'lesson' && subject && lesson && <LessonPage subject={subject} lesson={lesson} age={childAge} completed={completedIds.has(`${subject.id}/${lesson.id}`)} nextLesson={nextLesson} onStartExercise={() => navigate({ screen: 'exercise', subjectId: subject.id, lessonId: lesson.id })} onOpenNext={() => { if (nextLesson) navigate({ screen: 'lesson', subjectId: subject.id, lessonId: nextLesson.id }); }} />}

        {route.screen === 'exercise' && subject && lesson && <ExercisePage key={`${subject.id}/${lesson.id}`} subject={subject} lesson={lesson} age={childAge} onBackToLesson={() => goBackTo({ screen: 'lesson', subjectId: subject.id, lessonId: lesson.id })} onComplete={() => setCompletedIds((previous) => new Set(previous).add(`${subject.id}/${lesson.id}`))} onOpenNext={nextLesson ? () => navigate({ screen: 'lesson', subjectId: subject.id, lessonId: nextLesson.id }) : undefined} />}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> كل محاولة تعلّم جديد</span>
          <button type="button" onClick={() => navigate({ screen: 'home' })} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-bold text-slate-600 transition hover:bg-white hover:text-sky-800"><Home className="h-4 w-4" /> لوحة التعلم</button>
        </footer>
      </div>
    </main>
  );
};
