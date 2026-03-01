type Stats = {
  count: number;
  totalDuration: number;
  totalTransfer: number;
};

const key = 'imgPerf.stats';

const readStats = (): Stats => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { count: 0, totalDuration: 0, totalTransfer: 0 };
    return JSON.parse(raw) as Stats;
  } catch {
    return { count: 0, totalDuration: 0, totalTransfer: 0 };
  }
};

const writeStats = (s: Stats) => {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {}
};

export const startImagePerfObserver = () => {
  if (!('PerformanceObserver' in window)) return;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformanceResourceTiming[];
    const supabase = entries.filter((e) => e.initiatorType === 'img' && /supabase\.co/i.test(e.name));
    if (supabase.length === 0) return;
    const stats = readStats();
    for (const e of supabase) {
      stats.count += 1;
      stats.totalDuration += e.duration;
      const transfer = (e as any).transferSize || 0;
      stats.totalTransfer += transfer;
    }
    writeStats(stats);
    console.info('[ImgPerf]', {
      count: stats.count,
      avgDuration: stats.count ? Math.round(stats.totalDuration / stats.count) : 0,
      totalKB: Math.round(stats.totalTransfer / 1024),
    });
  });
  try {
    observer.observe({ type: 'resource', buffered: true });
  } catch {}
};

export const resetImagePerfStats = () => {
  writeStats({ count: 0, totalDuration: 0, totalTransfer: 0 });
};
