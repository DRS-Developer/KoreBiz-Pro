import { describe, it, expect } from 'vitest';
import {
  mapMediaFolderToStorageFolder,
  mapStorageFolderToMediaFolder,
  resolveMediaFolderFromOrigin,
} from './mediaFolderMapping';
import { StorageFolder } from './folderStructure';

describe('mediaFolderMapping', () => {
  it('deve resolver origem de formulário de serviços para categoria services', () => {
    expect(resolveMediaFolderFromOrigin('services')).toBe('services');
    expect(resolveMediaFolderFromOrigin('servicos')).toBe('services');
    expect(resolveMediaFolderFromOrigin('admin/services/form')).toBe('services');
  });

  it('deve resolver origens para categorias corretas', () => {
    expect(resolveMediaFolderFromOrigin('settings')).toBe('settings');
    expect(resolveMediaFolderFromOrigin('pages')).toBe('pages');
    expect(resolveMediaFolderFromOrigin('partners')).toBe('partners');
    expect(resolveMediaFolderFromOrigin('portfolio')).toBe('portfolio');
    expect(resolveMediaFolderFromOrigin('desconhecido')).toBe('general');
  });

  it('deve mapear media folder para storage folder corretamente', () => {
    expect(mapMediaFolderToStorageFolder('services')).toBe(StorageFolder.SERVICOS);
    expect(mapMediaFolderToStorageFolder('settings')).toBe(StorageFolder.SISTEMA);
    expect(mapMediaFolderToStorageFolder('portfolio')).toBe(StorageFolder.PORTFOLIO);
    expect(mapMediaFolderToStorageFolder('pages')).toBe(StorageFolder.POSTS);
    expect(mapMediaFolderToStorageFolder('partners')).toBe(StorageFolder.PARCEIROS);
    expect(mapMediaFolderToStorageFolder('general')).toBe(StorageFolder.GERAL);
  });

  it('deve mapear storage folder para media folder corretamente', () => {
    expect(mapStorageFolderToMediaFolder(StorageFolder.SERVICOS)).toBe('services');
    expect(mapStorageFolderToMediaFolder(StorageFolder.SISTEMA)).toBe('settings');
    expect(mapStorageFolderToMediaFolder(StorageFolder.PORTFOLIO)).toBe('portfolio');
    expect(mapStorageFolderToMediaFolder(StorageFolder.POSTS)).toBe('pages');
    expect(mapStorageFolderToMediaFolder(StorageFolder.PARCEIROS)).toBe('partners');
    expect(mapStorageFolderToMediaFolder(StorageFolder.GERAL)).toBe('general');
  });
});
