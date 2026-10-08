import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Hash, Lightbulb, Sparkles, Target, Volume2 } from 'lucide-react';
import { LearningTrack } from '../../types';

interface AgeGroupSelectionProps {
  childName: string;
  onSelectGroup: (group: LearningTrack) => void;
}

interface FutureGroupPageProps {
  childName: string;
  onBack: () => void;
}

const LEARNING_PATHS = [
  {
    icon: BookOpen,
    title: 'اللغة العربية والقراءة',
    color: 'text-amber-700 bg-amber-50 border-amber-100',
    topics: ['الحروف وأشكالها وأصواتها', 'الحركات والمقاطع والكلمات', 'قراءة جمل وقصص قصيرة وفهمها'],
  },
  {
    icon: Hash,
    title: 'الأعداد والرياضيات',
    color: 'text-sky-700 bg-sky-50 border-sky-100',
    topics: ['العدّ والكميات والمقارنة', 'الجمع والطرح بالتدرج', 'الأنماط والأشكال والمسائل اللفظية'],
  },
  {
    icon: Volume2,
    title: 'الاستماع واللغة الشفهية',
    color: 'text-violet-700 bg-violet-50 border-violet-100',
    topics: ['فهم التعليمات والمفردات', 'ترتيب أحداث القصة', 'الوصف وإعادة الحكاية'],
  },
  {
    icon: Lightbulb,
    title: 'التفكير والانتباه',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    topics: ['المطابقة والذاكرة والتصنيف', 'إكمال الأنماط والتسلسل', 'الألغاز والعلاقات المكانية'],
  },
];

const LEVELS = [
  {
    number: '١',
    title: 'مستكشف الرموز',
    summary: 'الحروف والأرقام الأولى',
    arabic: ['التعرف البصري والسمعي إلى الحروف', 'ربط الحرف بصور وكلمات مألوفة', 'تمييز أشكال الحروف في مواضعها الأولى'],
    math: ['الأعداد والكميات من ٠ إلى ١٠', 'المطابقة واحدًا لواحد', 'مقارنة مجموعات صغيرة'],
    thinking: ['المطابقة والتصنيف بصفة واحدة', 'إكمال نمط من عنصرين'],
    outcome: 'يتعرف الطفل على حروف وأرقام أولية ويربط الرقم بكمية محسوسة.',
  },
  {
    number: '٢',
    title: 'صائد الأصوات',
    summary: 'الانتباه إلى الصوت والترتيب',
    arabic: ['سماع الصوت الأول والأخير في الكلمات', 'التعرف إلى شكل الحرف في بداية الكلمة ونهايتها', 'مراجعة الحروف المتشابهة بصريًا وصوتيًا'],
    math: ['العد حتى ٢٠ وترتيب الأعداد', 'مقارنة الأعداد والكميات', 'مفاهيم قبل/بعد وأكثر/أقل'],
    thinking: ['ترتيب صور أحداث قصيرة', 'ألعاب ذاكرة وفرز بمعيارين'],
    outcome: 'يميّز الطفل أصواتًا أولية ويقرأ أو يطابق أعدادًا ضمن ٢٠.',
  },
  {
    number: '٣',
    title: 'باني المقاطع',
    summary: 'الحركات والدمج والحساب المحسوس',
    arabic: ['الفتحة والكسرة والضمة', 'دمج صوت الحرف مع الحركة', 'قراءة مقاطع وكلمات قصيرة جدًا وتتبع كتابة الحرف'],
    math: ['جمع وطرح محسوسان ضمن ١٠', 'العد التنازلي', 'أنماط عددية بسيطة'],
    thinking: ['اتباع تسلسل من خطوتين', 'اختيار العنصر المختلف وشرح السبب شفهيًا'],
    outcome: 'يدمج الطفل أصواتًا وحركات مألوفة ويحل مسائل محسوسة بسيطة.',
  },
  {
    number: '٤',
    title: 'قارئ الكلمات',
    summary: 'الكلمات والمدود والأعداد الأكبر',
    arabic: ['قراءة كلمات مألوفة مشكولة', 'المد بالألف والواو والياء', 'مطابقة الكلمة بالصورة أو معناها'],
    math: ['التدرج نحو الأعداد حتى ٥٠', 'تمهيد الآحاد والعشرات', 'الجمع والطرح ضمن ١٠'],
    thinking: ['ألغاز منطقية قصيرة', 'إكمال سلاسل ومقارنة أطوال أو كميات'],
    outcome: 'يقرأ الطفل كلمات قصيرة ويفهم معناها، ويجرب استراتيجيات حسابية بسيطة.',
  },
  {
    number: '٥',
    title: 'صانع الجمل',
    summary: 'الجمل والفهم والمسائل',
    arabic: ['قراءة جمل قصيرة والإجابة عن من/ماذا/أين', 'ترتيب كلمات لتكوين جملة بسيطة', 'نسخ كلمات مألوفة'],
    math: ['التعرف إلى الأعداد حتى ١٠٠ بحسب الاستعداد', 'الجمع والطرح ضمن ٢٠ بالصور أو خط الأعداد', 'قراءة مخطط مصور بسيط'],
    thinking: ['مسألة لفظية من خطوة واحدة', 'اكتشاف قاعدة نمط وشرحها'],
    outcome: 'يقرأ الطفل جملة قصيرة، ويجيب عن سؤال مباشر، ويشرح طريقة حل بسيطة.',
  },
  {
    number: '٦',
    title: 'بطل القصص والمسائل',
    summary: 'التطبيق والاستقلالية',
    arabic: ['قراءة قصة قصيرة مناسبة', 'فهم أحداثها وترتيبها وإعادة روايتها', 'كتابة كلمة أو جملة قصيرة باستقلالية أكبر'],
    math: ['حل مسائل حياتية قصيرة في الجمع والطرح', 'مراجعة القيمة المكانية الأساسية', 'القياس والمقارنة والأشكال والأنماط'],
    thinking: ['مشروع مصغر يجمع القراءة والعد والتصنيف', 'شرح خطوات العمل بكلمات الطفل'],
    outcome: 'يطبق الطفل ما تعلمه في نشاط متكامل ويشرح ما فعله.',
  },
];

const LessonSteps = ['تهيئة قصيرة', 'هدف واحد واضح', 'عرض صوتي ومرئي', 'تجربة وتحدٍ', 'خلاصة ومكافأة'];

export const AgeGroupSelection: React.FC<AgeGroupSelectionProps> = ({ childName, onSelectGroup }) => (
  <main dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 px-4 py-8 flex items-center justify-center">
    <section className="w-full max-w-2xl space-y-5">
      <header className="rounded-[2rem] border border-amber-200 bg-white p-6 text-center shadow-lg shadow-amber-900/5 sm:p-8">
        <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">🎈</span>
        <p className="mb-1 text-sm font-bold text-amber-700">أهلًا {childName}</p>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">اختر الفئة العمرية</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">اختر المسار المناسب، ويمكنك الرجوع إلى هذه الصفحة لتغيير اختيارك.</p>
      </header>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onSelectGroup('2-4')}
          className="group flex w-full items-center gap-4 rounded-[1.75rem] border-2 border-amber-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg sm:p-6"
        >
          <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <span className="text-2xl font-black">٢–٤</span>
            <span className="text-xs font-bold">سنوات</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-lg font-black text-slate-900">عالم البداية <BookOpen className="h-5 w-5 text-amber-500" /></span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">الحروف والأرقام والألعاب التعليمية الموجودة في الموقع، بأنشطة ممتعة للصغار.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-amber-700">ادخل إلى المحتوى الحالي <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectGroup('5-7')}
          className="group flex w-full items-center gap-4 rounded-[1.75rem] border-2 border-sky-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-lg sm:p-6"
        >
          <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
            <span className="text-2xl font-black">٥–٧</span>
            <span className="text-xs font-bold">سنوات</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-lg font-black text-slate-900">مغامرة المستكشفين <Sparkles className="h-5 w-5 text-sky-500" /></span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">مسار جديد سنبني محتواه معًا، ليناسب الأطفال من 5 إلى 7 سنوات.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-sky-700">افتح صفحة هذا المسار <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span>
          </span>
        </button>
      </div>
    </section>
  </main>
);

export const FutureGroupPage: React.FC<FutureGroupPageProps> = ({ childName, onBack }) => (
  <main dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-4 py-8">
    <section className="mx-auto w-full max-w-5xl space-y-8">
      <header className="overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-xl shadow-blue-900/5">
        <div className="bg-gradient-to-l from-sky-600 via-blue-600 to-indigo-600 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl">🚀</span>
          <p className="text-sm font-bold text-sky-100">أهلًا {childName}</p>
          <h1 className="mt-2 text-2xl font-black sm:text-4xl">مغامرة المستكشفين</h1>
          <p className="mt-2 text-base font-bold text-white/90">خريطة التعلّم المقترحة للفئة ٥–٧ سنوات</p>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 bg-white px-5 py-4 text-center sm:flex-row sm:text-right">
          <p className="max-w-2xl text-sm leading-6 text-slate-600">هذه هي هيكلة القسم الذي سنبنيه معًا. المراحل أدناه خريطة مقترحة؛ أما الدروس والألعاب الفعلية فسنبنيها بعد مراجعتها.</p>
          <span className="shrink-0 rounded-full bg-sky-50 px-4 py-2 text-xs font-black text-sky-800">خطة أولية للمراجعة</span>
        </div>
      </header>

      <section aria-labelledby="learning-paths-title">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-600" />
          <h2 id="learning-paths-title" className="text-xl font-black text-slate-900">المسارات التعليمية</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LEARNING_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <article key={path.title} className={`rounded-2xl border p-5 ${path.color}`}>
                <h3 className="flex items-center gap-2 font-black"><Icon className="h-5 w-5" />{path.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {path.topics.map((topic) => <li key={topic} className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 opacity-70" /><span>{topic}</span></li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="levels-title">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 id="levels-title" className="text-xl font-black text-slate-900">التدرج في ست مراحل</h2>
            <p className="mt-1 text-sm text-slate-500">افتح كل مرحلة للاطلاع على موضوعاتها وهدفها.</p>
          </div>
        </div>
        <div className="space-y-3">
          {LEVELS.map((level) => (
            <details key={level.number} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm open:border-sky-200 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg font-black text-sky-800">{level.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black text-slate-900">{level.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{level.summary}</span>
                </span>
                <span className="text-sm font-bold text-sky-700 group-open:hidden">التفاصيل</span>
                <span className="hidden text-sm font-bold text-sky-700 group-open:inline">إخفاء</span>
              </summary>
              <div className="border-t border-slate-100 px-4 py-5 sm:px-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-black text-amber-800"><BookOpen className="h-4 w-4" />اللغة العربية</h3>
                    <ul className="space-y-2 text-sm leading-6 text-slate-600">{level.arabic.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-black text-sky-800"><Hash className="h-4 w-4" />الرياضيات</h3>
                    <ul className="space-y-2 text-sm leading-6 text-slate-600">{level.math.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-black text-emerald-800"><Lightbulb className="h-4 w-4" />التفكير</h3>
                    <ul className="space-y-2 text-sm leading-6 text-slate-600">{level.thinking.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                </div>
                <p className="mt-5 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"><strong>هدف المرحلة:</strong> {level.outcome}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><Sparkles className="h-5 w-5 text-indigo-600" />قالب الدرس الواحد</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LessonSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl bg-indigo-50/70 p-3 text-sm font-bold text-indigo-900">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">يتضمن كل درس هدفًا واحدًا، ومثالًا مسموعًا ومرئيًا، وتجربة قصيرة، ثم تغذية راجعة مشجعة. عند الخطأ يحصل الطفل على تلميح ومحاولة جديدة، بلا عقوبة أو مؤقت إلزامي.</p>
      </section>

      <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-black text-amber-900"><CheckCircle2 className="h-5 w-5" />كيف يتقدم الطفل؟</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-950 sm:grid-cols-2">
          <li>• تقييم تمهيدي خفيف للتعرف إلى المهارات، لا للرسوب أو التصنيف.</li>
          <li>• انتقال بحسب الإتقان في أكثر من نشاط، لا بحسب العمر وحده.</li>
          <li>• مراجعة قصيرة وتلميح إضافي عند الحاجة، مع إمكانية إعادة الدرس.</li>
          <li>• عرض المهارات المتقنة وقيد التدريب بلغة مشجعة ومكافآت بسيطة.</li>
        </ul>
      </section>

      <footer className="pb-4 text-center">
        <p className="mx-auto mb-5 max-w-2xl text-sm leading-6 text-slate-500">الخطوة التالية بعد مراجعة الهيكلة: بناء شاشة «رحلتي اليوم»، ثم دروس الحروف والأصوات، فالأعداد والأنشطة.</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-black text-white shadow-md transition hover:bg-sky-700"
        >
          <ArrowLeft className="h-5 w-5" /> العودة لاختيار الفئة
        </button>
      </footer>
    </section>
  </main>
);
