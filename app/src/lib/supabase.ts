import { createClient } from '@supabase/supabase-js';

/**
 * 星言塔罗 — Supabase 客户端
 *
 * 环境变量（Vite 前缀为 VITE_）：
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[星言塔罗] Supabase 环境变量未配置。登录和云端同步功能不可用。\n' +
    '请在 app/.env.local 中添加：\n' +
    'VITE_SUPABASE_URL=your_supabase_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key'
  );
}

// 未配置时提供一个 dummy client，避免整个应用崩溃
// 所有方法返回空结果，让页面正常渲染（本地模式）
const dummyClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase 未配置') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase 未配置') }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    upsert: () => Promise.resolve({ error: null }),
  }),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: new Error('Supabase 未配置') }),
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
} as unknown as ReturnType<typeof createClient>;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : dummyClient;

// 便捷导出
export type SupabaseClient = typeof supabase;
