import React from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { LearningTrack } from '../../types';

interface AgeGroupSelectionProps {
  childName: string;
  onSelectGroup: (group: LearningTrack) => void;
}

interface FutureGroupPageProps {
  childName: string;
  onBack: () => void;
}

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
  <main dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-4 py-8 flex items-center justify-center">
    <section className="w-full max-w-2xl rounded-[2rem] border border-sky-200 bg-white p-7 text-center shadow-xl shadow-blue-900/5 sm:p-10">
      <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 text-4xl text-white shadow-lg">🚀</span>
      <p className="text-sm font-bold text-sky-700">أهلًا {childName}</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">مسار الفئة العمرية ٥–٧ سنوات</h1>
      <p className="mx-auto mt-4 max-w-lg text-base leading-8 text-slate-600">
        وصلت إلى المسار الجديد. هذا القسم سنبنيه معًا، بمحتوى وأنشطة تناسب الأطفال من 5 إلى 7 سنوات.
      </p>
      <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800">
        <Sparkles className="h-4 w-4" /> القسم قيد الإعداد
      </div>
      <div className="mt-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-black text-white shadow-md transition hover:bg-sky-700"
        >
          <ArrowLeft className="h-5 w-5" /> العودة لاختيار الفئة
        </button>
      </div>
    </section>
  </main>
);
