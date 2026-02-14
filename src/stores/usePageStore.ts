import { create } from 'zustand';
import { Database } from '../types/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface PageStore {
  pages: Record<string, Page | null>;
  setPage: (slug: string, page: Page | null) => void;
  hasLoaded: (slug: string) => boolean;
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: {},
  setPage: (slug, page) => set((state) => ({ 
    pages: { ...state.pages, [slug]: page } 
  })),
  hasLoaded: (slug) => slug in get().pages,
}));
