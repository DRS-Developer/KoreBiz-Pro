
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuração para carregar .env em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL;

console.log('--- Validação de Conectividade Supabase (Pré-requisito MCP) ---\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env');
  process.exit(1);
}

console.log(`✅ Credenciais REST encontradas:`);
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 5)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateRestConnection() {
  console.log('\n📡 Testando conexão REST (Leitura da tabela "partners")...');
  try {
    const { data, error } = await supabase.from('partners').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Falha na conexão REST: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Conexão REST estabelecida com sucesso!`);
    console.log(`   Tabela 'partners' acessível.`);
    return true;
  } catch (err) {
    console.error(`❌ Erro inesperado ao conectar:`, err);
    return false;
  }
}

function validateMcpConfig() {
  console.log('\n🔌 Verificando configuração para MCP PostgreSQL...');
  
  if (!dbUrl) {
    console.warn('⚠️ AVISO: Variável DATABASE_URL não encontrada no .env');
    console.warn('   Para usar o MCP PostgreSQL completo, você precisará adicionar a string de conexão direta.');
    console.warn('   Formato esperado: postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres');
    return false;
  }

  if (!dbUrl.startsWith('postgresql://')) {
    console.error('❌ ERRO: DATABASE_URL parece inválida (deve começar com postgresql://)');
    return false;
  }

  console.log('✅ DATABASE_URL encontrada. Pronto para configurar o MCP!');
  return true;
}

async function run() {
  const restSuccess = await validateRestConnection();
  const mcpReady = validateMcpConfig();

  console.log('\n--- Resumo ---');
  if (restSuccess && mcpReady) {
    console.log('🚀 Tudo pronto! Você pode prosseguir com a instalação do servidor MCP.');
  } else if (restSuccess) {
    console.log('⚠️ Conexão básica funciona, mas falta a Connection String para o MCP avançado.');
    console.log('   Siga as instruções em MCP_SETUP.md para obter a string de conexão.');
  } else {
    console.log('❌ Há problemas fundamentais de conexão. Verifique suas credenciais.');
  }
}

run();
