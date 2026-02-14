import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function measure(name, fn) {
  const start = performance.now();
  try {
    const res = await fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    // Estimate size
    const jsonString = JSON.stringify(res.data);
    const sizeKB = (new Blob([jsonString]).size / 1024).toFixed(2);
    
    return {
      name,
      duration_ms: duration,
      items: res.data?.length || 0,
      size_kb: sizeKB,
      error: res.error ? res.error.message : null
    };
  } catch (e) {
    return { name, error: e.message };
  }
}

async function runBenchmark() {
  console.log('🚀 Starting Performance Benchmark...\n');
  const results = [];

  // 1. Services (Current: Select *)
  results.push(await measure('Services (Select *)', async () => {
    return await supabase.from('services').select('*').eq('published', true).order('order');
  }));

  // 2. Services (Optimized: DTO)
  results.push(await measure('Services (Optimized)', async () => {
    return await supabase.from('services')
      .select('id, title, slug, short_description, image_url, icon, category')
      .eq('published', true)
      .order('order');
  }));

  // 3. Portfolio (Current: Select *)
  results.push(await measure('Portfolio (Select *)', async () => {
    return await supabase.from('portfolios').select('*').eq('published', true).order('created_at', { ascending: false });
  }));

  // 4. Portfolio (Optimized: DTO)
  results.push(await measure('Portfolio (Optimized)', async () => {
    return await supabase.from('portfolios')
      // Note: short_description was added recently, using it instead of description
      .select('id, title, slug, short_description, image_url, category, location, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
  }));

  // 5. Pages (Current: Select *)
  results.push(await measure('Pages (Select *)', async () => {
    return await supabase.from('pages').select('*').eq('published', true);
  }));

   // 6. Pages (Optimized: DTO)
   results.push(await measure('Pages (Optimized)', async () => {
    return await supabase.from('pages')
      .select('id, title, slug, updated_at') // Minimal for list
      .eq('published', true);
  }));

  console.table(results);
}

runBenchmark();
