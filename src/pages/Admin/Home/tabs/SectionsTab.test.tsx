// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import SectionsTab from './SectionsTab';
import { useSiteSettings } from '../../../../hooks/useSiteSettings';
import { useHomeConfig } from '../../../../hooks/useHomeConfig';
import { useHomeWidgets } from '../../../../hooks/useHomeWidgets';

expect.extend(matchers);

vi.mock('../../../../hooks/useSiteSettings');
vi.mock('../../../../hooks/useHomeConfig');
vi.mock('../../../../hooks/useHomeWidgets');
vi.mock('../../../../components/Admin/Home/HomeWidgetManager', () => ({
  default: ({ onConfigureHero }: any) => (
    <div data-testid="home-widget-manager">
      Home Widget Manager
      {onConfigureHero && (
        <button data-testid="mock-hero-config-button" onClick={onConfigureHero}>
          Configurar Hero
        </button>
      )}
    </div>
  ),
}));
vi.mock('../../../../components/Admin/Home/SectionManager', () => ({
  SectionManager: () => <div data-testid="legacy-section-manager">Legacy Section Manager</div>,
}));
vi.mock('./ContentEditorTab', () => ({
  default: () => <div data-testid="content-editor-tab">Content Editor Tab</div>,
}));
vi.mock('./HeroTab', () => ({
  default: () => <div data-testid="hero-tab-shared-editor">Hero Shared Editor</div>,
}));

describe('SectionsTab version modes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useHomeConfig).mockReturnValue({
      config: { sections: [] },
      loading: false,
      updateSection: vi.fn(),
      reorderSections: vi.fn(),
    } as any);

    vi.mocked(useHomeWidgets).mockReturnValue({
      widgets: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createWidget: vi.fn(),
      updateWidget: vi.fn(),
      deleteWidget: vi.fn(),
      duplicateWidget: vi.fn(),
      reorderWidgets: vi.fn(),
      publishWidgets: vi.fn(),
    } as any);
  });

  it('no Builder v2 ON exibe card Banner Principal e modal com editor compartilhado', async () => {
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

    render(<SectionsTab />);
    
    expect(screen.getByTestId('home-widget-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('v2-hero-settings-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacy-section-manager')).not.toBeInTheDocument();

    const configButton = screen.getByTestId('mock-hero-config-button');
    await userEvent.click(configButton);
    expect(screen.getByTestId('v2-hero-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('hero-tab-shared-editor')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('close-v2-hero-modal-button'));
    expect(screen.queryByTestId('v2-hero-modal-overlay')).not.toBeInTheDocument();
  });

  it('no modo legado mantém estrutura tradicional sem card/modal do banner v2', () => {
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

    render(<SectionsTab />);

    expect(screen.getByTestId('legacy-section-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('v2-hero-settings-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('v2-hero-config-element')).not.toBeInTheDocument();
    expect(screen.queryByTestId('open-v2-hero-modal-button')).not.toBeInTheDocument();
  });
});
