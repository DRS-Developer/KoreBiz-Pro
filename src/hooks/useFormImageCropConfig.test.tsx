import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useFormImageCropConfig } from './useFormImageCropConfig';
import { formImageCropConfigService } from '../services/formImageCropConfigService';

vi.mock('../services/formImageCropConfigService', () => ({
  formImageCropConfigService: {
    list: vi.fn(),
  },
}));

describe('useFormImageCropConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica configuração dinâmica ao formulário', async () => {
    vi.mocked(formImageCropConfigService.list).mockResolvedValue({
      'services.featured': {
        formKey: 'services.featured',
        label: 'Serviços',
        description: 'Teste',
        aspectWidth: 3,
        aspectHeight: 2,
        minWidth: 900,
        minHeight: 600,
        maxWidth: 1800,
        maxHeight: 1200,
        isActive: true,
      },
    } as any);

    const { result } = renderHook(() =>
      useFormImageCropConfig('services.featured', {
        aspectRatio: 4 / 3,
        minWidth: 800,
        minHeight: 600,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config?.aspectRatio).toBe(1.5);
    expect(result.current.config?.minWidth).toBe(900);
    expect(result.current.config?.maxHeight).toBe(1200);
  });

  it('usa fallback quando configuração dinâmica está desativada', async () => {
    vi.mocked(formImageCropConfigService.list).mockResolvedValue({
      'services.featured': {
        formKey: 'services.featured',
        label: 'Serviços',
        description: 'Teste',
        aspectWidth: 3,
        aspectHeight: 2,
        minWidth: 900,
        minHeight: 600,
        maxWidth: 1800,
        maxHeight: 1200,
        isActive: false,
      },
    } as any);

    const { result } = renderHook(() =>
      useFormImageCropConfig('services.featured', {
        aspectRatio: 4 / 3,
        minWidth: 800,
        minHeight: 600,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config?.aspectRatio).toBeCloseTo(4 / 3);
    expect(result.current.config?.minWidth).toBe(800);
    expect(result.current.config?.minHeight).toBe(600);
  });
});
