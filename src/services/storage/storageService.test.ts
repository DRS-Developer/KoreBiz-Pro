import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage, deleteImage } from './storageService';
import { StorageFolder } from './folderStructure';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockMove = vi.fn();
const mockList = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockValidateFile = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        move: mockMove,
        list: mockList,
      }),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock('./validations', () => ({
  validateFile: (...args: unknown[]) => mockValidateFile(...args),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateFile.mockResolvedValue({ isValid: true });
    mockEq.mockResolvedValue({ data: null, error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockUpsert.mockResolvedValue({ data: null, error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'media_files') {
        return {
          upsert: mockUpsert,
          delete: mockDelete,
        };
      }
      return {
        upsert: mockUpsert,
        delete: mockDelete,
      };
    });
  });

  const mockFile = {
    name: 'test-image.png',
    type: 'image/png',
    size: 1024,
  } as unknown as File;

  it('deve fazer upload de uma imagem com sucesso', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } });

    const result = await uploadImage(mockFile, StorageFolder.GERAL);

    expect(result.url).toBe('https://example.com/image.png');
    expect(result.error).toBeUndefined();
    expect(mockUpload).toHaveBeenCalled();
    expect(mockUpload.mock.calls[0][0]).toContain('geral/');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'general',
        url: 'https://example.com/image.png',
      }),
      { onConflict: 'url' }
    );
  });

  it('deve retornar erro se o upload falhar', async () => {
    mockUpload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } });

    const result = await uploadImage(mockFile, StorageFolder.GERAL);

    expect(result.url).toBe('');
    expect(result.error).toContain('Upload failed');
  });

  it('deve retornar erro de validação quando regras falharem', async () => {
    mockValidateFile.mockResolvedValue({ isValid: false, error: 'Proporção inválida.' });

    const result = await uploadImage(mockFile, StorageFolder.SERVICOS);

    expect(result.url).toBe('');
    expect(result.error).toBe('Proporção inválida.');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('deve mover a imagem antiga para trash ao fazer update (ou upload com oldUrl)', async () => {
    mockUpload.mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'new-url' } });
    mockMove.mockResolvedValue({ data: {}, error: null });

    const oldUrl = 'https://example.com/storage/v1/object/public/media/geral/old-image.png';
    
    await uploadImage(mockFile, StorageFolder.GERAL, oldUrl);

    expect(mockMove).toHaveBeenCalled();
    expect(mockMove.mock.calls[0][0]).toBe('geral/old-image.png');
    expect(mockMove.mock.calls[0][1]).toContain('trash/');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('url', oldUrl);
  });

  it('deve deletar uma imagem movendo-a para trash', async () => {
    mockMove.mockResolvedValue({ data: {}, error: null });
    const urlToDelete = 'https://example.com/storage/v1/object/public/media/sistema/logo.png';

    const success = await deleteImage(urlToDelete);

    expect(success).toBe(true);
    expect(mockMove).toHaveBeenCalledWith(
      'sistema/logo.png',
      expect.stringContaining('trash/')
    );
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('url', urlToDelete);
  });

  it('deve lidar com falha ao deletar', async () => {
    mockMove.mockResolvedValue({ data: null, error: { message: 'File not found' } });
    const urlToDelete = 'https://example.com/storage/v1/object/public/media/sistema/missing.png';

    const success = await deleteImage(urlToDelete);

    expect(success).toBe(false);
  });

  it('deve categorizar upload de serviços como folder services', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/service-image.webp' } });

    await uploadImage(mockFile, StorageFolder.SERVICOS);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'services',
        url: 'https://example.com/service-image.webp',
      }),
      { onConflict: 'url' }
    );
  });

  it('deve aplicar regras de validação no upload de serviço', async () => {
    mockUpload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/service-image.webp' } });

    const validationRules = {
      minWidth: 800,
      minHeight: 600,
      aspectRatio: 4 / 3,
      maxSizeMB: 5,
      allowedTypes: ['image/webp'],
    };
    const inputDimensions = { width: 800, height: 600 };

    await uploadImage(mockFile, StorageFolder.SERVICOS, undefined, { validationRules, inputDimensions });

    expect(mockValidateFile).toHaveBeenCalledWith(mockFile, validationRules, inputDimensions);
  });
});
