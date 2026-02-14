import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  type = 'website',
  url 
}) => {
  const { settings } = useSiteSettings();
  
  const siteName = settings?.site_name || 'ArsInstalações';
  const defaultDescription = settings?.site_description || 'Soluções completas em instalações elétricas, manutenção predial e automação.';
  const defaultImage = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop'; // Fallback image
  
  // Dynamic suffix from settings or default
  const titleSuffix = settings?.seo_title_suffix || ` | ${siteName}`;
  const finalTitle = title ? `${title}${titleSuffix}` : siteName;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url || window.location.href;
  const keywords = settings?.seo_keywords || 'instalações, elétrica, manutenção, residencial, industrial';
  
  // Indexing Control
  const isIndexingEnabled = settings?.indexing_enabled !== false; // Default to true if undefined

  // Structured Data (JSON-LD) for LocalBusiness
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteName,
    "image": finalImage,
    "url": "https://arsinstalacoes.com.br",
    "telephone": settings?.contact_phone || "",
    "email": settings?.contact_email || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.address || "São Paulo - SP",
      "addressLocality": "São Paulo",
      "addressRegion": "SP",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -23.55052, // Default SP coordinates, ideally should be dynamic too
      "longitude": -46.633309
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    },
    "sameAs": [
      (settings?.social_links as any)?.facebook,
      (settings?.social_links as any)?.instagram,
      (settings?.social_links as any)?.linkedin
    ].filter(Boolean)
  };

  return (
    <Helmet>
      {/* HTML Attributes */}
      <html lang="pt-BR" />

      {/* Standard Metadata */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Indexing Control */}
      {!isIndexingEnabled && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      {isIndexingEnabled && (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
