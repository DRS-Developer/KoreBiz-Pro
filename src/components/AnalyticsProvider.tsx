import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ReactGA from 'react-ga4';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { settings } = useSiteSettings();
  const location = useLocation();
  const analytics = settings?.analytics_settings as any;

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
