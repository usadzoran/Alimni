import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, Sparkles, User } from 'lucide-react';
import { ChildProfile } from '../../types';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface ChildOnboardingProps {
  child: ChildProfile;
  onComplete: () => void;
}

const SCHOOL_LEVELS = [
  { value: 'لم يبدأ الدراسة بعد', label: 'لم يبدأ الدراسة بعد' },
  { value: 'الروضة / التمهيدي', label: 'الروضة / التمهيدي' },
  { value: 'الصف الأول الابتدائي', label: 'الصف الأول الابتدائي' },
  { value: 'الصف الثاني الابتدائي', label: 'الصف الثاني الابتدائي' },
  { value: 'الصف الثالث الابتدائي', label: 'الصف الثالث الابتدائي' },
  { value: 'الصف الرابع الابتدائي', label: 'الصف الرابع الابتدائي' },
  { value: 'الصف الخامس الابتدائي', label: 'الصف الخامس الابتدائي' },
  { value: 'الصف السادس الابتدائي', label: 'الصف السادس الابتدائي' },
  { value: 'الصف الأول الإعدادي / المتوسط', label: 'الصف الأول الإعدادي / المتوسط' },
  { value: 'الصف الثاني الإعدادي / المتوسط', label: 'الصف الثاني الإعدادي / المتوسط' },
  { value: 'الصف الثالث الإعدادي / المتوسط', label: 'الصف الثالث الإعدادي / المتوسط' },
  { value: 'الصف الأول الثانوي', label: 'الصف الأول الثانوي' },
  { value: 'الصف الثاني الثانوي', label: 'الصف الثاني الثانوي' },
  { value: 'الصف الثالث الثانوي', label: 'الصف الثالث الثانوي' },
];

export const ChildOnboarding: React.FC<ChildOnboardingProps> = ({ child, onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const ageValue = Number(age);

    if (!cleanFirstName || !cleanLastName || !gradeLevel) {
      setError('أكمل جميع البيانات للمتابعة.');
      return;
    }
    if (!Number.isInteger(ageValue) || ageValue < 2 || ageValue > 7) {
      setError('أدخل عمرًا صحيحًا بين سنتين و7 سنوات.');
      return;
    }

    storageService.updateChild(child.id, {
      name: cleanFirstName,
      lastName: cleanLastName,
      age: ageValue,
      ageGroup: ageValue <= 4 ? '3-4' : '5-6',
      gradeLevel,
    });
    audioService.playTap();
    onComplete();
  };

  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-2xl shadow-amber-900/10">
        <div className="relative overflow-hidden bg-gradient-to-l from-amber-500 via-orange-400 to-yellow-400 px-6 py-8 text-white sm:px-10 sm:py-10">
          <span className="absolute -left-5 -top-8 text-8xl opacity-20" aria-hidden="true">🎈</span>
          <span className="absolute bottom-1 left-20 text-4xl opacity-30" aria-hidden="true">⭐</span>
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white/20 text-4xl shadow-sm">🦁</div>
            <div>
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" /> خطوة واحدة قبل المغامرة
              </p>
              <h1 className="text-2xl font-black sm:text-3xl">عرّفنا عليك يا بطل!</h1>
              <p className="mt-1 text-sm font-medium text-white/90">أدخل بياناتك لنجهّز لك رحلة تعلّم مناسبة.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-8" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="child-first-name" className="mb-1.5 block text-sm font-bold text-slate-700">الاسم الأول</label>
              <div className="relative">
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                <input
                  id="child-first-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={40}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="مثال: ليلى"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pr-10 pl-3 text-sm font-semibold outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="child-last-name" className="mb-1.5 block text-sm font-bold text-slate-700">اللقب / اسم العائلة</label>
              <div className="relative">
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                <input
                  id="child-last-name"
                  type="text"
                  autoComplete="family-name"
                  required
                  maxLength={50}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="مثال: العلي"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pr-10 pl-3 text-sm font-semibold outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="child-age" className="mb-1.5 block text-sm font-bold text-slate-700">العمر (بالسنوات)</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                <input
                  id="child-age"
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={7}
                  step={1}
                  required
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="مثال: 6"
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pr-10 pl-3 text-sm font-semibold outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">من سنتين إلى 7 سنوات</p>
            </div>
            <div>
              <label htmlFor="child-grade" className="mb-1.5 block text-sm font-bold text-slate-700">المستوى الدراسي</label>
              <div className="relative">
                <BookOpen className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                <select
                  id="child-grade"
                  required
                  value={gradeLevel}
                  onChange={(event) => setGradeLevel(event.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white py-3 pr-10 pl-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                  <option value="" disabled>اختر المستوى الدراسي</option>
                  {SCHOOL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 px-5 py-3.5 text-base font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            <span>احفظ البيانات واختر الفئة</span>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-center text-xs leading-5 text-slate-400">هذه الخطوة مطلوبة لإعداد ملف الطفل قبل دخول عالم الحروف والأرقام.</p>
        </form>
      </section>
    </main>
  );
};
