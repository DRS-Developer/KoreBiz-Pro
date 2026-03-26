import { useCallback, useEffect, useState } from 'react';
import { homeWidgetService } from '../services/homeWidgetService';
import { HomeWidgetDto } from '../types/home-widgets';
import { useGlobalStore } from '../stores/useGlobalStore';

export const useHomeWidgets = (pageKey = 'home') => {
  const { homeWidgets: cachedWidgets, setHomeWidgets } = useGlobalStore();
  
  // Use cached widgets as initial state if available for this pageKey
  // Currently, store only caches 'home' pageKey. For others, it's empty initially.
  const initialWidgets = pageKey === 'home' && cachedWidgets.length > 0 ? cachedWidgets : [];
  
  const [widgets, setWidgets] = useState<HomeWidgetDto[]>(initialWidgets);
  const [loading, setLoading] = useState(initialWidgets.length === 0);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      if (initialWidgets.length === 0) {
        setLoading(true);
      }
      setError(null);
      const data = await homeWidgetService.list(pageKey);
      setWidgets(data);
      if (pageKey === 'home') {
        setHomeWidgets(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Falha ao carregar widgets da Home.'));
    } finally {
      setLoading(false);
    }
  }, [pageKey, initialWidgets.length, setHomeWidgets]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return {
    widgets,
    loading,
    error,
    fetchWidgets,
  };
};
