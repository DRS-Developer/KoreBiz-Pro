
/**
 * Utilitário para otimização de imagens do Supabase Storage.
 * Utiliza o recurso de transformação de imagens do Supabase (se habilitado)
 * ou fallbacks apropriados.
 */

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

export const getOptimizedImageUrl = (url: string | null | undefined, options: OptimizeOptions = {}): string => {
  if (!url) return '';
  if (!url.includes('supabase.co/storage/v1/object/public')) return url; // Retorna original se não for do Supabase

  const { width, height, quality = 80, resize = 'cover' } = options;
  
  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('resize', resize);
  
  // Transformação de URL para o Supabase Image Resizer
  // De: .../storage/v1/object/public/...
  // Para: .../storage/v1/render/image/public/...
  
  const [baseUrl] = url.split('?');
  const renderUrl = baseUrl.replace('/object/public/', '/render/image/public/');
  return `${renderUrl}?${params.toString()}`;
};
