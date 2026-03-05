import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://korebiz-pro.com.br'; // Change this to your production domain

const staticPages = [
  '',
  '/empresa',
  '/servicos',
  '/portfolio',
  '/contato',
  '/areas-de-atuacao',
  '/parceiros',
  '/politica-privacidade',
  '/termos-uso'
];

async function generateSitemap() {
  console.log('Generating sitemap...');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Static Pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  // 2. Dynamic Services
  const { data: services } = await supabase
    .from('services')
    .select('slug, updated_at')
    .eq('published', true);

  if (services) {
    services.forEach(service => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/servicos/${service.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(service.updated_at).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });
  }

  // 3. Dynamic Portfolio
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('slug, updated_at')
    .eq('published', true);

  if (portfolios) {
    portfolios.forEach(project => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/portfolio/${project.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(project.updated_at).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
  }

  // 4. Dynamic Areas of Expertise (Static list but good to be explicit if they were DB driven)
  const areas = [
    'instalacoes-eletricas',
    'manutencao-predial',
    'instalacoes-hidraulicas',
    'combate-a-incendio',
    'automacao',
    'climatizacao'
  ];

  areas.forEach(slug => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/areas-de-atuacao/${slug}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  // Write to public/sitemap.xml
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap().catch(err => {
  console.error('❌ Failed to generate sitemap:', err);
  process.exit(1);
});
