import { useCallback, useEffect, useMemo, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useGlobalStore } from '../stores/useGlobalStore';
import { sidebarConfigService, SidebarModule } from '../services/sidebarConfigService';
import { supabase } from '../lib/supabase';
import { notifySystemModulesSync, SYSTEM_MODULES_SYNC_EVENT, SYSTEM_MODULES_SYNC_KEY } from './systemModulesSync';

const SIDEBAR_MODULES_LOCAL_KEY = 'ars-sidebar-modules-order';

export interface SystemModule {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  is_sort_enabled: boolean;
  order_position: number;
  updated_at: string;
  updated_by: string | null;
  visibilidade_personalizada?: boolean;
}

export const useSystemModules = () => {
  const { systemModules, setSystemModules } = useGlobalStore();
  const [loading, setLoading] = useState(systemModules.length === 0);

  const normalizeModules = useCallback((modules: SidebarModule[]) => {
    return [...modules].sort((a, b) => a.order_position - b.order_position);
  }, []);

  const saveLocalModules = useCallback((modules: SidebarModule[]) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(SIDEBAR_MODULES_LOCAL_KEY, JSON.stringify(normalizeModules(modules)));
  }, [normalizeModules]);

  const readLocalModules = useCallback((): SidebarModule[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    const raw = window.localStorage.getItem(SIDEBAR_MODULES_LOCAL_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as SidebarModule[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return normalizeModules(parsed);
    } catch {
      return [];
    }
  }, [normalizeModules]);

  const applyLocalOrderToServerData = useCallback((serverModules: SidebarModule[]) => {
    return normalizeModules(serverModules);
  }, [normalizeModules]);

  const fetchModules = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_modules_config');
      if (error) throw error;
      
      const mappedModules: SidebarModule[] = (data || []).map((m: any) => ({
        id: m.id,
        key: m.key,
        name: m.name,
        is_active: m.is_active,
        is_sort_enabled: m.is_sort_enabled,
        order_position: m.order_position,
        updated_at: new Date().toISOString(),
        updated_by: null,
        visibilidade_personalizada: m.visibilidade_personalizada ?? true
      }));

      const merged = applyLocalOrderToServerData(mappedModules);
      setSystemModules(merged);
      saveLocalModules(merged);
    } catch (error) {
      console.error('Erro ao carregar módulos do sistema:', error);
      if (systemModules.length === 0) {
        toast.error('Erro ao carregar módulos do sistema');
      }
    } finally {
      setLoading(false);
    }
  }, [applyLocalOrderToServerData, saveLocalModules, setSystemModules, systemModules.length]);

  const updateModuleConfig = useCallback(async (key: string, isActive: boolean, isSortEnabled: boolean) => {
    try {
      await sidebarConfigService.updateModuleConfig({
        key,
        isActive,
        isSortEnabled,
      });

      await fetchModules();
      notifySystemModulesSync();
      toast.success('Configuração do botão atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar configuração de módulo:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar configuração do botão');
      await fetchModules();
    }
  }, [fetchModules]);

  const toggleModuleVisibility = useCallback(async (key: string, isActive: boolean) => {
    const current = systemModules.find((module) => module.key === key);
    if (!current) {
      toast.error('Módulo não encontrado para atualização');
      return;
    }

    await updateModuleConfig(key, isActive, current.is_sort_enabled);
  }, [systemModules, updateModuleConfig]);

  const reorderModules = useCallback(async (orderedKeys: string[]) => {
    const moduleByKey = new Map(systemModules.map((module) => [module.key, module]));
    const optimistic = orderedKeys
      .map((key, index) => {
        const module = moduleByKey.get(key);
        if (!module) {
          return null;
        }
        return { ...module, order_position: index + 1 };
      })
      .filter((module): module is SidebarModule => module !== null);

    if (optimistic.length === systemModules.length) {
      setSystemModules(normalizeModules(optimistic));
      saveLocalModules(optimistic);
    }

    try {
      const data = await sidebarConfigService.reorderModules(orderedKeys);
      const normalized = normalizeModules(data);
      setSystemModules(normalized);
      saveLocalModules(normalized);
      notifySystemModulesSync();
      toast.success('Ordem dos botões atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao reordenar módulos:', error);
      const message = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Erro ao reordenar módulos');
      toast.error(message);
      await fetchModules();
    }
  }, [fetchModules, normalizeModules, saveLocalModules, setSystemModules, systemModules]);

  const updateAllSortEnabled = useCallback(async (enabled: boolean) => {
    try {
      for (const module of systemModules) {
        if (module.is_sort_enabled === enabled) {
          continue;
        }
        await sidebarConfigService.updateModuleConfig({
          key: module.key,
          isActive: module.is_active,
          isSortEnabled: enabled,
        });
      }
      await fetchModules();
      notifySystemModulesSync();
      toast.success(enabled ? 'Ordenação habilitada para todos os botões' : 'Ordenação desabilitada para todos os botões');
    } catch (error) {
      console.error('Erro ao atualizar ordenação em lote:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar ordenação em lote');
      await fetchModules();
    }
  }, [fetchModules, systemModules]);

  useEffect(() => {
    if (systemModules.length === 0) {
      const localModules = readLocalModules();
      if (localModules.length) {
        setSystemModules(localModules);
      }
    }

    fetchModules();

    const handleSyncEvent = () => {
      fetchModules();
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === SYSTEM_MODULES_SYNC_KEY) {
        fetchModules();
      }
    };

    window.addEventListener(SYSTEM_MODULES_SYNC_EVENT, handleSyncEvent);
    window.addEventListener('storage', handleStorageEvent);

    const subscription = supabase
      .channel('system_modules_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_modules'
      }, (_payload: RealtimePostgresChangesPayload<SystemModule>) => {
        fetchModules();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'menu_sidebar_config'
      }, () => {
        console.log('Detectada alteração nas configurações do menu sidebar. Atualizando...');
        fetchModules();
      })
      .subscribe();

    return () => {
      window.removeEventListener(SYSTEM_MODULES_SYNC_EVENT, handleSyncEvent);
      window.removeEventListener('storage', handleStorageEvent);
      subscription.unsubscribe();
    };
  }, [fetchModules, readLocalModules, setSystemModules, systemModules.length]);

  const orderedModules = useMemo(() => {
    return [...systemModules].sort((a, b) => a.order_position - b.order_position);
  }, [systemModules]);

  return {
    modules: orderedModules,
    loading,
    toggleModuleVisibility,
    updateModuleConfig,
    reorderModules,
    updateAllSortEnabled,
    getModuleStatus: (key: string) => {
      if (orderedModules.length === 0 && loading) return false;

      const module = orderedModules.find(m => m.key === key);
      return module?.is_active ?? true;
    },
    getModuleByKey: (key: string) => {
      const module = orderedModules.find(m => m.key === key);
      return module ?? null;
    },
    hasAtLeastOneActiveModule: () => {
      return orderedModules.some((module) => module.is_active);
    },
    getOrderedModuleKeys: () => {
      return orderedModules.map((module) => module.key);
    },
    canDisableModule: (key: string) => {
      const module = orderedModules.find((item) => item.key === key);
      if (!module || !module.is_active) {
        return true;
      }

      const activeModules = orderedModules.filter((item) => item.is_active);
      return activeModules.length > 1;
    },
    getModuleSortingState: (key: string) => {
      const module = orderedModules.find((item) => item.key === key);
      return module?.is_sort_enabled ?? false;
    },
    getSortedConfigurableModules: () => {
      return orderedModules;
    },
    getOrderedActiveModules: () => {
      return orderedModules.filter((module) => module.is_active);
    },
    getOrderedInactiveModules: () => {
      return orderedModules.filter((module) => !module.is_active);
    },
    getModuleOrderPosition: (key: string) => {
      const module = orderedModules.find((item) => item.key === key);
      return module?.order_position ?? null;
    },
    getModuleVisibilityState: (key: string) => {
      const module = systemModules.find(m => m.key === key);
      const isSidebarVisible = module?.visibilidade_personalizada ?? true;
      return {
        isActive: module?.is_active ?? true,
        isSidebarVisible,
        isSortEnabled: module?.is_sort_enabled ?? false,
        orderPosition: module?.order_position ?? null
      };
    },
    refreshModules: fetchModules
  };
};
