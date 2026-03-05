export enum StorageFolder {
  SISTEMA = 'sistema',
  SERVICOS = 'servicos',
  PORTFOLIO = 'portfolio',
  PARCEIROS = 'parceiros',
  POSTS = 'posts',
  EQUIPE = 'equipe',
  GERAL = 'geral',
}

export interface StorageConfig {
  bucket: string;
  maxSizeMB: number;
  allowedTypes: string[];
}

export const STORAGE_CONFIG: StorageConfig = {
  bucket: 'media',
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
};

/**
 * Valida se a pasta fornecida é uma pasta válida do sistema.
 */
export const isValidFolder = (folder: string): boolean => {
  return Object.values(StorageFolder).includes(folder as StorageFolder);
};

/**
 * Gera o caminho completo do arquivo no storage.
 * @param folder A pasta de destino (deve ser uma das pastas válidas).
 * @param fileName O nome do arquivo.
 * @returns O caminho completo (ex: 'sistema/logo.png').
 */
export const getStoragePath = (folder: StorageFolder, fileName: string): string => {
  // Remove caracteres especiais e espaços do nome do arquivo
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${folder}/${Date.now()}_${cleanName}`;
};

/**
 * Extrai o caminho do arquivo a partir da URL pública.
 * @param url A URL pública da imagem.
 * @returns O caminho relativo no bucket (ex: 'sistema/logo.png') ou null se inválido.
 */
export const getPathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${STORAGE_CONFIG.bucket}/`);
    if (pathParts.length === 2) {
      return decodeURIComponent(pathParts[1]);
    }
    return null;
  } catch (error) {
    console.error('Erro ao extrair caminho da URL:', error);
    return null;
  }
};
