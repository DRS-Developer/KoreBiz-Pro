import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { HomeConfig, DEFAULT_HOME_CONFIG, SectionConfig } from '../types/home-config';
import { toast } from 'sonner';

// Helper for deep comparison
const deepEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useHomeConfig = () => {
  const [config, setConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  const fetchConfig = useCallback(async () => {
    try {
      // Only set loading true on first fetch if we don't have config
      if (!mountedRef.current) setLoading(true);
      
      const { data, error } = await supabase
        .from('home_content')
        .select('content')
        .eq('section_key', 'layout_config')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.content) {
        const loadedConfig = data.content as unknown as HomeConfig;
        
        if (!loadedConfig || !Array.isArray(loadedConfig.sections)) {
           console.warn("Invalid config format in DB, using defaults");
           setConfig(prev => deepEqual(prev, DEFAULT_HOME_CONFIG) ? prev : DEFAULT_HOME_CONFIG);
           return;
        }

        const mergedSections = [...loadedConfig.sections];

        // Add any missing sections from DEFAULT_HOME_CONFIG
        DEFAULT_HOME_CONFIG.sections.forEach(defaultSection => {
          if (!mergedSections.find(s => s.id === defaultSection.id)) {
            mergedSections.push(defaultSection);
          }
        });

        const newConfig = { sections: mergedSections };
        
        // Deep compare to prevent unnecessary re-renders
        setConfig(prev => {
          if (deepEqual(prev, newConfig)) return prev;
          return newConfig;
        });
      } else {
        // First time, save default config
        setConfig(prev => deepEqual(prev, DEFAULT_HOME_CONFIG) ? prev : DEFAULT_HOME_CONFIG);
        saveConfig(DEFAULT_HOME_CONFIG, false);
      }
    } catch (error) {
      console.error('Error fetching home config:', error);
      setConfig(prev => deepEqual(prev, DEFAULT_HOME_CONFIG) ? prev : DEFAULT_HOME_CONFIG);
    } finally {
      setLoading(false);
      mountedRef.current = true;
    }
  }, []);

  const saveConfig = async (newConfig: HomeConfig, showToast = true) => {
    try {
      // Optimistic update
      setConfig(newConfig);

      const { error } = await supabase
        .from('home_content')
        .upsert({
          section_key: 'layout_config',
          content: newConfig as unknown as Record<string, any>,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (error) throw error;
      
      if (showToast) toast.success('Configuração da Home salva com sucesso!');
    } catch (error) {
      console.error('Error saving home config:', error);
      if (showToast) toast.error('Erro ao salvar configuração.');
      // Revert fetching on error? Ideally yes, but for now simple log
    }
  };

  const updateSection = (id: string, updates: Partial<SectionConfig>) => {
    const newSections = config.sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    );
    saveConfig({ sections: newSections });
  };

  const reorderSections = (newSections: SectionConfig[]) => {
    saveConfig({ sections: newSections });
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    saveConfig,
    updateSection,
    reorderSections,
    fetchConfig
  };
};
