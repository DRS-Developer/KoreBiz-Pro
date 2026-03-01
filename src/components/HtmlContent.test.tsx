import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HtmlContent from './HtmlContent';

describe('HtmlContent', () => {
  it('renders HTML content correctly', () => {
    const html = '<p data-testid="test-p">Hello World</p>';
    render(<HtmlContent content={html} />);
    
    // Verifica se o elemento p foi renderizado no DOM
    const pElement = screen.getByTestId('test-p');
    expect(pElement).toBeInTheDocument();
    expect(pElement).toHaveTextContent('Hello World');
    
    // Verifica se as tags não estão visíveis como texto
    const container = screen.getByText('Hello World').parentElement;
    expect(container?.innerHTML).toContain(html);
  });

  it('renders nothing when content is null or undefined', () => {
    const { container } = render(<HtmlContent content={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applies custom className', () => {
    const html = '<span>Test</span>';
    const className = 'custom-class';
    const { container } = render(<HtmlContent content={html} className={className} />);
    
    expect(container.firstChild).toHaveClass(className);
  });

  it('uses custom tag', () => {
    const html = '<span>Test</span>';
    const { container } = render(<HtmlContent content={html} tag="span" />);
    
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });
});
