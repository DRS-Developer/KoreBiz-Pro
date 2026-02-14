
// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import Empresa from './Empresa';

expect.extend(matchers);

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mocks
vi.mock('../stores/useGlobalStore', () => ({
  useGlobalStore: () => ({
    pages: [
        {
            slug: 'empresa',
            title: 'Sobre a Empresa',
            content: { type: 'doc', content: [] },
            featured_image: 'https://example.com/image.jpg',
            meta_description: 'Descrição de teste'
        }
    ]
  })
}));

vi.mock('../components/OptimizedImage', () => ({
  default: (props: any) => <img data-testid="optimized-image" src={props.src} alt={props.alt} />
}));

vi.mock('../components/RichTextRenderer', () => ({
  default: () => <div data-testid="rich-text">Content</div>
}));

vi.mock('../components/SEO', () => ({
  default: () => null
}));

vi.mock('../components/PageHeader', () => ({
  default: () => <div data-testid="page-header">Header</div>
}));

describe('Empresa Page', () => {
  it('renders the featured image when available', () => {
    render(<Empresa />);
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Sobre a Empresa');
  });
});
