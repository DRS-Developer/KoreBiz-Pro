
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mcpConfigPath = path.join(__dirname, '../.mcp/mcp-config.json');
const mcpConfigTemplatePath = path.join(__dirname, '../.mcp/mcp-config.example.json');

console.log('📦 Instalando dependências do MCP...');

try {
  // Instala as dependências como devDependencies
  // Usamos stdio: 'inherit' para mostrar o progresso do npm
  execSync('npm install --save-dev @modelcontextprotocol/server-postgres @modelcontextprotocol/server-github', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas com sucesso!');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

console.log('\n⚙️ Configurando arquivo mcp-config.json...');

if (!fs.existsSync(mcpConfigPath)) {
  if (fs.existsSync(mcpConfigTemplatePath)) {
    fs.copyFileSync(mcpConfigTemplatePath, mcpConfigPath);
    console.log('✅ Arquivo mcp-config.json criado a partir do template.');
    console.log('⚠️ IMPORTANTE: Edite .mcp/mcp-config.json com suas credenciais reais!');
  } else {
    // Cria um arquivo básico se o template não existir
    const basicConfig = {
      "mcpServers": {
        "supabase-postgres": {
          "command": "npx",
          "args": [
            "-y",
            "@modelcontextprotocol/server-postgres",
            "postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres"
          ]
        },
        "github": {
          "command": "npx",
          "args": [
            "-y",
            "@modelcontextprotocol/server-github"
          ],
          "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_SEU_TOKEN_AQUI"
          }
        }
      }
    };
    fs.writeFileSync(mcpConfigPath, JSON.stringify(basicConfig, null, 2));
    console.log('✅ Arquivo mcp-config.json criado.');
    console.log('⚠️ IMPORTANTE: Edite .mcp/mcp-config.json com suas credenciais reais!');
  }
} else {
  console.log('ℹ️ Arquivo mcp-config.json já existe. Nenhuma alteração feita.');
}

console.log('\n🚀 Configuração concluída! Leia MCP_SETUP.md para os próximos passos.');
