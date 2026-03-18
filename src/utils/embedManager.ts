const DEFAULT_ALLOWED_EMBED_HOSTS = [
  'docs.google.com',
  'forms.gle',
  'form.typeform.com',
  'tally.so',
  'form.jotform.com',
  'forms.hsforms.com',
];

const normalizeHost = (value: string) => value.trim().toLowerCase();

const getAllowedHosts = () => {
  const configured = (import.meta.env.VITE_EMBED_ALLOWED_HOSTS || '')
    .split(',')
    .map(normalizeHost)
    .filter(Boolean);
  if (configured.length > 0) return configured;
  return DEFAULT_ALLOWED_EMBED_HOSTS;
};

export const isAllowedEmbedUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = normalizeHost(parsed.hostname);
    const allowed = getAllowedHosts();
    return allowed.some((candidate: string) => host === candidate || host.endsWith(`.${candidate}`));
  } catch {
    return false;
  }
};

export const sanitizeEmbedUrl = (url: string): string | null => {
  if (!isAllowedEmbedUrl(url)) return null;
  return url.trim();
};
