# Plano A: Profissionalização Essencial & Admin Organizado

Este plano foca em transformar o sistema em um produto profissional, garantindo conformidade legal, SEO básico e uma experiência de administração organizada.

## 1. Banco de Dados (Supabase)
Criaremos uma nova migração para expandir a tabela `site_settings` e suportar os novos conteúdos dinâmicos:
*   **Páginas Legais**: Colunas `privacy_policy` (texto rico) e `terms_of_use` (texto rico).
*   **SEO Global**: Colunas `seo_keywords` (texto) e `seo_title_suffix` (ex: "| ArsInstalações").
*   **Personalização 404**: Colunas `not_found_title` e `not_found_message`.

## 2. Admin 2.0: Organização por Abas
Vamos refatorar a página de Configurações (`src/pages/Admin/Settings/index.tsx`) para usar um sistema de abas claro, facilitando a gestão:

*   **Aba 1: Geral** (Já existe)
    *   Nome do Site, Logo, Contatos, Redes Sociais.
*   **Aba 2: Aparência & 404** (Novo)
    *   Configuração da mensagem e título da página de "Não Encontrado".
    *   Banner padrão.
*   **Aba 3: SEO & Metadados** (Novo)
    *   Palavras-chave globais.
    *   Sufixo de título padrão.
*   **Aba 4: Páginas Legais** (Novo)
    *   Editor de Texto Rico (`react-quill`) para redigir a "Política de Privacidade".
    *   Editor de Texto Rico para "Termos de Uso".
*   **Aba 5: Cache** (Já existe)
    *   Configurações de performance.

## 3. Frontend (Páginas Públicas)
Implementaremos as páginas que consumirão essas novas configurações:
*   **Página 404 (`NotFound.tsx`)**:
    *   Rota `*` (catch-all) para capturar qualquer link quebrado.
    *   Exibirá o título/mensagem personalizados ou um padrão amigável.
    *   Botão "Voltar para Home".
*   **Páginas Legais**:
    *   Rota `/politica-privacidade`: Exibe o conteúdo HTML salvo no banco.
    *   Rota `/termos-uso`: Exibe o conteúdo HTML salvo no banco.
*   **SEO Global**:
    *   Atualizar o componente `SEO.tsx` para usar as keywords e sufixos do banco.
*   **Arquivos Estáticos**:
    *   Criar `robots.txt` e `sitemap.xml` na pasta pública (versão estática inicial para garantir indexação).

## Passo a Passo da Execução
1.  **Migração**: Criar e rodar SQL para adicionar colunas em `site_settings`.
2.  **Types**: Atualizar tipos do TypeScript (`database.types.ts`).
3.  **Admin**: Implementar a navegação por abas e os novos formulários com `react-quill`.
4.  **Frontend**: Criar as páginas 404, Política e Termos.
5.  **Rotas**: Configurar as novas rotas no `App.tsx`.
6.  **SEO**: Adicionar arquivos estáticos na pasta `public`.

Podemos prosseguir com este plano?