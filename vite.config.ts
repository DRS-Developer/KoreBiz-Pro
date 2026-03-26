import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false, // Production: no sourcemaps for security/size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React & State (Critical Path)
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          // UI Components (Critical Path)
          ui: ['lucide-react', 'clsx', 'tailwind-merge', 'sonner'],
          // Utils (Critical Path)
          utils: ['date-fns', 'uuid'],
          
          // --- Non-Critical / Lazy Loaded ---
          
          // Heavy Map library (Only needed in Contact/Footer)
          maps: ['leaflet', 'react-leaflet'],
          // Animation library (Can be deferred)
          animation: ['framer-motion'],
          // Supabase Client (Lazy loaded via chunks)
          supabase: ['@supabase/supabase-js'],
          
          // --- Admin Exclusives (Should never block Home) ---
          
          editor: [
            '@tiptap/react', 
            '@tiptap/starter-kit', 
            '@tiptap/extension-image', 
            '@tiptap/extension-link', 
            '@tiptap/extension-placeholder', 
            '@tiptap/extension-text-align'
          ],
          admin: [
            'react-dropzone', 
            'react-easy-crop', 
            'react-advanced-cropper', 
            '@dnd-kit/core', 
            '@dnd-kit/sortable', 
            '@dnd-kit/utilities',
            'react-filerobot-image-editor' // Massive library, must be isolated
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Extrair a URL da Hero image a partir do JSON estático gerado pelo build
        let preloadTag = '';
        try {
          const dbPath = path.resolve(__dirname, 'public/static-db/site_settings.json');
          if (fs.existsSync(dbPath)) {
              const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
              if (data && data.length > 0 && data[0].image_settings?.banner_url) {
                const bannerUrl = data[0].image_settings.banner_url;
                
                // Formatar para Supabase CDN se aplicável (assumindo Cloudflare ou Supabase)
                // Para simplificar no LCP base:
                const width = 1200;
                const quality = 80;
                
                // Injetar o state do Hero diretamente no HTML para o Zustand não fazer fetch extra
                const heroDataScript = `\n    <script id="hero-bootstrap">window.HERO_DATA = { homeHero: { background_image: "${bannerUrl}" } };</script>`;
                preloadTag += heroDataScript;
                
                // Se Cloudflare estiver ativo no build
                if (process.env.VITE_ENABLE_CLOUDFLARE_IMAGES === 'true') {
                  // Correção Cloudflare URL: Cloudflare não requer encodeURIComponent na URL inteira a menos que passe como query param.
                  // O formato padrão do Supabase com cdn-cgi é apenas concatenar a URL limpa (sem query strings problemáticas)
                  const cleanUrl = bannerUrl.split('?')[0];
                  const cfUrl = `https://${process.env.VITE_CLOUDFLARE_DOMAIN}/cdn-cgi/image/width=${width},quality=${quality},fit=cover,format=auto/${cleanUrl}`;
                  preloadTag += `\n    <link rel="preload" as="image" href="${cfUrl}" fetchpriority="high" />`;
                } else {
                  // Fallback para original ou Render URL do Supabase
                  const renderUrl = bannerUrl.replace('/object/public/', '/render/image/public/');
                  const finalUrl = `${renderUrl}?width=${width}&quality=${quality}&resize=cover&format=webp`;
                  preloadTag += `\n    <link rel="preload" as="image" href="${finalUrl}" fetchpriority="high" />`;
                }
              }
            }
        } catch (e) {
          console.error('Falha ao injetar preload LCP no build:', e);
        }
        
        return html.replace(
          '<!-- Preconnect to Supabase Storage -->',
          `<!-- Preconnect to Supabase Storage -->${preloadTag}`
        );
      },
    },
    VitePWA({
      registerType: 'autoUpdate', // Updates silently in background
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'KoreBiz-Pro',
        short_name: 'KoreBiz-Pro',
        description: 'Soluções Inteligentes em Instalações e Manutenção',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'], // Precache critical assets
        cleanupOutdatedCaches: true, // Delete old caches (v1, v2...)
        clientsClaim: true, // Take control immediately
        skipWaiting: true, // Activate new SW immediately
        runtimeCaching: [
          // 1. Images (Supabase Storage) - Cache First, Long TTL
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/media\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'img-cache-v1',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 2. Rendered Images (Supabase)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/render\/image\/public\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'img-render-v1',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 3. API Data (Supabase REST) - Stale While Revalidate (Offline First feel)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-data-v1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 Week offline capability
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 4. External Fonts (Google Fonts)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 5. External Image Placeholders (placehold.co)
          {
            urlPattern: /^https:\/\/placehold\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'placehold-co-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
