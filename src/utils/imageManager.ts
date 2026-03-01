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
 */
export const isAllowedImageSource = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // 1. Allow local relative paths
  if (url.startsWith('/')) return true;
  
  // 2. Allow Supabase Storage URLs
  // Regex strictness: https protocol, subdomains allowed, supabase.co domain, storage/v1 path
  const supabaseRegex = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/(object|render)\/(image\/)?public\//i;
  return supabaseRegex.test(url);
};

// Deprecated: Use isAllowedImageSource instead, but kept for compatibility with existing code if any
export const isSupabasePublicUrl = (url: string) => {
  if (!url) return false;
  return /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/(object|render)\/(image\/)?public\//i.test(url);
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

  // If not Supabase (and not local, though local usually falls into SVG check above), return as is
  // But wait, if it's local non-SVG (e.g. /images/banner.jpg), we can't transform it via Supabase unless we use a resizer.
  // For now, we assume local images are static assets served as is.
  if (!isSupabasePublicUrl(url)) {
    return url;
  }

  // Check if it's a render URL (Supabase Image Transformation)
  if (url.includes('/render/image/public')) {
    // It's already a render URL, we might append params if supported, but usually we construct it.
    // For simplicity, if it's a standard storage URL, we append transform.
    // Supabase standard: /storage/v1/object/public/bucket/file
    // Transform: /storage/v1/render/image/public/bucket/file?width=...
    return `${url}?width=${width}&height=${height}&quality=${quality}&resize=${resize}&format=${format}`;
  }
  
  // Convert standard URL to render URL if needed
  // Current URL: .../storage/v1/object/public/...
  // New URL: .../storage/v1/render/image/public/...
  
  const renderUrl = url.replace('/object/public/', '/render/image/public/');
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
  const webp = withTransformParams(base, profile.width, profile.height, profile.quality, profile.resize, 'webp');

  return { original, webp };
};

export const resolveDefaultImageByRole = (role: ImageRole, page: PageKey = 'home'): ManagedImageResult => {
  const path = getLocalDefaultPath(page, role);
  return { original: path, webp: path };
};
