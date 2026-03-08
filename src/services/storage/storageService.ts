import { supabase } from '../../lib/supabase';
import { StorageFolder, STORAGE_CONFIG, getStoragePath, getPathFromUrl } from './folderStructure';
import { ImageDimensions, ImageValidationRules, validateFile } from './validations';
import { mapStorageFolderToMediaFolder } from './mediaFolderMapping';

const BUCKET = STORAGE_CONFIG.bucket;

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface UploadImageOptions {
  validationRules?: ImageValidationRules;
  inputDimensions?: ImageDimensions | null;
}

const getImageDimensions = async (file: File): Promise<{ width?: number; height?: number }> => {
  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    return {};
  }
  if (typeof Blob !== 'undefined' && !(file instanceof Blob)) {
    return {};
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
      resolve({});
    };
    img.src = objectUrl;
  });
};

/**
 * Move um arquivo para a pasta 'trash' (Backup temporário).
 * @param url URL da imagem original.
 */
const moveImageToTrash = async (url: string): Promise<boolean> => {
  const path = getPathFromUrl(url);
  if (!path) {
    console.warn(`[Storage] Caminho inválido extraído da URL: ${url}`);
    return false;
  }

  const fileName = path.split('/').pop();
  // Cria uma estrutura de pasta trash/YYYY-MM-DD/timestamp_nome
  const dateFolder = new Date().toISOString().split('T')[0];
  const trashPath = `trash/${dateFolder}/${Date.now()}_${fileName}`;

  console.log(`[Storage] Movendo de '${path}' para '${trashPath}'`);

  const { error: moveError } = await supabase.storage
    .from(BUCKET)
    .move(path, trashPath);

  if (moveError) {
    console.error('[Storage] Erro ao mover para trash:', moveError);
    return false;
  }

  return true;
};

/**
 * Realiza o upload de uma imagem para o Supabase Storage.
 * @param file O arquivo a ser enviado.
 * @param folder A pasta de destino (enum StorageFolder).
 * @param oldUrl (Opcional) URL da imagem antiga para substituição (será movida para trash).
 */
export const uploadImage = async (
  file: File, 
  folder: StorageFolder, 
  oldUrl?: string,
  options?: UploadImageOptions
): Promise<UploadResult> => {
  console.group('Storage Service: Upload Image');
  console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
  console.log('Folder:', folder);

  try {
    // 1. Validação
    const validation = await validateFile(file, options?.validationRules, options?.inputDimensions);
    if (!validation.isValid) {
      console.error('Validação falhou:', validation.error);
      console.groupEnd();
      return { url: '', path: '', error: validation.error };
    }

    // 2. Se houver imagem antiga, mover para trash (backup temporário)
    if (oldUrl) {
      console.log('Processando substituição de imagem antiga:', oldUrl);
      const moved = await moveImageToTrash(oldUrl);
      if (!moved) {
        console.warn('Falha ao mover imagem antiga. Continuando upload...');
      }
    }

    // 3. Gerar caminho único
    const path = getStoragePath(folder, file.name);
    console.log('Novo caminho gerado:', path);

    // 4. Upload para o Supabase
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw error;
    }

    // 5. Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;
    const mediaFolder = mapStorageFolderToMediaFolder(folder);
    const dimensions = await getImageDimensions(file);

    const { error: metadataError } = await supabase
      .from('media_files')
      .upsert(
        {
          filename: file.name,
          url: publicUrl,
          size: file.size,
          width: dimensions.width ?? null,
          height: dimensions.height ?? null,
          mime_type: file.type,
          folder: mediaFolder,
        },
        { onConflict: 'url' }
      );

    if (metadataError) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw metadataError;
    }

    if (oldUrl) {
      await supabase.from('media_files').delete().eq('url', oldUrl);
    }

    console.log('Upload concluído com sucesso:', publicUrlData.publicUrl);
    console.groupEnd();
    
    return {
      url: publicUrl,
      path: path
    };

  } catch (error: any) {
    console.error('Erro fatal no upload:', error);
    console.groupEnd();
    return { url: '', path: '', error: error.message || 'Erro desconhecido no upload.' };
  }
};

/**
 * Remove uma imagem do sistema (move para trash/backup).
 * @param url URL pública da imagem.
 */
export const deleteImage = async (url: string): Promise<boolean> => {
  console.group('Storage Service: Delete Image');
  console.log('URL para deletar:', url);

  try {
    const success = await moveImageToTrash(url);
    await supabase.from('media_files').delete().eq('url', url);
    if (success) {
      console.log('Imagem movida para lixeira com sucesso.');
    } else {
      console.warn('Falha ao mover imagem para lixeira ou imagem não encontrada.');
    }
    console.groupEnd();
    return success;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    console.groupEnd();
    return false;
  }
};

/**
 * Atualiza uma imagem existente (wrapper para uploadImage).
 */
export const updateImage = async (
  file: File, 
  oldUrl: string, 
  folder: StorageFolder,
  options?: UploadImageOptions
): Promise<UploadResult> => {
  return uploadImage(file, folder, oldUrl, options);
};
