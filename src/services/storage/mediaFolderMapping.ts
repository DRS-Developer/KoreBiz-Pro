import { MediaFolder } from '../../types/media';
import { StorageFolder } from './folderStructure';

const normalize = (value: string) => value.trim().toLowerCase();

const tokenIncludes = (value: string, tokens: string[]) => {
  const normalized = normalize(value);
  return tokens.some((token) => normalized.includes(token));
};

export const resolveMediaFolderFromOrigin = (origin?: string): MediaFolder => {
  const value = normalize(origin || '');

  if (tokenIncludes(value, ['servicos', 'services', 'service'])) return 'services';
  if (tokenIncludes(value, ['portfolio', 'portfólio'])) return 'portfolio';
  if (tokenIncludes(value, ['pages', 'paginas', 'páginas', 'page'])) return 'pages';
  if (tokenIncludes(value, ['partners', 'parceiros', 'partner'])) return 'partners';
  if (tokenIncludes(value, ['settings', 'config', 'sistema', 'system'])) return 'settings';

  return 'general';
};

export const mapMediaFolderToStorageFolder = (folder: MediaFolder): StorageFolder => {
  if (folder === 'services') return StorageFolder.SERVICOS;
  if (folder === 'portfolio') return StorageFolder.PORTFOLIO;
  if (folder === 'pages') return StorageFolder.POSTS;
  if (folder === 'partners') return StorageFolder.PARCEIROS;
  if (folder === 'settings') return StorageFolder.SISTEMA;
  return StorageFolder.GERAL;
};

export const mapStorageFolderToMediaFolder = (folder: StorageFolder): MediaFolder => {
  if (folder === StorageFolder.SERVICOS) return 'services';
  if (folder === StorageFolder.PORTFOLIO) return 'portfolio';
  if (folder === StorageFolder.POSTS) return 'pages';
  if (folder === StorageFolder.PARCEIROS) return 'partners';
  if (folder === StorageFolder.SISTEMA) return 'settings';
  return 'general';
};
