import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkMediaUsage, normalizeUrl } from './mediaUsage';

const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('mediaUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => {
      if (table === 'services') {
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'portfolios') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'po1',
                title: 'Portfólio 1',
                image_url: null,
                gallery_images: [
                  'https://host/storage/v1/object/public/media/portfolio/legado.webp',
                  { url: 'https://host/storage/v1/object/public/media/portfolio/novo.webp' },
                ],
                description: null,
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'pages') {
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'site_settings') {
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 's1',
                logo_url: 'https://host/storage/v1/object/public/media/sistema/logo.webp',
                image_settings: {
                  banner_url: 'https://host/storage/v1/object/public/media/sistema/banner.webp',
                },
                privacy_policy: '<p><img src="https://host/storage/v1/object/public/media/posts/privacy.webp" /></p>',
                terms_of_use: '<p><img src="https://host/storage/v1/object/public/media/posts/terms.webp" /></p>',
              },
              error: null,
            }),
          }),
        };
      }
      if (table === 'partners') {
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'home_content') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'h1',
                section_key: 'hero',
                content: {
                  background_image: 'https://host/storage/v1/object/public/media/geral/hero.webp?version=1',
                },
              },
              {
                id: 'h2',
                section_key: 'about',
                content: {
                  image_url: 'https://host/storage/v1/object/public/media/geral/about.webp',
                },
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'practice_areas') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'p1',
                title: 'Área 1',
                image_url: 'https://host/storage/v1/object/public/media/servicos/area.webp',
                description: null,
                methodology: null,
                what_we_offer: null,
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'areas') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'a1',
                title: 'Área Legada',
                image_url: 'https://host/storage/v1/object/public/media/geral/area-legado.webp',
                description: '<p><img src="https://host/storage/v1/object/public/media/geral/area-legado-rich.webp" /></p>',
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'u1',
                full_name: 'Admin',
                email: 'admin@example.com',
                avatar_url: 'https://host/storage/v1/object/public/media/geral/avatar.webp',
              },
            ],
            error: null,
          }),
        };
      }

      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });
  });

  it('deve normalizar URL para o path no bucket', () => {
    expect(
      normalizeUrl('https://host/storage/v1/object/public/media/geral/teste.webp?x=1')
    ).toBe('geral/teste.webp');
  });

  it('deve marcar imagens da home_content como usadas', async () => {
    const usageMap = await checkMediaUsage();

    expect(usageMap['geral/hero.webp']).toBeDefined();
    expect(usageMap['geral/about.webp']).toBeDefined();
    expect(usageMap['geral/hero.webp'][0].type).toBe('home');
    expect(usageMap['geral/about.webp'][0].type).toBe('home');
  });

  it('deve marcar imagem de practice_areas como usada', async () => {
    const usageMap = await checkMediaUsage();
    expect(usageMap['servicos/area.webp']).toBeDefined();
    expect(usageMap['servicos/area.webp'][0].type).toBe('practice_area');
  });

  it('deve rastrear imagens de configurações, perfis e áreas legadas', async () => {
    const usageMap = await checkMediaUsage();

    expect(usageMap['sistema/logo.webp']?.some((u) => u.type === 'setting')).toBe(true);
    expect(usageMap['sistema/banner.webp']?.some((u) => u.type === 'setting')).toBe(true);
    expect(usageMap['posts/privacy.webp']?.some((u) => u.field === 'privacy_policy')).toBe(true);
    expect(usageMap['posts/terms.webp']?.some((u) => u.field === 'terms_of_use')).toBe(true);
    expect(usageMap['geral/avatar.webp']?.some((u) => u.type === 'profile')).toBe(true);
    expect(usageMap['geral/area-legado.webp']?.some((u) => u.type === 'area')).toBe(true);
    expect(usageMap['geral/area-legado-rich.webp']?.some((u) => u.type === 'area')).toBe(true);
  });

  it('deve aceitar galeria legada com URL string em portfolio', async () => {
    const usageMap = await checkMediaUsage();
    expect(usageMap['portfolio/legado.webp']?.some((u) => u.field === 'gallery')).toBe(true);
    expect(usageMap['portfolio/novo.webp']?.some((u) => u.field === 'gallery')).toBe(true);
  });
});
