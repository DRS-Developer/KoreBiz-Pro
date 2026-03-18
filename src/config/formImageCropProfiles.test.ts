import { describe, expect, it } from 'vitest';
import { DEFAULT_FORM_IMAGE_CROP_PROFILES, FORM_IMAGE_CROP_KEYS, getAspectRatio, resolveFormImageCropProfile } from './formImageCropProfiles';

describe('formImageCropProfiles', () => {
  it('mantém perfis padrão para todos os formulários', () => {
    for (const key of FORM_IMAGE_CROP_KEYS) {
      const profile = DEFAULT_FORM_IMAGE_CROP_PROFILES[key];
      expect(profile.formKey).toBe(key);
      expect(profile.minWidth).toBeGreaterThan(0);
      expect(profile.minHeight).toBeGreaterThan(0);
      expect(profile.maxWidth).toBeGreaterThanOrEqual(profile.minWidth);
      expect(profile.maxHeight).toBeGreaterThanOrEqual(profile.minHeight);
    }
  });

  it('resolve perfil com override respeitando proporção', () => {
    const resolved = resolveFormImageCropProfile('services.featured', {
      aspectWidth: 1,
      aspectHeight: 1,
      minWidth: 600,
      minHeight: 600,
      maxWidth: 1200,
      maxHeight: 1200,
    });

    expect(resolved.aspectRatio).toBe(1);
    expect(resolved.minWidth).toBe(600);
    expect(resolved.maxWidth).toBe(1200);
  });

  it('retorna fallback de proporção quando valores inválidos', () => {
    expect(getAspectRatio(0, 0)).toBe(16 / 9);
  });
});
