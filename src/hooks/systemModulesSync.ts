export const SYSTEM_MODULES_SYNC_EVENT = 'ars:system-modules-sync';
export const SYSTEM_MODULES_SYNC_KEY = 'ars-system-modules-sync';

export const notifySystemModulesSync = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const stamp = Date.now().toString();
  window.localStorage.setItem(SYSTEM_MODULES_SYNC_KEY, stamp);
  window.dispatchEvent(new Event(SYSTEM_MODULES_SYNC_EVENT));
};
