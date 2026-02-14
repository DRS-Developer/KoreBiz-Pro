import { useGlobalStore } from '../stores/useGlobalStore';
import { Database } from '../types/database.types';
import { formatPhoneDisplay, formatWhatsAppLink } from '../utils/formatters';
import { supabase } from '../lib/supabase';

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

export interface UseSiteSettingsResult {
  settings: SiteSettings | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  
  // Formatted Values
  displayAddress: string;
  displayPhone: string;
  whatsappLink: string;
}

export function useSiteSettings(): UseSiteSettingsResult {
  const { settings, setSettings } = useGlobalStore();
  
  // Refetch implementation (updates global store)
  const refetch = async () => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();
        
        if (error) throw error;
        if (data) setSettings(data);
    } catch (err) {
        console.error('Error refreshing settings:', err);
    }
  };

  // Extract WhatsApp from social_links JSONB safely
  const getWhatsappNumber = (): string | null => {
    if (!settings?.social_links || typeof settings.social_links !== 'object') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links = settings.social_links as any;
    return links.whatsapp || null;
  };

  const whatsappNumber = getWhatsappNumber();
  
  // Use specific whatsapp field if available, otherwise fallback to contact_phone
  const whatsappLink = formatWhatsAppLink(whatsappNumber || settings?.contact_phone);

  // Fallback values during hydration to avoid flash of "Not Configured"
  const isHydrated = !!settings;
  const address = isHydrated ? (settings.address || 'Endereço não configurado') : 'Carregando...';
  // If we have settings, use them. If not, return empty string (or skeleton placeholder) instead of formatted "undefined"
  const phone = isHydrated ? formatPhoneDisplay(settings.contact_phone) : ''; 

  return {
    settings,
    loading: !isHydrated, 
    error: null,
    refetch,
    displayAddress: address,
    displayPhone: phone,
    whatsappLink
  };
}