import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Database } from '../types/database.types';
import { HeroContent, AboutContent, CTAContent, PracticeArea, Partner } from '../types/home-content';
import { SystemModule } from '../hooks/useSystemModules';
import { deepEqual } from '../utils/equality';
import { isAllowedImageSource } from '../utils/imageManager';

// Re-export types for convenience
export type { PracticeArea, Partner, HeroContent, AboutContent, CTAContent };

// Helper to sanitize data (remove blocked URLs)
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
    newItem.image_url = null;
  }
  
  if (newItem.icon_url && !isAllowedImageSource(newItem.icon_url)) {
    newItem.icon_url = null;
  }
  
  if (newItem.avatar_url && !isAllowedImageSource(newItem.avatar_url)) {
    newItem.avatar_url = null;
  }

  if (newItem.logo_url && !isAllowedImageSource(newItem.logo_url)) {
    newItem.logo_url = null;
  }

  // Handle gallery_images (array of strings or objects)
  if (newItem.gallery_images && Array.isArray(newItem.gallery_images)) {
    newItem.gallery_images = newItem.gallery_images.filter((img: any) => {
        if (typeof img === 'string') return isAllowedImageSource(img);
        if (typeof img === 'object' && img.url) return isAllowedImageSource(img.url);
        return false;
    });
  }

  return newItem;
};

// Types for Supabase data
export type Service = Database['public']['Tables']['services']['Row'];
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Page = Database['public']['Tables']['pages']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

interface GlobalState {
  // Data
  services: Service[];
  portfolio: Portfolio[];
  pages: Page[];
  contacts: Contact[];
  profiles: Profile[];
  settings: SiteSettings | null;
  
  // Home Content Cache
  practiceAreas: PracticeArea[];
  partners: Partner[];
  homeHero: HeroContent | null;
  homeAbout: AboutContent | null;
  homeCta: CTAContent | null;
  
  // System Modules
  systemModules: SystemModule[];
  setSystemModules: (data: SystemModule[]) => void;
  updateSystemModule: (item: SystemModule) => void;
  
  // Sync Metadata
  isHydrated: boolean;
  lastSync: number;
  lastUpdateCheck: string | null;
  
  // Actions
  setServices: (data: Service[]) => void;
  setPortfolio: (data: Portfolio[]) => void;
  setPages: (data: Page[]) => void;
  setContacts: (data: Contact[]) => void;
  setProfiles: (data: Profile[]) => void;
  setSettings: (data: SiteSettings | null) => void;
  
  setPracticeAreas: (data: PracticeArea[]) => void;
  setPartners: (data: Partner[]) => void;
  setHomeHero: (data: HeroContent | null) => void;
  setHomeAbout: (data: AboutContent | null) => void;
  setHomeCta: (data: CTAContent | null) => void;

  setHydrated: (status: boolean) => void;
  setLastUpdateCheck: (timestamp: string) => void;
  
  // Granular Actions (Realtime)
  updateService: (item: Service) => void;
  removeService: (id: string) => void;
  updatePortfolio: (item: Portfolio) => void;
  removePortfolio: (id: string) => void;
  updatePage: (item: Page) => void;
  removePage: (id: string) => void;
  updateProfile: (item: Profile) => void;
  removeProfile: (id: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      services: [],
      portfolio: [],
      pages: [],
      contacts: [],
      profiles: [],
      settings: null,
      
      practiceAreas: [],
      partners: [],
      homeHero: null,
      homeAbout: null,
      homeCta: null,

      systemModules: [],

      isHydrated: false,
      lastSync: 0,
      lastUpdateCheck: null,

      setServices: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().services, clean)) set({ services: clean });
      },
      setPortfolio: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().portfolio, clean)) set({ portfolio: clean });
      },
      setPages: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().pages, clean)) set({ pages: clean });
      },
      setContacts: (data) => {
        if (!deepEqual(get().contacts, data)) set({ contacts: data });
      },
      setProfiles: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().profiles, clean)) set({ profiles: clean });
      },
      setSettings: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().settings, clean)) set({ settings: clean });
      },
      
      setPracticeAreas: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().practiceAreas, clean)) set({ practiceAreas: clean });
      },
      setPartners: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().partners, clean)) set({ partners: clean });
      },
      setHomeHero: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().homeHero, clean)) set({ homeHero: clean });
      },
      setHomeAbout: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().homeAbout, clean)) set({ homeAbout: clean });
      },
      setHomeCta: (data) => {
        const clean = sanitizeData(data);
        if (!deepEqual(get().homeCta, clean)) set({ homeCta: clean });
      },
      
      setSystemModules: (data) => {
        if (!deepEqual(get().systemModules, data)) set({ systemModules: data });
      },
      updateSystemModule: (item) => set((state) => {
        const index = state.systemModules.findIndex(i => i.id === item.id);
        if (index >= 0) {
          const newModules = [...state.systemModules];
          newModules[index] = item;
          return { systemModules: newModules };
        }
        return { systemModules: [...state.systemModules, item] };
      }),

      setHydrated: (status) => set({ isHydrated: status, lastSync: Date.now() }),
      setLastUpdateCheck: (timestamp) => set({ lastUpdateCheck: timestamp }),

      // Realtime Helpers
      removeService: (id) => set((state) => ({
        services: state.services.filter(i => i.id !== id)
      })),
      
      updateService: (item) => set((state) => {
        const clean = sanitizeItem(item);
        const index = state.services.findIndex(i => i.id === clean.id);
        if (index >= 0) {
          const newServices = [...state.services];
          newServices[index] = clean;
          return { services: newServices };
        }
        return { services: [clean, ...state.services] };
      }),

      updatePortfolio: (item) => set((state) => {
        const clean = sanitizeItem(item);
        const index = state.portfolio.findIndex(i => i.id === clean.id);
        if (index >= 0) {
            const newPortfolio = [...state.portfolio];
            newPortfolio[index] = clean;
            return { portfolio: newPortfolio };
        }
        return { portfolio: [clean, ...state.portfolio] };
      }),
      removePortfolio: (id) => set((state) => ({
        portfolio: state.portfolio.filter(i => i.id !== id)
      })),
      updatePage: (item) => set((state) => {
        const clean = sanitizeItem(item);
        const index = state.pages.findIndex(i => i.id === clean.id);
        if (index >= 0) {
          const newPages = [...state.pages];
          newPages[index] = clean;
          return { pages: newPages };
        }
        return { pages: [clean, ...state.pages] };
      }),
      removePage: (id) => set((state) => ({
        pages: state.pages.filter(i => i.id !== id)
      })),
      updateProfile: (item) => set((state) => {
        const clean = sanitizeItem(item);
        const index = state.profiles.findIndex(i => i.id === clean.id);
        if (index >= 0) {
          const newProfiles = [...state.profiles];
          newProfiles[index] = clean;
          return { profiles: newProfiles };
        }
        return { profiles: [clean, ...state.profiles] };
      }),
      removeProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(i => i.id !== id)
      })),
    }),
    {
      name: 'ars-global-store',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            services: [],
            portfolio: [],
            pages: [],
            contacts: [],
            profiles: [],
            settings: null,
            practiceAreas: [],
            partners: [],
            homeHero: null,
            homeAbout: null,
            homeCta: null,
            systemModules: [],
            isHydrated: false,
            lastSync: 0,
            lastUpdateCheck: null
          };
        }
        return persistedState as GlobalState;
      },
      partialize: (state) => ({ 
        services: state.services,
        portfolio: state.portfolio,
        pages: state.pages,
        settings: state.settings,
        practiceAreas: state.practiceAreas,
        partners: state.partners,
        homeHero: state.homeHero,
        homeAbout: state.homeAbout,
        homeCta: state.homeCta,
        systemModules: state.systemModules,
        isHydrated: state.isHydrated,
        lastSync: state.lastSync,
        lastUpdateCheck: state.lastUpdateCheck
      }),
    }
  )
);
