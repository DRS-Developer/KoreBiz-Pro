import { supabase } from '../lib/supabase';
import { HomeWidgetDto, HomeWidgetRecord, HomeWidgetUpsertInput } from '../types/home-widgets';

interface ApiResult<T> {
  data: T;
  error?: string;
}

const DEFAULT_PAGE_KEY = 'home';
const CORS_ERROR_SIGNATURES = ['Failed to fetch', 'NetworkError', 'ERR_FAILED', 'CORS'];
const LOCAL_STORAGE_KEY = 'home_widgets_local_fallback_v1';
export const HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY = 'home_widgets_public_unavailable_v1';
export const HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY = 'home_widgets_public_unavailable_at_v1';
type TransportMode = 'unknown' | 'function' | 'table' | 'local';
let transportMode: TransportMode = 'unknown';

const getFunctionUrl = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL não configurada.');
  }
  return `${baseUrl}/functions/v1/home-widgets`;
};

const buildAuthHeaders = async () => {
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!apiKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY não configurada.');
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  return {
    apikey: apiKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const normalizeRecord = (record: HomeWidgetRecord): HomeWidgetDto => {
  return {
    id: record.id,
    pageKey: record.page_key,
    widgetType: record.widget_type,
    variant: record.variant,
    orderIndex: record.order_index,
    enabled: record.enabled,
    settings: (record.settings || {}) as Record<string, unknown>,
    dataBinding: (record.data_binding || null) as Record<string, unknown> | null,
    version: record.version,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

const isNetworkCorsError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return CORS_ERROR_SIGNATURES.some((signature) => error.message.includes(signature));
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || '');
  }
  return '';
};

const isSessionError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('sessão expirada') || message.includes('session') || message.includes('refresh_token');
};

const isTableUnavailableError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes('home_widgets') && message.includes('404')) return true;
  if (message.includes('relation') && message.includes('home_widgets')) return true;
  if (message.includes('could not find') && message.includes('home_widgets')) return true;
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code || '');
    if (code === 'PGRST205') return true;
  }
  return false;
};

const isRecoverableTransportError = (error: unknown) => {
  return isNetworkCorsError(error) || isTableUnavailableError(error) || isSessionError(error);
};

const canUseLocalStorage = () => typeof window !== 'undefined' && !!window.localStorage;
const isAdminContext = () =>
  typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
const isPublicContext = () =>
  typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin');

const sortWidgets = (items: HomeWidgetDto[]) => {
  return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
};

const readLocalWidgets = (): HomeWidgetDto[] => {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalWidgets = (items: HomeWidgetDto[]) => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
};

const listViaLocal = (pageKey = DEFAULT_PAGE_KEY): HomeWidgetDto[] => {
  return sortWidgets(readLocalWidgets().filter((item) => item.pageKey === pageKey));
};

const listViaSafeLocal = (pageKey = DEFAULT_PAGE_KEY): HomeWidgetDto[] => {
  if (!isAdminContext()) {
    return [];
  }
  return listViaLocal(pageKey);
};

const readPublicUnavailableFlag = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY) === '1';
};

const writePublicUnavailableFlag = (value: boolean) => {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY, '1');
    window.localStorage.setItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY, new Date().toISOString());
    return;
  }
  window.localStorage.removeItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_KEY);
  window.localStorage.removeItem(HOME_WIDGETS_PUBLIC_UNAVAILABLE_AT_KEY);
};

const toIso = () => new Date().toISOString();

const generateWidgetId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `widget_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const upsertViaLocal = (input: HomeWidgetUpsertInput, pageKey = DEFAULT_PAGE_KEY): HomeWidgetDto => {
  const items = readLocalWidgets();
  const targetPageKey = input.pageKey || pageKey;
  const now = toIso();
  const index = items.findIndex((item) => item.id === input.id);

  if (index >= 0) {
    const current = items[index];
    const next: HomeWidgetDto = {
      ...current,
      pageKey: targetPageKey,
      widgetType: input.widgetType ?? current.widgetType,
      variant: input.variant ?? current.variant ?? 'default',
      orderIndex: typeof input.orderIndex === 'number' ? input.orderIndex : current.orderIndex,
      enabled: typeof input.enabled === 'boolean' ? input.enabled : current.enabled,
      settings: input.settings ?? current.settings ?? {},
      dataBinding: input.dataBinding ?? current.dataBinding ?? null,
      version: (current.version || 1) + 1,
      updatedAt: now,
    };
    items[index] = next;
    writeLocalWidgets(items);
    return next;
  }

  const pageItems = items.filter((item) => item.pageKey === targetPageKey);
  const nextOrder =
    typeof input.orderIndex === 'number'
      ? input.orderIndex
      : pageItems.reduce((max, item) => Math.max(max, item.orderIndex), -1) + 1;

  const created: HomeWidgetDto = {
    id: input.id || generateWidgetId(),
    pageKey: targetPageKey,
    widgetType: input.widgetType,
    variant: input.variant || 'default',
    orderIndex: nextOrder,
    enabled: input.enabled !== false,
    settings: input.settings || {},
    dataBinding: input.dataBinding || null,
    version: input.version || 1,
    createdAt: now,
    updatedAt: now,
  };

  items.push(created);
  writeLocalWidgets(items);
  return created;
};

const removeViaLocal = (id: string): boolean => {
  const items = readLocalWidgets();
  const next = items.filter((item) => item.id !== id);
  writeLocalWidgets(next);
  return true;
};

const reorderViaLocal = (ids: string[], pageKey = DEFAULT_PAGE_KEY): HomeWidgetDto[] => {
  const items = readLocalWidgets();
  const pageItems = items.filter((item) => item.pageKey === pageKey);
  const others = items.filter((item) => item.pageKey !== pageKey);
  const idSet = new Set(ids);
  const ordered = ids
    .map((id) => pageItems.find((item) => item.id === id))
    .filter((item): item is HomeWidgetDto => !!item)
    .map((item, index) => ({ ...item, orderIndex: index, updatedAt: toIso(), version: (item.version || 1) + 1 }));
  const missing = pageItems
    .filter((item) => !idSet.has(item.id))
    .map((item, index) => ({ ...item, orderIndex: ordered.length + index, updatedAt: toIso(), version: (item.version || 1) + 1 }));
  const merged = [...others, ...ordered, ...missing];
  writeLocalWidgets(merged);
  return sortWidgets([...ordered, ...missing]);
};

const callApi = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  query = '',
  body?: unknown
): Promise<T> => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${getFunctionUrl()}${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload: ApiResult<T> | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new Error(payload?.error || 'Falha ao processar widgets da Home.');
  }
  if (!payload) {
    throw new Error('Resposta inválida da API de widgets da Home.');
  }
  return payload.data;
};

const listViaTable = async (pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto[]> => {
  const { data, error } = await (supabase as any)
    .from('home_widgets')
    .select('*')
    .eq('page_key', pageKey)
    .order('order_index', { ascending: true });
  if (error) {
    throw error;
  }
  return ((data || []) as HomeWidgetRecord[]).map(normalizeRecord);
};

const upsertViaTable = async (input: HomeWidgetUpsertInput, pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto> => {
  const payload: Record<string, unknown> = {
    page_key: input.pageKey || pageKey,
    widget_type: input.widgetType,
    variant: input.variant || 'default',
    order_index: typeof input.orderIndex === 'number' ? input.orderIndex : 0,
    enabled: input.enabled !== false,
    settings: input.settings || {},
    data_binding: input.dataBinding || null,
    version: input.version || 1,
  };
  if (input.id) payload.id = input.id;
  const { data, error } = await (supabase as any)
    .from('home_widgets')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) {
    throw error;
  }
  return normalizeRecord(data as HomeWidgetRecord);
};

const removeViaTable = async (id: string): Promise<boolean> => {
  const { error } = await (supabase as any).from('home_widgets').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
};

const reorderViaTable = async (ids: string[], pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto[]> => {
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const { error } = await (supabase as any)
      .from('home_widgets')
      .update({ order_index: index })
      .eq('id', id)
      .eq('page_key', pageKey);
    if (error) {
      throw error;
    }
  }
  return listViaTable(pageKey);
};

export const revalidatePublicHomeWidgetsFlag = async (pageKey = DEFAULT_PAGE_KEY): Promise<boolean> => {
  try {
    await listViaTable(pageKey);
    writePublicUnavailableFlag(false);
    return true;
  } catch (error) {
    if (isTableUnavailableError(error)) {
      writePublicUnavailableFlag(true);
      return false;
    }
    throw error;
  }
};

export const homeWidgetService = {
  async list(pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto[]> {
    if (isPublicContext()) {
      if (import.meta.env.DEV) {
        try {
          const rows = await listViaTable(pageKey);
          writePublicUnavailableFlag(false);
          transportMode = 'table';
          return rows;
        } catch (error) {
          if (isTableUnavailableError(error)) {
            writePublicUnavailableFlag(true);
            return listViaLocal(pageKey);
          }
          if (isRecoverableTransportError(error)) {
            return listViaLocal(pageKey);
          }
          throw error;
        }
      }
      if (readPublicUnavailableFlag()) {
        return [];
      }
      try {
        const rows = await listViaTable(pageKey);
        writePublicUnavailableFlag(false);
        transportMode = 'table';
        return rows;
      } catch (error) {
        if (isTableUnavailableError(error)) {
          writePublicUnavailableFlag(true);
          return [];
        }
        if (isRecoverableTransportError(error)) {
          return [];
        }
        throw error;
      }
    }

    if (transportMode === 'local') {
      return listViaSafeLocal(pageKey);
    }
    if (transportMode === 'table') {
      try {
        return await listViaTable(pageKey);
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return listViaSafeLocal(pageKey);
      }
    }
    try {
      const rows = await callApi<HomeWidgetRecord[]>('GET', `?pageKey=${encodeURIComponent(pageKey)}`);
      transportMode = 'function';
      return rows.map(normalizeRecord);
    } catch (error) {
      if (!isRecoverableTransportError(error)) {
        throw error;
      }
      try {
        const rows = await listViaTable(pageKey);
        transportMode = 'table';
        return rows;
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return listViaSafeLocal(pageKey);
      }
    }
  },

  async upsert(input: HomeWidgetUpsertInput, pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto> {
    const payload = {
      ...input,
      pageKey: input.pageKey || pageKey,
    };
    const method = input.id ? 'PUT' : 'POST';
    const query = input.id ? `?id=${encodeURIComponent(input.id)}` : '';
    if (transportMode === 'local') {
      return upsertViaLocal(payload, pageKey);
    }
    if (transportMode === 'table') {
      try {
        return await upsertViaTable(payload, pageKey);
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return upsertViaLocal(payload, pageKey);
      }
    }
    try {
      const row = await callApi<HomeWidgetRecord>(method, query, payload);
      transportMode = 'function';
      return normalizeRecord(row);
    } catch (error) {
      if (!isRecoverableTransportError(error)) {
        throw error;
      }
      try {
        const row = await upsertViaTable(payload, pageKey);
        transportMode = 'table';
        return row;
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return upsertViaLocal(payload, pageKey);
      }
    }
  },

  async remove(id: string): Promise<boolean> {
    if (transportMode === 'local') {
      return removeViaLocal(id);
    }
    if (transportMode === 'table') {
      try {
        return await removeViaTable(id);
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return removeViaLocal(id);
      }
    }
    try {
      const removed = await callApi<boolean>('DELETE', `?id=${encodeURIComponent(id)}`);
      transportMode = 'function';
      return removed;
    } catch (error) {
      if (!isRecoverableTransportError(error)) {
        throw error;
      }
      try {
        const removed = await removeViaTable(id);
        transportMode = 'table';
        return removed;
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return removeViaLocal(id);
      }
    }
  },

  async reorder(ids: string[], pageKey = DEFAULT_PAGE_KEY): Promise<HomeWidgetDto[]> {
    if (transportMode === 'local') {
      return reorderViaLocal(ids, pageKey);
    }
    if (transportMode === 'table') {
      try {
        return await reorderViaTable(ids, pageKey);
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return reorderViaLocal(ids, pageKey);
      }
    }
    try {
      const rows = await callApi<HomeWidgetRecord[]>('POST', '?action=reorder', {
        pageKey,
        ids,
      });
      transportMode = 'function';
      return rows.map(normalizeRecord);
    } catch (error) {
      if (!isRecoverableTransportError(error)) {
        throw error;
      }
      try {
        const rows = await reorderViaTable(ids, pageKey);
        transportMode = 'table';
        return rows;
      } catch (tableError) {
        if (!isRecoverableTransportError(tableError)) {
          throw tableError;
        }
        transportMode = 'local';
        return reorderViaLocal(ids, pageKey);
      }
    }
  },
};
