import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sidebarConfigService } from './sidebarConfigService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('sidebarConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('busca módulos pelo endpoint get_system_modules_config', async () => {
    const mockData = [
      { key: 'areas_atuacao', is_active: true, is_sort_enabled: true, order_position: 1 },
    ];
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await sidebarConfigService.fetchModules();

    expect(supabase.rpc).toHaveBeenCalledWith('get_system_modules_config');
    expect(result).toEqual(mockData);
  });

  it('atualiza configuração pelo endpoint update_system_module_config', async () => {
    const updated = {
      key: 'servicos',
      is_active: true,
      is_sort_enabled: false,
      order_position: 3,
    };
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: updated,
      error: null,
    });

    const result = await sidebarConfigService.updateModuleConfig({
      key: 'servicos',
      isActive: true,
      isSortEnabled: false,
    });

    expect(supabase.rpc).toHaveBeenCalledWith('update_system_module_config', {
      p_key: 'servicos',
      p_is_active: true,
      p_is_sort_enabled: false,
    });
    expect(result).toEqual(updated);
  });

  it('reordena pelo endpoint reorder_system_modules', async () => {
    const ordered = [
      { key: 'parceiros', order_position: 1 },
      { key: 'servicos', order_position: 2 },
    ];
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: ordered,
      error: null,
    });

    const result = await sidebarConfigService.reorderModules(['parceiros', 'servicos']);

    expect(supabase.rpc).toHaveBeenCalledWith('reorder_system_modules', {
      p_keys: ['parceiros', 'servicos'],
    });
    expect(result).toEqual(ordered);
  });

  it('valida duplicidade antes de chamar endpoint de reordenação', async () => {
    await expect(sidebarConfigService.reorderModules(['servicos', 'servicos']))
      .rejects
      .toThrow('A lista de ordenação contém duplicidades');

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
