import { STORAGE_CONFIG } from './folderStructure';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageValidationRules {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  aspectTolerance?: number;
  minSizeMB?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
}

const getImageDimensions = async (file: File): Promise<ImageDimensions | null> => {
  if (typeof window === 'undefined' || typeof URL === 'undefined' || typeof Image === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
};

const formatRatio = (ratio: number) => {
  if (!Number.isFinite(ratio) || ratio <= 0) return `${ratio}`;
  return `${ratio.toFixed(2)}:1`;
};

export const validateFile = async (
  file: File,
  rules?: ImageValidationRules,
  inputDimensions?: ImageDimensions | null
): Promise<ValidationResult> => {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado.' };
  }

  const allowedTypes = rules?.allowedTypes?.length ? rules.allowedTypes : STORAGE_CONFIG.allowedTypes;
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Formato inválido: ${file.type}. Permitidos: ${allowedTypes.join(', ')}.` 
    };
  }

  const minSizeMB = rules?.minSizeMB ?? 0;
  const maxSizeMB = rules?.maxSizeMB ?? STORAGE_CONFIG.maxSizeMB;
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB < minSizeMB) {
    return {
      isValid: false,
      error: `O arquivo está abaixo do tamanho mínimo de ${minSizeMB}MB.`,
    };
  }

  if (fileSizeMB > maxSizeMB) {
    return { 
      isValid: false, 
      error: `O arquivo excede o tamanho máximo de ${maxSizeMB}MB.` 
    };
  }

  const hasDimensionRule = !!(
    rules?.minWidth ||
    rules?.minHeight ||
    rules?.maxWidth ||
    rules?.maxHeight ||
    rules?.aspectRatio
  );

  if (hasDimensionRule) {
    const dimensions = inputDimensions ?? await getImageDimensions(file);
    if (!dimensions) {
      return {
        isValid: false,
        error: 'Não foi possível validar as dimensões da imagem.',
      };
    }

    if (rules?.minWidth && dimensions.width < rules.minWidth) {
      return {
        isValid: false,
        error: `Largura mínima não atendida. Esperado: ${rules.minWidth}px.`,
      };
    }

    if (rules?.minHeight && dimensions.height < rules.minHeight) {
      return {
        isValid: false,
        error: `Altura mínima não atendida. Esperado: ${rules.minHeight}px.`,
      };
    }

    if (rules?.maxWidth && dimensions.width > rules.maxWidth) {
      return {
        isValid: false,
        error: `Largura máxima excedida. Permitido: ${rules.maxWidth}px.`,
      };
    }

    if (rules?.maxHeight && dimensions.height > rules.maxHeight) {
      return {
        isValid: false,
        error: `Altura máxima excedida. Permitido: ${rules.maxHeight}px.`,
      };
    }

    if (rules?.aspectRatio) {
      const currentRatio = dimensions.width / dimensions.height;
      const tolerance = rules.aspectTolerance ?? 0.05;
      const diff = Math.abs(currentRatio - rules.aspectRatio);
      if (diff > tolerance) {
        return {
          isValid: false,
          error: `Proporção inválida. Esperado: ${formatRatio(rules.aspectRatio)}.`,
        };
      }
    }
  }

  return { isValid: true };
};
