# Configuração de Servidores MCP - KoreBiz-Pro Platform

Este guia detalha como configurar os servidores MCP para turbinar o assistente Trae com acesso direto ao banco de dados e repositório da plataforma **KoreBiz-Pro**.

## 1. Visão Geral

O sistema utiliza o Model Context Protocol (MCP) para integrar o assistente de IA com:
- **Banco de Dados (Supabase PostgreSQL):** Para validação de esquema e dados.
- **Controle de Versão (GitHub):** Para gestão de issues e PRs.

## 2. Pré-requisitos

- Node.js (v18+)
- Acesso ao dashboard do Supabase do projeto KoreBiz-Pro.
- Token de Acesso Pessoal (PAT) do GitHub.

## 3. Instalação

Execute o comando de setup automatizado:

```bash
npm run mcp:setup
```

Isso instalará as dependências (`@modelcontextprotocol/server-postgres`, `@modelcontextprotocol/server-github`) e criará a estrutura de configuração em `.mcp/`.

## 4. Configuração das Credenciais

Edite o arquivo `.mcp/mcp-config.json` com suas credenciais reais.

### PostgreSQL (Supabase)
Obtenha a string de conexão em: **Supabase Dashboard > Settings > Database > Connection String (URI)**.
Recomendado usar a porta 6543 (Transaction Pooler).

**Formato:**
`postgresql://postgres:[SUA-SENHA]@db.[PROJETO].supabase.co:6543/postgres`

### GitHub
Gere um token em: **GitHub Settings > Developer settings > Personal access tokens**.
Escopos necessários: `repo` (para ler e escrever no repositório).

**Formato do arquivo `.mcp/mcp-config.json`:**

```json
{
  "mcpServers": {
    "supabase-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:SENHA_REAL@db.ID_DO_PROJETO.supabase.co:6543/postgres"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_SEU_TOKEN_REAL_AQUI"
      }
    }
  }
}
```

## 5. Validação

Para testar se a conexão com o Supabase está acessível (nível de rede), execute:

```bash
npm run mcp:validate
```

## 6. Uso no Dia a Dia

Com os MCPs configurados, você pode pedir ao Trae:
- "Verifique se a tabela `services` tem a coluna `price`" (Usa Postgres MCP)
- "Crie uma issue para o bug de login" (Usa GitHub MCP)
- "Liste os últimos PRs abertos" (Usa GitHub MCP)

---
**Nota:** Certifique-se de não comitar o arquivo `mcp-config.json` com suas senhas. O arquivo `.gitignore` já deve estar configurado para ignorar a pasta `.mcp/` ou arquivos sensíveis.
