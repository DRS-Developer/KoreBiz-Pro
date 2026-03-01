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
  
  const siteName = settings?.site_name || 'KoreBiz';
  const defaultDescription = settings?.site_description || 'Soluções Inteligentes em Instalações e Manutenção.';
  const defaultImage =
    ((settings?.image_settings as any)?.banner_url as string | undefined) ||
    `${window.location.origin}/defaults/hero.svg`;
  
  // Dynamic suffix from settings or default
  let suffix = settings?.seo_title_suffix || ` | ${siteName}`;

  // Ensure pipe has spaces around it if present
  if (suffix.includes('|')) {
    suffix = suffix.replace(/\s*\|\s*/g, ' | ');
  }

  // Ensure space between title and suffix if needed
  const titleSuffix = suffix;
  // If suffix doesn't start with space, we'll add one in the template string
  // If it does start with space (which it will if it was " | ..."), we don't add another
  const separator = titleSuffix.startsWith(' ') ? '' : ' ';
  
  const finalTitle = title ? `${title}${separator}${titleSuffix}` : siteName;
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
    "url": "https://korebiz.com.br",
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
