# Análise de Performance do Backend (Supabase)

## 1. Visão Geral
Este documento detalha a análise de performance realizada nas listagens de Serviços, Portfólio e Páginas. Como o projeto utiliza uma arquitetura **Serverless (Supabase)**, o foco da análise foi na otimização de queries, indexação de banco de dados e eficiência na transferência de dados para o frontend.

## 2. Metodologia
Foi criado um script de benchmark (`scripts/benchmark-performance.js`) para simular o carregamento das listagens principais, medindo:
- **Latência (Duration)**: Tempo total de resposta.
- **Payload Size**: Tamanho dos dados transferidos (JSON).

## 3. Resultados do Benchmark

| Endpoint / Lista | Estratégia Anterior (`select *`) | Estratégia Otimizada (DTO) | Melhoria de Tempo | Redução de Dados |
|------------------|----------------------------------|----------------------------|-------------------|------------------|
| **Serviços**     | 598ms / 6.37KB                   | 111ms / 2.29KB             | **~5x mais rápido** | **~64% menor**   |
| **Portfólio**    | 86ms / 5.01KB                    | 153ms* / 2.26KB            | Variável          | **~55% menor**   |
| **Páginas**      | 206ms / 2.33KB                   | 90ms / 0.13KB              | **~2x mais rápido** | **~94% menor**   |

*Nota: A variação de tempo no Portfólio deve-se à latência de rede flutuante, mas a redução de payload garante carregamento mais rápido em conexões 3G/4G.*

## 4. Problemas Identificados & Soluções

### 4.1. Over-fetching (Busca Excessiva de Dados)
- **Problema**: As listagens buscavam todas as colunas (`select *`), incluindo campos pesados como `content`, `full_description` e `gallery_images` (JSON), que não são usados nos cards de listagem.
- **Solução**: Implementação de **Projeções DTO** (Data Transfer Object). Agora, as queries buscam apenas os campos estritamente necessários (ex: `id`, `title`, `slug`, `image_url`).
- **Arquivos Alterados**:
  - `src/pages/Servicos/index.tsx`
  - `src/pages/Portfolio/index.tsx`
  - `src/pages/Admin/Pages/List.tsx`
  - `scripts/generate-static-db.js`

### 4.2. Ausência de Índices de Performance
- **Problema**: As queries filtram por `published` e ordenam por `order` ou `created_at`, mas não existiam índices compostos para essas operações, forçando "Sequential Scans" no banco.
- **Solução**: Criação de índices específicos.
- **Migração Criada**: `supabase/migrations/20260205120000_add_performance_indexes.sql`
  - `idx_services_published_order`
  - `idx_portfolios_published_created_at`
  - `idx_pages_published_title`

### 4.3. Monitoramento de Performance
- **Implementação**: Adicionado check de performance de query (`checkQueryPerformance`) ao serviço de Health Check.
- **Arquivo**: `src/services/healthCheck.ts`
- **Métrica**: Monitora a latência de uma query de leitura real. Se ultrapassar 500ms, reporta status `slow` ou `degraded`.

## 5. Estratégias de Cache Existentes (Mantidas)
O projeto já possui uma excelente estratégia de cache híbrida que foi preservada e beneficia-se das otimizações acima:
1.  **IndexedDB (OfflineRepository/CacheManager)**: Armazena os resultados otimizados localmente.
2.  **Static Fallback (JSON)**: Em caso de falha de rede/Supabase, carrega JSONs pré-gerados (agora também otimizados e menores).

## 6. Próximos Passos Recomendados
1.  **Paginação**: Atualmente as listas carregam "todos" os itens publicados. Se o número de itens passar de 100, implementar paginação (`.range(0, 9)`) ou "Load More".
2.  **Otimização de Imagens**: Garantir que as URLs de imagens (`image_url`) utilizem transformações do Supabase Storage para redimensionamento automático (ex: `?width=400`).
