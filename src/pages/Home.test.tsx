// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';

expect.extend(matchers);

import { useSiteSettings } from '../hooks/useSiteSettings';
import { HomeContentRepository } from '../repositories/HomeContentRepository';
import { PracticeAreasRepository } from '../repositories/PracticeAreasRepository';
import { PartnersRepository } from '../repositories/PartnersRepository';

// Mock dependencies
const { mockUseGlobalStore, mockGetState } = vi.hoisted(() => {
  const mockGetState = vi.fn();
  const mockUseGlobalStore = vi.fn();
  (mockUseGlobalStore as any).getState = mockGetState;
  return { mockUseGlobalStore, mockGetState };
});

vi.mock('../stores/useGlobalStore', () => ({
  useGlobalStore: mockUseGlobalStore
}));

vi.mock('../hooks/useSiteSettings');
vi.mock('../repositories/HomeContentRepository');
vi.mock('../repositories/PracticeAreasRepository');
vi.mock('../repositories/PartnersRepository');

// Mock OptimizedImage to avoid lazy loading issues
vi.mock('../components/OptimizedImage', () => ({
  default: ({ src, alt, priority, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock SEO component
vi.mock('../components/SEO', () => ({
  default: ({ title }: any) => <div data-testid="seo-title">{title}</div>,
}));

describe('Home Page Flickering Fix', () => {
  const mockSetHomeHero = vi.fn();
  const mockSetHomeAbout = vi.fn();
  const mockSetHomeCta = vi.fn();
  const mockSetPracticeAreas = vi.fn();
  const mockSetPartners = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock IntersectionObserver
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.IntersectionObserver = MockIntersectionObserver as any;

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Default mock implementation for Repositories
    (HomeContentRepository.getSection as any).mockResolvedValue({ content: { title: 'New Hero Title' } });
    (PracticeAreasRepository.getActive as any).mockResolvedValue([]);
    (PartnersRepository.getActive as any).mockResolvedValue([]);

    // Default mock for useSiteSettings
    (useSiteSettings as any).mockReturnValue({
      settings: null,
      loading: true, // Simulate loading initially
    });
  });

  it('renders Skeleton on first load (no cached content)', () => {
    const initialState = {
      services: [],
      portfolio: [],
      isHydrated: false, // Not hydrated yet
      homeHero: null,
      homeAbout: null,
      homeCta: null,
      practiceAreas: [],
      partners: [],
      setHomeHero: mockSetHomeHero,
      setHomeAbout: mockSetHomeAbout,
      setHomeCta: mockSetHomeCta,
      setPracticeAreas: mockSetPracticeAreas,
      setPartners: mockSetPartners,
    };
    
    (mockUseGlobalStore as any).mockReturnValue(initialState);
    mockGetState.mockReturnValue(initialState);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Should show skeleton (HomeSkeleton uses react-loading-skeleton)
    const skeleton = document.querySelector('.react-loading-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders Cached Content immediately (prevent flickering)', async () => {
    // Setup store WITH cached content
    const cachedHero = {
      title: 'Cached Hero Title',
      description: 'Cached Description',
      primary_button_text: 'Button',
      primary_button_link: '/link',
      background_image: 'img.jpg'
    };
    
    const cachedAbout = {
      title: 'Cached About',
      subtitle: 'Subtitle',
      description: 'Desc',
      image_url: 'img.jpg',
      button_text: 'Btn',
      button_link: '/link',
      features: []
    };

    const hydratedState = {
      services: [],
      portfolio: [],
      isHydrated: true, // Hydrated from storage
      homeHero: cachedHero,
      homeAbout: cachedAbout, // Must have both to be considered "cached"
      homeCta: null,
      practiceAreas: [],
      partners: [],
      setHomeHero: mockSetHomeHero,
      setHomeAbout: mockSetHomeAbout,
      setHomeCta: mockSetHomeCta,
      setPracticeAreas: mockSetPracticeAreas,
      setPartners: mockSetPartners,
    };

    (mockUseGlobalStore as any).mockReturnValue(hydratedState);
    mockGetState.mockReturnValue(hydratedState);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Should NOT show skeleton
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();

    // Should show cached content immediately
    const headings = screen.getAllByRole('heading', { name: 'Cached Hero Title' });
    expect(headings[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cached About')[0]).toBeInTheDocument();

    // But should still fetch new data in background
    await waitFor(() => {
        expect(HomeContentRepository.getSection).toHaveBeenCalledWith('hero');
        expect(HomeContentRepository.getSection).toHaveBeenCalledWith('about');
    });
  });

  it('fetches and updates content in background', async () => {
    // Setup store with cached content
    const cachedHero = { title: 'Old Title', description: 'Old Desc', background_image: 'img.jpg' };
    const cachedAbout = { title: 'Old About', description: 'Old Desc', image_url: 'img.jpg' };

    const hydratedState = {
      services: [],
      portfolio: [],
      isHydrated: true,
      homeHero: cachedHero,
      homeAbout: cachedAbout,
      homeCta: null,
      practiceAreas: [],
      partners: [],
      setHomeHero: mockSetHomeHero,
      setHomeAbout: mockSetHomeAbout,
      setHomeCta: mockSetHomeCta,
      setPracticeAreas: mockSetPracticeAreas,
      setPartners: mockSetPartners,
    };

    (mockUseGlobalStore as any).mockReturnValue(hydratedState);
    mockGetState.mockReturnValue(hydratedState);

    // Mock new data from repository
    const newHero = { title: 'New Fresh Title', description: 'New Desc' };
    (HomeContentRepository.getSection as any).mockImplementation((key: string) => {
        if (key === 'hero') return Promise.resolve({ content: newHero });
        if (key === 'about') return Promise.resolve({ content: cachedAbout });
        return Promise.resolve({ content: null });
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Initial render shows old content
    expect(screen.getAllByRole('heading', { name: 'Old Title' })[0]).toBeInTheDocument();

    // Wait for background fetch to complete and update store
    await waitFor(() => {
      expect(mockSetHomeHero).toHaveBeenCalledWith(newHero);
    });
  });
});
