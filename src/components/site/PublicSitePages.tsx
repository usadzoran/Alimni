import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, FileText, Send } from 'lucide-react';
import { getPublicSupabaseClient } from '../../lib/supabase';

export type AdPlacement = 'home-banner' | 'learning-footer' | 'public-library' | 'site-footer';

type AdRow = { id: string; title: string; html_content: string };

type PublishedDocument = {
  id: string;
  title: string;
  description: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  signedUrl: string | null;
};

const BUCKET_NAME = 'alimni-documents';

function getSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

/** Counts one approximate browser-tab visit per session without recording IP addresses. */
export async function trackSiteVisitOnce(): Promise<void> {
  if (typeof window === 'undefined' || window.location.hash === '#admin') return;
  const key = 'alimni_site_visit_session';
  try {
    if (window.sessionStorage.getItem(key)) return;
    const client = getPublicSupabaseClient();
    if (!client) return;
    const sessionId = getSessionId();
    const { error } = await client.from('site_visits').insert({
      session_id: sessionId,
      path: (window.location.pathname || '/').slice(0, 240),
    });
    if (!error || error.code === '23505') window.sessionStorage.setItem(key, sessionId);
    else console.warn('Visitor counter could not record this session:', error.message);
  } catch (error) {
    // Analytics is optional and must never block the learning site.
    console.info('Visitor counter unavailable in this browser session.', error);
  }
}

export const SiteAdSlot: React.FC<{ placement: AdPlacement; className?: string }> = ({ placement, className = '' }) => {
  const [ads, setAds] = useState<AdRow[]>([]);

  useEffect(() => {
    let active = true;
    const client = getPublicSupabaseClient();
    if (!client) return () => { active = false; };
    void client
      .from('site_ads')
      .select('id,title,html_content')
      .eq('is_active', true)
      .contains('placements', [placement])
      .limit(3)
      .then(({ data, error }) => {
        if (active && !error) setAds((data ?? []) as AdRow[]);
      });
    return () => { active = false; };
  }, [placement]);

  if (ads.length === 0) return null;
  return (
    <section aria-label="إعلان" className={`mx-auto w-full max-w-7xl space-y-3 ${className}`}>
      {ads.map((ad) => (
        <article key={ad.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <iframe
            title={`إعلان: ${ad.title}`}
            srcDoc={ad.html_content}
            sandbox="allow-scripts allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="block h-[220px] w-full border-0"
          />
        </article>
      ))}
    </section>
  );
};

export const SiteFooterLinks: React.FC = () => (
  <>
    <SiteAdSlot placement="site-footer" className="px-4 pb-3" />
    <footer dir="rtl" lang="ar" className="border-t border-slate-200 bg-white/90 px-4 py-5 text-sm text-slate-600">
      <nav aria-label="روابط الموقع" className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <a href="#library" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 font-bold transition hover:bg-sky-50 hover:text-sky-800">
          <BookOpen className="h-4 w-4" /> المكتبة التعليمية
        </a>
        <a href="#contact" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 font-bold transition hover:bg-amber-50 hover:text-amber-800">
          <Send className="h-4 w-4" /> أرسل استفسارًا
        </a>
        <span className="text-xs text-slate-400">عَلِّمني · مساحة آمنة للتعلّم</span>
      </nav>
    </footer>
  </>
);

const PublicPageFrame: React.FC<{ title: string; description: string; onBack: () => void; children: React.ReactNode }> = ({ title, description, onBack, children }) => (
  <main dir="rtl" lang="ar" className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 px-4 py-6 sm:py-10">
    <div className="mx-auto max-w-4xl">
      <button type="button" onClick={onBack} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-bold text-slate-600 transition hover:bg-white hover:text-sky-800">
        <ArrowRight className="h-4 w-4" /> العودة إلى عَلِّمني
      </button>
      <header className="mb-6 rounded-[2rem] border border-white bg-white/90 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <p className="text-xs font-black text-sky-700">عَلِّمني · موارد ومساعدة</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </header>
      {children}
      <SiteFooterLinks />
    </div>
  </main>
);

export const PublicLibraryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [documents, setDocuments] = useState<PublishedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const client = getPublicSupabaseClient();
      if (!client) {
        if (active) { setError('تعذر الاتصال بالمكتبة الآن. حاول مرة أخرى لاحقًا.'); setLoading(false); }
        return;
      }
      const { data, error: queryError } = await client
        .from('site_documents')
        .select('id,title,description,file_name,storage_path,mime_type,file_size,created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);
      if (queryError) {
        if (active) { setError('تعذر تحميل الملفات المنشورة الآن.'); setLoading(false); }
        return;
      }
      const rows = (data ?? []) as Omit<PublishedDocument, 'signedUrl'>[];
      const withLinks = await Promise.all(rows.map(async (document) => {
        const { data: file, error: fileError } = await client.storage.from(BUCKET_NAME).createSignedUrl(document.storage_path, 3600);
        return { ...document, signedUrl: fileError ? null : (file?.signedUrl ?? null) };
      }));
      if (active) { setDocuments(withLinks); setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, []);

  return (
    <PublicPageFrame title="المكتبة التعليمية" description="ملفات ومواد تعليمية يشاركها فريق عَلِّمني. لا تظهر الملفات هنا إلا بعد اعتمادها للنشر." onBack={onBack}>
      <SiteAdSlot placement="public-library" className="mb-6" />
      {loading ? (
        <p role="status" className="rounded-2xl bg-white p-6 text-center font-bold text-slate-600 shadow-sm">جارٍ تحميل الموارد...</p>
      ) : error ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-800">{error}</p>
      ) : documents.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><FileText className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-black text-slate-900">المكتبة تستعد لاستقبال أول ملف</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">ستظهر هنا ملفات PDF وWord التعليمية بعد نشرها من فريق الموقع.</p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {documents.map((document) => (
            <article key={document.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><FileText className="h-6 w-6" /></span>
              <h2 className="mt-4 font-black text-slate-950">{document.title}</h2>
              {document.description && <p className="mt-2 text-sm leading-6 text-slate-600">{document.description}</p>}
              <p className="mt-3 text-xs text-slate-400">{document.mime_type === 'application/pdf' ? 'ملف PDF' : 'ملف Word'} · {(document.file_size / 1024 / 1024).toFixed(1)} م.ب</p>
              {document.signedUrl ? (
                <a href={document.signedUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-800">
                  افتح الملف <ExternalLink className="h-4 w-4" />
                </a>
              ) : <p className="mt-4 text-xs font-bold text-amber-700">تعذر تجهيز رابط الملف الآن.</p>}
            </article>
          ))}
        </section>
      )}
    </PublicPageFrame>
  );
};

export const PublicContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    setSuccess(false);
    const client = getPublicSupabaseClient();
    if (!client) {
      setError('تعذر الاتصال الآن. حاول مرة أخرى لاحقًا.');
      setSending(false);
      return;
    }
    const { error: insertError } = await client.from('site_inquiries').insert({
      name: name.trim(),
      email: email.trim() || null,
      message: message.trim(),
      status: 'new',
    });
    if (insertError) {
      setError('لم نتمكن من إرسال الاستفسار. تحقق من الاتصال وحاول مرة أخرى.');
    } else {
      setName(''); setEmail(''); setMessage(''); setSuccess(true);
    }
    setSending(false);
  };

  return (
    <PublicPageFrame title="أرسل استفسارًا" description="يسعدنا سماع ملاحظاتك. اكتب سؤالك، وسيصل إلى فريق عَلِّمني لمراجعته." onBack={onBack}>
      <form onSubmit={(event) => void submit(event)} className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-amber-200 bg-white p-5 shadow-sm sm:p-7">
        <div>
          <label htmlFor="inquiry-name" className="mb-1.5 block text-sm font-black text-slate-800">الاسم</label>
          <input id="inquiry-name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
        </div>
        <div>
          <label htmlFor="inquiry-email" className="mb-1.5 block text-sm font-black text-slate-800">البريد الإلكتروني <span className="font-medium text-slate-400">(اختياري)</span></label>
          <input id="inquiry-email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-left outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" dir="ltr" />
        </div>
        <div>
          <label htmlFor="inquiry-message" className="mb-1.5 block text-sm font-black text-slate-800">الاستفسار</label>
          <textarea id="inquiry-message" required minLength={5} maxLength={5000} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</p>}
        {success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">وصلنا استفسارك، شكرًا لك.</p>}
        <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-black text-white transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60">
          <Send className="h-4 w-4" /> {sending ? 'جارٍ الإرسال...' : 'إرسال الاستفسار'}
        </button>
      </form>
    </PublicPageFrame>
  );
};
