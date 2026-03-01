import { onCLS, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const sendToSupabase = (metric: Metric, path: string) => {
  const body = {
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    path,
    user_agent: navigator.userAgent,
  };

  // Use navigator.sendBeacon if available, falling back to fetch.
  // However, Supabase REST API needs specific headers.
  // We'll use supabase-js client but wrap it to not block main thread
  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleTask = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, 1));

  scheduleTask(() => {
    supabase.from('performance_metrics').insert(body).then(({ error }) => {
      if (error) console.error('Error sending metrics:', error);
    });
  });
};

export const usePerformanceMonitor = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run in production or staging, but for now we run everywhere to test
    const path = location.pathname;

    onCLS((metric) => sendToSupabase(metric, path));
    onLCP((metric) => sendToSupabase(metric, path));
    onTTFB((metric) => sendToSupabase(metric, path));
    onINP((metric) => sendToSupabase(metric, path));
    // onFID was removed in web-vitals v4+, replaced by INP
  }, [location]);
};
