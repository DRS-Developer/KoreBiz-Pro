import { useEffect, useMemo, useState } from 'react';
import { FormImageCropKey, FormImageCropProfile, resolveFormImageCropProfile } from '../config/formImageCropProfiles';
import { formImageCropConfigService } from '../services/formImageCropConfigService';

interface UseFormImageCropConfigResult {
  config: ReturnType<typeof resolveFormImageCropProfile> | null;
  loading: boolean;
  error: string | null;
}

export const useFormImageCropConfig = (
  formKey?: FormImageCropKey,
  fallback?: {
    aspectRatio: number;
    minWidth: number;
    minHeight: number;
  }
): UseFormImageCropConfigResult => {
  const [configs, setConfigs] = useState<Partial<Record<FormImageCropKey, FormImageCropProfile>> | null>(null);
  const [loading, setLoading] = useState<boolean>(!!formKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formKey) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    formImageCropConfigService
      .list()
      .then((data) => {
        if (!mounted) return;
        setConfigs(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Falha ao carregar configuração de crop.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [formKey]);

  const config = useMemo(() => {
    if (!formKey) return null;
    const resolved = resolveFormImageCropProfile(formKey, configs?.[formKey]);
    if (!resolved.isActive && fallback) {
      return {
        ...resolved,
        aspectRatio: fallback.aspectRatio,
        minWidth: fallback.minWidth,
        minHeight: fallback.minHeight,
      };
    }
    return resolved;
  }, [configs, fallback, formKey]);

  return {
    config,
    loading,
    error,
  };
};
