import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from env or local config
let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('arabic_kids_supabase_url') || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('arabic_kids_supabase_key') || '' : '';

  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('arabic_kids_supabase_url', url.trim());
    localStorage.setItem('arabic_kids_supabase_key', key.trim());
  }
  // Reset cached client
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
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

  if (!url || !key) {
    return {
      success: false,
      message: 'لم يتم إدخال رابط أو مفتاح Supabase بعد. يرجى إدخال الرابط والمفتاح العام (anon key) في لوحة الإدارة أو ولي الأمر.',
    };
  }

  if (!client) {
    return {
      success: false,
      message: 'تعذر إنشاء عميل Supabase. يرجى التأكد من صحة تنسيق رابط المشروع والمفتاح.',
    };
  }

  try {
    // Attempt a light ping by querying any public table or auth
    const { error } = await client.from('letters').select('id').limit(1);

    if (error) {
      // Check if table missing vs network/key error
      if (error.code === '42P01') {
        // Table does not exist yet, but connection succeeded!
        return {
          success: true,
          message: 'تم الاتصال بمشروع Supabase بنجاح! يلزم تنفيذ ملف SQL لإنشاء الجداول وسياسات الأمان.',
        };
      }
      return {
        success: false,
        message: `خطأ من Supabase: ${error.message} (رمز: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح وقراءة البيانات!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `فشل الاتصال: ${errorMsg}`,
    };
  }
}
