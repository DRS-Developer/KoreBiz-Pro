import { FormImageCropKey, FormImageCropProfile, FORM_IMAGE_CROP_KEYS, DEFAULT_FORM_IMAGE_CROP_PROFILES, resolveFormImageCropProfile } from '../config/formImageCropProfiles';
import { supabase } from '../lib/supabase';

export interface FormImageCropConfigRecord {
  id: string;
  form_key: FormImageCropKey;
  label: string;
  description: string | null;
  aspect_width: number;
  aspect_height: number;
  min_width: number;
  min_height: number;
  max_width: number;
  max_height: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResult<T> {
  data: T;
  error?: string;
}

let cache: Partial<Record<FormImageCropKey, FormImageCropProfile>> | null = null;
let cacheTime = 0;
let pendingRequest: Promise<Partial<Record<FormImageCropKey, FormImageCropProfile>>> | null = null;

const CACHE_TTL_MS = 1000 * 60 * 5;
const CORS_ERROR_SIGNATURES = ['Failed to fetch', 'NetworkError', 'ERR_FAILED', 'CORS'];

const getFunctionUrl = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL não configurada.');
  }
  return `${baseUrl}/functions/v1/form-image-crop-configs`;
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

const normalizeRecord = (record: FormImageCropConfigRecord): FormImageCropProfile => {
  return {
    formKey: record.form_key,
    label: record.label,
    description: record.description || '',
    aspectWidth: record.aspect_width,
    aspectHeight: record.aspect_height,
    minWidth: record.min_width,
    minHeight: record.min_height,
    maxWidth: record.max_width,
    maxHeight: record.max_height,
    isActive: record.is_active,
  };
};

const callApi = async <T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', query = '', body?: unknown): Promise<T> => {
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
    throw new Error(payload?.error || 'Falha ao processar configuração de crop.');
  }

  if (!payload) {
    throw new Error('Resposta inválida da API de configurações de crop.');
  }

  return payload.data;
};

const isNetworkCorsError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return CORS_ERROR_SIGNATURES.some((signature) => error.message.includes(signature));
};

const listViaTable = async (): Promise<FormImageCropConfigRecord[]> => {
  const { data, error } = await (supabase as any)
    .from('form_image_crop_configs')
    .select('*')
    .order('form_key', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as FormImageCropConfigRecord[];
};

const upsertViaTable = async (profile: FormImageCropProfile): Promise<FormImageCropConfigRecord> => {
  const payload = {
    form_key: profile.formKey,
    label: profile.label,
    description: profile.description || null,
    aspect_width: Math.round(profile.aspectWidth),
    aspect_height: Math.round(profile.aspectHeight),
    min_width: Math.round(profile.minWidth),
    min_height: Math.round(profile.minHeight),
    max_width: Math.round(profile.maxWidth),
    max_height: Math.round(profile.maxHeight),
    is_active: profile.isActive,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('form_image_crop_configs')
    .upsert(payload, { onConflict: 'form_key' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as FormImageCropConfigRecord;
};

const resetViaTable = async (formKey: FormImageCropKey): Promise<boolean> => {
  const { error } = await (supabase as any)
    .from('form_image_crop_configs')
    .delete()
    .eq('form_key', formKey);

  if (error) {
    throw error;
  }

  return true;
};

const mapFromList = (rows: FormImageCropConfigRecord[]): Partial<Record<FormImageCropKey, FormImageCropProfile>> => {
  const mapped: Partial<Record<FormImageCropKey, FormImageCropProfile>> = {};
  for (const row of rows) {
    mapped[row.form_key] = normalizeRecord(row);
  }
  return mapped;
};

const mergeWithDefaults = (overrides: Partial<Record<FormImageCropKey, FormImageCropProfile>>) => {
  const merged: Partial<Record<FormImageCropKey, FormImageCropProfile>> = {};
  for (const key of FORM_IMAGE_CROP_KEYS) {
    merged[key] = resolveFormImageCropProfile(key, overrides[key]);
  }
  return merged;
};

export const formImageCropConfigService = {
  invalidateCache() {
    cache = null;
    cacheTime = 0;
    pendingRequest = null;
  },

  async list(force = false): Promise<Partial<Record<FormImageCropKey, FormImageCropProfile>>> {
    const now = Date.now();
    if (!force && cache && now - cacheTime < CACHE_TTL_MS) {
      return cache;
    }

    if (!force && pendingRequest) {
      return pendingRequest;
    }

    pendingRequest = (async () => {
      let rows: FormImageCropConfigRecord[] = [];
      try {
        rows = await callApi<FormImageCropConfigRecord[]>('GET');
      } catch (error) {
        if (!isNetworkCorsError(error)) {
          throw error;
        }
        rows = await listViaTable();
      }
      const overrides = mapFromList(rows);
      const merged = mergeWithDefaults(overrides);
      cache = merged;
      cacheTime = Date.now();
      pendingRequest = null;
      return merged;
    })();

    return pendingRequest;
  },

  async upsert(profile: FormImageCropProfile): Promise<FormImageCropProfile> {
    let data: FormImageCropConfigRecord;
    try {
      data = await callApi<FormImageCropConfigRecord>('PUT', '', {
        formKey: profile.formKey,
        label: profile.label,
        description: profile.description,
        aspectWidth: profile.aspectWidth,
        aspectHeight: profile.aspectHeight,
        minWidth: profile.minWidth,
        minHeight: profile.minHeight,
        maxWidth: profile.maxWidth,
        maxHeight: profile.maxHeight,
        isActive: profile.isActive,
      });
    } catch (error) {
      if (!isNetworkCorsError(error)) {
        throw error;
      }
      data = await upsertViaTable(profile);
    }

    const normalized = normalizeRecord(data);
    const current = cache || {};
    cache = {
      ...current,
      [profile.formKey]: normalized,
    };
    cacheTime = Date.now();
    return normalized;
  },

  async resetToDefault(formKey: FormImageCropKey): Promise<FormImageCropProfile> {
    const fallback = DEFAULT_FORM_IMAGE_CROP_PROFILES[formKey];
    let deleted = false;
    try {
      deleted = await callApi<boolean>('DELETE', `?formKey=${encodeURIComponent(formKey)}`);
    } catch (error) {
      if (!isNetworkCorsError(error)) {
        throw error;
      }
      deleted = await resetViaTable(formKey);
    }
    if (!deleted) {
      throw new Error('Não foi possível restaurar o padrão deste formulário.');
    }

    const current = cache || {};
    cache = {
      ...current,
      [formKey]: fallback,
    };
    cacheTime = Date.now();
    return fallback;
  },
};
