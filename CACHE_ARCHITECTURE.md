# Arquitetura de Cache e PWA - KoreBiz-Pro

Este documento descreve a nova arquitetura de cache e PWA implementada para garantir alta performance, funcionamento offline e atualizações silenciosas.

## 1. Visão Geral

O sistema foi migrado para uma arquitetura **Offline-First** utilizando Service Workers (via `vite-plugin-pwa` e Workbox) para gerenciar o cache de assets e dados. A persistência local via `localStorage` foi removida em favor do cache de rede do Service Worker, garantindo uma fonte única de verdade alinhada com as requisições HTTP.

## 2. Estratégias de Cache

### Assets Estáticos (Shell)
- **O que:** HTML, JS, CSS, Ícones, Fontes locais.
- **Estratégia:** `CacheFirst` (Precaching).
- **Comportamento:** Baixados na instalação do Service Worker. Atualizados apenas quando uma nova versão do build é detectada.

### Imagens (Supabase Storage)
- **O que:** Imagens de conteúdo (`/storage/v1/object/public/media/*`).
- **Estratégia:** `CacheFirst`.
- **Configuração:**
  - Cache Name: `img-cache-v1`
  - Expiração: 1 Ano (365 dias)
  - Limite: 200 entradas
- **Motivo:** Imagens são imutáveis ou pouco frequentes. Cache longo evita downloads repetidos.

### Dados da API (Supabase REST)
- **O que:** Dados de serviços, portfólio, configurações (`/rest/v1/*`).
- **Estratégia:** `StaleWhileRevalidate`.
- **Comportamento:**
  1. O navegador retorna imediatamente a resposta do cache (se existir).
  2. Em paralelo, faz uma requisição à rede para buscar dados novos.
  3. Se houver dados novos, o cache é atualizado para a próxima visita.
  4. A UI é atualizada via React Query ou Realtime Subscriptions (se ativos).
- **Offline:** Se não houver rede, o cache é retornado e a requisição de rede falha silenciosamente, mantendo a aplicação funcional.

## 3. Ciclo de Vida e Atualizações

- **Instalação:** O SW é registrado imediatamente (`immediate: true`).
- **Atualização:**
  - O sistema verifica atualizações a cada carregamento.
  - Se uma nova versão for encontrada, o novo SW é instalado em segundo plano.
  - `skipWaiting: true`: O novo SW assume o controle imediatamente, sem exigir que o usuário feche todas as abas.
  - A aplicação atualiza-se "silenciosamente".

## 4. Comandos de Manutenção

### Limpar Cache (Desenvolvimento)
Para forçar a remoção de todos os caches antigos e testar o fluxo de "Primeiro Acesso":
1. Abra o DevTools (F12) -> Application -> Storage.
2. Clique em "Clear site data".
3. Recarregue a página.

### Build e Deploy
O processo de build gera automaticamente o manifesto de precache.
```bash
npm run build
# O diretório dist/ conterá o sw.js e workbox-*.js
```

## 5. Verificação de Funcionamento

1. **Online:** A navegação deve ser instantânea (cache) e os dados atualizados em background.
2. **Offline:** Desconecte a rede. Recarregue a página. O app deve carregar normalmente com os dados da última sessão.
3. **Imagens:** Imagens já vistas não devem gerar tráfego de rede (Status: `(ServiceWorker)` ou `(Disk Cache)` no Network tab).
