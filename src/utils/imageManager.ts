import { IMAGE_PROFILES, ImageRole, ManagedImageResult, PageKey } from '../config/imageProfiles';

// Strict Security Policy: Only allow local images and Supabase Storage
// const ALLOWED_ORIGINS = [
//   'self', // Local relative paths
//   '.supabase.co' // Supabase domains
// ];


// Audit Logger for Image Replacements
export const logImageReplacement = (context: string, reason: string, oldSrc?: string, newSrc?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'security',
    action: 'block',
    context,
    reason,
    oldSrc: oldSrc || 'none',
    newSrc: newSrc || 'default',
    violation: 'EXTERNAL_DOMAIN'
  };
  
  // Log to console has been disabled to reduce noise in production
  // console.warn(`[SecurityAudit] ⚠️ External image blocked: ${oldSrc}`);
  
  // Optional: Store in localStorage for temporary persistence/debugging
  try {
    const logs = JSON.parse(localStorage.getItem('image_security_audit') || '[]');
    logs.push(logEntry);
    // Keep last 100 logs
    if (logs.length > 100) logs.shift();
    localStorage.setItem('image_security_audit', JSON.stringify(logs));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Validates if a URL is allowed by the security policy.
 * Policy:
 * 1. Must be a relative path (starts with /)
 * 2. OR must be a valid Supabase Storage URL
 * 3. OR must be a valid Cloudflare Images URL (if configured)
 */
export const isAllowedImageSource = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // 1. Allow local relative paths
  if (url.startsWith('/')) return true;
  
  // 2. Allow Supabase Storage URLs
  const supabaseRegex = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/(object|render)\/(image\/)?public\//i;
  if (supabaseRegex.test(url)) return true;

  // 3. Allow Cloudflare CDN URLs (assuming standard custom domain or workers.dev setup for image delivery)
  // Example: https://cdn.korebiz.com.br/cdn-cgi/imagedelivery/...
  const cloudflareRegex = /^https:\/\/[a-zA-Z0-9.-]+\/cdn-cgi\/imagedelivery\//i;
  if (cloudflareRegex.test(url)) return true;

  return false;
};

// Deprecated: Use isAllowedImageSource instead
export const isSupabasePublicUrl = (url: string) => {
  if (!url) return false;
  return /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/(object|render)\/(image\/)?public\//i.test(url);
};

// Check if URL is configured for Cloudflare Image Resizing
const isCloudflareDelivery = (url: string) => {
  if (!url) return false;
  // This matches standard Cloudflare Image Delivery or Custom Domain with CF proxy
  // e.g. https://cdn.example.com/cdn-cgi/imagedelivery/<account_hash>/<image_id>/<variant_name>
  return url.includes('/cdn-cgi/imagedelivery/');
};

// Configuration for Cloudflare provider usage
const CLOUDFLARE_ENABLED = import.meta.env.VITE_ENABLE_CLOUDFLARE_IMAGES === 'true';
const CLOUDFLARE_DOMAIN = import.meta.env.VITE_CLOUDFLARE_DOMAIN; // e.g. "cdn.korebiz.com.br"

// Helper to construct Cloudflare URL
const buildCloudflareUrl = (originalUrl: string, width: number, height: number, quality: number, resize: string) => {
  // If we already have a Cloudflare URL, just adjust its variant/params
  if (isCloudflareDelivery(originalUrl)) {
    // Basic variant substitution logic could go here
    return originalUrl; 
  }

  // If we want to proxy a Supabase URL through Cloudflare Image Resizing:
  // Format: https://<ZONE>/cdn-cgi/image/width=X,height=Y,quality=Z,fit=cover/<ORIGINAL_URL>
  if (CLOUDFLARE_ENABLED && CLOUDFLARE_DOMAIN) {
    const fit = resize === 'contain' ? 'contain' : 'cover';
    // Cloudflare uses 'format=auto' by default when using cdn-cgi/image, which handles AVIF/WebP automatically
    // based on the Accept header of the browser.
    return `https://${CLOUDFLARE_DOMAIN}/cdn-cgi/image/width=${width},height=${height},quality=${quality},fit=${fit},format=auto/${encodeURIComponent(originalUrl)}`;
  }

  return null;
};

// Map page/role to local SVG default
const getLocalDefaultPath = (page: PageKey, role: ImageRole): string => {
  if (role === 'hero') return '/defaults/hero.svg';
  
  if (page.startsWith('servicos')) return '/defaults/service.svg';
  if (page.startsWith('portfolio')) return '/defaults/portfolio.svg';
  if (page === 'parceiros') return '/defaults/partner.svg';
  
  if (role === 'logo') return '/defaults/avatar.svg';
  
  return '/defaults/general.svg';
};

const withTransformParams = (url: string, width: number, height: number, quality = 80, resize = 'cover', format = 'origin') => {
  // If it's a local SVG, don't apply transform params
  if (url.startsWith('/defaults/') || url.endsWith('.svg')) {
    return url;
  }

  // 1. Try Cloudflare Provider First (if enabled and applicable)
  // Cloudflare handles formats automatically, so we don't need to generate specific 'webp' or 'avif' URLs
  // when using Cloudflare. We just return the CF URL for all format requests if we are using it.
  const cfUrl = buildCloudflareUrl(url, width, height, quality, resize);
  if (cfUrl) {
    return cfUrl;
  }

  // 2. Fallback to Supabase Provider
  // If not Supabase (and not local, though local usually falls into SVG check above), return as is
  if (!isAllowedImageSource(url) || !url.includes('.supabase.co')) {
    return url;
  }

  // Check if it's already a render URL
  if (url.includes('/render/image/public')) {
    return `${url}?width=${width}&height=${height}&quality=${quality}&resize=${resize}&format=${format}`;
  }

  // Convert standard URL to render URL
  // Current URL: .../storage/v1/object/public/...
  // New URL: .../storage/v1/render/image/public/...
  
  // Clean up any existing query string to avoid malformed URLs like ?t=123?width=...
  const [baseUrl] = url.split('?');
  const renderUrl = baseUrl.replace('/object/public/', '/render/image/public/');
  return `${renderUrl}?width=${width}&height=${height}&quality=${quality}&resize=${resize}&format=${format}`;
};

export const resolveManagedImage = (page: PageKey, role: ImageRole, src?: string | null): ManagedImageResult => {
  const profile = IMAGE_PROFILES[page]?.[role] || IMAGE_PROFILES['home']['card'];
  
  let base = src;

  // 1. Check if source exists
  if (!base) {
    base = getLocalDefaultPath(page, role);
    logImageReplacement(`${page}:${role}`, 'Missing source', undefined, base);
  } 
  // 2. Strict Security Check: Validate Source against Whitelist
  else if (!isAllowedImageSource(base)) {
    const old = base;
    base = getLocalDefaultPath(page, role);
    logImageReplacement(`${page}:${role}`, 'Security Policy Violation: External URL rejected', old, base);
  }
  
  // 3. Apply transformations
  // If it's a default SVG or local path, withTransformParams will return it as is (mostly).
  const original = withTransformParams(base, profile.width, profile.height, profile.quality, profile.resize, 'origin');
  let webp = withTransformParams(base, profile.width, profile.height, profile.quality, profile.resize, 'webp');
  let avif = withTransformParams(base, profile.width, profile.height, profile.quality, profile.resize, 'avif');

  // If the transformation didn't change the URL (e.g. not a Supabase URL) and it's not explicitly a webp/avif file,
  // we shouldn't claim it's a webp/avif.
  if (webp === original && !webp.toLowerCase().endsWith('.webp')) {
    webp = undefined as any; 
  }
  if (avif === original && !avif.toLowerCase().endsWith('.avif')) {
    avif = undefined as any; 
  }

  // Generate srcset for responsive images (400w, 800w, 1200w, and optionally 1600w for heroes)
  // Only apply srcset if it's a transformable Supabase/Cloudflare URL
  let srcset;
  if (original !== base) {
    const isHero = role === 'hero';
    const breakpoints = isHero ? [400, 800, 1200, 1600] : [400, 800, 1200];
    
    // If it's Cloudflare, we only need one srcset because format is 'auto' (content-negotiated)
    const isCF = isCloudflareDelivery(original);

    // Helper to generate a single srcset string for a specific format
    const generateSrcSetString = (format: string) => {
      return breakpoints.map(w => {
        const h = Math.round(w * (profile.height / profile.width));
        const url = withTransformParams(base, w, h, profile.quality, profile.resize, format);
        return `${url} ${w}w`;
      }).join(', ');
    };

    if (isCF) {
      // Cloudflare handles AVIF/WebP automatically based on Accept headers, 
      // so we just generate the original srcset and leave webp/avif undefined.
      // This forces the <picture> tag to just use the standard <img srcset="...">
      // and let the CDN do the magic.
      srcset = {
        original: generateSrcSetString('origin')
      };
      // Explicitly clear webp/avif since CF does it implicitly
      webp = undefined as any;
      avif = undefined as any;
    } else {
      // Supabase fallback: Generate full <picture> sources
      srcset = {
        original: generateSrcSetString('origin'),
        webp: webp ? generateSrcSetString('webp') : undefined,
        avif: avif ? generateSrcSetString('avif') : undefined,
      };
    }
  }

  return { original, webp, avif, srcset };
};

export const resolveDefaultImageByRole = (role: ImageRole, page: PageKey = 'home'): ManagedImageResult => {
  const path = getLocalDefaultPath(page, role);
  return { original: path, webp: undefined, avif: undefined };
};
