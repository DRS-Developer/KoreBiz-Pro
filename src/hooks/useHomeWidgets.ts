import { useCallback, useEffect, useState } from 'react';
import { homeWidgetService } from '../services/homeWidgetService';
import { HomeWidgetDto } from '../types/home-widgets';

export const useHomeWidgets = (enabled: boolean, pageKey = 'home') => {
  const [widgets, setWidgets] = useState<HomeWidgetDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidgets = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const data = await homeWidgetService.list(pageKey);
      setWidgets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Falha ao carregar widgets da Home.'));
    } finally {
      setLoading(false);
    }
  }, [enabled, pageKey]);

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
