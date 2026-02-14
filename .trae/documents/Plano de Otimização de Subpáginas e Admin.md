O plano a seguir detalha a implementação das otimizações de performance nas subpáginas dinâmicas (Detalhes de Serviços, Portfólio e Áreas de Atuação) e melhorias na criação de páginas no Admin. O objetivo é eliminar flickering, otimizar LCP e garantir consistência visual.

### **Fase 1: Otimização das Subpáginas (Frontend)**
Implementar o padrão de alta performance (Cache + Skeleton + LCP Image) nas páginas de detalhes.

#### **1.1. Serviços Detalhes (`src/pages/Servicos/Detalhes.tsx`)**
- **Data Fetching:** Migrar de `useEffect` direto para `useCachedData` (Cache Key: `service_detail_{slug}`).
- **Loading State:** Substituir `Loader2` por um `PageSkeleton` personalizado ou o genérico criado.
- **Imagens:** Substituir `<img>` por `OptimizedImage` com `priority={true}` na imagem de destaque.
- **SEO:** Garantir que o componente `SEO` receba os metadados corretos do serviço.

#### **1.2. Portfólio Detalhes (`src/pages/Portfolio/Detalhes.tsx`)**
- **Data Fetching:** Migrar para `useCachedData` (Cache Key: `portfolio_detail_{slug}`).
- **Loading State:** Implementar Skeleton que simule o layout de galeria.
- **Imagens:**
  - Imagem principal: `OptimizedImage` com `priority={true}`.
  - Galeria: `OptimizedImage` com lazy loading padrão (já ativo).

#### **1.3. Áreas de Atuação Detalhes (`src/pages/AreasAtuacao/Detalhes.tsx`)**
- **Refatoração:** Atualmente usa dados estáticos (mock). Refatorar para buscar conteúdo dinâmico do Supabase (se aplicável) ou manter estático mas com `OptimizedImage` para performance.
- **Consistência:** Aplicar a mesma estrutura de `PageSkeleton` se houver carregamento dinâmico futuro.

### **Fase 2: Otimização da Criação no Admin (Backend/CMS)**
Garantir que novos conteúdos sejam criados com dados otimizados por padrão.

#### **2.1. Melhoria nos Formulários (`Admin/Services/Form`, `Admin/Portfolio/Form`, `Admin/Pages/Form`)**
- **Validação de Imagens:** Reforçar o uso de `ImageUpload` que já valida tamanho/formato.
- **Preview de SEO:** Adicionar um componente visual simples que mostre como o `meta_title` e `meta_description` aparecerão no Google (Snippet Preview), incentivando o preenchimento correto pelo admin.
- **Cache Invalidation:** Garantir que ao salvar/editar um item, o cache correspondente seja invalidado (embora o `useCachedData` tenha TTL, forçar a atualização melhora a experiência de edição). *Nota: Isso pode exigir ajuste no hook ou apenas instrução de reload.*

### **Fase 3: Verificação e Testes**
- **Navegação:** Testar fluxo Lista -> Detalhe para verificar ausência de flickering.
- **Refresh:** Testar F5 na página de detalhe para verificar o comportamento do cache (Dual Write).
- **Lighthouse:** Verificar se o LCP das subpáginas está abaixo de 2.5s.
