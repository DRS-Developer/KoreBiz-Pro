# Análise de Performance e Imagens - KoreBiz-Pro

Esta análise detalhada foca nos gargalos de performance de carregamento e manipulação de imagens no projeto React (Vite + Supabase).

## 1. Lista Priorizada de Problemas

### 🔴 1. Bloqueio de Renderização Crítico (Synchronous XHR)
- **Onde:** `index.html` (linhas 15-29)
- **Impacto:** **Alto** (Afeta TTFB, FCP e LCP)
- **Explicação Técnica:** Há um script inline no `<head>` que faz um `XMLHttpRequest` com a flag `async` definida como `false` (`xhr.open('GET', '/config.json', false);`). Isso bloqueia a thread principal do navegador e impede o parser de HTML de continuar até que o arquivo `config.json` seja baixado, atrasando o download do bundle JS e a renderização da página.

### 🔴 2. Desativação da Transformação de Imagens (Tamanho Real vs Exibido)
- **Onde:** `src/utils/imageManager.ts` (linhas 97-100) e `src/utils/imageOptimizer.ts`
- **Impacto:** **Alto** (Afeta LCP, Largura de Banda e Percepção de Velocidade)
- **Explicação Técnica:** A função `withTransformParams` possui um comentário `DISABLE IMAGE TRANSFORMATION (Temporary Fix for HTTP 403)` e está retornando a URL original do Supabase Storage. Isso significa que **todas as imagens** estão sendo baixadas em seu tamanho e peso originais (ex: imagens de 2MB sendo carregadas em cards de 300px), anulando qualquer otimização de peso.

### 🔴 3. Falsificação de Formato WebP
- **Onde:** `src/components/OptimizedImage.tsx` e `src/utils/imageManager.ts`
- **Impacto:** **Alto** (Erros de renderização no navegador e desperdício de banda)
- **Explicação Técnica:** Como a transformação está desativada, a variável `webpSrc` recebe a mesma URL da imagem original (que pode ser JPEG/PNG). O componente `<picture>` então usa `<source srcSet={webpSrc} type="image/webp" />`. O navegador acredita que está baixando um WebP, mas recebe um JPEG. Alguns navegadores podem falhar ao renderizar ou gastar CPU tentando decodificar formatos incompatíveis.

### 🔴 4. Waterfall de Data Fetching (Hydration Delay no LCP)
- **Onde:** `src/pages/Home.tsx` (useEffect `loadContent`)
- **Impacto:** **Alto** (Afeta severamente o LCP)
- **Explicação Técnica:** A página inicial renderiza um `HomeSkeleton` enquanto aguarda a resposta do `HomeContentRepository`. Como é um SPA, o navegador precisa: Baixar HTML -> Baixar JS -> Executar React -> Fazer a requisição ao Supabase -> Receber a URL da imagem Hero -> **Só então iniciar o download da imagem Hero**. Isso cria um gargalo em cascata gigantesco para o LCP.

### 🟡 5. Ausência de `srcSet` e `sizes` Responsivos
- **Onde:** `src/components/OptimizedImage.tsx`
- **Impacto:** **Médio** (Afeta performance mobile)
- **Explicação Técnica:** O componente de imagem otimizada não implementa o atributo `srcSet` com múltiplas resoluções (ex: `1x, 2x` ou larguras dinâmicas `400w, 800w`) nem o atributo `sizes`. Dispositivos móveis baixam a mesma imagem gigante que um monitor 4K, consumindo dados móveis desnecessariamente e atrasando o carregamento da página.

### 🟡 6. Preload da Imagem Principal Inexistente
- **Onde:** `src/components/OptimizedImage.tsx` e `PRIORITY_USAGE.md`
- **Impacto:** **Médio** (Atrasa a descoberta da imagem LCP)
- **Explicação Técnica:** O uso da propriedade `priority={true}` apenas aplica `loading="eager"` e `decoding="sync"` na tag `<img>`. Isso não instrui o navegador a fazer o *preload* da imagem. Em um SPA, a tag `<img>` só existe no DOM após a execução do JS. O ideal seria injetar uma tag `<link rel="preload" as="image" href="...">` no `<head>` o mais cedo possível para o scanner do navegador iniciar o download antecipadamente.

### 🟡 7. Políticas de Cache do Storage
- **Onde:** Supabase Storage (Configuração de infraestrutura) e `vite.config.ts` (Service Worker)
- **Impacto:** **Médio**
- **Explicação Técnica:** O `vite-plugin-pwa` está configurado para fazer cache no Service Worker (`img-cache-v1`), mas no primeiro carregamento (cold cache), dependemos do CDN do Supabase. Se as imagens não estiverem sendo servidas com cabeçalhos `Cache-Control` longos do lado do Supabase, o CDN da Cloudflare não fará o edge caching eficiente.

---

## 2. Resumo da Análise por Categoria

### 1. Imagens
- **Uso de srcset e sizes:** Ausente. O componente usa um único `src` para todas as telas.
- **Formatos:** A intenção era usar WebP via `<picture>`, mas o fallback desativou a conversão e está passando formatos originais (JPEG/PNG) declarando falsamente como `type="image/webp"`.
- **Tamanho real vs exibido:** Crítico. Transformação via Supabase Image Resizer está comentada por erro 403, forçando o download de imagens brutas gigantes.
- **Estratégia de lazy loading:** Funcional (`loading="lazy"` como padrão e `eager` com `priority={true}`). Há um cache global (`globalImageCache`) para evitar flicker de transição.
- **Preload na imagem principal:** Inexistente no nível do documento (`<head>`), apenas instrução tardia via DOM do React.

### 2. Rede
- **Uso ou ausência de CDN:** O Supabase usa Cloudflare, mas sem as otimizações de imagem, a transferência de dados do CDN para o cliente é massiva.
- **Cache headers:** O PWA está bem configurado no Vite, mas o carregamento inicial sofre sem otimização.
- **Latência de carregamento:** O XHR síncrono para `/config.json` causa bloqueio total da thread de rede e parser HTML no início do ciclo de vida da página.

### 3. React / Frontend
- **Impacto do bundle JS:** Chunking configurado corretamente no `vite.config.ts` (divisão de `vendor`, `ui`, etc.).
- **Hydration delay & Blocking render:** A estratégia de renderização cliente-side pura faz com que o `HomeSkeleton` atrase a descoberta do LCP. O conteúdo principal (Hero) é bloqueado pelo fetch de dados do Supabase.

### 4. Métricas
- **O que está afetando LCP:** XHR síncrono inicial + JS Download + API Fetch + Imagem não otimizada e sem preload.
- **O que está afetando TTFB:** O script síncrono no `index.html` paralisa a percepção de recebimento da página pelo navegador.
- **O que impacta percepção de velocidade:** O usuário vê uma tela em branco (por causa do bloqueio do HTML), seguida de Skeletons (por causa do fetch de dados), e por fim as imagens demoram a aparecer porque são enormes.

---
**Nota:** Nenhuma alteração foi realizada no código. Este documento serve como plano de análise técnica dos gargalos de performance atuais da aplicação.