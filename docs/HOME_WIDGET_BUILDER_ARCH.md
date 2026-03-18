# Home Widget Builder Architecture

## Objetivo

Evoluir a aba "Seções da Home" para um construtor dinâmico de widgets, preservando fallback para o layout legado baseado em `layout_config`.

## Arquitetura Runtime

- Fonte legada: `home_content.section_key = 'layout_config'`
- Fonte nova: `home_widgets` + `home_widget_audit_logs`
- Chave de ativação: `site_settings.layout_settings.home_builder_v2_enabled`
- Renderização:
  - Flag desligada: usa layout legado
  - Flag ligada + widgets válidos: usa widgets
  - Falha de API/estrutura vazia: fallback automático para layout legado

## Frontend

- `useHomeConfig` mantém fluxo legado ativo
- `useHomeWidgets` carrega widgets da API/tabela
- `HomeRuntimeRenderer` decide em tempo real entre widgets e seções legadas
- `homeWidgetService` centraliza contrato REST e fallback de leitura

## Backend

- Nova tabela `home_widgets` para composição da Home
- Auditoria em `home_widget_audit_logs`
- RPC `reorder_home_widgets` para ordenação em lote
- Edge Function `home-widgets` para CRUD + reorder com controle de acesso

## Compatibilidade e Rollback

- Deploy não destrutivo: layout legado permanece intacto
- Rollback operacional: desligar `home_builder_v2_enabled`
- Migração reversível: remover consumo de `home_widgets` sem perda de conteúdo legado

## Performance

- Renderização pública mantém fallback imediato
- Otimização de widgets pesados via carregamento progressivo em próximas fases
- Métricas RUM existentes (LCP/CLS/INP/TTFB) são usadas como gate de rollout
