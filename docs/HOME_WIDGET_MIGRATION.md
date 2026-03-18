# Home Widget Migration and Rollback

## Estratégia

Migração incremental com operação paralela entre layout novo e legado.

## Etapas

1. Aplicar migration `20260309183000_create_home_widgets_builder.sql`
2. Publicar Edge Function `home-widgets`
3. Manter `home_builder_v2_enabled = false`
4. Popular `home_widgets` com base em `layout_config.sections`
5. Validar API, reorder, permissões e auditoria
6. Ativar flag apenas em homologação
7. Monitorar RUM (LCP, CLS, INP, TTFB)
8. Ativar em produção de forma gradual

## Critérios de avanço

- Sem erro de render em páginas existentes
- Tempo de resposta de criação/reordenação dentro da meta
- Sem regressão de CLS e LCP acima do limite definido

## Rollback

1. Desligar `home_builder_v2_enabled`
2. Confirmar retorno automático para `layout_config`
3. Manter dados em `home_widgets` para investigação
4. Corrigir e repetir rollout em novo ciclo

## Dados legados

`home_content.section_key = 'layout_config'` permanece como fonte de fallback enquanto a flag existir.

## Operação via Admin

- Caminho: **Admin > Configurações > Layout & Aparência**
- Controle: checkbox **Ativar Home Builder v2**
- Ao desmarcar, a Home volta automaticamente para o layout legado sem perda de dados.
