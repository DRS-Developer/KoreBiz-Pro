// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSystemModules } from '../../hooks/useSystemModules';

expect.extend(matchers);

vi.mock('../../hooks/useSiteSettings');
vi.mock('../../hooks/useSystemModules');
vi.mock('../OptimizedImage', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('Header visibility rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSiteSettings as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      settings: {
        site_name: 'KoreBiz-Pro',
        logo_url: null,
        layout_settings: {
          topbar_enabled: false,
        },
      },
      loading: false,
      displayPhone: '',
      displayEmail: '',
    });
  });

  it('mostra item quando Site está ativo e Sidebar está visível', () => {
    (useSystemModules as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      modules: [
        {
          id: '1',
          key: 'servicos',
          name: 'Serviços',
          is_active: true,
          is_sort_enabled: true,
          order_position: 1,
          updated_at: '',
          updated_by: null,
          visibilidade_personalizada: true,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Serviços' })).toBeInTheDocument();
  });

  it('oculta item quando Sidebar está oculta mesmo com Site ativo', () => {
    (useSystemModules as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      modules: [
        {
          id: '1',
          key: 'servicos',
          name: 'Serviços',
          is_active: true,
          is_sort_enabled: true,
          order_position: 1,
          updated_at: '',
          updated_by: null,
          visibilidade_personalizada: false,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: 'Serviços' })).not.toBeInTheDocument();
  });
});
