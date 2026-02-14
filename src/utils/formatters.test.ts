
import { describe, it, expect } from 'vitest';
import { formatPhoneDisplay, formatWhatsAppLink } from './formatters';

describe('formatPhoneDisplay', () => {
  it('should format 11-digit numbers correctly', () => {
    expect(formatPhoneDisplay('11999999999')).toBe('(11) 99999-9999');
  });

  it('should format 10-digit numbers correctly', () => {
    expect(formatPhoneDisplay('1199999999')).toBe('(11) 9999-9999');
  });

  it('should handle formatted inputs by cleaning them first', () => {
    expect(formatPhoneDisplay('(11) 99999-9999')).toBe('(11) 99999-9999');
    expect(formatPhoneDisplay('11 99999 9999')).toBe('(11) 99999-9999');
  });

  it('should return default message for null/undefined', () => {
    expect(formatPhoneDisplay(null)).toBe('Telefone não informado');
    expect(formatPhoneDisplay(undefined)).toBe('Telefone não informado');
  });

  it('should return original string for non-standard lengths', () => {
    expect(formatPhoneDisplay('0800 123')).toBe('0800 123');
  });
});

describe('formatWhatsAppLink', () => {
  it('should format raw numbers correctly', () => {
    expect(formatWhatsAppLink('5511999999999')).toBe('https://wa.me/5511999999999');
  });

  it('should add 55 country code if missing for mobile numbers', () => {
    expect(formatWhatsAppLink('11999999999')).toBe('https://wa.me/5511999999999');
  });

  it('should handle null/undefined', () => {
    expect(formatWhatsAppLink(null)).toBe('#');
    expect(formatWhatsAppLink(undefined)).toBe('#');
  });

  it('should strip non-digits', () => {
    expect(formatWhatsAppLink('+55 (11) 99999-9999')).toBe('https://wa.me/5511999999999');
  });
});
