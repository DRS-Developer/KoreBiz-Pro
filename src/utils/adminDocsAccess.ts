const ADMIN_DOCS_ACCESS_KEY = 'admin_docs_access_v1';
const DEFAULT_TTL_MS = 20 * 60 * 1000;

export const grantAdminDocsAccess = (ttlMs = DEFAULT_TTL_MS) => {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + ttlMs;
  window.sessionStorage.setItem(
    ADMIN_DOCS_ACCESS_KEY,
    JSON.stringify({ expiresAt })
  );
};

export const hasAdminDocsAccess = () => {
  if (typeof window === 'undefined') return false;
  const raw = window.sessionStorage.getItem(ADMIN_DOCS_ACCESS_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { expiresAt?: number };
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(ADMIN_DOCS_ACCESS_KEY);
      return false;
    }
    return true;
  } catch {
    window.sessionStorage.removeItem(ADMIN_DOCS_ACCESS_KEY);
    return false;
  }
};
