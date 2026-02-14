# Plano de Otimização de Performance e UX

Este plano visa resolver os problemas de FOUC, melhorar o tempo de carregamento e implementar feedback visual durante o carregamento.

## 1. Instalação de Dependências

Instalar bibliotecas necessárias para animações, skeletons e métricas.

* `framer-motion`: Para animações suaves de transição.

* `react-loading-skeleton`: Para skeletons screens.

* `web-vitals`: Para monitoramento de métricas (LCP, FID, CLS).

* `vite-plugin-pwa`: Para suporte a Service Workers e cache.

* `@types/react-lazy-load-image-component` e `react-lazy-load-image-component`: Para lazy loading de imagens.

## 2. Componentes de Performance e UX

### Criar `src/components/OptimizedImage.tsx`

* Implementar um wrapper em torno da tag `img`.

* Utilizar `react-lazy-load-image-component` ou implementação nativa com `IntersectionObserver`.

* Adicionar efeito de blur-up ou fade-in ao carregar.

* Tratamento de erro de carregamento (fallback image).

### Criar `src/components/Skeletons/HomeSkeleton.tsx`

* Criar uma versão "esqueleto" da Home Page usando `react-loading-skeleton`.

* Deve imitar o layout do Hero, Serviços e Projetos.

### Criar `src/components/LoadingSpinner.tsx`

* Um spinner simples e elegante para fallbacks de rotas.

## 3. Refatoração da Estrutura de Rotas (Code Splitting)

### Atualizar `src/App.tsx`

* Substituir imports estáticos por `React.lazy(() => import('./pages/...'))`.

* Envolver as rotas em um `Suspense` com o `LoadingSpinner` como fallback.

* Isso reduzirá drasticamente o bundle inicial.

## 4. Otimização da Página Principal (`src/pages/Home.tsx`)

* **Resolver FOUC:** Utilizar o estado `loading` existente para renderizar o `HomeSkeleton` enquanto os dados são buscados.

* **Animações:** Envolver seções principais com `motion.div` (Framer Motion) para entrada suave (fade-in/slide-up).

* **Imagens:** Substituir todas as tags `<img>` por `<OptimizedImage />`.

## 5. Implementação de PWA e Service Workers

### Configurar `vite.config.ts`

* Adicionar `VitePWA` plugin.

* Configurar estratégias de cache (Stale-While-Revalidate) para assets e imagens.

## 6. Monitoramento de Performance

### Criar `src/reportWebVitals.ts`

* Função para registrar métricas no console (ou enviar para endpoint analytics futuro).

### Atualizar `src/main.tsx`

* Chamar `reportWebVitals` na inicialização.

## 7. Verificação

* Rodar build e preview.

* Verificar Lighthouse score.

