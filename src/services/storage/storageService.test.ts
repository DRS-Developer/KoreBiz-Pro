import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage, deleteImage, updateImage } from './storageService';
import { StorageFolder } from './folderStructure';

// Mock do Supabase
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockMove = vi.fn();
const mockList = vi.fn();

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
  },
}));

// Mock do validations para ignorar checagem de File real (que é difícil de criar em Node puro sem polyfills complexos)
vi.mock('./validations', () => ({
  validateFile: () => ({ isValid: true }),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(mockUpload.mock.calls[0][0]).toContain('geral/'); // Verifica se a pasta está correta
  });

  it('deve retornar erro se o upload falhar', async () => {
    mockUpload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } });

    const result = await uploadImage(mockFile, StorageFolder.GERAL);

    expect(result.url).toBe('');
    expect(result.error).toContain('Upload failed');
  });

  it('deve mover a imagem antiga para trash ao fazer update (ou upload com oldUrl)', async () => {
    mockUpload.mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'new-url' } });
    mockMove.mockResolvedValue({ data: {}, error: null });

    const oldUrl = 'https://example.com/storage/v1/object/public/media/geral/old-image.png';
    
    await uploadImage(mockFile, StorageFolder.GERAL, oldUrl);

    expect(mockMove).toHaveBeenCalled();
    // Verifica se o path de origem está correto (extraído da URL)
    expect(mockMove.mock.calls[0][0]).toBe('geral/old-image.png');
    // Verifica se o path de destino contém 'trash'
    expect(mockMove.mock.calls[0][1]).toContain('trash/');
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
  });

  it('deve lidar com falha ao deletar', async () => {
    mockMove.mockResolvedValue({ data: null, error: { message: 'File not found' } });
    const urlToDelete = 'https://example.com/storage/v1/object/public/media/sistema/missing.png';

    const success = await deleteImage(urlToDelete);

    expect(success).toBe(false);
  });
});
