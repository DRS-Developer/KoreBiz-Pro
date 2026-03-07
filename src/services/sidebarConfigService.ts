import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type SidebarModule = Database['public']['Tables']['system_modules']['Row'] & {
  visibilidade_personalizada?: boolean;
};

export interface UpdateModuleConfigPayload {
  key: string;
  isActive: boolean;
  isSortEnabled: boolean;
}

const ensureKeysIntegrity = (keys: string[]) => {
  if (!keys.length) {
    throw new Error('A lista de ordenação não pode ser vazia');
  }

  if (new Set(keys).size !== keys.length) {
    throw new Error('A lista de ordenação contém duplicidades');
  }
};

export const sidebarConfigService = {
  async fetchModules(): Promise<SidebarModule[]> {
    const { data, error } = await supabase.rpc('get_system_modules_config');

    if (error) {
      throw error;
    }

    return (data ?? []) as SidebarModule[];
  },

  async updateModuleConfig(payload: UpdateModuleConfigPayload): Promise<SidebarModule> {
    const { data, error } = await supabase.rpc('update_system_module_config', {
      p_key: payload.key,
      p_is_active: payload.isActive,
      p_is_sort_enabled: payload.isSortEnabled,
    });

    if (error) {
      throw error;
    }

    return data as SidebarModule;
  },

  async reorderModules(keys: string[]): Promise<SidebarModule[]> {
    ensureKeysIntegrity(keys);

    const { data, error } = await supabase.rpc('reorder_system_modules', {
      p_keys: keys,
    });

    if (error) {
      throw error;
    }

    return (data ?? []) as SidebarModule[];
  },
};
