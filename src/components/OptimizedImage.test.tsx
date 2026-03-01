import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OptimizedImage from './OptimizedImage';

describe('OptimizedImage', () => {
  it('renders with loading="eager" when priority is true', () => {
    render(
      <OptimizedImage 
        src="test.jpg" 
        alt="Test Image" 
        priority={true} 
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('renders with opacity-100 immediately when priority is true', () => {
    render(
      <OptimizedImage 
        src="test.jpg" 
        alt="Test Image" 
        priority={true} 
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveClass('opacity-100');
    expect(img).not.toHaveClass('opacity-0');
  });

  it('renders with loading="lazy" when priority is false (default)', () => {
    render(
      <OptimizedImage 
        src="test.jpg" 
        alt="Test Image" 
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
