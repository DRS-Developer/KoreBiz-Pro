import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de ambiente e caminhos
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public/static-db');

// Garantir que diretório existe
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('📦 Iniciando geração de dados estáticos (Static DB)...');

async function fetchAndSave(key, table, select = '*', order = null, filters = {}) {
  try {
    console.log(`   Scraping [${table}] -> ${key}.json...`);
    let query = supabase.from(table).select(select);

    // Aplicar filtros
    Object.entries(filters).forEach(([col, val]) => {
      query = query.eq(col, val);
    });

    // Aplicar ordenação
    if (order) {
      query = query.order(order.column, { ascending: order.ascending });
    }

    const { data, error } = await query;

    if (error) throw error;

    const filePath = path.join(PUBLIC_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   ✅ Salvo: ${filePath} (${data.length} itens)`);
  } catch (err) {
    console.error(`   ❌ Falha ao buscar ${table}:`, err.message);
    // Não falhar o build inteiro, apenas logar o erro, pois o site pode funcionar sem isso (apenas sem fallback)
  }
}

async function generate() {
  // 1. Configurações do Site
  await fetchAndSave('site_settings', 'site_settings');

  // 2. Portfólio (Apenas publicados)
  await fetchAndSave(
    'portfolio_list', 
    'portfolios', 
    'id, slug, title, short_description, description, image_url, category, location, published, created_at', 
    { column: 'created_at', ascending: false }, 
    { published: true }
  );

  // 3. Serviços (Apenas publicados e ordenados)
  await fetchAndSave(
    'services_list', 
    'services', 
    'id, title, slug, short_description, image_url, icon, category, order, published', 
    { column: 'order', ascending: true }, 
    { published: true }
  );

  // 4. Páginas Institucionais (Apenas publicadas)
  await fetchAndSave(
    'pages_list', 
    'pages', 
    'id, title, slug, published, updated_at', 
    { column: 'title', ascending: true }, 
    { published: true }
  );

  // 5. Parceiros (Se houver tabela, assumindo estrutura genérica ou omitindo por enquanto)
  // await fetchAndSave('partners_list', 'partners', ...); 

  console.log('🏁 Geração de Static DB concluída.');
}

generate();
