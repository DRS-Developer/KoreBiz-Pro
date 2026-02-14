import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UseSlugOptions {
  table: string;
  field?: string;
}

export const useSlug = ({ table, field = 'slug' }: UseSlugOptions) => {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Converte uma string em um formato URL-friendly
   * Remove acentos, caracteres especiais e limita a 100 chars
   */
  const formatSlug = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
      .substring(0, 100) // Limita a 100 caracteres
      .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
  }, []);

  /**
   * Verifica se o slug já existe no banco de dados
   * Ignora o registro atual (currentId) se estiver editando
   */
  const checkAvailability = useCallback(async (slug: string, currentId?: string): Promise<boolean> => {
    if (!slug) return true;
    
    setIsChecking(true);
    try {
      let query = supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq(field, slug); // Case-insensitive por padrão no Postgres text/varchar se configurado, mas idealmente forçamos lower no insert

      if (currentId) {
        query = query.neq('id', currentId);
      }

      // Se tiver soft delete (deleted_at), deve ignorar os deletados?
      // O requisito diz "ignore slugs de registros excluídos/lixeira"
      // Assumindo que a tabela possa ter deleted_at. Se não tiver, isso não afeta.
      // query = query.is('deleted_at', null); // Descomentar se houver soft delete

      const { count, error } = await query;

      if (error) throw error;
      
      return count === 0;
    } catch (error) {
      console.error('Erro ao verificar slug:', error);
      return false; // Na dúvida, assume indisponível ou trata erro
    } finally {
      setIsChecking(false);
    }
  }, [table, field]);

  /**
   * Gera um slug único adicionando sufixo numérico se necessário
   * Ex: projeto-incrivel -> projeto-incrivel-1 -> projeto-incrivel-2
   */
  const generateUniqueSlug = useCallback(async (baseText: string, currentId?: string): Promise<string> => {
    let slug = formatSlug(baseText);
    let isAvailable = await checkAvailability(slug, currentId);
    let counter = 1;
    const originalSlug = slug;

    while (!isAvailable) {
      slug = `${originalSlug}-${counter}`;
      isAvailable = await checkAvailability(slug, currentId);
      counter++;
      
      // Safety break para evitar loop infinito
      if (counter > 100) {
        toast.error('Não foi possível gerar um slug único automaticamente.');
        break;
      }
    }

    return slug;
  }, [formatSlug, checkAvailability]);

  return {
    formatSlug,
    checkAvailability,
    generateUniqueSlug,
    isChecking
  };
};
