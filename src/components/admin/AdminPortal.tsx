import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { getAdminSupabaseClient } from '../../lib/supabase';
import type { AdPlacement } from '../site/PublicSitePages';

interface AdminPortalProps { onClose: () => void }

type AdminSection = 'overview' | 'students' | 'inquiries' | 'documents' | 'ads';
type InquiryStatus = 'new' | 'read' | 'closed';
type StudentRow = {
  id: string; name: string; last_name: string; age: number; grade_level: string;
  learning_track: string | null; stars_count: number; total_time_minutes: number; last_active: string;
};
type InquiryRow = { id: string; name: string; email: string | null; message: string; status: InquiryStatus; created_at: string };
type DocumentRow = {
  id: string; title: string; description: string; file_name: string; storage_path: string;
  mime_type: string; file_size: number; is_published: boolean; created_at: string;
};
type AdRow = { id: string; title: string; html_content: string; placements: AdPlacement[]; is_active: boolean; created_at: string };

const DOCUMENT_BUCKET = 'alimni-documents';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const PLACEMENTS: { id: AdPlacement; label: string }[] = [
  { id: 'home-banner', label: 'بانر الصفحة الرئيسية لمسار ٢–٤' },
  { id: 'learning-footer', label: 'أسفل صفحات مسار ٥–٧' },
  { id: 'public-library', label: 'صفحة المكتبة التعليمية' },
  { id: 'site-footer', label: 'تذييل الموقع' },
];
const NAV: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'students', label: 'التلاميذ', icon: Users },
  { id: 'inquiries', label: 'الاستفسارات', icon: HelpCircle },
  { id: 'documents', label: 'الملفات التعليمية', icon: FileText },
  { id: 'ads', label: 'الإعلانات', icon: Megaphone },
];

const formatDate = (value: string) => new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const randomId = () => typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [section, setSection] = useState<AdminSection>('overview');
  const [checkingSession, setCheckingSession] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [panelError, setPanelError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalVisits: 0, recentVisits: 0, students: 0, newInquiries: 0, publishedDocuments: 0, activeAds: 0 });
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentFilter, setStudentFilter] = useState('');
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [ads, setAds] = useState<AdRow[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentBusy, setDocumentBusy] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adHtml, setAdHtml] = useState('');
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>(['home-banner']);
  const [adBusy, setAdBusy] = useState(false);

  const client = getAdminSupabaseClient();

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    document.title = 'إدارة عَلِّمني';
    return () => { document.title = previousTitle; meta.remove(); };
  }, []);

  const verifyCurrentSession = async () => {
    if (!client) return false;
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData.session) return false;
    const { data, error } = await client.rpc('is_alimni_admin');
    if (!error && data === true) {
      setAuthorized(true);
      setAuthError('');
      return true;
    }
    await client.auth.signOut();
    setAuthorized(false);
    setAuthError('هذا الحساب غير مخوّل للوحة الإدارة. استخدم البريد المعتمد من مالك الموقع.');
    return false;
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (client) await verifyCurrentSession();
      if (active) setCheckingSession(false);
    })();
    return () => { active = false; };
  }, []);

  const refreshSummary = async () => {
    if (!client) return;
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const [visits, recentVisits, studentCount, inquiryCount, documentCount, adCount] = await Promise.all([
      client.from('site_visits').select('session_id', { count: 'exact', head: true }),
      client.from('site_visits').select('session_id', { count: 'exact', head: true }).gte('created_at', since.toISOString()),
      client.from('children').select('id', { count: 'exact', head: true }),
      client.from('site_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      client.from('site_documents').select('id', { count: 'exact', head: true }).eq('is_published', true),
      client.from('site_ads').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    const resultError = [visits, recentVisits, studentCount, inquiryCount, documentCount, adCount].find((result) => result.error)?.error;
    if (resultError) { setPanelError('تعذر تحميل بعض الإحصاءات. تحقق من صلاحيات قاعدة البيانات.'); return; }
    setSummary({
      totalVisits: visits.count ?? 0,
      recentVisits: recentVisits.count ?? 0,
      students: studentCount.count ?? 0,
      newInquiries: inquiryCount.count ?? 0,
      publishedDocuments: documentCount.count ?? 0,
      activeAds: adCount.count ?? 0,
    });
  };

  const loadSection = async (target: AdminSection = section) => {
    if (!client) return;
    setLoading(true);
    setPanelError('');
    setNotice('');
    try {
      if (target === 'overview') {
        await refreshSummary();
      } else if (target === 'students') {
        const { data, error } = await client.from('children')
          .select('id,name,last_name,age,grade_level,learning_track,stars_count,total_time_minutes,last_active')
          .order('last_active', { ascending: false }).limit(200);
        if (error) throw error;
        setStudents((data ?? []) as StudentRow[]);
      } else if (target === 'inquiries') {
        const { data, error } = await client.from('site_inquiries')
          .select('id,name,email,message,status,created_at').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        setInquiries((data ?? []) as InquiryRow[]);
      } else if (target === 'documents') {
        const { data, error } = await client.from('site_documents')
          .select('id,title,description,file_name,storage_path,mime_type,file_size,is_published,created_at')
          .order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        setDocuments((data ?? []) as DocumentRow[]);
      } else if (target === 'ads') {
        const { data, error } = await client.from('site_ads')
          .select('id,title,html_content,placements,is_active,created_at').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        setAds((data ?? []) as AdRow[]);
      }
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : 'تعذر تحميل هذا القسم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authorized || !client) return;
    void loadSection(section);
  }, [authorized, section]);

  const signInOrSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || authBusy) return;
    setAuthBusy(true); setAuthError(''); setAuthNotice('');
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (authMode === 'signin') {
        const { error } = await client.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        const allowed = await verifyCurrentSession();
        if (allowed) setPassword('');
      } else {
        const { data, error } = await client.auth.signUp({ email: normalizedEmail, password });
        if (error) throw error;
        if (data.session) {
          const allowed = await verifyCurrentSession();
          if (allowed) setPassword('');
        } else {
          setAuthNotice('أرسلنا رسالة تحقق إلى بريدك. أكّد الحساب، ثم ارجع إلى هذه الصفحة وسجّل الدخول.');
          setAuthMode('signin');
          setPassword('');
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'تعذر إكمال تسجيل الدخول.');
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (client) await client.auth.signOut();
    setAuthorized(false); setSection('overview'); setPassword(''); setAuthNotice('تم تسجيل الخروج من لوحة الإدارة.');
  };

  const markInquiry = async (inquiry: InquiryRow, status: InquiryStatus) => {
    if (!client) return;
    const { error } = await client.from('site_inquiries').update({ status }).eq('id', inquiry.id);
    if (error) { setPanelError('تعذر تحديث حالة الاستفسار.'); return; }
    await loadSection('inquiries'); await refreshSummary();
  };

  const uploadDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !documentFile || documentBusy) return;
    const extension = documentFile.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = MIME_BY_EXTENSION[extension];
    if (!mimeType) { setPanelError('الملفات المدعومة هي PDF وDOC وDOCX فقط.'); return; }
    if (documentFile.size > MAX_UPLOAD_BYTES) { setPanelError('حجم الملف أكبر من 10 ميغابايت.'); return; }
    if (documentTitle.trim().length < 2) { setPanelError('أدخل عنوانًا واضحًا للملف.'); return; }
    setDocumentBusy(true); setPanelError(''); setNotice('');
    const storagePath = `${Date.now()}-${randomId()}.${extension}`;
    try {
      const { error: uploadError } = await client.storage.from(DOCUMENT_BUCKET).upload(storagePath, documentFile, {
        cacheControl: '3600', upsert: false, contentType: mimeType,
      });
      if (uploadError) throw uploadError;
      const { error: rowError } = await client.from('site_documents').insert({
        title: documentTitle.trim(), description: documentDescription.trim(), file_name: documentFile.name,
        storage_path: storagePath, mime_type: mimeType, file_size: documentFile.size, is_published: false,
      });
      if (rowError) {
        await client.storage.from(DOCUMENT_BUCKET).remove([storagePath]);
        throw rowError;
      }
      setDocumentTitle(''); setDocumentDescription(''); setDocumentFile(null);
      const fileInput = document.getElementById('admin-document-file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      setNotice('تم حفظ الملف كمسودة خاصة. لن يظهر للزوار حتى تختار «نشر».');
      await loadSection('documents'); await refreshSummary();
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : 'تعذر رفع الملف.');
    } finally { setDocumentBusy(false); }
  };

  const toggleDocument = async (document: DocumentRow) => {
    if (!client) return;
    const { error } = await client.from('site_documents').update({ is_published: !document.is_published, updated_at: new Date().toISOString() }).eq('id', document.id);
    if (error) { setPanelError('تعذر تحديث حالة نشر الملف.'); return; }
    setNotice(document.is_published ? 'أُزيل الملف من المكتبة العامة.' : 'نُشر الملف في المكتبة العامة.');
    await loadSection('documents'); await refreshSummary();
  };

  const deleteDocument = async (document: DocumentRow) => {
    if (!client || !window.confirm(`حذف «${document.title}» وملفه نهائيًا؟`)) return;
    const { error: fileError } = await client.storage.from(DOCUMENT_BUCKET).remove([document.storage_path]);
    if (fileError) { setPanelError('تعذر حذف الملف من التخزين. لم يُحذف سجلّه.'); return; }
    const { error } = await client.from('site_documents').delete().eq('id', document.id);
    if (error) { setPanelError('حُذف الملف من التخزين، لكن تعذر حذف سجلّه. أعد المحاولة أو تواصل مع الدعم التقني.'); return; }
    setNotice('تم حذف الملف.'); await loadSection('documents'); await refreshSummary();
  };

  const togglePlacement = (placement: AdPlacement) => {
    setAdPlacements((current) => current.includes(placement) ? current.filter((item) => item !== placement) : [...current, placement]);
  };

  const saveAd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || adBusy) return;
    if (adTitle.trim().length < 2 || !adHtml.trim() || adHtml.length > 30000 || adPlacements.length === 0) {
      setPanelError('أدخل عنوان الإعلان، كود HTML، ومكان عرض واحدًا على الأقل. الحد الأقصى للكود 30 ألف حرف.'); return;
    }
    setAdBusy(true); setPanelError(''); setNotice('');
    const { error } = await client.from('site_ads').insert({
      title: adTitle.trim(), html_content: adHtml, placements: adPlacements, is_active: false,
    });
    if (error) setPanelError('تعذر حفظ الإعلان.');
    else {
      setAdTitle(''); setAdHtml(''); setAdPlacements(['home-banner']);
      setNotice('حُفظ الإعلان كمسودة غير نشطة. فعّله بعد مراجعة المعاينة.');
      await loadSection('ads'); await refreshSummary();
    }
    setAdBusy(false);
  };

  const toggleAd = async (ad: AdRow) => {
    if (!client) return;
    const { error } = await client.from('site_ads').update({ is_active: !ad.is_active, updated_at: new Date().toISOString() }).eq('id', ad.id);
    if (error) { setPanelError('تعذر تغيير حالة الإعلان.'); return; }
    setNotice(ad.is_active ? 'أُوقف الإعلان في الموقع.' : 'أُتيح الإعلان في المواقع المحددة.');
    await loadSection('ads'); await refreshSummary();
  };

  const deleteAd = async (ad: AdRow) => {
    if (!client || !window.confirm(`حذف الإعلان «${ad.title}»؟`)) return;
    const { error } = await client.from('site_ads').delete().eq('id', ad.id);
    if (error) { setPanelError('تعذر حذف الإعلان.'); return; }
    setNotice('تم حذف الإعلان.'); await loadSection('ads'); await refreshSummary();
  };

  const filteredStudents = students.filter((student) => `${student.name} ${student.last_name} ${student.grade_level}`.toLowerCase().includes(studentFilter.trim().toLowerCase()));

  if (checkingSession) return <div dir="rtl" className="grid min-h-screen place-items-center bg-slate-950 text-white">جارٍ التحقق من صلاحية الدخول...</div>;

  if (!authorized) {
    return (
      <main dir="rtl" lang="ar" className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 text-slate-900">
        <section className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800"><ShieldCheck className="h-7 w-7" /></span>
            <button type="button" onClick={onClose} className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-slate-100"><ArrowRight className="h-4 w-4" /> خروج</button>
          </div>
          <p className="mt-5 text-xs font-black text-indigo-700">منطقة خاصة بصاحب الموقع</p>
          <h1 className="mt-1 text-2xl font-black">لوحة إدارة عَلِّمني</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">يلزم حساب Supabase مصرح به. إخفاء الرابط وحده لا يمنح صلاحية لقراءة بيانات التلاميذ أو الإدارة.</p>
          <form onSubmit={(event) => void signInOrSignUp(event)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-black">البريد الإلكتروني</label>
              <input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-left outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" dir="ltr" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-black">كلمة المرور</label>
              <input id="admin-password" type="password" required minLength={8} autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" dir="ltr" />
            </div>
            {authError && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{authError}</p>}
            {authNotice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{authNotice}</p>}
            <button type="submit" disabled={authBusy || !client} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 font-black text-white transition hover:bg-indigo-800 disabled:opacity-50">
              <LogIn className="h-4 w-4" /> {authBusy ? 'جارٍ التحقق...' : authMode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب المدير'}
            </button>
          </form>
          <button type="button" onClick={() => { setAuthMode((mode) => mode === 'signin' ? 'signup' : 'signin'); setAuthError(''); setAuthNotice(''); }} className="mt-4 w-full rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
            {authMode === 'signin' ? 'أول مرة؟ أنشئ حسابًا للبريد المصرح به' : 'لديك حساب؟ انتقل إلى تسجيل الدخول'}
          </button>
          {!client && <p className="mt-3 text-xs leading-5 text-rose-700">تعذر تهيئة اتصال قاعدة البيانات؛ تحقق من إعداد Supabase في الموقع.</p>}
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">لا تشارك كلمة المرور مع أحد. يمكن تسجيل حساب عادي، لكن صلاحيات المدير محصورة بالبريد المصرّح في قاعدة البيانات.</p>
        </section>
      </main>
    );
  }

  const summaryCards = [
    { label: 'زيارات الجلسات الكلية', value: summary.totalVisits, note: 'تقديري، دون حفظ عناوين IP', icon: Activity, color: 'text-sky-700 bg-sky-50' },
    { label: 'الجلسات خلال ٣٠ يومًا', value: summary.recentVisits, note: 'جلسات متصفح تقريبية', icon: BarChart3, color: 'text-indigo-700 bg-indigo-50' },
    { label: 'التلاميذ المسجلون', value: summary.students, note: 'ملفات محفوظة في Supabase', icon: Users, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'استفسارات جديدة', value: summary.newInquiries, note: 'بانتظار المراجعة', icon: HelpCircle, color: 'text-amber-700 bg-amber-50' },
    { label: 'ملفات منشورة', value: summary.publishedDocuments, note: 'ظاهرة في المكتبة العامة', icon: FileText, color: 'text-violet-700 bg-violet-50' },
    { label: 'إعلانات نشطة', value: summary.activeAds, note: 'تظهر في المواضع المحددة', icon: Megaphone, color: 'text-rose-700 bg-rose-50' },
  ];

  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-xs font-bold text-indigo-200">مساحة خاصة · غير ظاهرة للزوار</p><h1 className="text-xl font-black sm:text-2xl">إدارة عَلِّمني</h1></div></div>
          <div className="flex flex-wrap items-center gap-2"><span className="hidden text-xs text-slate-300 sm:inline">{email || 'مدير الموقع'}</span><button type="button" onClick={() => void loadSection(section)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-bold transition hover:bg-white/20"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> تحديث</button><button type="button" onClick={() => void signOut()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-500/20 px-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/30"><LogOut className="h-4 w-4" /> خروج</button><button type="button" onClick={onClose} aria-label="العودة إلى الموقع" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-8">
        <nav aria-label="أقسام الإدارة" className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:sticky lg:top-5 lg:h-fit lg:flex-col">
          {NAV.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-black transition lg:w-full ${section === item.id ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}
        </nav>
        <section className="min-w-0 space-y-5">
          {panelError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{panelError}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</p>}
          {section === 'overview' && <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">نظرة عامة</h2><p className="mt-1 text-sm text-slate-500">ملخص النشاط والمحتوى المنشور.</p></div><p className="text-xs text-slate-400">عداد الزوار يعتمد جلسات متصفح تقريبية ولا يخزن IP.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{summaryCards.map((card) => { const Icon = card.icon; return <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}><Icon className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold text-slate-500">{card.label}</p><p className="mt-1 text-3xl font-black tabular-nums">{card.value}</p><p className="mt-2 text-xs text-slate-400">{card.note}</p></article>; })}</div>
            <article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-7 text-indigo-950"><h3 className="font-black">خصوصية وأمان</h3><p className="mt-1">بيانات الأطفال والاستفسارات لا تُقرأ إلا بعد التحقق من صلاحية المدير في قاعدة البيانات. ملفات المسودات خاصة، وكود الإعلان يُعرض داخل إطار معزول عن صفحات الموقع.</p></article>
          </>}
          {section === 'students' && <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">قائمة التلاميذ</h2><p className="mt-1 text-sm text-slate-500">بيانات الملفات التعليمية المحفوظة في قاعدة البيانات.</p></div><input aria-label="بحث عن تلميذ" value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} placeholder="ابحث بالاسم أو المستوى" className="min-h-11 w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500" /></div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-[850px] w-full text-right text-sm"><thead className="bg-slate-100 text-xs text-slate-500"><tr>{['الاسم الكامل','العمر','المستوى الدراسي','المسار','النجوم','وقت التعلم','آخر نشاط'].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((student) => <tr key={student.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-black">{student.name} {student.last_name}</td><td className="px-4 py-3">{student.age}</td><td className="px-4 py-3">{student.grade_level}</td><td className="px-4 py-3">{student.learning_track ?? '—'}</td><td className="px-4 py-3">⭐ {student.stars_count}</td><td className="px-4 py-3">{student.total_time_minutes} د</td><td className="px-4 py-3 text-xs text-slate-500">{formatDate(student.last_active)}</td></tr>)}{filteredStudents.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">لا توجد ملفات مطابقة.</td></tr>}</tbody></table></div>
            <p className="text-xs text-slate-400">يعرض هذا القسم أحدث ٢٠٠ ملف. الوصول إليه مقيد بصلاحية المدير.</p>
          </>}
          {section === 'inquiries' && <>
            <div><h2 className="text-2xl font-black">الاستفسارات</h2><p className="mt-1 text-sm text-slate-500">رسائل نموذج «أرسل استفسارًا» في الموقع العام.</p></div>
            <div className="space-y-3">{inquiries.map((inquiry) => <article key={inquiry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{inquiry.name}</h3><p className="mt-1 text-xs text-slate-500">{inquiry.email || 'لم يضف بريدًا'} · {formatDate(inquiry.created_at)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${inquiry.status === 'new' ? 'bg-amber-100 text-amber-800' : inquiry.status === 'read' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>{inquiry.status === 'new' ? 'جديد' : inquiry.status === 'read' ? 'قيد المراجعة' : 'مغلق'}</span></div><p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{inquiry.message}</p><div className="mt-3 flex flex-wrap gap-2">{inquiry.status !== 'read' && <button type="button" onClick={() => void markInquiry(inquiry, 'read')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-50 px-3 text-xs font-black text-sky-800 hover:bg-sky-100"><Check className="h-4 w-4" /> قيد المراجعة</button>}{inquiry.status !== 'closed' && <button type="button" onClick={() => void markInquiry(inquiry, 'closed')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700 hover:bg-slate-200"><X className="h-4 w-4" /> إغلاق</button>}{inquiry.status !== 'new' && <button type="button" onClick={() => void markInquiry(inquiry, 'new')} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-amber-50"><RefreshCw className="h-4 w-4" /> إعادة فتح</button>}</div></article>)}{inquiries.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">لا توجد استفسارات بعد.</p>}</div>
          </>}
          {section === 'documents' && <>
            <div><h2 className="text-2xl font-black">الملفات التعليمية</h2><p className="mt-1 text-sm text-slate-500">ارفع ملفات PDF أو Word. تُحفظ كمسودات خاصة حتى تضغط «نشر».</p></div>
            <form onSubmit={(event) => void uploadDocument(event)} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">عنوان الملف<input required minLength={2} maxLength={140} value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-medium outline-none focus:border-indigo-500" /></label><label className="text-sm font-black">وصف مختصر <span className="font-medium text-slate-400">(اختياري)</span><input maxLength={1000} value={documentDescription} onChange={(event) => setDocumentDescription(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-medium outline-none focus:border-indigo-500" /></label></div>
              <label className="text-sm font-black">ملف Word أو PDF (حتى 10 ميغابايت)<input id="admin-document-file" required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-medium" /></label>
              <div><button type="submit" disabled={documentBusy || !documentFile} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-800 disabled:opacity-50"><Upload className="h-4 w-4" />{documentBusy ? 'جارٍ الرفع...' : 'رفع كمسودة'}</button></div>
            </form>
            <div className="space-y-3">{documents.map((document) => <article key={document.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h3 className="truncate font-black">{document.title}</h3><p className="mt-1 truncate text-xs text-slate-500">{document.file_name} · {(document.file_size / 1024 / 1024).toFixed(1)} م.ب · {formatDate(document.created_at)}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${document.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{document.is_published ? 'منشور' : 'مسودة خاصة'}</span></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => void toggleDocument(document)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black ${document.is_published ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>{document.is_published ? 'إلغاء النشر' : 'نشر'}</button><button type="button" onClick={() => void deleteDocument(document)} aria-label={`حذف ${document.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button></div></article>)}{documents.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">لم تُرفع ملفات بعد.</p>}</div>
          </>}
          {section === 'ads' && <>
            <div><h2 className="text-2xl font-black">الإعلانات</h2><p className="mt-1 text-sm text-slate-500">ألصق HTML واختر مواضع العرض. تحفظ الإعلانات كمسودة، ويُعزل كل كود داخل iframe sandbox بلا وصول إلى جلسة الموقع.</p></div>
            <form onSubmit={(event) => void saveAd(event)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <label className="block text-sm font-black">اسم داخلي للإعلان<input required minLength={2} maxLength={120} value={adTitle} onChange={(event) => setAdTitle(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-medium outline-none focus:border-indigo-500" /></label>
              <fieldset><legend className="text-sm font-black">مواضع العرض <span className="font-medium text-slate-400">(يمكن اختيار أكثر من مكان)</span></legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{PLACEMENTS.map((placement) => <label key={placement.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold"><input type="checkbox" checked={adPlacements.includes(placement.id)} onChange={() => togglePlacement(placement.id)} className="h-4 w-4 accent-indigo-700" />{placement.label}</label>)}</div></fieldset>
              <label className="block text-sm font-black">كود الإعلان HTML<textarea required maxLength={30000} rows={8} value={adHtml} onChange={(event) => setAdHtml(event.target.value)} dir="ltr" spellCheck={false} placeholder="<!-- ألصق كود الإعلان هنا -->" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-950 px-3 py-3 font-mono text-xs leading-6 text-emerald-200 outline-none focus:border-indigo-500" /></label>
              {adHtml.trim() && <div><p className="mb-2 text-xs font-black text-slate-600">معاينة معزولة</p><iframe title="معاينة الإعلان" srcDoc={adHtml} sandbox="allow-scripts allow-popups" referrerPolicy="no-referrer" className="h-56 w-full rounded-xl border border-slate-200 bg-white" /></div>}
              <button type="submit" disabled={adBusy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-800 disabled:opacity-50"><Plus className="h-4 w-4" />{adBusy ? 'جارٍ الحفظ...' : 'حفظ الإعلان كمسودة'}</button>
            </form>
            <div className="space-y-3">{ads.map((ad) => <article key={ad.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{ad.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{PLACEMENTS.filter((item) => ad.placements.includes(item.id)).map((item) => item.label).join(' · ')}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${ad.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{ad.is_active ? 'نشط' : 'مسودة / متوقف'}</span></div><div className="flex gap-2"><button type="button" onClick={() => void toggleAd(ad)} className={`min-h-10 rounded-xl px-3 text-xs font-black ${ad.is_active ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{ad.is_active ? 'إيقاف' : 'تفعيل'}</button><button type="button" onClick={() => void deleteAd(ad)} aria-label={`حذف الإعلان ${ad.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button></div></div><details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-indigo-700">عرض معاينة الإعلان</summary><iframe title={`معاينة ${ad.title}`} srcDoc={ad.html_content} sandbox="allow-scripts allow-popups" referrerPolicy="no-referrer" className="mt-3 h-56 w-full rounded-xl border border-slate-200" /></details></article>)}{ads.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">لم تُضف إعلانات بعد.</p>}</div>
          </>}
          {loading && <p role="status" className="text-center text-xs font-bold text-slate-400">جارٍ التحديث...</p>}
        </section>
      </div>
    </main>
  );
};
