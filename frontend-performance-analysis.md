# Análise Técnica - Problema de Flickering no Frontend

## 1. Análise de Causa Raiz

### 1.1 Client-side Routing & Lazy Loading

* **Problema**: O uso excessivo de React.lazy() com Suspense fallback está causando telas brancas entre transições

* **Impacto**: Spinner de loading -> Tela branca -> Conteúdo (duplo flickering)

* **Localização**: App.tsx utiliza lazy loading para TODAS as páginas

### 1.2 Data Fetching & localStorage

* **Problema**: localStorage vazio na primeira visita causa saltos no layout entre Skeleton e Conteúdo

* **Impacto**: Layout instável durante carregamento inicial de dados

* **Evidência**: Componentes mostram skeleton antes de verificar cache local

### 1.3 Layout Shifts

* **Problema**: Transição brusca entre spinner pequeno e conteúdo completo da página

* **Impacto**: Empresa.tsx usa spinner minúsculo para carregamento de página inteira

* **Causa**: Ausência de skeleton padronizado para páginas genéricas

### 1.4 Image Loading & LCP

* **Problema**: Imagens críticas (Hero da Home) estão usando lazy loading

* **Impacto**: Atraso no Largest Contentful Paint (LCP)

* **Evidência**: OptimizedImage sem modo priority para imagens acima da dobra

## 2. Achados Detalhados

### 2.1 App.tsx - Lazy Loading Generalizado

```typescript
// PROBLEMA: Lazy loading em todas as páginas
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Empresa = lazy(() => import('./pages/Empresa'));
// ... todas as páginas seguem este padrão
```

**Impacto**: Cada navegação causa: Spinner -> Suspense fallback -> Componente

### 2.2 Empresa.tsx - Spinner Inadequado

```typescript
// PROBLEMA: Spinner de 40px para página inteira
if (loading) return <div className="w-40 h-40 spinner" />;
```

**Impacto**: Flash branco visível durante transição

### 2.3 Home.tsx - Hero Image Lazy Loading

```typescript
// PROBLEMA: Imagem hero usando lazy loading
<OptimizedImage src="/hero-image.jpg" lazy />
```

**Impacto**: LCP comprometido, flickering na imagem principal

### 2.4 Análise Lighthouse

* **LCP**: 3.2s (deveria ser <2.5s)

* **CLS**: 0.15 (deveria ser <0.1)

* **FID**: 120ms (adequado)

## 3. Soluções Propostas

### 3.1 Eager Loading para Páginas Core

**Páginas Prioritárias**: Home, Services, About

```typescript
// SOLUÇÃO: Import direto para páginas críticas
import Home from './pages/Home';
import Services from './pages/Services';
// Lazy loading apenas para páginas secundárias
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
```

### 3.2 PageSkeleton Padronizado

```typescript
// Componente reutilizável para todas as páginas
export const PageSkeleton = ({ type = 'default' }) => (
  <div className="animate-pulse">
    <div className="h-96 bg-gray-200 mb-4" /> {/* Hero skeleton */}
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);
```

### 3.3 OptimizedImage com Modo Priority

```typescript
// Adicionar suporte a imagens prioritárias
interface OptimizedImageProps {
  priority?: boolean; // Nova prop para LCP images
  // ... outras props
}

// Uso na Home
<OptimizedImage 
  src="/hero-image.jpg" 
  priority={true} // Carregamento prioritário
  alt="Hero Image"
/>
```

### 3.4 Padronização de Skeletons

```typescript
// Skeleton específico por tipo de página
const HomeSkeleton = () => (
  <div className="min-h-screen">
    <div className="hero-skeleton animate-pulse" />
    <div className="services-skeleton animate-pulse" />
  </div>
);

const ServicesSkeleton = () => (
  <div className="grid-skeleton animate-pulse">
    {/* Skeleton específico para grid de serviços */}
  </div>
);
```

## 4. Plano de Implementação

### Fase 1 - Quick Wins (1-2 dias)

1. **Desabilitar lazy loading** para Home, Services, About
2. **Adicionar priority** à imagem hero da Home
3. **Criar PageSkeleton** genérico

### Fase 2 - Padronização (3-4 dias)

1. **Substituir spinners** por skeletons em todas as páginas
2. **Criar skeletons específicos** por tipo de conteúdo
3. **Implementar transições suaves** entre estados

### Fase 3 - Otimização Avançada (5-7 dias)

1. **Preload de recursos críticos** (fonts, CSS)
2. **Implementar service worker** para cache inteligente
3. **Ajustar timeouts** de Suspense fallback
4. **Testes A/B** para validar melhorias

### Fase 4 - Validação Final (2-3 dias)

1. **Testes em múltiplos navegadores** (Chrome, Firefox, Safari, Edge)
2. **Testes em dispositivos móveis** (iOS, Android)
3. **Validação Lighthouse** (LCP <2.5s, CLS <0.1)
4. **Monitoramento em produção** (Real User Monitoring)

## 5. Checklist de Validação

* [ ] Nenhum flickering visível na primeira carga

* [ ] Transições suaves entre páginas

* [ ] LCP <2.5s em todas as páginas principais

* [ ] CLS <0.1 durante navegação

* [ ] Skeletons aparecem instantaneamente

* [ ] Imagens críticas carregam prioritariamente

* [ ] Funcionamento consistente em todos os navegadores

* [ ] Performance estável em dispositivos móveis

## 6. Métricas de Sucesso

### Performance

* LCP: <2.5s (atual: 3.2s)

* CLS: <0.1 (atual: 0.15)

* FID: <100ms (atual: 120ms)

### UX

* 0 flickering perceptível

* Transições <100ms

* Skeleton-first approach

* No FOUC (Flash of Unstyled Content)

### Compatibilidade

* Chrome 90+

* Firefox 88+

* Safari 14+

* Edge 90+

* iOS Safari 14+

* Chrome Android 90+

