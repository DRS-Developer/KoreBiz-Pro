import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useGlobalStore, Service, Portfolio, Page } from '../stores/useGlobalStore';
import { toast } from 'sonner';

export const useRealtimeSync = () => {
  const { 
    setServices, setPortfolio, setPages, setSettings, setHydrated,
    updateService, removeService,
    updatePortfolio, removePortfolio,
    updatePage, removePage
  } = useGlobalStore();
  const retryRef = useRef<{ count: number; timer: number | null }>({ count: 0, timer: null });

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const isAbortError = (error: unknown) => {
      const err = error as { name?: string; message?: string };
      return err?.name === 'AbortError' || err?.message?.includes('AbortError');
    };
    const isNetworkError = (error: unknown) => {
      const err = error as { message?: string };
      return err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError');
    };

    const loadStaticFallback = async () => {
      try {
        const [servicesRes, portfolioRes, pagesRes, settingsRes] = await Promise.all([
          fetch('/static-db/services_list.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
          fetch('/static-db/portfolio_list.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
          fetch('/static-db/pages_list.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
          fetch('/static-db/site_settings.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
        ]);

        if (!isMounted) return false;

        if (servicesRes) setServices(servicesRes as Service[]);
        if (portfolioRes) setPortfolio(portfolioRes as Portfolio[]);
        if (pagesRes) setPages(pagesRes as any[]);
        if (Array.isArray(settingsRes) && settingsRes[0]) setSettings(settingsRes[0] as any);

        return Boolean(servicesRes || portfolioRes || pagesRes || settingsRes);
      } catch (error) {
        console.warn('[RealtimeSync] Static fallback failed', error);
        return false;
      }
    };

    // Check if data is already loaded to avoid unnecessary refetch on re-mounts
    const currentStore = useGlobalStore.getState();
    if (currentStore.isHydrated && currentStore.services.length > 0) {
       console.log('[RealtimeSync] Data already hydrated. Skipping bootstrap.');
       // We still need to setup realtime subscription though, so we proceed to subscription part
       // But we skip the fetch
    }

    const bootstrap = async () => {
      try {
        const state = useGlobalStore.getState();
        const alreadyHydrated = state.isHydrated;
        const hasDataInStore = state.services.length > 0 || state.portfolio.length > 0;
        
        // Se estiver "hidratado" mas sem dados (cache vazio ou inválido), força o fetch
        if (!alreadyHydrated || !hasDataInStore) {
            console.log('[RealtimeSync] Starting bootstrap fetch from Supabase...', { alreadyHydrated, hasDataInStore });
            
            // 1. Initial Fetch (Parallel)
            const [servicesRes, portfolioRes, pagesRes, settingsRes] = await Promise.all<any>([
              supabase.from('services').select('*').order('order', { ascending: true }),
              supabase.from('portfolios').select('*').order('created_at', { ascending: false }),
              supabase.from('pages').select('*').order('title', { ascending: true }),
              supabase.from('site_settings').select('*').single()
            ]);

            console.log('[RealtimeSync] Supabase responses received', {
              services: { count: servicesRes.data?.length, error: servicesRes.error },
              portfolio: { count: portfolioRes.data?.length, error: portfolioRes.error },
              pages: { count: pagesRes.data?.length, error: pagesRes.error },
              settings: { exists: !!settingsRes.data, error: settingsRes.error }
            });

            if (isMounted) {
              const responses = [servicesRes, portfolioRes, pagesRes, settingsRes];
              const hasAbort = responses.some((res) => isAbortError(res.error));
              const hasNetwork = responses.some((res) => isNetworkError(res.error));
              const hasError = responses.some((res) => res.error);
              
              if (hasError) {
                console.error('[RealtimeSync] Detected errors in responses:', responses.filter(r => r.error).map(r => r.error));
              }

              if (servicesRes.data) setServices(servicesRes.data as Service[]);
              if (portfolioRes.data) setPortfolio(portfolioRes.data as Portfolio[]);
              if (pagesRes.data) setPages(pagesRes.data as any[]);
              if (settingsRes.data) setSettings(settingsRes.data as any);

              const hasData =
                Boolean(servicesRes.data && servicesRes.data.length > 0) ||
                Boolean(portfolioRes.data && portfolioRes.data.length > 0) ||
                Boolean(pagesRes.data && pagesRes.data.length > 0) ||
                Boolean(settingsRes.data);

              if (hasError || !hasData) {
                console.warn('[RealtimeSync] Fetch failed or returned no data. Attempting static fallback...', { hasError, hasData });
                const fallbackLoaded = await loadStaticFallback();
                if (fallbackLoaded) {
                  setHydrated(true);
                  console.log('[RealtimeSync] Static fallback applied successfully. Hydrated.');
                } else {
                  console.error('[RealtimeSync] Both Supabase and static fallback failed.');
                  scheduleRetry();
                }
              } else {
                setHydrated(true);
                console.log('[RealtimeSync] Bootstrap complete from Supabase. Hydrated.');
              }

              if (hasAbort || hasNetwork) {
                console.log('[RealtimeSync] Scheduling retry due to abort/network error');
                scheduleRetry();
              }
            }
        } else {
             console.log('[RealtimeSync] Skipped fetch, already hydrated and has data in store.');
        }

        if (!channel && useGlobalStore.getState().isHydrated) {
          channel = supabase.channel('global-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'services' },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                updateService(payload.new as Service);
                toast.info('Serviços atualizados em tempo real');
              } else if (payload.eventType === 'DELETE') {
                removeService(payload.old.id);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'portfolios' },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                updatePortfolio(payload.new as Portfolio);
                toast.info('Portfólio atualizado em tempo real');
              } else if (payload.eventType === 'DELETE') {
                removePortfolio(payload.old.id);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pages' },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                updatePage(payload.new as Page);
                toast.info('Páginas atualizadas em tempo real');
              } else if (payload.eventType === 'DELETE') {
                removePage(payload.old.id);
              }
            }
          )
          .subscribe();
        }

      } catch (error) {
        if (!isAbortError(error)) {
          console.error('[RealtimeSync] Bootstrap failed', error);
        }
      }
    };

    const scheduleRetry = () => {
      if (retryRef.current.count >= 5) return;
      if (retryRef.current.timer !== null) {
        window.clearTimeout(retryRef.current.timer);
      }
      const delay = Math.min(10000, 1000 * Math.pow(2, retryRef.current.count));
      retryRef.current.count += 1;
      retryRef.current.timer = window.setTimeout(() => {
        if (isMounted) bootstrap();
      }, delay);
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
      if (retryRef.current.timer !== null) window.clearTimeout(retryRef.current.timer);
    };
  }, []); // Run once on mount
};
