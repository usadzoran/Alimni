import React, { useEffect, useState } from 'react';
import { Check, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseClient } from '../../lib/supabase';

type ContentKind = 'lessons' | 'challenges';
type ContentRow = {
  id: string; title: string; description?: string; instructions?: string; subject: string; age_group: string;
  content?: string; questions?: unknown[]; duration_minutes?: number; points?: number; is_published: boolean; created_at: string;
};

type Props = { client: SupabaseClient; kind: ContentKind; canManage: boolean };
const ageOptions = [{ value: 'all', label: 'كل الأعمار' }, { value: '2-4', label: '٢–٤ سنوات' }, { value: '5-7', label: '٥–٧ سنوات' }];
const dateText = (value: string) => new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(value));

export const AdminContentManager: React.FC<Props> = ({ client, kind, canManage }) => {
  const isLesson = kind === 'lessons';
  const permission = isLesson ? 'content.lessons' : 'content.challenges';
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('عام');
  const [ageGroup, setAgeGroup] = useState('all');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('10');
  const [points, setPoints] = useState('1');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reset = () => { setEditingId(null); setTitle(''); setDescription(''); setSubject('عام'); setAgeGroup('all'); setContent(''); setDuration('10'); setPoints('1'); };
  const load = async () => {
    setLoading(true); setError('');
    const { data, error: queryError } = await client.from(isLesson ? 'alimni_lessons' : 'alimni_challenges')
      .select(isLesson ? 'id,title,description,subject,age_group,content,duration_minutes,is_published,created_at' : 'id,title,instructions,subject,age_group,questions,points,is_published,created_at')
      .order('created_at', { ascending: false }).limit(100);
    if (queryError) setError(queryError.message);
    else setRows((data ?? []) as ContentRow[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [kind]);

  const startEdit = (row: ContentRow) => {
    setEditingId(row.id); setTitle(row.title); setDescription(row.description ?? row.instructions ?? ''); setSubject(row.subject); setAgeGroup(row.age_group);
    setContent(isLesson ? row.content ?? '' : JSON.stringify(row.questions ?? [], null, 2)); setDuration(String(row.duration_minutes ?? 10)); setPoints(String(row.points ?? 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (title.trim().length < 2) { setError('أدخل عنوانًا واضحًا.'); return; }
    if (isLesson && content.trim().length < 10) { setError('أدخل محتوى الدرس (10 أحرف على الأقل).'); return; }
    let questions: unknown[] | undefined;
    if (!isLesson) { try { questions = JSON.parse(content || '[]'); if (!Array.isArray(questions)) throw new Error(); } catch { setError('أسئلة التحدي يجب أن تكون JSON على شكل مصفوفة.'); return; } }
    setBusy(true); setError(''); setNotice('');
    const payload = isLesson
      ? { title: title.trim(), description: description.trim(), subject: subject.trim() || 'عام', age_group: ageGroup, content: content.trim(), duration_minutes: Math.max(1, Math.min(120, Number(duration) || 10)), updated_at: new Date().toISOString() }
      : { title: title.trim(), instructions: description.trim(), subject: subject.trim() || 'عام', age_group: ageGroup, questions, points: Math.max(1, Math.min(100, Number(points) || 1)), updated_at: new Date().toISOString() };
    const result = editingId ? await client.from(isLesson ? 'alimni_lessons' : 'alimni_challenges').update(payload).eq('id', editingId) : await client.from(isLesson ? 'alimni_lessons' : 'alimni_challenges').insert({ ...payload, is_published: false });
    if (result.error) setError(result.error.message);
    else { setNotice(editingId ? 'تم تحديث المحتوى.' : 'تم حفظ المحتوى كمسودة خاصة.'); reset(); await load(); }
    setBusy(false);
  };
  const togglePublish = async (row: ContentRow) => {
    const { error: updateError } = await client.from(isLesson ? 'alimni_lessons' : 'alimni_challenges').update({ is_published: !row.is_published, updated_at: new Date().toISOString() }).eq('id', row.id);
    if (updateError) setError(updateError.message); else { setNotice(row.is_published ? 'تم إلغاء النشر.' : 'تم نشر المحتوى.'); await load(); }
  };
  const remove = async (row: ContentRow) => {
    if (!window.confirm(`حذف «${row.title}» نهائيًا؟`)) return;
    const { error: deleteError } = await client.from(isLesson ? 'alimni_lessons' : 'alimni_challenges').delete().eq('id', row.id);
    if (deleteError) setError(deleteError.message); else { setNotice('تم الحذف.'); await load(); }
  };

  if (!canManage) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-900">ليس لديك صلاحية إدارة {isLesson ? 'الدروس' : 'التحديات'}.</section>;
  return <div className="space-y-5">
    <div><h2 className="text-2xl font-black">{isLesson ? 'الدروس المخصصة' : 'التحديات المخصصة'}</h2><p className="mt-1 text-sm text-slate-500">أنشئ محتوى جديدًا، راجعه كمسودة، ثم انشره للمتعلمين.</p></div>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</p>}
    <form onSubmit={(event) => void save(event)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between"><h3 className="font-black">{editingId ? 'تعديل المحتوى' : `إضافة ${isLesson ? 'درس' : 'تحدٍّ'} جديد`}</h3>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><X className="h-4 w-4" /> إلغاء التعديل</button>}</div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">العنوان<input required minLength={2} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label><label className="text-sm font-black">المادة<input maxLength={80} value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">الفئة العمرية<select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500">{ageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="text-sm font-black">{isLesson ? 'المدة بالدقائق' : 'النقاط'}<input type="number" min={1} max={isLesson ? 120 : 100} value={isLesson ? duration : points} onChange={(e) => isLesson ? setDuration(e.target.value) : setPoints(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label></div>
      <label className="block text-sm font-black">{isLesson ? 'وصف الدرس' : 'تعليمات التحدي'}<textarea maxLength={isLesson ? 1000 : 2000} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" /></label>
      <label className="block text-sm font-black">{isLesson ? 'محتوى الدرس' : 'أسئلة التحدي بصيغة JSON'}<textarea required rows={isLesson ? 8 : 10} value={content} onChange={(e) => setContent(e.target.value)} dir={isLesson ? 'rtl' : 'ltr'} spellCheck={false} placeholder={isLesson ? 'اكتب شرح الدرس والأنشطة هنا...' : '[{"question":"...","options":["..."],"answer":"..."}]'} className={`mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 ${isLesson ? 'leading-7' : 'font-mono text-xs'}`} /></label>
      <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white hover:bg-indigo-800 disabled:opacity-50">{editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{busy ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديل' : 'حفظ كمسودة'}</button>
    </form>
    {loading ? <p className="text-center text-sm font-bold text-slate-400">جارٍ تحميل المحتوى...</p> : <div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{row.title}</h3><p className="mt-1 text-xs text-slate-500">{row.subject} · {ageOptions.find((item) => item.value === row.age_group)?.label ?? row.age_group} · {dateText(row.created_at)}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${row.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{row.is_published ? 'منشور' : 'مسودة خاصة'}</span></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void togglePublish(row)} className={`min-h-10 rounded-xl px-3 text-xs font-black ${row.is_published ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{row.is_published ? 'إلغاء النشر' : 'نشر'}</button><button type="button" onClick={() => startEdit(row)} className="inline-flex h-10 items-center gap-1 rounded-xl bg-indigo-50 px-3 text-xs font-black text-indigo-800"><Edit3 className="h-4 w-4" /> تعديل</button><button type="button" onClick={() => void remove(row)} aria-label={`حذف ${row.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><Trash2 className="h-4 w-4" /></button></div></div></article>)}{rows.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">لم يُضف محتوى بعد.</p>}</div>}
  </div>;
};

export const AdminTeamManager: React.FC<{ client: SupabaseClient; canManage: boolean }> = ({ client, canManage }) => {
  const [members, setMembers] = useState<Array<{ email: string; user_id: string | null; role: string; permissions: Record<string, boolean>; is_active: boolean; created_at: string }>>([]);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState('moderator'); const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const permissionOptions = [{ id: 'content.lessons', label: 'إدارة الدروس' }, { id: 'content.challenges', label: 'إدارة التحديات' }, { id: 'ads.manage', label: 'إدارة الإعلانات' }, { id: 'documents.manage', label: 'إدارة الملفات' }, { id: 'inquiries.manage', label: 'إدارة الاستفسارات' }, { id: 'students.view', label: 'عرض التلاميذ' }, { id: 'analytics.view', label: 'عرض الإحصاءات' }];
  const load = async () => { const { data, error: loadError } = await client.rpc('list_alimni_team'); if (loadError) setError(loadError.message); else setMembers((data ?? []) as typeof members); };
  useEffect(() => { if (canManage) void load(); }, [canManage]);
  const create = async (event: React.FormEvent) => { event.preventDefault(); if (busy) return; setBusy(true); setError(''); setNotice('');
    const normalized = email.trim().toLowerCase(); const signupClient = getPublicSupabaseClient();
    if (!signupClient) { setError('تعذر تهيئة اتصال التسجيل.'); setBusy(false); return; }
    const { data, error: signUpError } = await signupClient.auth.signUp({ email: normalized, password });
    if (signUpError || !data.user) { setError(signUpError?.message || 'تعذر إنشاء حساب المشرف.'); setBusy(false); return; }
    const { error: rpcError } = await client.rpc('create_alimni_moderator', { p_email: normalized, p_user_id: data.user.id, p_role: role, p_permissions: permissions });
    if (rpcError) setError(rpcError.message); else { setNotice('تم إنشاء المشرف. يجب أن يؤكد بريده الإلكتروني إن كان التأكيد مفعلًا في Supabase.'); setEmail(''); setPassword(''); setPermissions({}); await load(); }
    setBusy(false);
  };
  const toggle = async (member: typeof members[number]) => { if (!member.user_id) return; const { error: updateError } = await client.rpc('set_alimni_member_active', { p_user_id: member.user_id, p_is_active: !member.is_active }); if (updateError) setError(updateError.message); else await load(); };
  if (!canManage) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-900">ليس لديك صلاحية إدارة المشرفين.</section>;
  return <div className="space-y-5"><div><h2 className="text-2xl font-black">المشرفون والصلاحيات</h2><p className="mt-1 text-sm text-slate-500">أنشئ حسابًا لمشرف وحدد الأقسام التي يمكنه إدارتها. لا يمكن تعطيل مالك الموقع من هنا.</p></div>{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</p>}<form onSubmit={(e) => void create(e)} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="font-black">إنشاء مشرف جديد</h3><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">البريد الإلكتروني<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label><label className="text-sm font-black">كلمة المرور الأولية<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label></div><label className="block text-sm font-black">نوع الحساب<select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="moderator">مشرف بصلاحيات محددة</option><option value="admin">مدير كامل</option></select></label><fieldset><legend className="text-sm font-black">الصلاحيات</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{permissionOptions.map((item) => <label key={item.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold"><input type="checkbox" checked={role === 'admin' || !!permissions[item.id]} disabled={role === 'admin'} onChange={() => setPermissions((old) => ({ ...old, [item.id]: !old[item.id] }))} className="h-4 w-4 accent-indigo-700" />{item.label}</label>)}</div></fieldset><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"><Plus className="h-4 w-4" />{busy ? 'جارٍ إنشاء الحساب...' : 'إنشاء المشرف'}</button></form><div className="space-y-3">{members.map((member) => <article key={member.user_id ?? member.email} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div><h3 className="font-black">{member.email}</h3><p className="mt-1 text-xs text-slate-500">{member.role === 'owner' ? 'مالك الموقع' : member.role === 'admin' ? 'مدير كامل' : 'مشرف بصلاحيات محددة'} · {new Date(member.created_at).toLocaleDateString('ar')}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${member.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{member.is_active ? 'فعال' : 'معطل'}</span>{member.role !== 'owner' && <button type="button" onClick={() => void toggle(member)} className="min-h-10 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700">{member.is_active ? 'تعطيل' : 'تفعيل'}</button>}</div></article>)}</div></div>;
};
