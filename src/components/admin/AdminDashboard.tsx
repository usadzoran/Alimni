import React, { useState } from 'react';
import {
  ShieldAlert,
  BookOpen,
  Hash,
  Trophy,
  Volume2,
  FileCode,
  CheckCircle,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ARABIC_LETTERS } from '../../data/lettersData';
import { ALL_NUMBERS } from '../../data/numbersData';
import { APP_LEVELS } from '../../data/levelsData';
import { audioService } from '../../services/audioService';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'letters' | 'numbers' | 'levels' | 'audio_diagnostic' | 'sql'>('letters');
  const [voiceTestText, setVoiceTestText] = useState('مرحباً بكم في عالم الحروف والأرقام');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestAudio = (text: string) => {
    audioService.playTap();
    setTestStatus(`جارٍ تشغيل النطق: ${text}`);
    audioService.speakArabic(text, {
      onEnd: () => setTestStatus('اكتمل تشغيل الصوت بنجاح ✓'),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black">
            ⚡
          </div>
          <div>
            <h2 className="text-2xl font-black">لوحة الإدارة والتحكم بالمحتوى</h2>
            <p className="text-xs text-slate-400">
              إدارة الفهرس التعليمي، فحص محرك النطق العربي، وسجلات النظام
            </p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الخروج من لوحة الإدارة</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('letters')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'letters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>فهرس الحروف ({ARABIC_LETTERS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'numbers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="w-4 h-4 text-emerald-600" />
          <span>فهرس الأرقام (0-100)</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'levels' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>المستويات الستة</span>
        </button>

        <button
          onClick={() => setActiveTab('audio_diagnostic')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audio_diagnostic'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4 text-purple-600" />
          <span>مختبر فحص الصوت</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-rose-600" />
          <span>مخطط Supabase SQL</span>
        </button>
      </div>

      {/* 1. Letters Catalogue */}
      {activeTab === 'letters' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg">قائمة الحروف الـ 28 وبياناتها</h3>
            <span className="text-xs text-slate-500 font-bold">28 حرفاً كاملاً</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-2 font-bold">#</th>
                  <th className="pb-2 font-bold">الحرف</th>
                  <th className="pb-2 font-bold">الاسم</th>
                  <th className="pb-2 font-bold">الصوت الفونيكي</th>
                  <th className="pb-2 font-bold">الكلمة المصورة</th>
                  <th className="pb-2 font-bold">الأشكال</th>
                  <th className="pb-2 font-bold text-center">فحص الصوت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ARABIC_LETTERS.map((letter) => (
                  <tr key={letter.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-400">{letter.id}</td>
                    <td className="py-2.5 text-xl font-black text-blue-600">{letter.letter}</td>
                    <td className="py-2.5 font-bold text-slate-800">{letter.name}</td>
                    <td className="py-2.5 font-bold text-purple-700">{letter.soundPhonic}</td>
                    <td className="py-2.5 font-bold text-slate-700">
                      {letter.example.emoji} {letter.example.wordTashkeel}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {letter.shapes.isolated} · {letter.shapes.beginning} · {letter.shapes.middle} ·{' '}
                      {letter.shapes.ending}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() =>
                          handleTestAudio(
                            `حرف الـ${letter.name}.. ${letter.soundPhonic}.. ${letter.example.wordTashkeel}`
                          )
                        }
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                        title="تجربة النطق"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Numbers Catalogue */}
      {activeTab === 'numbers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-lg">فهرس الأرقام والعد (0 إلى 100)</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ALL_NUMBERS.slice(0, 30).map((num) => (
              <div
                key={num.number}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1"
              >
                <span className="text-2xl font-black text-emerald-700 block">
                  {num.arabicNumeral}
                </span>
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {num.nameArabic}
                </span>
                <button
                  onClick={() => handleTestAudio(`الرقم ${num.nameArabic}`)}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>استماع</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Levels Settings */}
      {activeTab === 'levels' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-lg">المستويات التعليمية وشروط الاجتياز</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APP_LEVELS.map((lvl) => (
              <div key={lvl.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lvl.icon}</span>
                    <h4 className="font-black text-slate-900 text-base">{lvl.titleArabic}</h4>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    شرط الاجتياز: {lvl.minExamScorePercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-600">{lvl.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Audio Diagnostics Studio */}
      {activeTab === 'audio_diagnostic' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-200 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-xl font-black text-slate-900">مختبر تشخيص وضبط الصوت العربي</h3>
            <p className="text-xs text-slate-500">
              اختبر جودة النطق وسرعة نطق الحروف والكلمات لضمان وضوحها التام للأطفال
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نص التجربة الصوتية:
              </label>
              <input
                type="text"
                value={voiceTestText}
                onChange={(e) => setVoiceTestText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-sm font-bold"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTestAudio(voiceTestText)}
                className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل النطق العربي</span>
              </button>

              <button
                onClick={() => audioService.playCorrect()}
                className="py-3 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold hover:bg-emerald-100 cursor-pointer"
              >
                رنة الإجابة الصحيحة
              </button>

              <button
                onClick={() => audioService.playLevelUp()}
                className="py-3 px-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-bold hover:bg-amber-100 cursor-pointer"
              >
                موسيقى الفوز
              </button>
            </div>

            {testStatus && (
              <div className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-2xl text-xs font-bold">
                {testStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SQL Schema Viewer */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg">ملف SQL الكامل مع سياسات الأمان RLS</h3>
            <span className="text-xs text-slate-500 font-bold">موجود في جذر المشروع: /supabase_schema.sql</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            يحتوي هذا الملف على أوامر إنشاء جميع الجداول (الحروف، الأرقام، الأطفال، أولياء الأمور، المحاولات، الشارات) وتفعيل سياسات Row Level Security التي تعزل بيانات كل عائلة وتحميها.
          </p>

          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96">
{`-- ملف مخطط قاعدة بيانات Supabase جاهز للتنفيذ
-- تم وضعه في: /supabase_schema.sql
-- يحتوي على 11 جدولاً كاملاً + فهارس + RLS Policies:
-- 1. parent_profiles
-- 2. children
-- 3. letters
-- 4. numbers
-- 5. levels
-- 6. child_progress
-- 7. quiz_attempts
-- 8. badges
-- 9. child_badges
-- 10. daily_activity_logs
-- 11. child_characters`}
          </pre>
        </div>
      )}
    </div>
  );
};
