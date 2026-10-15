import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Megaphone, X } from 'lucide-react';
import type { ChildProfile } from '../../types';
import { getPublicSupabaseClient } from '../../lib/supabase';

type NotificationRow = {
  id: string;
  notification_type: 'announcement' | 'lesson' | 'challenge';
  title: string;
  message: string;
  target_age_group: 'all' | '2-4' | '5-7';
  link: string | null;
  created_at: string;
};
const READ_KEY = 'alimni_read_notifications_v1';
const formatDate = (value: string) => new Intl.DateTimeFormat('ar', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
const matchesChild = (row: NotificationRow, child?: ChildProfile) => row.target_age_group === 'all' || row.target_age_group === child?.learningTrack;

export const NotificationCenter: React.FC<{ activeChild?: ChildProfile }> = ({ activeChild }) => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]') as string[]; } catch { return []; }
  });
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'denied');
  const client = getPublicSupabaseClient();

  const markRead = (id: string) => {
    setReadIds((current) => { const next = Array.from(new Set([...current, id])).slice(-100); localStorage.setItem(READ_KEY, JSON.stringify(next)); return next; });
  };
  const visible = useMemo(() => notifications.filter((row) => matchesChild(row, activeChild)), [notifications, activeChild]);
  const unreadCount = visible.filter((row) => !readIds.includes(row.id)).length;

  useEffect(() => {
    if (!client) return;
    let active = true;
    const load = async () => {
      const { data } = await client.from('site_notifications').select('id,notification_type,title,message,target_age_group,link,created_at').order('created_at', { ascending: false }).limit(30);
      if (active) setNotifications((data ?? []) as NotificationRow[]);
    };
    void load();
    const channel = client.channel('alimni-site-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_notifications' }, (payload) => {
      const row = payload.new as NotificationRow;
      if (!matchesChild(row, activeChild)) return;
      setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 30));
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') new window.Notification(row.title, { body: row.message, icon: '/Alimni/pwa-192x192.png' });
    }).subscribe();
    return () => { active = false; void client.removeChannel(channel); };
  }, [activeChild?.learningTrack]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const next = await window.Notification.requestPermission(); setPermission(next);
  };
  return <div className="relative">
    <button type="button" aria-label="الإشعارات" title="الإشعارات" onClick={() => setOpen((value) => !value)} className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 transition hover:bg-amber-100">
      <Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">{unreadCount > 9 ? '٩+' : unreadCount}</span>}
    </button>
    {open && <div className="absolute left-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-amber-200 bg-white text-right shadow-2xl" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-100 p-3"><div><h3 className="font-black text-slate-900">إشعارات عَلِّمني</h3><p className="mt-0.5 text-[11px] text-slate-500">تصل فور نشر درس أو إعلان جديد</p></div><button type="button" aria-label="إغلاق" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
      {permission === 'default' && <button type="button" onClick={() => void requestPermission()} className="flex w-full items-center gap-2 border-b border-slate-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800"><Bell className="h-4 w-4" /> فعّل إشعارات المتصفح ليصلك التنبيه فورًا</button>}
      <div className="max-h-80 overflow-y-auto">{visible.length === 0 ? <p className="p-6 text-center text-sm font-bold text-slate-500">لا توجد إشعارات جديدة.</p> : visible.map((row) => <button type="button" key={row.id} onClick={() => markRead(row.id)} className={`block w-full border-b border-slate-100 p-3 text-right transition hover:bg-amber-50 ${readIds.includes(row.id) ? 'bg-white opacity-70' : 'bg-amber-50/50'}`}><div className="flex items-start gap-2"><span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${row.notification_type === 'announcement' ? 'bg-rose-100 text-rose-700' : row.notification_type === 'lesson' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}>{row.notification_type === 'announcement' ? <Megaphone className="h-4 w-4" /> : <Check className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><strong className="block text-sm font-black text-slate-900">{row.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{row.message}</span><time className="mt-1 block text-[10px] text-slate-400">{formatDate(row.created_at)}{!readIds.includes(row.id) && <b className="mr-2 text-rose-600">جديد</b>}</time></span></div></button>)}</div>
    </div>}
  </div>;
};
