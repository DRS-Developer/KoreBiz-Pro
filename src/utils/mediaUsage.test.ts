import { describe, it, expect } from 'vitest';
import { normalizeUrl } from './mediaUsage';

describe('normalizeUrl', () => {
  it('should remove query parameters', () => {
    const input = 'https://example.com/image.webp?t=12345';
    const expected = 'https://example.com/image.webp';
    expect(normalizeUrl(input)).toBe(expected);
  });

  it('should decode URI components', () => {
    const input = 'https://example.com/folder/My%20Image.jpg';
    const expected = 'https://example.com/folder/My Image.jpg';
    expect(normalizeUrl(input)).toBe(expected);
  });

  it('should handle both query params and encoding', () => {
    const input = 'https://example.com/folder/My%20Image.jpg?version=1';
    const expected = 'https://example.com/folder/My Image.jpg';
    expect(normalizeUrl(input)).toBe(expected);
  });

  it('should handle empty input', () => {
    expect(normalizeUrl('')).toBe('');
  });

  it('should handle invalid URLs gracefully', () => {
    const input = 'not a valid url';
    expect(normalizeUrl(input)).toBe('not a valid url');
  });
});
