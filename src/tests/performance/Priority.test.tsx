import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServicesDefault from '../../components/Home/Sections/Services/ServicesDefault';
import ProjectsDefault from '../../components/Home/Sections/Projects/ProjectsDefault';
import PartnersDefault from '../../components/Home/Sections/Partners/PartnersDefault';
import AboutDefault from '../../components/Home/Sections/About/AboutDefault';
import { useGlobalStore } from '../../stores/useGlobalStore';

// Mock OptimizedImage to capture priority prop
vi.mock('../../components/OptimizedImage', () => ({
  default: ({ src, alt, priority, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      data-priority={priority ? 'true' : 'false'} 
      {...props} 
    />
  ),
}));

// Mock Carousel to render children directly
vi.mock('../../components/Carousel', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

// Mock Global Store
vi.mock('../../stores/useGlobalStore');

describe('Performance & Priority Attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Services Section', () => {
    it('should apply priority to the first 4 images', () => {
      const mockAreas = Array.from({ length: 6 }).map((_, i) => ({
        id: `area-${i}`,
        title: `Area ${i}`,
        image_url: `img-${i}.jpg`,
        published: true,
        description: 'desc'
      }));

      (useGlobalStore as any).mockReturnValue({
        practiceAreas: mockAreas,
        services: []
      });

      render(
        <MemoryRouter>
          <ServicesDefault />
        </MemoryRouter>
      );

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(6);

      // First 4 should have priority=true
      expect(images[0]).toHaveAttribute('data-priority', 'true');
      expect(images[1]).toHaveAttribute('data-priority', 'true');
      expect(images[2]).toHaveAttribute('data-priority', 'true');
      expect(images[3]).toHaveAttribute('data-priority', 'true');
      
      // Others should be false
      expect(images[4]).toHaveAttribute('data-priority', 'false');
      expect(images[5]).toHaveAttribute('data-priority', 'false');
    });
  });

  describe('Projects Section', () => {
    it('should apply priority to the first 4 project images', () => {
      const mockProjects = Array.from({ length: 6 }).map((_, i) => ({
        id: `proj-${i}`,
        title: `Project ${i}`,
        slug: `proj-${i}`,
        image_url: `pimg-${i}.jpg`,
        published: true,
        category: 'Cat',
        description: 'desc'
      }));

      (useGlobalStore as any).mockReturnValue({
        portfolio: mockProjects
      });

      render(
        <MemoryRouter>
          <ProjectsDefault />
        </MemoryRouter>
      );

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(6);

      expect(images[0]).toHaveAttribute('data-priority', 'true');
      expect(images[3]).toHaveAttribute('data-priority', 'true');
      expect(images[4]).toHaveAttribute('data-priority', 'false');
    });
  });

  describe('Partners Section', () => {
    it('should apply priority to the first 6 partner logos', () => {
      const mockPartners = Array.from({ length: 8 }).map((_, i) => ({
        id: `part-${i}`,
        name: `Partner ${i}`,
        logo_url: `logo-${i}.jpg`
      }));

      (useGlobalStore as any).mockReturnValue({
        partners: mockPartners
      });

      render(
        <MemoryRouter>
          <PartnersDefault />
        </MemoryRouter>
      );

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(8);

      expect(images[0]).toHaveAttribute('data-priority', 'true');
      expect(images[5]).toHaveAttribute('data-priority', 'true');
      expect(images[6]).toHaveAttribute('data-priority', 'false');
    });
  });

  describe('About Section', () => {
    it('should always apply priority to the main image', () => {
      (useGlobalStore as any).mockReturnValue({
        homeAbout: {
          title: 'About',
          image_url: 'about.jpg'
        }
      });

      render(
        <MemoryRouter>
          <AboutDefault />
        </MemoryRouter>
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('data-priority', 'true');
    });
  });
});
