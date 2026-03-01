import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useGlobalStore } from '../stores/useGlobalStore';

export interface SystemModule {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  updated_at: string;
  updated_by: string;
}

export const useSystemModules = () => {
  const { systemModules, setSystemModules, updateSystemModule } = useGlobalStore();
  const [loading, setLoading] = useState(systemModules.length === 0);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('system_modules')
        .select('*')
        .order('name');

      if (error) throw error;
      setSystemModules(data || []);
    } catch (error) {
      console.error('Error fetching system modules:', error);
      // Only show toast if we have no cached data, otherwise it might be just a temporary connection issue
      if (systemModules.length === 0) {
        toast.error('Erro ao carregar módulos do sistema');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleVisibility = async (key: string, isActive: boolean) => {
    try {
      // Optimistic update
      const module = systemModules.find(m => m.key === key);
      if (module) {
        updateSystemModule({ ...module, is_active: isActive });
      }

      const { error } = await supabase
        .from('system_modules')
        .update({ is_active: isActive })
        .eq('key', key);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'toggle_module_visibility',
        details: { module: key, new_status: isActive },
      });

      toast.success(`Módulo ${isActive ? 'habilitado' : 'desabilitado'} com sucesso`);
    } catch (error) {
      console.error('Error updating module visibility:', error);
      toast.error('Erro ao atualizar visibilidade do módulo');
      // Revert optimistic update by refetching
      fetchModules();
    }
  };

  useEffect(() => {
    fetchModules();

    // Subscribe to changes
    const subscription = supabase
      .channel('system_modules_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'system_modules' 
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          updateSystemModule(payload.new as SystemModule);
        } else if (payload.eventType === 'INSERT') {
          setSystemModules([...systemModules, payload.new as SystemModule]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    modules: systemModules,
    loading,
    toggleModuleVisibility,
    getModuleStatus: (key: string) => {
      // If loading and no data, assume true to prevent flash of hidden content? 
      // Or false to be safe? 
      // The user complained about "showing disabled page for 1-2 seconds".
      // This implies that during loading, we default to TRUE, then it switches to FALSE.
      // If we have cached data, we use it.
      if (systemModules.length === 0 && loading) return false; // Fail safe: hide if unknown? Or show?
      // Better: if we persist data, use it. If no data, wait for load.
      
      const module = systemModules.find(m => m.key === key);
      return module?.is_active ?? true;
    }
  };
};
