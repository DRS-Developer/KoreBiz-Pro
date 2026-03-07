# Documentação dos Servidores MCP (Model Context Protocol) - KoreBiz-Pro

Este documento detalha os servidores MCP configurados no ambiente Trae para o projeto KoreBiz-Pro, permitindo que agentes de IA interajam diretamente com serviços externos e ferramentas de desenvolvimento de forma segura e estruturada.

## 1. Visão Geral

O projeto utiliza o **Model Context Protocol (MCP)** para estender as capacidades do assistente de IA, fornecendo acesso a:
- **Banco de Dados:** Consultas diretas e inspeção de esquema no Supabase PostgreSQL.
- **Repositório:** Gestão de issues, pull requests e leitura de arquivos no GitHub.
- **Automação de Navegador:** Testes E2E e scraping com Puppeteer.
- **Depuração:** Inspeção via Chrome DevTools.
- **Gestão de Contexto:** Otimização de contexto via servidor Context7.

---

## 2. Servidores Configurados

### 2.1. Supabase PostgreSQL (`@modelcontextprotocol/server-postgres`)

**Descrição Técnica:**
Permite que o agente execute consultas SQL de leitura (SELECT) e inspeção de esquema no banco de dados do projeto. É fundamental para entender a estrutura de dados, validar migrações e diagnosticar problemas de dados sem precisar sair do editor.

**Entrada e Saída:**
- **Entrada:** Comandos SQL ou solicitações de esquema de tabela.
- **Saída:** Resultados da consulta em formato JSON ou descrição do esquema (DDL).

**Exemplos de Uso Prático:**
- *"Verifique a estrutura da tabela `profiles`."*
- *"Liste os últimos 5 usuários cadastrados para verificar se a flag `is_admin` está correta."*
- *"Verifique se a migração `20260306120000_create_menu_sidebar` foi aplicada consultando a tabela `supabase_migrations`."*

**Casos de Erro Comuns:**
- **Erro:** `ECONNREFUSED` - Verificar credenciais e status do projeto no dashboard do Supabase.
- **Erro:** `permission denied` - Verificar permissões do usuário do banco.

---

### 2.2. GitHub (`@modelcontextprotocol/server-github`)

**Descrição Técnica:**
Fornece integração com a API do GitHub para gerenciar o ciclo de vida do desenvolvimento. Permite criar issues, verificar status de PRs, ler conteúdo de arquivos de outros branches e buscar informações do repositório.

**Entrada e Saída:**
- **Entrada:** Comandos naturais para ações no GitHub (ex: "criar issue", "listar PRs").
- **Saída:** Links para os recursos criados, listas de itens ou conteúdo de arquivos.

**Exemplos de Uso Prático:**
- *"Crie uma issue para rastrear o bug de layout na página de Contato."*
- *"Verifique se há PRs abertos aguardando revisão."*
- *"Leia o conteúdo do arquivo `README.md` da branch `main` para comparar com a versão local."*

---

### 2.3. Puppeteer (`@modelcontextprotocol/server-puppeteer`)

**Descrição Técnica:**
Ferramenta de automação de navegador headless baseada no Google Chrome. Permite realizar testes de interface (E2E), capturar screenshots, gerar PDFs e verificar o comportamento visual da aplicação em diferentes viewports.

**Entrada e Saída:**
- **Entrada:** Scripts de navegação ou comandos de inspeção de página.
- **Saída:** Screenshots, logs do console do navegador, conteúdo HTML renderizado.

**Exemplos de Uso Prático:**
- *"Acesse a página inicial em resolução mobile e tire um screenshot."*
- *"Verifique se o botão de login está visível e clicável após o carregamento da página."*
- *"Simule o fluxo de cadastro de um novo usuário."*

**Casos de Erro Comuns:**
- **Erro:** Timeout ao carregar página - Verificar se o servidor local (`npm run dev`) está rodando.
- **Erro:** Elemento não encontrado - Verificar seletores CSS utilizados.

---

### 2.4. Chrome DevTools MCP

**Descrição Técnica:**
Integração direta com o protocolo Chrome DevTools (CDP). Permite inspecionar a árvore DOM em tempo real, analisar requisições de rede, verificar logs do console e debugar problemas de performance e layout diretamente no navegador controlado.

**Entrada e Saída:**
- **Entrada:** Comandos de inspeção (Network, Console, DOM).
- **Saída:** Dados de performance, headers de requisição, estrutura DOM atual.

**Exemplos de Uso Prático:**
- *"Inspecione as requisições de rede na página de Login para ver se o token JWT está sendo enviado."*
- *"Verifique se há erros de JavaScript no console ao clicar no botão 'Salvar'."*
- *"Analise o tempo de carregamento dos recursos estáticos (LCP, CLS)."*

---

### 2.5. Context7

**Descrição Técnica:**
Servidor especializado em gestão avançada de contexto para o modelo de IA. Otimiza a recuperação de informações relevantes do projeto, gerenciando a memória de curto e longo prazo para garantir que o agente tenha acesso aos detalhes mais pertinentes da tarefa atual sem sobrecarregar a janela de contexto.

**Entrada e Saída:**
- **Entrada:** Consultas contextuais implícitas ou explícitas sobre o estado do projeto.
- **Saída:** Fragmentos de código, documentação e histórico relevantes para a query atual.

**Exemplos de Uso Prático:**
- *"Recupere as últimas decisões de arquitetura sobre o módulo de autenticação."*
- *"Quais foram as últimas alterações feitas no componente `Sidebar`?"*
- *"Liste as dependências circulares detectadas anteriormente."*

---

## 3. Instalação e Manutenção

Para instalar ou atualizar os servidores MCP locais, utilize o script utilitário do projeto:

```bash
npm run mcp:setup
```

Para validar a conexão com o Supabase:

```bash
npm run mcp:validate
```

## 4. Segurança

- **NUNCA** comite o arquivo `.mcp/mcp-config.json` no controle de versão, pois ele contém credenciais sensíveis.
- O arquivo `.gitignore` já está configurado para ignorar a pasta `.mcp/`.
- Use variáveis de ambiente sempre que possível.
