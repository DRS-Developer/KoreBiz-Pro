// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import HomeSettings from './index';
import { useSiteSettings } from '../../../hooks/useSiteSettings';

expect.extend(matchers);

vi.mock('../../../hooks/useSiteSettings');
vi.mock('./tabs/HeroTab', () => ({
  default: () => <div data-testid="hero-tab-content">Hero Tab</div>,
}));
vi.mock('./tabs/SectionsTab', () => ({
  default: () => <div data-testid="sections-tab-content">Sections Tab</div>,
}));
vi.mock('./tabs/VisualsTab', () => ({
  default: () => <div data-testid="visuals-tab-content">Visuals Tab</div>,
}));

describe('Admin Home tabs by builder version', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantém aba Banner Principal no modo legado', () => {
    vi.mocked(useSiteSettings).mockReturnValue({
      settings: { layout_settings: { home_builder_v2_enabled: false } } as any,
      loading: false,
      error: null,
      refetch: vi.fn(),
      displayAddress: '',
      displayPhone: '',
      displayEmail: '',
      whatsappLink: '',
    });

    render(<HomeSettings />);

    expect(screen.getByRole('button', { name: /Banner Principal/i })).toBeInTheDocument();
    expect(screen.getByTestId('hero-tab-content')).toBeInTheDocument();
  });

  it('remove aba Banner Principal quando Builder v2 está ON', async () => {
    vi.mocked(useSiteSettings).mockReturnValue({
      settings: { layout_settings: { home_builder_v2_enabled: true } } as any,
      loading: false,
      error: null,
      refetch: vi.fn(),
      displayAddress: '',
      displayPhone: '',
      displayEmail: '',
      whatsappLink: '',
    });

    render(<HomeSettings />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Banner Principal/i })).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('sections-tab-content')).toBeInTheDocument();
  });
});
