import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGlobalStore, Service, Portfolio, Page, Profile, PracticeArea } from '../stores/useGlobalStore';
import { isAllowedImageSource } from '../utils/imageManager';

// Helper to check if we are in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper to sanitize data from remote DB (remove blocked URLs)
const sanitizeData = (data: any[] | any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeItem(item));
  }
  
  return sanitizeItem(data);
};

const sanitizeItem = (item: any): any => {
  if (!item || typeof item !== 'object') return item;
  
  const newItem = { ...item };
  
  // Check common image fields
  if (newItem.image_url && !isAllowedImageSource(newItem.image_url)) {
    // console.warn(`[RealtimeSync] Sanitized blocked URL: ${newItem.image_url}`);
    newItem.image_url = null;
  }
  
  if (newItem.icon_url && !isAllowedImageSource(newItem.icon_url)) {
    newItem.icon_url = null;
  }
  
  if (newItem.avatar_url && !isAllowedImageSource(newItem.avatar_url)) {
    newItem.avatar_url = null;
  }

  return newItem;
};

// Simple deep equal for JSON-serializable data
function isDeepEqual(a: any, b: any): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// Helper to check if any item in a list has blocked URLs
const hasBlockedUrls = (data: any[] | any): boolean => {
  if (!data) return false;
  
  if (Array.isArray(data)) {
    return data.some(item => hasBlockedUrlsItem(item));
  }
  
  return hasBlockedUrlsItem(data);
};

const hasBlockedUrlsItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  
  if (item.image_url && !isAllowedImageSource(item.image_url)) return true;
  if (item.icon_url && !isAllowedImageSource(item.icon_url)) return true;
  if (item.avatar_url && !isAllowedImageSource(item.avatar_url)) return true;
  
  return false;
};

export const useRealtimeSync = () => {
  // We use getState() inside the effect to avoid subscribing the component (App.tsx) 
  // to store updates, preventing unnecessary re-renders of the root component.
  
  useEffect(() => {
    if (!isBrowser) return;

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const bootstrap = async () => {
      try {
        console.log('[RealtimeSync] Checking for updates...');
        
        // Access store actions and state non-reactively
        const state = useGlobalStore.getState();
        const { 
            setServices, setPortfolio, setPages, setProfiles, setSettings, setPracticeAreas, setHydrated, setLastUpdateCheck,
            lastUpdateCheck 
        } = state;

        // 1. Check Global Update Timestamp first (Lightweight)
        const { data: updateConfig } = await supabase
            .from('site_settings')
            .select('updated_at')
            .single();
            
        const remoteTime = updateConfig?.updated_at;
        
        // Check if current state has blocked URLs (dirty cache from old version)
        const isDirty = 
            hasBlockedUrls(state.services) || 
            hasBlockedUrls(state.portfolio) || 
            hasBlockedUrls(state.pages) || 
            hasBlockedUrls(state.profiles) || 
            hasBlockedUrls(state.settings) || 
            hasBlockedUrls(state.practiceAreas);

        // If we have a local timestamp and it matches remote, AND cache is clean, SKIP everything
        if (!isDirty && lastUpdateCheck && remoteTime && lastUpdateCheck === remoteTime) {
            console.log('[RealtimeSync] System up to date. Using cache.');
            if (!state.isHydrated) setHydrated(true);
            return;
        }

        if (isDirty) {
            console.warn('[RealtimeSync] Cache dirty (blocked URLs found). Forcing refresh and sanitization...');
        } else {
            console.log('[RealtimeSync] Update detected or first load. Fetching fresh data...');
        }

        // 2. Fetch All Data (Only if needed)
        const [servicesRes, portfolioRes, pagesRes, profilesRes, settingsRes, practiceAreasRes] = await Promise.all<any>([
          supabase.from('services').select('*').order('order', { ascending: true }),
          supabase.from('portfolios').select('*').order('created_at', { ascending: false }),
          supabase.from('pages').select('*').order('title', { ascending: true }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('site_settings').select('*').single(),
          supabase.from('practice_areas').select('*').order('order_index', { ascending: true })
        ]);

        if (isMounted) {
          // Only update state if data actually changed to prevent re-renders
          if (servicesRes.data && !isDeepEqual(state.services, servicesRes.data)) {
             setServices(sanitizeData(servicesRes.data) as Service[]);
          }
          if (portfolioRes.data && !isDeepEqual(state.portfolio, portfolioRes.data)) {
             setPortfolio(sanitizeData(portfolioRes.data) as Portfolio[]);
          }
          if (pagesRes.data && !isDeepEqual(state.pages, pagesRes.data)) {
             setPages(sanitizeData(pagesRes.data) as any[]);
          }
          if (profilesRes.data && !isDeepEqual(state.profiles, profilesRes.data)) {
             setProfiles(sanitizeData(profilesRes.data) as Profile[]);
          }
          if (settingsRes.data && !isDeepEqual(state.settings, settingsRes.data)) {
             setSettings(sanitizeData(settingsRes.data) as any);
          }
          if (practiceAreasRes.data && !isDeepEqual(state.practiceAreas, practiceAreasRes.data)) {
             setPracticeAreas(sanitizeData(practiceAreasRes.data) as PracticeArea[]);
          }

          // Update the timestamp after successful fetch
          if (remoteTime && typeof setLastUpdateCheck === 'function') {
              setLastUpdateCheck(remoteTime);
          }
          
          if (!state.isHydrated) setHydrated(true);
          console.log('[RealtimeSync] Data synchronized.');
        }
      } catch (error) {
        console.error('[RealtimeSync] Sync error:', error);
      }
    };

    bootstrap();
    
    // Subscribe to Realtime changes
    // We access actions directly from store instance to avoid closure staleness if we used destructured vars
    const getActions = () => useGlobalStore.getState();

    const channels = [
      supabase
        .channel('public:services')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          (payload) => {
            const { updateService, removeService } = getActions();
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              updateService(payload.new as Service);
            } else if (payload.eventType === 'DELETE') {
              removeService(payload.old.id);
            }
          }
        )
        .subscribe(),

      supabase
        .channel('public:portfolios')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'portfolios' },
          (payload) => {
            const { updatePortfolio, removePortfolio } = getActions();
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              updatePortfolio(payload.new as Portfolio);
            } else if (payload.eventType === 'DELETE') {
              removePortfolio(payload.old.id);
            }
          }
        )
        .subscribe(),

      supabase
        .channel('public:pages')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pages' },
          (payload) => {
            const { updatePage, removePage } = getActions();
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              updatePage(payload.new as Page);
            } else if (payload.eventType === 'DELETE') {
              removePage(payload.old.id);
            }
          }
        )
        .subscribe(),

        supabase
          .channel('public:practice_areas')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'practice_areas' },
            async (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                    // Re-fetch entire list for ordered items
                    const { data } = await supabase.from('practice_areas').select('*').order('order_index', { ascending: true });
                    if (data) {
                        useGlobalStore.getState().setPracticeAreas(data as PracticeArea[]);
                    }
                }
            }
          )
          .subscribe()
    ];

    return () => {
        isMounted = false;
        if (retryTimeout) clearTimeout(retryTimeout);
        channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, []);
};
