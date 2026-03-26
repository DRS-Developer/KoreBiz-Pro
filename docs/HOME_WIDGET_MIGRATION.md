# Home Widget Migration and Rollback

## Estratégia

Consolidar a Home no Builder v2 como arquitetura única.

## Etapas

1. Aplicar migration `20260309183000_create_home_widgets_builder.sql`
2. Publicar Edge Function `home-widgets`
3. Popular `home_widgets` com composição inicial (`hero`, `about`, `cta`)
4. Migrar configuração para modais por widget no Admin Home
5. Remover dependências legadas (`useHomeConfig`, `home-config`, `SectionManager`)
6. Validar API, reorder, permissões e auditoria
7. Monitorar RUM (LCP, CLS, INP, TTFB)
8. Publicar arquitetura v2-only

## Critérios de avanço

- Sem erro de render em páginas existentes
- Tempo de resposta de criação/reordenação dentro da meta
- Sem regressão de CLS e LCP acima do limite definido

## Rollback técnico

1. Restaurar commit/tag anterior à remoção do Home v1
2. Reexecutar build e smoke tests
3. Revalidar tabelas `home_widgets` e `home_content`
4. Corrigir e reaplicar rollout

## Operação via Admin

- Caminho: **Admin > Home > Seções da Home**
- Operação: gerenciamento completo por widgets e modais de configuração
- Não há mais alternância para layout legado
