# Home Widget Builder Architecture

## Objetivo

Operar a Home exclusivamente com o Builder v2, sem dependências do módulo legado.

## Arquitetura Runtime

- Fonte de estrutura: `home_widgets` + `home_widget_audit_logs`
- Fonte de conteúdo compartilhado: `home_content` (`hero`, `about`, `cta`)
- Renderização pública: `HomeRuntimeRenderer` → `HomeBuilder`
- Fallback operacional: se não houver widgets válidos, renderiza composição mínima v2 (`hero`, `about`, `cta`)

## Frontend

- `useHomeWidgets` carrega widgets da API/tabela para Home pública e Admin
- `HomeRuntimeRenderer` converte widgets ativos para seções consumidas por `HomeBuilder`
- `HomeWidgetManager` gerencia canvas, ordenação, visibilidade e ações de configuração
- Configuração de conteúdo por modal:
  - `HeroTab`
  - `AboutTab`
  - `CtaTab`

## Backend

- Tabela `home_widgets` para composição da Home
- Auditoria em `home_widget_audit_logs`
- RPC `reorder_home_widgets` para ordenação em lote
- Edge Function `home-widgets` para CRUD + reorder com controle de acesso

## Remoções do Legado (Home v1)

- Removidos:
  - `useHomeConfig`
  - `types/home-config`
  - `SectionManager`
  - `SortableSectionItem`
- Removida alternância de modo no Admin e em runtime público
- `home_builder_v2_enabled` mantido apenas como valor forçado em persistência de settings por compatibilidade de dados

## Performance

- Renderização pública baseada em composição de widgets ativos
- Componentes de seção com import estático para evitar flicker
- Métricas RUM existentes (LCP/CLS/INP/TTFB) permanecem como referência de regressão
