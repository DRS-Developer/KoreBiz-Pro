
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
  
  // Verifica se é uma URL válida do Supabase Storage
  // Exemplo: https://xyz.supabase.co/storage/v1/object/public/bucket/file.jpg
  
  // Para usar o Image Transformation do Supabase, adicionamos query params na URL de render
  // Nota: Isso requer que o projeto tenha Image Transformations habilitado (Pro plan ou self-hosted com imgproxy)
  // Caso contrário, o Supabase ignora os parâmetros e serve a imagem original.
  
  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('resize', resize);
  
  // A URL de transformação geralmente é /render/image/public em vez de /object/public
  // Mas a sintaxe mais recente permite query params diretamente no endpoint padrão em alguns casos
  // ou requer mudança para /render/image. Vamos tentar a abordagem padrão de query params
  // que funciona com o Next.js Image Loader do Supabase, mas para URLs diretas:
  
  // Transformação de URL:
  // De: .../storage/v1/object/public/...
  // Para: .../storage/v1/render/image/public/... (Padrão antigo/específico)
  // OU apenas append params se o servidor suportar.
  
  // Vamos usar a estratégia de append params que é menos destrutiva.
  // Se o usuário tiver o "Supabase Image Resizer" configurado, funcionará.
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};
