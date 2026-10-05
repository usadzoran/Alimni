import React from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  HeartHandshake,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface AdultOverviewViewProps {
  onStartKids: () => void;
  onOpenParent: () => void;
}

const BENEFITS = [
  {
    icon: BookOpenCheck,
    title: 'تعلم قصير وواضح',
    text: 'أنشطة صغيرة تناسب وقت الطفل وتحافظ على تركيزه دون ضغط.',
    color: 'blue',
  },
  {
    icon: HeartHandshake,
    title: 'تعلم مع التشجيع',
    text: 'كل خطوة تتحول إلى نجمة ومكافأة ورسالة إيجابية يفهمها الطفل.',
    color: 'rose',
  },
  {
    icon: ShieldCheck,
    title: 'متابعة أسهل للأسرة',
    text: 'يشاهد ولي الأمر التقدم والمهارات التي تحتاج إلى مراجعة في مكان واحد.',
    color: 'emerald',
  },
];

const STEPS = [
  ['01', 'أنشئ ملف الطفل', 'اختر الاسم والعمر والشخصية المحببة.'],
  ['02', 'اتركه يكتشف', 'الحروف والأرقام والألعاب مصممة لتُفهم من أول مرة.'],
  ['03', 'تابع التقدم', 'راجع الإنجازات واحتفل بالتقدم مع طفلك.'],
];

export const AdultOverviewView: React.FC<AdultOverviewViewProps> = ({ onStartKids, onOpenParent }) => {
  const handleStart = () => {
    audioService.playTap();
    onStartKids();
  };

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-10 text-white shadow-xl sm:px-8 md:px-12 md:py-14">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-200">
              <Sparkles className="h-4 w-4" />
              <span>مساحة هادئة للتعلم والنمو</span>
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
              تعليم العربية يصبح أسهل عندما يتحول إلى رحلة ممتعة.
            </h1>
            <p className="max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
              عالم الحروف والأرقام منصة عربية بسيطة تجمع التعلم باللعب، وتمنح الطفل خطوات صغيرة واضحة، وتمنح الأسرة صورة مفهومة عن التقدم.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
              >
                <PlayCircle className="h-5 w-5" />
                <span>جرّب واجهة الطفل</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={onOpenParent}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <span>افتح مساحة ولي الأمر</span>
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-100 via-white to-blue-50 p-5 text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700">تقدم جميل اليوم</span>
                  <span className="text-3xl">🌱</span>
                </div>
                <div className="mt-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500">ملف سارة</p>
                    <p className="mt-1 text-3xl font-black text-slate-900">42%</p>
                  </div>
                  <div className="text-left text-xs font-bold text-amber-700">⭐ 12 نجمة</div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">🔤 12 حرفاً</div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">🔢 8 أرقام</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-white/20 bg-white px-4 py-3 text-xs font-black text-slate-800 shadow-xl">
              ✅ بدون تعقيد
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.2em] text-amber-600">لماذا عالم الحروف والأرقام؟</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">تجربة واحدة، مفهومة للجميع</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">صممنا الواجهة بحيث يعرف الطفل ما الذي يفعله، ويعرف الكبير لماذا يفيده.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text, color }) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-700">
              <Users className="h-5 w-5" />
              <span className="text-xs font-black">ثلاث خطوات فقط</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">ابدأ من المكان المناسب لكم</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">لا تحتاج إلى شرح طويل. اختر ملف الطفل، ابدأ بنشاط واحد، ثم دع التقدم يتراكم بهدوء.</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {STEPS.map(([number, title, text]) => (
              <div key={number} className="rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-xs font-black text-amber-500">{number}</span>
                <h3 className="mt-3 text-sm font-black text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-blue-600 px-5 py-6 text-white shadow-lg sm:flex-row sm:px-8">
        <div>
          <h2 className="text-xl font-black">هل نبدأ أول مغامرة؟</h2>
          <p className="mt-1 text-sm text-blue-100">الطفل يتعلم باللعب، والأسرة تتابع بثقة.</p>
        </div>
        <button onClick={handleStart} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50">
          <span>إلى عالم الطفل</span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
};
