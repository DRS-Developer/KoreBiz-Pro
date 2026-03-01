import { supabase } from '../lib/supabase';

export interface HealthReport {
  timestamp: string;
  status: 'online' | 'degraded' | 'offline';
  checks: {
    database: { status: 'ok' | 'error'; latency: number; message?: string };
    queryPerformance: { status: 'ok' | 'slow' | 'error'; latency: number; message?: string };
    auth: { status: 'ok' | 'error'; message?: string };
    storage: { status: 'ok' | 'error'; message?: string };
    dns: { status: 'ok' | 'error'; message?: string }; // Simulated via fetch
  };
}

export const HealthCheckService = {
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; latency: number; message?: string }> {
    const start = performance.now();
    try {
      // Simple query to check connection and read capability
      const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
      const end = performance.now();
      const latency = Math.round(end - start);

      if (error) throw error;

      return { status: 'ok', latency };
    } catch (err: any) {
      return { status: 'error', latency: 0, message: err.message || 'Database unreachable' };
    }
  },

  async checkQueryPerformance(): Promise<{ status: 'ok' | 'slow' | 'error'; latency: number; message?: string }> {
    const start = performance.now();
    try {
      // Benchmark query: Fetch top 5 services with specific columns (simulating optimized load)
      const { error } = await supabase
        .from('services')
        .select('id, title, slug, category')
        .eq('published', true)
        .order('order')
        .limit(5);
        
      const end = performance.now();
      const latency = Math.round(end - start);

      if (error) throw error;

      // Threshold: 500ms for "slow" on a simple query
      return { 
        status: latency > 500 ? 'slow' : 'ok', 
        latency 
      };
    } catch (err: any) {
      return { status: 'error', latency: 0, message: err.message };
    }
  },

  async checkAuth(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return { status: 'ok' };
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  },

  async checkStorage(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    try {
      // List buckets to verify storage access
      const { error } = await supabase.storage.listBuckets();
      if (error) throw error;
      return { status: 'ok' };
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  },

  async checkDNS(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    // We cannot do real DNS lookups in browser, but we can try to fetch the Supabase URL
    // via a simple HEAD request if CORS allows, or infer from other failures.
    // If DB check failed with a network error, it's likely DNS/Network.
    // Here we will rely on the DB check result mostly, but we can try a fetch to the project URL if known.
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return { status: 'error', message: 'URL not configured' };

    try {
        // This might fail due to CORS if not hitting an endpoint that allows it.
        // Usually Supabase APIs allow CORS. We try the health endpoint or just the root.
        // Actually, just checking if 'supabase.auth.getSession()' worked is a good proxy.
        // But let's try a fetch to see if it's a network error specifically.
        const response = await fetch(`${supabaseUrl}/rest/v1/`, { 
            method: 'HEAD',
            headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY } 
        });
        if (response.ok || response.status === 404 || response.status === 401) {
             // If we get a response (even 401), DNS is working.
             return { status: 'ok' };
        }
        return { status: 'error', message: `HTTP Status: ${response.status}` };
    } catch (err: any) {
        // Failed to fetch -> Network or DNS error
        return { status: 'error', message: err.message || 'Network unreachable' };
    }
  },

  async runFullDiagnosis(): Promise<HealthReport> {
    const [db, perf, auth, storage, dns] = await Promise.all([
      this.checkDatabase(),
      this.checkQueryPerformance(),
      this.checkAuth(),
      this.checkStorage(),
      this.checkDNS()
    ]);

    let overallStatus: 'online' | 'degraded' | 'offline' = 'online';

    if (db.status === 'error' || dns.status === 'error') {
      overallStatus = 'offline';
    } else if (auth.status === 'error' || storage.status === 'error' || db.latency > 1000 || perf.status === 'slow') {
      overallStatus = 'degraded';
    }

    return {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      checks: {
        database: db,
        queryPerformance: perf,
        auth,
        storage,
        dns
      }
    };
  }
};
