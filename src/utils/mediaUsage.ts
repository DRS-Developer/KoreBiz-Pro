import { supabase } from '../lib/supabase';

export interface MediaUsage {
  id: string;
  type: 'service' | 'portfolio' | 'page' | 'setting' | 'partner';
  title: string;
  field: string;
}

// Helper to normalize URLs for comparison
// Removes query parameters and decodes URI components
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  try {
    // Handle relative URLs or full URLs
    const urlToParse = url.startsWith('http') ? url : `https://example.com${url.startsWith('/') ? '' : '/'}${url}`;
    const urlObj = new URL(urlToParse);
    
    // We only care about the path, decoded
    // If it was a full URL, we might want to keep origin, but for media files hosted on same bucket, path is usually enough unique identifier
    // BUT, let's keep it safe and return origin + pathname if it was absolute, or just pathname if relative.
    
    // Actually, simpler approach: just strip query params and decode
    const cleanUrl = url.split('?')[0];
    return decodeURIComponent(cleanUrl);
  } catch (e) {
    console.warn('Error normalizing URL:', url, e);
    return url;
  }
};

export const checkMediaUsage = async (): Promise<Record<string, MediaUsage[]>> => {
  const usageMap: Record<string, MediaUsage[]> = {};
  
  console.log('[MediaUsage] Starting usage check...');

  const addUsage = (rawUrl: string, usage: MediaUsage) => {
    if (!rawUrl) return;
    
    const normalized = normalizeUrl(rawUrl);
    
    if (!usageMap[normalized]) {
      usageMap[normalized] = [];
    }
    
    // Avoid duplicates
    const exists = usageMap[normalized].some(u => 
      u.id === usage.id && u.type === usage.type && u.field === usage.field
    );
    
    if (!exists) {
      usageMap[normalized].push(usage);
    }
  };

  try {
    // 1. Check Services
    const { data: services, error: sErr } = await supabase.from('services').select('id, title, image_url, full_description');
    if (sErr) console.error('Error fetching services:', sErr);
    
    services?.forEach(svc => {
      if (svc.image_url) {
          addUsage(svc.image_url, { id: svc.id, type: 'service', title: svc.title, field: 'image_url' });
      }
      
      // Extract images from rich text (full_description)
      const richTextImages = svc.full_description?.match(/src="([^"]+)"/g);
      richTextImages?.forEach(img => {
        const url = img.match(/src="([^"]+)"/)?.[1];
        if (url) addUsage(url, { id: svc.id, type: 'service', title: svc.title, field: 'full_description' });
      });
    });
    console.log(`[MediaUsage] Checked ${services?.length || 0} services`);

    // 2. Check Portfolio
    const { data: portfolios, error: pErr } = await supabase.from('portfolios').select('id, title, image_url, gallery_images, description');
    if (pErr) console.error('Error fetching portfolios:', pErr);

    portfolios?.forEach(item => {
      if (item.image_url) {
        addUsage(item.image_url, { id: item.id, type: 'portfolio', title: item.title, field: 'image_url' });
      }
      
      // Gallery
      if (Array.isArray(item.gallery_images)) {
        item.gallery_images.forEach((img: any) => {
          if (img.url) addUsage(img.url, { id: item.id, type: 'portfolio', title: item.title, field: 'gallery' });
        });
      }
      // Rich Text
      const richTextImages = item.description?.match(/src="([^"]+)"/g);
      richTextImages?.forEach(img => {
        const url = img.match(/src="([^"]+)"/)?.[1];
        if (url) addUsage(url, { id: item.id, type: 'portfolio', title: item.title, field: 'description' });
      });
    });
    console.log(`[MediaUsage] Checked ${portfolios?.length || 0} portfolios`);

    // 3. Check Pages
    const { data: pages, error: pgErr } = await supabase.from('pages').select('id, title, featured_image, content');
    if (pgErr) {
        const isAbort = (pgErr as any).message?.includes('AbortError') || (pgErr as any).name === 'AbortError';
        if (!isAbort) console.error('Error fetching pages:', pgErr);
    }

    pages?.forEach(page => {
      if (page.featured_image) {
        addUsage(page.featured_image, { id: page.id, type: 'page', title: page.title, field: 'featured_image' });
      }
      
      const richTextImages = typeof page.content === 'string' 
        ? page.content.match(/src="([^"]+)"/g)
        : JSON.stringify(page.content).match(/src="([^"]+)"/g);
        
      richTextImages?.forEach(img => {
        const url = img.match(/src="([^"]+)"/)?.[1];
        if (url) addUsage(url, { id: page.id, type: 'page', title: page.title, field: 'content' });
      });
    });
    console.log(`[MediaUsage] Checked ${pages?.length || 0} pages`);

    // 4. Check Site Settings
    try {
        const { data: settings, error: stErr } = await supabase.from('site_settings').select('site_name, logo_url, id, image_settings').single();
        
        if (stErr && stErr.code !== 'PGRST116') {
             const isAbort = (stErr as any).message?.includes('AbortError') || (stErr as any).name === 'AbortError';
             if (!isAbort) console.error('Error fetching settings:', stErr); 
        }

        if (settings) {
            if (settings.logo_url) {
                addUsage(settings.logo_url, { id: settings.id, type: 'setting', title: 'Configurações Gerais', field: 'logo_url' });
            }
            
            const imgSettings = settings.image_settings as any;
            if (imgSettings?.banner_url) {
                addUsage(imgSettings.banner_url, { id: settings.id, type: 'setting', title: 'Configurações Gerais', field: 'banner_url' });
            }
        }
        console.log(`[MediaUsage] Checked settings`);
    } catch (err) {
        console.warn('Error checking settings table (might not exist yet):', err);
    }
    
    // 5. Check Partners
    const { data: partners, error: ptErr } = await supabase.from('partners').select('id, name, logo_url');
    if (ptErr) {
        const isAbort = (ptErr as any).message?.includes('AbortError') || (ptErr as any).name === 'AbortError';
        if (!isAbort) console.error('Error fetching partners:', ptErr);
    }

    partners?.forEach(p => {
        if (p.logo_url) {
            addUsage(p.logo_url, { id: p.id, type: 'partner', title: p.name, field: 'logo_url' });
        }
    });
    console.log(`[MediaUsage] Checked ${partners?.length || 0} partners`);

  } catch (error) {
    console.error('Error checking media usage:', error);
  }

  return usageMap;
};
