import React from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import type { LearningTrack } from '../../types';

interface LearningTrackActionsBarProps {
  track: LearningTrack;
  onChangeGroup: () => void;
  onExit: () => void;
}

export const LearningTrackActionsBar: React.FC<LearningTrackActionsBarProps> = ({ track, onChangeGroup, onExit }) => {
  const isExplorerTrack = track === '5-7';
  const trackLabel = isExplorerTrack ? '٥–٧ سنوات' : '٢–٤ سنوات';
  const accent = isExplorerTrack
    ? 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 focus-visible:ring-sky-200'
    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus-visible:ring-amber-200';

  return (
    <nav aria-label="أدوات مسار التعلّم" className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-4 md:px-8">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="px-1 text-xs font-black text-slate-600">مسارك الحالي: <span className={isExplorerTrack ? 'text-sky-700' : 'text-amber-700'}>{trackLabel}</span></p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onChangeGroup}
            aria-label="تغيير الفئة العمرية"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 ${accent}`}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>تغيير الفئة العمرية</span>
          </button>
          <button
            type="button"
            onClick={onExit}
            aria-label="الخروج إلى اختيار الفئة مع حفظ التقدم"
            title="العودة إلى اختيار الفئة؛ سيبقى تقدمك محفوظًا"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>الخروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
