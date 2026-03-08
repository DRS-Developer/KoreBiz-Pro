import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type ServiceUsageRow = Pick<
  Database['public']['Tables']['services']['Row'],
  'id' | 'title' | 'image_url' | 'full_description'
>;

type PortfolioUsageRow = Pick<
  Database['public']['Tables']['portfolios']['Row'],
  'id' | 'title' | 'image_url' | 'gallery_images' | 'description'
>;

type PageUsageRow = Pick<
  Database['public']['Tables']['pages']['Row'],
  'id' | 'title' | 'featured_image' | 'content'
>;

type SettingsUsageRow = Pick<
  Database['public']['Tables']['site_settings']['Row'],
  'id' | 'logo_url' | 'image_settings'
>;

type PartnerUsageRow = Pick<
  Database['public']['Tables']['partners']['Row'],
  'id' | 'name' | 'logo_url'
>;

type ProfileUsageRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'email' | 'avatar_url'
>;

type HomeContentUsageRow = Pick<
  Database['public']['Tables']['home_content']['Row'],
  'id' | 'section_key' | 'content'
>;

type PracticeAreaUsageRow = Pick<
  Database['public']['Tables']['practice_areas']['Row'],
  'id' | 'title' | 'description' | 'image_url' | 'what_we_offer' | 'methodology'
>;

type AreaUsageRow = Pick<
  Database['public']['Tables']['areas']['Row'],
  'id' | 'title' | 'description' | 'image_url'
>;

export interface MediaUsage {
  id: string;
  type: 'service' | 'portfolio' | 'page' | 'setting' | 'partner' | 'profile' | 'home' | 'practice_area' | 'area';
  title: string;
  field: string;
}

const PUBLIC_MEDIA_MARKER = '/storage/v1/object/public/media/';

export const normalizeUrl = (url: string): string => {
  if (!url) return '';

  const cleanUrl = url.trim().split('?')[0].split('#')[0];
  if (!cleanUrl) return '';

  try {
    const decoded = decodeURIComponent(cleanUrl);
    const markerIndex = decoded.indexOf(PUBLIC_MEDIA_MARKER);
    if (markerIndex >= 0) {
      return decoded.substring(markerIndex + PUBLIC_MEDIA_MARKER.length);
    }
    return decoded;
  } catch (e) {
    console.warn('Error normalizing URL:', cleanUrl, e);
    return cleanUrl;
  }
};

const extractRichTextImages = (value: string): string[] => {
  const matches = value.match(/src=['"]([^'"]+)['"]/g) || [];
  return matches
    .map((img) => img.match(/src=['"]([^'"]+)['"]/)?.[1] || '')
    .filter(Boolean);
};

const isLikelyMediaUrl = (value: string): boolean => {
  if (!value) return false;
  if (value.includes(PUBLIC_MEDIA_MARKER)) return true;
  return /^https?:\/\/.+\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(value);
};

const collectMediaUrls = (value: unknown, collector: Set<string>) => {
  if (!value) return;

  if (typeof value === 'string') {
    extractRichTextImages(value).forEach((url) => collector.add(url));
    if (isLikelyMediaUrl(value)) {
      collector.add(value);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaUrls(item, collector));
    return;
  }

  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectMediaUrls(item, collector));
  }
};

const isAbortError = (error: any) =>
  error?.message?.includes('AbortError') || error?.name === 'AbortError';

export const checkMediaUsage = async (): Promise<Record<string, MediaUsage[]>> => {
  const usageMap: Record<string, MediaUsage[]> = {};
  
  console.log('[MediaUsage] Starting usage check...');

  const addUsage = (rawUrl: string, usage: MediaUsage) => {
    if (!rawUrl) return;
    
    const normalized = normalizeUrl(rawUrl);
    if (!normalized) return;
    
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
    const [
      servicesResult,
      portfoliosResult,
      pagesResult,
      settingsResult,
      partnersResult,
      homeContentResult,
      practiceAreasResult,
      areasResult,
      profilesResult,
    ] = await Promise.all([
      supabase.from('services').select('id, title, image_url, full_description'),
      supabase.from('portfolios').select('id, title, image_url, gallery_images, description'),
      supabase.from('pages').select('id, title, featured_image, content'),
      supabase.from('site_settings').select('site_name, logo_url, id, image_settings, privacy_policy, terms_of_use').single(),
      supabase.from('partners').select('id, name, logo_url'),
      supabase.from('home_content').select('id, section_key, content'),
      supabase.from('practice_areas').select('id, title, description, image_url, what_we_offer, methodology'),
      supabase.from('areas').select('id, title, description, image_url'),
      supabase.from('profiles').select('id, full_name, email, avatar_url'),
    ]);

    if (servicesResult.error && !isAbortError(servicesResult.error)) {
      console.error('Error fetching services:', servicesResult.error);
    }
    const servicesList = ((servicesResult.data as unknown as ServiceUsageRow[] | null) || []);
    servicesList.forEach((svc) => {
      if (svc.image_url) {
        addUsage(svc.image_url, { id: svc.id, type: 'service', title: svc.title, field: 'image_url' });
      }
      extractRichTextImages(svc.full_description || '').forEach((url) => {
        addUsage(url, { id: svc.id, type: 'service', title: svc.title, field: 'full_description' });
      });
    });
    console.log(`[MediaUsage] Checked ${servicesList.length || 0} services`);

    if (portfoliosResult.error && !isAbortError(portfoliosResult.error)) {
      console.error('Error fetching portfolios:', portfoliosResult.error);
    }
    const portfolioList = ((portfoliosResult.data as unknown as PortfolioUsageRow[] | null) || []);
    portfolioList.forEach((item) => {
      if (item.image_url) {
        addUsage(item.image_url, { id: item.id, type: 'portfolio', title: item.title, field: 'image_url' });
      }

      if (Array.isArray(item.gallery_images)) {
        item.gallery_images.forEach((img: any) => {
          if (typeof img === 'string') {
            addUsage(img, { id: item.id, type: 'portfolio', title: item.title, field: 'gallery' });
            return;
          }
          if (img?.url) {
            addUsage(img.url, { id: item.id, type: 'portfolio', title: item.title, field: 'gallery' });
          }
        });
      }

      extractRichTextImages(item.description || '').forEach((url) => {
        addUsage(url, { id: item.id, type: 'portfolio', title: item.title, field: 'description' });
      });
    });
    console.log(`[MediaUsage] Checked ${portfolioList.length || 0} portfolios`);

    if (pagesResult.error && !isAbortError(pagesResult.error)) {
      console.error('Error fetching pages:', pagesResult.error);
    }
    const pageList = ((pagesResult.data as unknown as PageUsageRow[] | null) || []);
    pageList.forEach((page) => {
      if (page.featured_image) {
        addUsage(page.featured_image, { id: page.id, type: 'page', title: page.title, field: 'featured_image' });
      }
      const pageContentUrls = new Set<string>();
      collectMediaUrls(page.content, pageContentUrls);
      pageContentUrls.forEach((url) => {
        addUsage(url, { id: page.id, type: 'page', title: page.title, field: 'content' });
      });
    });
    console.log(`[MediaUsage] Checked ${pageList.length || 0} pages`);

    if (settingsResult.error && settingsResult.error.code !== 'PGRST116' && !isAbortError(settingsResult.error)) {
      console.error('Error fetching settings:', settingsResult.error);
    }
    if (settingsResult.data) {
      const settings = settingsResult.data as unknown as SettingsUsageRow & {
        privacy_policy?: string | null;
        terms_of_use?: string | null;
      };
      if (settings.logo_url) {
        addUsage(settings.logo_url, { id: settings.id, type: 'setting', title: 'Configurações Gerais', field: 'logo_url' });
      }
      const imageSettings = (settings.image_settings as any) || {};
      if (imageSettings?.banner_url) {
        addUsage(imageSettings.banner_url, { id: settings.id, type: 'setting', title: 'Configurações Gerais', field: 'banner_url' });
      }
      extractRichTextImages(settings.privacy_policy || '').forEach((url) => {
        addUsage(url, { id: settings.id, type: 'setting', title: 'Política de Privacidade', field: 'privacy_policy' });
      });
      extractRichTextImages(settings.terms_of_use || '').forEach((url) => {
        addUsage(url, { id: settings.id, type: 'setting', title: 'Termos de Uso', field: 'terms_of_use' });
      });
    }
    console.log('[MediaUsage] Checked settings');

    if (partnersResult.error && !isAbortError(partnersResult.error)) {
      console.error('Error fetching partners:', partnersResult.error);
    }
    const partnerList = ((partnersResult.data as unknown as PartnerUsageRow[] | null) || []);
    partnerList.forEach((partner) => {
      if (partner.logo_url) {
        addUsage(partner.logo_url, { id: partner.id, type: 'partner', title: partner.name, field: 'logo_url' });
      }
    });
    console.log(`[MediaUsage] Checked ${partnerList.length || 0} partners`);

    if (homeContentResult.error && !isAbortError(homeContentResult.error)) {
      console.error('Error fetching home_content:', homeContentResult.error);
    }
    const homeContentList = ((homeContentResult.data as unknown as HomeContentUsageRow[] | null) || []);
    homeContentList.forEach((section) => {
      const sectionUrls = new Set<string>();
      collectMediaUrls(section.content, sectionUrls);
      sectionUrls.forEach((url) => {
        addUsage(url, {
          id: section.id,
          type: 'home',
          title: `Home (${section.section_key})`,
          field: 'content',
        });
      });
    });
    console.log(`[MediaUsage] Checked ${homeContentList.length || 0} home sections`);

    if (practiceAreasResult.error && !isAbortError(practiceAreasResult.error)) {
      console.error('Error fetching practice_areas:', practiceAreasResult.error);
    }
    const practiceAreasList = ((practiceAreasResult.data as unknown as PracticeAreaUsageRow[] | null) || []);
    practiceAreasList.forEach((area) => {
      if (area.image_url) {
        addUsage(area.image_url, {
          id: area.id,
          type: 'practice_area',
          title: area.title,
          field: 'image_url',
        });
      }
      const areaUrls = new Set<string>();
      collectMediaUrls(area.description, areaUrls);
      collectMediaUrls(area.methodology, areaUrls);
      collectMediaUrls(area.what_we_offer, areaUrls);
      areaUrls.forEach((url) => {
        addUsage(url, {
          id: area.id,
          type: 'practice_area',
          title: area.title,
          field: 'content',
        });
      });
    });
    console.log(`[MediaUsage] Checked ${practiceAreasList.length || 0} practice_areas`);

    if (areasResult.error && !isAbortError(areasResult.error)) {
      console.error('Error fetching areas:', areasResult.error);
    }
    const areasList = ((areasResult.data as unknown as AreaUsageRow[] | null) || []);
    areasList.forEach((area) => {
      if (area.image_url) {
        addUsage(area.image_url, {
          id: area.id,
          type: 'area',
          title: area.title,
          field: 'image_url',
        });
      }
      extractRichTextImages(area.description || '').forEach((url) => {
        addUsage(url, {
          id: area.id,
          type: 'area',
          title: area.title,
          field: 'description',
        });
      });
    });
    console.log(`[MediaUsage] Checked ${areasList.length || 0} areas`);

    if (profilesResult.error && !isAbortError(profilesResult.error)) {
      console.error('Error fetching profiles:', profilesResult.error);
    }
    const profilesList = ((profilesResult.data as unknown as ProfileUsageRow[] | null) || []);
    profilesList.forEach((profile) => {
      if (profile.avatar_url) {
        addUsage(profile.avatar_url, {
          id: profile.id,
          type: 'profile',
          title: profile.full_name || profile.email || 'Usuário',
          field: 'avatar_url',
        });
      }
    });
    console.log(`[MediaUsage] Checked ${profilesList.length || 0} profiles`);

  } catch (error) {
    console.error('Error checking media usage:', error);
  }

  return usageMap;
};
