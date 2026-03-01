import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveManagedImage, isAllowedImageSource } from './imageManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('imageManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return default SVG when src is missing', () => {
    const result = resolveManagedImage('home', 'hero', null);
    expect(result.original).toBe('/defaults/hero.svg');
    expect(result.webp).toBe('/defaults/hero.svg');
  });

  it('should return default SVG when src is external (e.g. Google)', () => {
    const externalUrl = 'https://google.com/image.png';
    const result = resolveManagedImage('servicos:list', 'card', externalUrl);
    expect(result.original).toBe('/defaults/service.svg');
  });

  it('should return Supabase URL when src is valid Supabase URL', () => {
    const supabaseUrl = 'https://xyz.supabase.co/storage/v1/object/public/media/test.jpg';
    const result = resolveManagedImage('home', 'card', supabaseUrl);
    // Should include transform params
    expect(result.original).toContain('https://xyz.supabase.co/storage/v1/render/image/public/media/test.jpg');
    expect(result.original).toContain('width=800');
  });

  it('should return local path when src is local', () => {
    const localUrl = '/images/test.jpg';
    const result = resolveManagedImage('home', 'card', localUrl);
    expect(result.original).toBe(localUrl);
  });

  it('should log replacement when src is missing', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    resolveManagedImage('portfolio:list', 'card', null);
    
    expect(consoleSpy).toHaveBeenCalled();
    const logs = JSON.parse(window.localStorage.getItem('image_security_audit') || '[]');
    expect(logs).toHaveLength(1);
    expect(logs[0].reason).toBe('Missing source');
  });

  it('should log security violation when src is external', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    resolveManagedImage('portfolio:list', 'card', 'https://google.com/image.png');
    
    expect(consoleSpy).toHaveBeenCalled();
    const logs = JSON.parse(window.localStorage.getItem('image_security_audit') || '[]');
    expect(logs).toHaveLength(1);
    expect(logs[0].violation).toBe('EXTERNAL_DOMAIN');
  });
  
  it('should correctly validate allowed sources', () => {
      // Valid
      expect(isAllowedImageSource('https://vymiwxuizkcvtgrobgro.supabase.co/storage/v1/object/public/media/test.jpg')).toBe(true);
      expect(isAllowedImageSource('/defaults/hero.svg')).toBe(true);
      
      // Invalid
      expect(isAllowedImageSource('https://google.com/image.jpg')).toBe(false);
      expect(isAllowedImageSource('http://supabase.co/storage/v1/object/public/media/test.jpg')).toBe(false); // HTTP not allowed
      expect(isAllowedImageSource('https://fake-supabase.co/storage/v1/object/public/media/test.jpg')).toBe(false); // Invalid domain
  });
});
