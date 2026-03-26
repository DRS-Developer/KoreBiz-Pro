// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import HomeSettings from './index';

expect.extend(matchers);

vi.mock('./tabs/SectionsTab', () => ({
  default: () => <div data-testid="sections-tab-content">Sections Tab</div>,
}));
vi.mock('./tabs/VisualsTab', () => ({
  default: () => <div data-testid="visuals-tab-content">Visuals Tab</div>,
}));

describe('Admin Home tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only sections and visuals tabs', () => {
    render(<HomeSettings />);

    expect(screen.queryByRole('button', { name: /Banner Principal/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seções da Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Elementos Visuais/i })).toBeInTheDocument();
    expect(screen.getByTestId('sections-tab-content')).toBeInTheDocument();
  });
});
