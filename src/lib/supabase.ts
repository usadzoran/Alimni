import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Publishable client credentials are intentionally public; all private child data is protected by RLS.
const PUBLIC_SUPABASE_URL = 'https://qkjnybjyyqakyvaoyozy.supabase.co';
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_d1TtE_UGMSXCv8eg7kQulw_O9oc7rWw';

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';
let cachedPublicClient: SupabaseClient | null = null;
let currentPublicUrl = '';
let currentPublicKey = '';
let cachedAdminClient: SupabaseClient | null = null;
let currentAdminUrl = '';
let currentAdminKey = '';

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
  cachedPublicClient = null;
  currentPublicUrl = '';
  currentPublicKey = '';
  cachedAdminClient = null;
  currentAdminUrl = '';
  currentAdminKey = '';
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
        // Keep admin email-confirmation tokens out of the child's anonymous session.
        detectSessionInUrl: false,
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

/** Stateless public client: public content and contact forms use the anon role, not a child's auth session. */
export function getPublicSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedPublicClient && currentPublicUrl === url && currentPublicKey === key) return cachedPublicClient;

  try {
    cachedPublicClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'alimni-public-anon-v1',
      },
    });
    currentPublicUrl = url;
    currentPublicKey = key;
    return cachedPublicClient;
  } catch (err) {
    console.error('Failed to initialize public Supabase client:', err);
    return null;
  }
}

/** Uses a separate persisted auth key so administrator sign-in cannot replace the child's anonymous session. */
export function getAdminSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedAdminClient && currentAdminUrl === url && currentAdminKey === key) return cachedAdminClient;

  try {
    cachedAdminClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'alimni-admin-auth-v1',
      },
    });
    currentAdminUrl = url;
    currentAdminKey = key;
    return cachedAdminClient;
  } catch (err) {
    console.error('Failed to initialize admin Supabase client:', err);
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
