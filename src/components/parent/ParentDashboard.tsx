import React, { useState } from 'react';
import {
  Shield,
  Users,
  BarChart3,
  Settings,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Clock,
  Award,
  BookOpen,
  Volume2,
  Lock,
} from 'lucide-react';
import { ChildProfile, ParentSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { testSupabaseConnection, saveSupabaseCredentials, getSupabaseCredentials } from '../../lib/supabase';
import { audioService } from '../../services/audioService';
import { ARABIC_LETTERS } from '../../data/lettersData';

interface ParentDashboardProps {
  onBackToApp: () => void;
  onOpenAdmin: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onBackToApp, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'children' | 'settings' | 'supabase'>('analytics');
  const children = storageService.getChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>(
    storageService.getActiveChild()?.id || children[0]?.id || ''
  );

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];
  const settings = storageService.getSettings();

  // Settings form state
  const [pin, setPin] = useState(settings.parentPin);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoalMinutes);
  const [speechRate, setSpeechRate] = useState(settings.speechRate);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Supabase form state
  const initialCreds = getSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(initialCreds.url);
  const [sbKey, setSbKey] = useState(initialCreds.key);
  const [sbTesting, setSbTesting] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset progress double confirm state
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSettings({
      parentPin: pin,
      dailyGoalMinutes: Number(dailyGoal),
      speechRate: Number(speechRate),
    });
    audioService.setSpeechRate(Number(speechRate));
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  const handleTestSupabase = async () => {
    setSbTesting(true);
    setSbTestResult(null);
    saveSupabaseCredentials(sbUrl, sbKey);
    const result = await testSupabaseConnection();
    setSbTestResult(result);
    setSbTesting(false);
    if (result.success) {
      storageService.syncFromSupabase();
    }
  };

  const handleResetProgress = (childId: string) => {
    if (confirmResetId !== childId) {
      setConfirmResetId(childId);
      return;
    }
    storageService.resetChildProgress(childId);
    setConfirmResetId(null);
    audioService.speakArabic('تمت إعادة ضبط تقدم الطفل بنجاح');
  };

  const handleDeleteChild = (childId: string) => {
    if (children.length <= 1) {
      alert('يجب الإبقاء على ملف طفل واحد على الأقل في الحساب.');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا الملف نهائياً؟')) {
      storageService.deleteChild(childId);
      if (selectedChildId === childId) {
        setSelectedChildId(children[0]?.id || '');
      }
    }
  };

  // Calculations for current child
  const quizAttempts = selectedChild ? storageService.getAttemptsForChild(selectedChild.id) : [];
  const masteredLettersCount = selectedChild?.masteredLetters.length || 0;
  const troubledItemsCount = selectedChild?.troubledItems.length || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center text-2xl shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              لوحة تحكم وإشراف ولي الأمر
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              متابعة دقيقة للأداء التعليمي، إدارة ملفات الأطفال، والربط السحابي مع Supabase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold text-xs transition-colors cursor-pointer"
          >
            لوحة إدارة المحتوى
          </button>

          <button
            onClick={onBackToApp}
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            العودة لواجهة الطفل
          </button>
        </div>
      </div>

      {/* Tabs Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>التقرير والتحليلات التعليمية</span>
        </button>

        <button
          onClick={() => setActiveTab('children')}
          className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'children'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>إدارة ملفات الأطفال ({children.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-600" />
          <span>إعدادات الأمان والصوت</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'supabase'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span>ربط قاعدة بيانات Supabase</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Analytics & Progress Report Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'analytics' && selectedChild && (
        <div className="space-y-6">
          {/* Child Selector Dropdown */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">اختر ملف الطفل لعرض التقرير:</span>
            <div className="flex items-center gap-2">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChildId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedChildId === c.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.avatar}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700">الحروف المتقنة</span>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-blue-900 tabular-nums">
                {masteredLettersCount} / 28
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                نسبة الإتقان: {Math.round((masteredLettersCount / 28) * 100)}%
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700">الأرقام المتقنة</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-900 tabular-nums">
                {selectedChild.masteredNumbers.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                من أصل 100 رقم في النظام
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700">النجوم المكتسبة</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-900 tabular-nums">
                {selectedChild.stars} ⭐
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                المستوى الحالي: {selectedChild.currentLevelId}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-700">وقت التعلم</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-purple-900 tabular-nums">
                {selectedChild.totalTimeMinutes} دقيقة
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                الهدف اليومي: {settings.dailyGoalMinutes} د
              </p>
            </div>
          </div>

          {/* Mastered Letters vs Needs Review Detailed Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel 1: Mastered Letters */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>الحروف المتقنة بالكامل ({selectedChild.masteredLetters.length})</span>
                </h3>
              </div>

              {selectedChild.masteredLetters.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">لم يتقن الطفل أي حرف بعد.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedChild.masteredLetters.map((id) => {
                    const l = ARABIC_LETTERS.find((item) => item.id === id);
                    if (!l) return null;
                    return (
                      <span
                        key={id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm"
                      >
                        {l.letter} ({l.name})
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel 2: Needs Review */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>عناصر تحتاج إلى مراجعة وتثبيت ({troubledItemsCount})</span>
                </h3>
              </div>

              {troubledItemsCount === 0 ? (
                <p className="text-xs text-emerald-600 py-6 text-center font-bold">
                  ممتاز! لا توجد أخطاء متكررة حالياً، جميع الإجابات متقنة.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedChild.troubledItems.map((item, idx) => {
                    const letterObj =
                      item.type === 'letter' ? ARABIC_LETTERS.find((l) => l.id === item.id) : null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-xs"
                      >
                        <span className="font-bold text-amber-900">
                          {item.type === 'letter'
                            ? `حرف الـ${letterObj?.name || item.id}`
                            : `الرقم ${item.id}`}
                        </span>
                        <span className="text-slate-500">
                          عدد المحاولات الخاطئة: {item.errorCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quiz Attempts History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-slate-800 text-base">
              سجل الاختبارات والأنشطة المكتملة
            </h3>

            {quizAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد محاولات مسجلة بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="pb-2 font-bold">عنوان الاختبار</th>
                      <th className="pb-2 font-bold">النتيجة</th>
                      <th className="pb-2 font-bold">النسبة المئوية</th>
                      <th className="pb-2 font-bold">الحالة</th>
                      <th className="pb-2 font-bold">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizAttempts.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-800">{a.title}</td>
                        <td className="py-2.5 tabular-nums text-slate-600">
                          {a.correctAnswers} من {a.totalQuestions}
                        </td>
                        <td className="py-2.5 tabular-nums font-bold text-slate-800">
                          {a.scorePercent}%
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              a.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {a.passed ? 'ناجح' : 'يحتاج مراجعة'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {new Date(a.timestamp).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Children Management Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'children' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">ملفات أطفالي المسجلين</h3>
              <p className="text-xs text-slate-500">
                يمكنك متابعة وتعديل بيانات كل طفل أو إعادة ضبط تقدمه بحذر
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-5 rounded-3xl border-2 border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
                      {child.avatar}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{child.name}</h4>
                      <p className="text-xs text-slate-500">
                        الفئة العمرية: {child.ageGroup} سنوات · المستوى: {child.currentLevelId}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    ⭐ {child.stars} نجمة
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  {/* Reset Progress Button */}
                  <button
                    onClick={() => handleResetProgress(child.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                      confirmResetId === child.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {confirmResetId === child.id ? 'اضغط ثانية للتأكيد!' : 'إعادة ضبط التقدم'}
                    </span>
                  </button>

                  {/* Delete Child */}
                  <button
                    onClick={() => handleDeleteChild(child.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف ملف الطفل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Settings Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-xl font-black text-slate-900">إعدادات الأمان والتجربة</h3>
            <p className="text-xs text-slate-500">تخصيص رمز الأمان والوقت اليومي وسرعة النطق الصوتي</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رمز أمان ولي الأمر (PIN Code):
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-sm font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">الرمز المستخدم لمنع عبث الأطفال بالإعدادات.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الهدف اليومي للتعلم (بالدقائق):
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سرعة النطق الصوتي (Web Speech Rate):
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0.6}
                  max={1.2}
                  step={0.05}
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {Math.round(speechRate * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">الموصى به للأطفال 3-6 سنوات هو 85% لسلامة الاستيعاب.</p>
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold">
              ✓ تم حفظ الإعدادات بنجاح!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm transition-colors shadow-xs cursor-pointer"
          >
            حفظ التغييرات
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Supabase Integration Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                <Database className="w-3.5 h-3.5" />
                <span>قاعدة بيانات Supabase الحقيقية</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">ربط وحفظ البيانات السحابية</h3>
              <p className="text-xs text-slate-500 mt-1">
                اربط مشروع Supabase الخاص بك لحفظ تقدم الأطفال ونتائجهم وشهاداتهم في سحابة مؤمنة بـ RLS
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابط مشروع Supabase (Project URL):
              </label>
              <input
                type="text"
                dir="ltr"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المفتاح العام للواجهة (Anon Public API Key):
              </label>
              <input
                type="text"
                dir="ltr"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-xs font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ملاحظة أمنية: لا تدخل أبداً مفتاح `service_role`. استخدم المفتاح العام `anon` فقط لحماية أمان قاعدة بياناتك.
              </p>
            </div>
          </div>

          {/* Connection Test Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestSupabase}
              disabled={sbTesting}
              className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${sbTesting ? 'animate-spin' : ''}`} />
              <span>{sbTesting ? 'جارٍ اختبار الاتصال...' : 'اختبار الاتصال وحفظ الإعدادات'}</span>
            </button>
          </div>

          {/* Result Feedback */}
          {sbTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold ${
                sbTestResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {sbTestResult.message}
            </div>
          )}

          {/* SQL Schema helper box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>ملف مخطط الجداول وسياسات الأمان (RLS SQL):</span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                جاهز في ملف supabase_schema.sql
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              قمنا بإنشاء ملف كامل وقابل للتنفيذ باسم <code className="bg-white px-1.5 py-0.5 rounded border text-purple-800">/supabase_schema.sql</code> في جذر المشروع. يحتوي على جميع الجداول الـ 11 والفهارس وسياسات RLS لحماية بيانات كل عائلة. يمكنك نسخه وتشغيله بنقرة واحدة داخل SQL Editor في لوحة Supabase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
