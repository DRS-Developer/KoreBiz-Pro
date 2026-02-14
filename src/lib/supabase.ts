import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

declare global {
  interface Window {
    ENV?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    };
  }
}

// Função auxiliar para resolver variáveis de ambiente com suporte Universal
// Prioridade:
// 1. Runtime Config (window.ENV) - para Docker/ConfigMap
// 2. Vite Env (import.meta.env) - para desenvolvimento local e configuração manual
// 3. Vercel System Env (import.meta.env + process.env) - para integração nativa
const getEnvVar = (key: string, nextKey: string) => {
  // @ts-expect-error window.ENV is injected at runtime in index.html
  const runtimeEnv = typeof window !== 'undefined' ? window.ENV : {};
  
  // Tenta recuperar na ordem de prioridade
  const value = 
    runtimeEnv?.[key] || 
    runtimeEnv?.[nextKey] ||
    import.meta.env[key] || 
    import.meta.env[nextKey] || 
    // @ts-expect-error process.env may be undefined in browser runtime; used in build/SSR only
    (typeof process !== 'undefined' ? process.env?.[nextKey] : undefined);

  if (!value) {
    console.warn(`[Supabase] Env var ${key}/${nextKey} not found in runtime, import.meta.env or process.env`);
  }

  return value;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check config.json, .env file or Vercel settings.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'Accept': 'application/json',
      },
    },
  }
);
