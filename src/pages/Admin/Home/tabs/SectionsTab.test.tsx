// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import SectionsTab from './SectionsTab';
import { useHomeWidgets } from '../../../../hooks/useHomeWidgets';

expect.extend(matchers);

vi.mock('../../../../hooks/useHomeWidgets');
vi.mock('../../../../components/Admin/Home/HomeWidgetManager', () => ({
  default: ({ onConfigureHero, onConfigureAbout, onConfigureCta }: any) => (
    <div data-testid="home-widget-manager">
      Home Widget Manager
      {onConfigureHero && (
        <button data-testid="mock-hero-config-button" onClick={onConfigureHero}>
          Configurar Hero
        </button>
      )}
      {onConfigureAbout && (
        <button data-testid="mock-about-config-button" onClick={onConfigureAbout}>
          Configurar About
        </button>
      )}
      {onConfigureCta && (
        <button data-testid="mock-cta-config-button" onClick={onConfigureCta}>
          Configurar CTA
        </button>
      )}
    </div>
  ),
}));
vi.mock('./HeroTab', () => ({
  default: () => <div data-testid="hero-tab-shared-editor">Hero Shared Editor</div>,
}));
vi.mock('./AboutTab', () => ({
  default: () => <div data-testid="about-tab-shared-editor">About Shared Editor</div>,
}));
vi.mock('./CtaTab', () => ({
  default: () => <div data-testid="cta-tab-shared-editor">CTA Shared Editor</div>,
}));

describe('SectionsTab v2', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useHomeWidgets).mockReturnValue({
      widgets: [],
      loading: false,
      error: null,
      fetchWidgets: vi.fn(),
    } as any);
  });

  it('opens all configuration modals from widget manager', async () => {
    render(<SectionsTab />);
    
    expect(screen.getByTestId('home-widget-manager')).toBeInTheDocument();
    expect(screen.getByTestId('home-builder-mode-badge')).toHaveTextContent('Builder v2');

    await userEvent.click(screen.getByTestId('mock-hero-config-button'));
    expect(screen.getByTestId('v2-hero-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('hero-tab-shared-editor')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('close-v2-hero-modal-button'));
    expect(screen.queryByTestId('v2-hero-modal-overlay')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('mock-about-config-button'));
    expect(screen.getByTestId('v2-about-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('about-tab-shared-editor')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('close-v2-about-modal-button'));
    expect(screen.queryByTestId('v2-about-modal-overlay')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('mock-cta-config-button'));
    expect(screen.getByTestId('v2-cta-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('cta-tab-shared-editor')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('close-v2-cta-modal-button'));
    expect(screen.queryByTestId('v2-cta-modal-overlay')).not.toBeInTheDocument();
  });
});
