import { STORAGE_CONFIG } from './folderStructure';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado.' };
  }

  if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Tipo de arquivo inválido: ${file.type}. Permitidos: ${STORAGE_CONFIG.allowedTypes.join(', ')}` 
    };
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > STORAGE_CONFIG.maxSizeMB) {
    return { 
      isValid: false, 
      error: `O arquivo excede o tamanho máximo de ${STORAGE_CONFIG.maxSizeMB}MB.` 
    };
  }

  return { isValid: true };
};
