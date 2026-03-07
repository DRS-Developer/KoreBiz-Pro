import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ReactGA from 'react-ga4';
import { toast } from 'sonner';
import { useGlobalStore } from '../stores/useGlobalStore';
import { startImagePerfObserver } from '../utils/imagePerf';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { settings } = useSiteSettings();
  const location = useLocation();
  const analytics = settings?.analytics_settings as any;
  const {
    isHydrated,
    services,
    portfolio,
    pages,
  } = useGlobalStore();
  const rebuildScheduledRef = useRef(false);
  const reloadCooldownRef = useRef<number>(0);
  const canReloadRef = useRef(true);
  const COOLDOWN_MS = 5 * 60 * 1000;
  const isDev = !!import.meta.env.DEV;

  useEffect(() => {
    const until = Number(sessionStorage.getItem('ars:rebuildCooldownUntil') || '0');
    reloadCooldownRef.current = until;
  }, []);

  const canAttemptReload = () => {
    if (isDev) return false;
    const now = Date.now();
    if (now < reloadCooldownRef.current) return false;
    if (!canReloadRef.current) return false;
    return true;
  };

  const setReloadCooldown = () => {
    const until = Date.now() + COOLDOWN_MS;
    reloadCooldownRef.current = until;
    try { sessionStorage.setItem('ars:rebuildCooldownUntil', String(until)); } catch {}
    canReloadRef.current = false;
    setTimeout(() => { canReloadRef.current = true; }, COOLDOWN_MS);
  };

  const attemptRebuild = () => {
    if (!canAttemptReload()) return;
    rebuildScheduledRef.current = true;
    setReloadCooldown();
      const win = window as any;
      if (win.caches) {
        win.caches.keys().then((names: string[]) => {
          Promise.all(names.map((n: string) => win.caches.delete(n))).finally(() => {
            window.location.reload();
          });
        });
      } else {
        window.location.reload();
      }
  };

  // Initialize GA4
  useEffect(() => {
    if (analytics?.google_analytics_id) {
      ReactGA.initialize(analytics.google_analytics_id);
    }
  }, [analytics?.google_analytics_id]);

  // Track Page Views (GA4)
  useEffect(() => {
    if (analytics?.google_analytics_id) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location, analytics?.google_analytics_id]);

  // Global error and rejection monitoring
  useEffect(() => {
    startImagePerfObserver();
    const onWindowError = (event: ErrorEvent) => {
      // Ignora erros comuns de desenvolvimento/extensões
      if (event?.filename?.includes('chrome-extension')) return;
      
      // const _msg = event?.message || 'Erro desconhecido';
      console.error('[Monitor] window.onerror', event);
      // toast.error(msg); // Desativado para evitar spam visual em produção
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = (event?.reason && (event.reason.message || String(event.reason))) || 'Rejeição não tratada';

      // Ignore Service Worker errors in development or preview mode (InvalidStateError)
      if (typeof reason === 'string' && (
        reason.includes('ServiceWorkerRegistration') || 
        reason.includes('InvalidStateError') ||
        reason.includes('The document is in an invalid state')
      )) {
        console.warn('[Monitor] Ignored SW Error:', reason);
        return;
      }

      console.error('[Monitor] unhandledrejection', event);
      // toast.error(String(reason)); // Disable global error toast to avoid spamming user
    };
    const onResourceError = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        const src = (target as HTMLImageElement).src || '';
        console.warn('[Monitor] image error (silenciado)', src);
        return;
      }
    };
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onResourceError, true);
    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onResourceError, true);
    };
  }, []);

  // Rebuild detection when hydrated but no content present
  useEffect(() => {
    if (!isHydrated || rebuildScheduledRef.current) return;
    const noContent =
      (!services || services.length === 0) &&
      (!portfolio || portfolio.length === 0) &&
      (!pages || pages.length === 0);
    if (noContent) {
      const timer = window.setTimeout(() => {
        const state = useGlobalStore.getState();
        const stillNoContent =
          (!state.services || state.services.length === 0) &&
          (!state.portfolio || state.portfolio.length === 0) &&
          (!state.pages || state.pages.length === 0);
        if (stillNoContent && !rebuildScheduledRef.current) {
          toast.warning('Dados não carregados após hidratação. Tentando reconstruir...');
          attemptRebuild();
        }
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [isHydrated, services, portfolio, pages]);

  // Inject GTM & Custom Scripts - Refactored for Hydration Safety
  useEffect(() => {
    if (!analytics) return;

    // Use requestIdleCallback or setTimeout to defer injection until after hydration
    const injectScripts = () => {
      // Google Tag Manager
      if (analytics.google_tag_manager_id && !document.getElementById('gtm-script')) {
        const gtmScript = document.createElement('script');
        gtmScript.id = 'gtm-script';
        gtmScript.async = true; // Non-blocking
        gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${analytics.google_tag_manager_id}');`;
        document.head.appendChild(gtmScript);
        
        // NoScript iframe injection handled safely if needed, or skipped for React purity
      }

      // Meta Pixel
      if (analytics.facebook_pixel_id && !document.getElementById('fb-pixel-script')) {
        const pixelScript = document.createElement('script');
        pixelScript.id = 'fb-pixel-script';
        pixelScript.async = true;
        pixelScript.innerHTML = `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${analytics.facebook_pixel_id}');
        fbq('track', 'PageView');`;
        document.head.appendChild(pixelScript);
      }

      // Custom Head Scripts
      if (analytics.custom_head_scripts) {
        try {
          // Simple check to avoid duplication (imperfect but better)
          if (!document.querySelector('meta[name="custom-head-scripts-injected"]')) {
             const range = document.createRange();
             const fragment = range.createContextualFragment(analytics.custom_head_scripts);
             document.head.appendChild(fragment);
             
             const marker = document.createElement('meta');
             marker.name = "custom-head-scripts-injected";
             document.head.appendChild(marker);
          }
        } catch (e) {
          console.error('Error injecting custom head scripts', e);
        }
      }

      // Custom Body Scripts
      if (analytics.custom_body_scripts) {
        try {
           if (!document.querySelector('meta[name="custom-body-scripts-injected"]')) {
              const range = document.createRange();
              const fragment = range.createContextualFragment(analytics.custom_body_scripts);
              document.body.appendChild(fragment);

              const marker = document.createElement('meta');
              marker.name = "custom-body-scripts-injected";
              document.head.appendChild(marker);
           }
        } catch (e) {
          console.error('Error injecting custom body scripts', e);
        }
      }
    };

    // Defer execution
    const timeoutId = setTimeout(injectScripts, 2000); // 2s delay to ensure TTI and Hydration complete

    return () => clearTimeout(timeoutId);

  }, [analytics]);

  return <>{children}</>;
};

// Helper for event tracking
export const trackEvent = (category: string, action: string, label?: string) => {
  // GA4
  if (window.gtag) {
    ReactGA.event({
      category,
      action,
      label
    });
  }
  
  // GTM DataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'custom_event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', action, { category, label });
  }
};

export default AnalyticsProvider;
