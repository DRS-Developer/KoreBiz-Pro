# Plano de Migração de Dependências Principais (Major Updates)

**Data de Criação:** 12 de Fevereiro de 2026
**Projeto:** KoreBiz-Pro
**Responsável:** Equipe de Desenvolvimento (Trae AI Pair Programmer)

## 1. Análise do Ambiente Atual e Escopo

Este plano visa a atualização das dependências "Major" identificadas na auditoria, que introduzem mudanças arquiteturais significativas (Breaking Changes).

### Dependências Alvo:
1.  **Tailwind CSS**: v3.4.17 → **v4.1.18**
    *   *Impacto:* Alto. Mudança radical na configuração (CSS-first), remoção de `tailwind.config.js` em favor de diretivas CSS, nova engine.
2.  **Vite**: v6.3.5 → **v7.3.1**
    *   *Impacto:* Médio/Alto. Atualização do build tool, possível depreciação de plugins antigos, melhorias de performance.
3.  **ESLint**: v9.x → **v10.0.0**
    *   *Impacto:* Médio. Evolução do Flat Config, novas regras.
4.  **Node.js Types**: v22.x → **v25.x**
    *   *Impacto:* Baixo/Médio. Tipagens para novas features do Node.js.

---

## 2. Requisitos e Arquitetura Alvo

### Requisitos Técnicos:
*   **Node.js**: Garantir ambiente compatível (Node 22+ já em uso).
*   **Compatibilidade de Browser**: Manter suporte aos browsers definidos no `package.json` (via browserslist/autoprefixer).
*   **Performance**: Aproveitar a nova engine do Tailwind v4 para builds mais rápidos.

### Arquitetura Alvo:
*   **Estilização**: Tailwind v4 nativo com plugin `@tailwindcss/vite`.
*   **Build**: Vite v7 otimizado.
*   **Linting**: ESLint v10 com configuração estrita.

---

## 3. Estratégia de Migração e Cronograma

A migração será realizada em **Fases Sequenciais**, isolando riscos. Não realizaremos todas as atualizações simultaneamente.

### Fase 1: Infraestrutura Base (Vite & Node Types) - *Prioridade 1*
*   **Objetivo**: Atualizar o motor de build e tipagens base.
*   **Ações**:
    1.  Atualizar `@types/node` para v25.
    2.  Atualizar `vite` para v7.x e `@vitejs/plugin-react`.
    3.  Validar configurações do `vite.config.ts`.
*   **Tempo Estimado**: 2 horas.

### Fase 2: Estilização (Tailwind CSS v4) - *Prioridade 2*
*   **Objetivo**: Migrar para a nova arquitetura do Tailwind.
*   **Ações**:
    1.  Instalar `tailwindcss` v4 e `@tailwindcss/vite`.
    2.  Remover `postcss` e `autoprefixer` (se não forem mais necessários explicitamente ou integrados).
    3.  Migrar configurações de `tailwind.config.js` para variáveis CSS (`@theme`).
    4.  Atualizar importações no `index.css`.
*   **Tempo Estimado**: 4-6 horas (dependendo da complexidade do tema customizado).

### Fase 3: Qualidade de Código (ESLint v10) - *Prioridade 3*
*   **Objetivo**: Atualizar linter para regras mais recentes.
*   **Ações**:
    1.  Atualizar `eslint` e plugins relacionados.
    2.  Revisar `eslint.config.js` para novas regras deprecadas.
*   **Tempo Estimado**: 2 horas.

---

## 4. Gestão de Riscos e Rollback

| Risco | Probabilidade | Mitigação | Estratégia de Rollback |
|-------|---------------|-----------|------------------------|
| **Quebra Visual (CSS)** | Alta (Fase 2) | Testes visuais manuais em componentes críticos; verificação de variáveis de tema. | Reverter commit git; Voltar para branch `main`. |
| **Falha no Build** | Média (Fase 1) | Leitura atenta do changelog do Vite; verificação de plugins. | Downgrade da versão no `package.json` e `npm install`. |
| **Incompatibilidade de Plugins** | Média | Verificar issues no GitHub dos plugins antes de atualizar. | Manter versão anterior do plugin específico. |

### Procedimento de Rollback Geral:
1.  `git reset --hard HEAD~1` (se o commit não foi pushado) ou `git revert <commit-hash>`.
2.  `rm -rf node_modules package-lock.json`.
3.  `npm install`.
4.  Validar se o ambiente voltou ao estado estável anterior.

---

## 5. Plano de Validação e Testes

Para cada fase, o seguinte ciclo de validação deve ser executado:

1.  **Build Check**: `npm run build` deve passar sem erros.
2.  **Type Check**: `npm run check` (TypeScript) deve passar limpo.
3.  **Lint Check**: `npm run lint` não deve reportar erros novos.
4.  **Teste de Runtime (Dev Server)**:
    *   Iniciar `npm run dev`.
    *   Navegar pelas rotas principais: Dashboard, Formulários, Login.
    *   Verificar console do navegador para erros JS.
5.  **Teste Visual (Específico Fase 2)**:
    *   Verificar espaçamentos, cores e tipografia (garantir que o tema customizado foi portado corretamente).
    *   Testar responsividade (Mobile/Desktop).

---

## 6. Comunicação e Documentação

*   **Commits**: Utilizar Conventional Commits para clareza (ex: `chore(deps): upgrade vite to v7`, `refactor(css): migrate to tailwind v4`).
*   **Changelog**: Atualizar `CHANGELOG.md` ao final de cada fase com as versões exatas e notas de migração.
*   **Equipe**: Notificar sobre a mudança na forma de configurar estilos (fim do `tailwind.config.js`).

---

## 7. Pós-Migração e Monitoramento

1.  **Monitoramento de Performance**: Comparar tempo de build antes e depois da migração (esperado ganho com Tailwind v4).
2.  **Limpeza**: Remover arquivos de configuração obsoletos (`postcss.config.js`, `tailwind.config.js` após Fase 2).
3.  **Backlog**: Criar tarefas para refatorar componentes antigos para usar novas features (ex: novas queries de container do Tailwind v4) sob demanda.

---

### Aprovação
Este plano deve ser aprovado pelo líder técnico antes do início da execução da Fase 1.
