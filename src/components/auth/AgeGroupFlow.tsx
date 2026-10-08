import React from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import type { LearningTrack } from '../../types';
import { AgeGroupLearningExperience } from './AgeGroupLearningExperience';

interface AgeGroupSelectionProps {
  childName: string;
  onSelectGroup: (group: LearningTrack) => void;
}

interface FutureGroupPageProps {
  childName: string;
  childAge: number;
  onBack: () => void;
}

export const AgeGroupSelection: React.FC<AgeGroupSelectionProps> = ({ childName, onSelectGroup }) => (
  <main dir="rtl" lang="ar" className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 px-4 py-8">
    <section className="w-full max-w-2xl space-y-5">
      <header className="rounded-[2rem] border border-amber-200 bg-white p-6 text-center shadow-lg shadow-amber-900/5 sm:p-8">
        <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Sparkles className="h-7 w-7" /></span>
        <p className="mb-1 text-sm font-bold text-amber-700">أهلًا {childName}</p>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">اختر الفئة العمرية</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">اختر المسار المناسب، ويمكنك تغيير اختيارك لاحقًا من الهيدر.</p>
      </header>

      <div className="space-y-4">
        <button type="button" onClick={() => onSelectGroup('2-4')} className="group flex w-full items-center gap-4 rounded-[1.75rem] border-2 border-amber-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg sm:p-6">
          <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"><span className="text-2xl font-black">٢–٤</span><span className="text-xs font-bold">سنوات</span></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-lg font-black text-slate-900">عالم البداية <BookOpen className="h-5 w-5 text-amber-500" /></span><span className="mt-1 block text-sm leading-6 text-slate-600">الحروف والأرقام والألعاب التعليمية الموجودة في الموقع، بأنشطة ممتعة للصغار.</span><span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-amber-700">ادخل إلى المحتوى الحالي <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span></span>
        </button>

        <button type="button" onClick={() => onSelectGroup('5-7')} className="group flex w-full items-center gap-4 rounded-[1.75rem] border-2 border-sky-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-lg sm:p-6">
          <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md"><span className="text-2xl font-black">٥–٧</span><span className="text-xs font-bold">سنوات</span></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-lg font-black text-slate-900">مغامرة المستكشفين <Sparkles className="h-5 w-5 text-sky-500" /></span><span className="mt-1 block text-sm leading-6 text-slate-600">مسار متدرّج فيه دروس عربية ورياضيات وإنجليزية تأسيسية وتحديات قصيرة.</span><span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-sky-700">اكتشف المسار الجديد <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></span></span>
        </button>
      </div>
    </section>
  </main>
);

export const FutureGroupPage: React.FC<FutureGroupPageProps> = ({ childName, childAge, onBack }) => (
  <AgeGroupLearningExperience childName={childName} childAge={childAge} onBack={onBack} />
);
