import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Database } from '../types/database.types';

// Tipos para os dados do Supabase
export type Service = Database['public']['Tables']['services']['Row'];
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Page = Database['public']['Tables']['pages']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

interface GlobalState {
  // Dados
  services: Service[];
  portfolio: Portfolio[];
  pages: Page[];
  contacts: Contact[];
  settings: SiteSettings | null;
  
  // Metadados de Sync
  isHydrated: boolean;
  lastSync: number;
  
  // Ações
  setServices: (data: Service[]) => void;
  setPortfolio: (data: Portfolio[]) => void;
  setPages: (data: Page[]) => void;
  setContacts: (data: Contact[]) => void;
  setSettings: (data: SiteSettings | null) => void;
  setHydrated: (status: boolean) => void;
  
  // Ações Granulares (Realtime)
  updateService: (item: Service) => void;
  removeService: (id: string) => void;
  updatePortfolio: (item: Portfolio) => void;
  removePortfolio: (id: string) => void;
  updatePage: (item: Page) => void;
  removePage: (id: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      services: [],
      portfolio: [],
      pages: [],
      contacts: [],
      settings: null,
      isHydrated: false,
      lastSync: 0,

      setServices: (data) => set({ services: data }),
      setPortfolio: (data) => set({ portfolio: data }),
      setPages: (data) => set({ pages: data }),
      setContacts: (data) => set({ contacts: data }),
      setSettings: (data) => set({ settings: data }),
      setHydrated: (status) => set({ isHydrated: status, lastSync: Date.now() }),

      // Realtime Helpers: Atualiza apenas o item que mudou sem recriar todo o array se possível
      updateService: (item) => set((state) => {
        const index = state.services.findIndex(i => i.id === item.id);
        if (index >= 0) {
          const newServices = [...state.services];
          newServices[index] = item;
          return { services: newServices };
        }
        return { services: [item, ...state.services] };
      }),
      removeService: (id) => set((state) => ({
        services: state.services.filter(i => i.id !== id)
      })),

      updatePortfolio: (item) => set((state) => {
        const index = state.portfolio.findIndex(i => i.id === item.id);
        if (index >= 0) {
            const newPortfolio = [...state.portfolio];
            newPortfolio[index] = item;
            return { portfolio: newPortfolio };
        }
        return { portfolio: [item, ...state.portfolio] };
      }),
      removePortfolio: (id) => set((state) => ({
        portfolio: state.portfolio.filter(i => i.id !== id)
      })),
      updatePage: (item) => set((state) => {
        const index = state.pages.findIndex(i => i.id === item.id);
        if (index >= 0) {
          const newPages = [...state.pages];
          newPages[index] = item;
          return { pages: newPages };
        }
        return { pages: [item, ...state.pages] };
      }),
      removePage: (id) => set((state) => ({
        pages: state.pages.filter(i => i.id !== id)
      })),
    }),
    {
      name: 'ars-global-store', // nome único para o localStorage
      storage: createJSONStorage(() => localStorage), // define localStorage explicitamente
      partialize: (state) => ({ 
        services: state.services,
        portfolio: state.portfolio,
        pages: state.pages,
        // Contacts are sensitive data, so we don't persist them to localStorage
        // They will be fetched on demand by the Admin component
        settings: state.settings,
        isHydrated: state.isHydrated, // Persistimos o estado de hidratação
        lastSync: state.lastSync
      }),
    }
  )
);
