import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSystemModules } from './useSystemModules';
import { useGlobalStore } from '../stores/useGlobalStore';
import { sidebarConfigService } from '../services/sidebarConfigService';

vi.mock('../services/sidebarConfigService', () => ({
  sidebarConfigService: {
    fetchModules: vi.fn(),
    updateModuleConfig: vi.fn(),
    reorderModules: vi.fn(),
  },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(function on(this: any) {
        return this;
      }),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const initialModules = [
  {
    id: '1',
    key: 'areas_atuacao',
    name: 'Áreas de Atuação',
    is_active: true,
    is_sort_enabled: true,
    order_position: 1,
    updated_at: '',
    updated_by: null,
  },
  {
    id: '2',
    key: 'servicos',
    name: 'Serviços',
    is_active: true,
    is_sort_enabled: true,
    order_position: 2,
    updated_at: '',
    updated_by: null,
  },
  {
    id: '3',
    key: 'parceiros',
    name: 'Parceiros',
    is_active: false,
    is_sort_enabled: true,
    order_position: 3,
    updated_at: '',
    updated_by: null,
  },
];

describe('useSystemModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    useGlobalStore.setState({
      services: [],
      portfolio: [],
      pages: [],
      contacts: [],
      profiles: [],
      settings: null,
      practiceAreas: [],
      partners: [],
      homeHero: null,
      homeAbout: null,
      homeCta: null,
      systemModules: [],
      isHydrated: false,
      lastSync: 0,
      lastUpdateCheck: null,
    });
    (sidebarConfigService.fetchModules as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(initialModules);
  });

  it('carrega módulos ordenados ao iniciar', async () => {
    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modules.map((module) => module.key)).toEqual([
      'areas_atuacao',
      'servicos',
      'parceiros',
    ]);
  });

  it('atualiza estado após reordenação persistida', async () => {
    const reordered = [
      { ...initialModules[1], order_position: 1 },
      { ...initialModules[0], order_position: 2 },
      { ...initialModules[2], order_position: 3 },
    ];
    (sidebarConfigService.reorderModules as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(reordered);

    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reorderModules(['servicos', 'areas_atuacao', 'parceiros']);
    });

    expect(result.current.modules.map((module) => module.key)).toEqual([
      'servicos',
      'areas_atuacao',
      'parceiros',
    ]);
  });

  it('suporta múltiplas requisições concorrentes de ordenação', async () => {
    let resolveFirst: ((value: any) => void) | undefined;
    let resolveSecond: ((value: any) => void) | undefined;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    (sidebarConfigService.reorderModules as unknown as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let firstCall: Promise<void>;
    let secondCall: Promise<void>;
    await act(async () => {
      firstCall = result.current.reorderModules(['servicos', 'areas_atuacao', 'parceiros']);
      secondCall = result.current.reorderModules(['parceiros', 'servicos', 'areas_atuacao']);
    });

    resolveFirst?.([
      { ...initialModules[1], order_position: 1 },
      { ...initialModules[0], order_position: 2 },
      { ...initialModules[2], order_position: 3 },
    ]);

    resolveSecond?.([
      { ...initialModules[2], order_position: 1 },
      { ...initialModules[1], order_position: 2 },
      { ...initialModules[0], order_position: 3 },
    ]);

    await act(async () => {
      await Promise.all([firstCall!, secondCall!]);
    });

    expect(sidebarConfigService.reorderModules).toHaveBeenCalledTimes(2);
    expect(result.current.modules.map((module) => module.key)).toEqual([
      'parceiros',
      'servicos',
      'areas_atuacao',
    ]);
  });

  it('reordena sem acionar reload de página', async () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload: reloadMock });
    (sidebarConfigService.reorderModules as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...initialModules[1], order_position: 1 },
      { ...initialModules[0], order_position: 2 },
      { ...initialModules[2], order_position: 3 },
    ]);

    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reorderModules(['servicos', 'areas_atuacao', 'parceiros']);
    });

    expect(reloadMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('persiste ordenação local após reordenar', async () => {
    (sidebarConfigService.reorderModules as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...initialModules[1], order_position: 1 },
      { ...initialModules[0], order_position: 2 },
      { ...initialModules[2], order_position: 3 },
    ]);

    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reorderModules(['servicos', 'areas_atuacao', 'parceiros']);
    });

    const raw = window.localStorage.getItem('ars-sidebar-modules-order');
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw || '[]');
    expect(persisted.map((item: { key: string }) => item.key)).toEqual([
      'servicos',
      'areas_atuacao',
      'parceiros',
    ]);
  });

  it('habilita e desabilita ordenação para todos os botões do grupo', async () => {
    (sidebarConfigService.updateModuleConfig as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useSystemModules());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateAllSortEnabled(false);
    });

    expect(sidebarConfigService.updateModuleConfig).toHaveBeenCalledTimes(initialModules.length);
    expect(sidebarConfigService.updateModuleConfig).toHaveBeenNthCalledWith(1, {
      key: 'areas_atuacao',
      isActive: true,
      isSortEnabled: false,
    });
    expect(sidebarConfigService.updateModuleConfig).toHaveBeenNthCalledWith(2, {
      key: 'servicos',
      isActive: true,
      isSortEnabled: false,
    });
    expect(sidebarConfigService.updateModuleConfig).toHaveBeenNthCalledWith(3, {
      key: 'parceiros',
      isActive: false,
      isSortEnabled: false,
    });
  });
});
