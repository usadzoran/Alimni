import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Publishable client credentials are intentionally public; all private child data is protected by RLS.
const PUBLIC_SUPABASE_URL = 'https://qkjnybjyyqakyvaoyozy.supabase.co';
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_d1TtE_UGMSXCv8eg7kQulw_O9oc7rWw';

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

type ViteEnvironment = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export function getSupabaseCredentials(): { url: string; key: string } {
  const env = (import.meta as unknown as { env: ViteEnvironment }).env;
  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('arabic_kids_supabase_url') || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('arabic_kids_supabase_key') || '' : '';

  return {
    url: env.VITE_SUPABASE_URL || storedUrl || PUBLIC_SUPABASE_URL,
    key: env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || storedKey || PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('arabic_kids_supabase_url', url.trim());
    localStorage.setItem('arabic_kids_supabase_key', key.trim());
  }
  cachedClient = null;
  currentUrl = '';
  currentKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && currentUrl === url && currentKey === key) return cachedClient;

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !client) {
    return { success: false, message: 'تعذر إعداد الاتصال بمشروع Supabase.' };
  }

  try {
    const { error } = await client.from('children').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return { success: true, message: 'تم الاتصال بمشروع Supabase؛ لم تُنشأ جداول ملفات الأطفال بعد.' };
      }
      return { success: false, message: `خطأ من Supabase: ${error.message} (رمز: ${error.code})` };
    }

    return { success: true, message: 'تم الاتصال بقاعدة بيانات الأطفال بنجاح.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `فشل الاتصال: ${errorMsg}` };
  }
}
