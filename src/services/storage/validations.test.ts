import { describe, expect, it } from 'vitest';
import { validateFile } from './validations';

const createFile = (sizeBytes: number, type = 'image/png') => {
  const content = new Uint8Array(sizeBytes);
  return new File([content], `arquivo.${type.split('/')[1] || 'png'}`, { type });
};

describe('validateFile', () => {
  it('valida arquivo válido com regras completas', async () => {
    const file = createFile(1024 * 1024, 'image/webp');

    const result = await validateFile(
      file,
      {
        minWidth: 800,
        minHeight: 600,
        maxWidth: 1920,
        maxHeight: 1080,
        aspectRatio: 4 / 3,
        minSizeMB: 0.1,
        maxSizeMB: 5,
        allowedTypes: ['image/webp', 'image/jpeg'],
      },
      { width: 1200, height: 900 }
    );

    expect(result.isValid).toBe(true);
  });

  it('rejeita tipo não permitido', async () => {
    const file = createFile(1000, 'image/gif');

    const result = await validateFile(file, {
      allowedTypes: ['image/png', 'image/jpeg'],
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Formato inválido');
  });

  it('rejeita arquivo acima do tamanho máximo', async () => {
    const file = createFile(6 * 1024 * 1024, 'image/png');

    const result = await validateFile(file, { maxSizeMB: 5 });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('tamanho máximo');
  });

  it('rejeita dimensão mínima não atendida', async () => {
    const file = createFile(500 * 1024, 'image/png');

    const result = await validateFile(file, { minWidth: 800, minHeight: 600 }, { width: 700, height: 600 });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Largura mínima');
  });

  it('rejeita proporção fora da tolerância', async () => {
    const file = createFile(500 * 1024, 'image/png');

    const result = await validateFile(file, { aspectRatio: 16 / 9 }, { width: 1000, height: 1000 });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Proporção inválida');
  });
});
