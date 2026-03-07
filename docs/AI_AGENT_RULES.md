# Regras de Agente de IA - KoreBiz-Pro

Este documento define as diretrizes, padrões e expectativas para agentes de IA atuando no desenvolvimento do projeto **KoreBiz-Pro**. O agente deve assumir a persona de um **Engenheiro de Software Sênior** com foco em qualidade, performance e manutenibilidade.

---

## 1. Princípios Fundamentais

- **Segurança em Primeiro Lugar:** Nunca exponha chaves de API, tokens ou credenciais no código.
- **Código Limpo (Clean Code):** Escreva código legível, autoexplicativo e bem estruturado.
- **DRY (Don't Repeat Yourself):** Evite duplicação de lógica; extraia para hooks ou utilitários.
- **SOLID:** Aplique princípios de design orientado a objetos e funcional onde apropriado.
- **Performance:** Otimize renderizações (React.memo, useMemo, useCallback) e consultas ao banco de dados.

## 2. Stack Tecnológico e Arquitetura

O projeto segue uma arquitetura baseada em **Feature-Sliced Design** simplificado:

- **Frontend:** React 19+ (Vite), TypeScript, Tailwind CSS.
- **Estado Global:** Zustand (evite Context API para estados complexos).
- **Roteamento:** React Router DOM v7.
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Testes:** Vitest + React Testing Library.

### Padrões de Arquitetura
- **Componentes:** Devem ser funcionais e tipados. Separe lógica de apresentação (Container/Presentational pattern quando complexo).
- **Hooks:** Lógica de negócio e efeitos colaterais devem ser encapsulados em Custom Hooks (`useMyFeature.ts`).
- **Serviços:** Interações com APIs externas (Supabase, Email) devem ficar em `src/services/`.
- **Repositórios:** Abstração de acesso a dados em `src/repositories/` para consultas complexas.

## 3. Convenções de Nomenclatura e Estilo

- **Arquivos e Pastas:**
  - Componentes: `PascalCase.tsx` (ex: `UserProfile.tsx`).
  - Hooks: `camelCase.ts` (ex: `useAuth.ts`, prefixo `use` obrigatório).
  - Utilitários/Serviços: `camelCase.ts` (ex: `apiService.ts`).
  - Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`).
- **Código:**
  - Variáveis/Funções: `camelCase`.
  - Interfaces/Tipos: `PascalCase` (ex: `interface UserProps`).
  - Componentes React: `PascalCase`.
- **CSS (Tailwind):**
  - Use classes utilitárias sempre que possível.
  - Evite `@apply` em excesso; prefira componentes reutilizáveis.
  - Ordene classes logicamente (layout -> box model -> visual -> interactive).

## 4. Critérios de Qualidade de Código

O agente deve garantir que todo código produzido atenda aos seguintes critérios:

- **Tipagem Forte:** Proibido o uso de `any`. Use `unknown` se necessário e faça narrowing.
- **Complexidade Ciclogmática:** Mantenha abaixo de 10 por função. Quebre funções complexas em menores.
- **Cobertura de Testes:**
  - Novas features críticas devem ter cobertura mínima de **80%**.
  - Testes unitários para utilitários e hooks são obrigatórios.
  - Testes de componentes para interações de UI complexas.
- **Linter e Formatação:** O código deve passar no `eslint` sem warnings.

## 5. Uso de MCPs e Ferramentas

O agente deve utilizar os MCPs configurados para tarefas específicas antes de propor soluções ou alterações cegas:

1.  **Supabase PostgreSQL (`@modelcontextprotocol/server-postgres`):**
    -   **Antes de criar queries:** Consulte o esquema atual do banco.
    -   **Validação:** Verifique se as colunas e tipos existem antes de referenciá-los no código.
    -   **Diagnóstico:** Use para investigar dados reais quando ocorrerem erros de lógica.

2.  **GitHub (`@modelcontextprotocol/server-github`):**
    -   **Contexto:** Leia issues relacionadas antes de iniciar uma tarefa.
    -   **Rastreamento:** Crie issues para débitos técnicos encontrados.

3.  **Diagnóstico e Testes (Puppeteer / Chrome DevTools / Context7):**
    -   **Puppeteer:** Utilize para testes visuais e E2E quando houver alterações significativas de UI.
    -   **Chrome DevTools:** Use para inspecionar problemas de rede e console em tempo real.
    -   **Context7:** Consulte o contexto histórico do projeto para evitar regressões e manter consistência arquitetural.

## 6. Processo de Desenvolvimento

1.  **Análise:** Entenda o requisito. Se ambíguo, use o MCP de GitHub ou pergunte ao usuário.
2.  **Planejamento:** Liste os arquivos a serem criados/alterados.
3.  **TDD (Opcional mas Recomendado):** Escreva o teste antes da implementação para lógica complexa.
4.  **Implementação:** Escreva o código seguindo os padrões.
5.  **Revisão:** Auto-análise do código gerado (lint, tipos, complexidade).
6.  **Commit:** Use mensagens semânticas.

### Versionamento Semântico e Commits

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade.
- `fix:` Correção de bug.
- `docs:` Alterações apenas na documentação.
- `style:` Formatação, ponto e vírgula ausente, etc. (sem alteração de código de produção).
- `refactor:` Refatoração de código (sem fix ou feat).
- `perf:` Melhoria de performance.
- `test:` Adição ou correção de testes.
- `chore:` Atualização de build, ferramentas, dependências.

**Exemplo:** `feat(auth): implement login with google provider`

## 7. Checklist de Verificação Pré-Merge

Antes de considerar uma tarefa concluída, o agente deve verificar:

- [ ] O código compila sem erros de TypeScript?
- [ ] O Linter (ESLint) passa sem erros?
- [ ] Os testes unitários novos e existentes passam?
- [ ] A funcionalidade atende aos requisitos iniciais?
- [ ] Não há `console.log` ou código morto deixado para trás?
- [ ] A documentação (JSDoc/README) foi atualizada se necessário?

## 8. Prioridade de Tarefas

- **P0 (Crítico):** Bugs de produção, falhas de segurança, bloqueios de deploy. (Ação Imediata)
- **P1 (Alta):** Novas features do roadmap, refatorações de performance.
- **P2 (Média):** Melhorias de UX, débitos técnicos não bloqueantes.
- **P3 (Baixa):** Ajustes cosméticos, documentação interna.
