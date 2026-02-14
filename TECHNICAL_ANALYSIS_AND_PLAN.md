# Análise Técnica e Plano de Otimização Backend/Frontend

## 1. Diagnóstico do Sistema Atual

### Monitoramento de Performance
- **Latência Atual:** Variável. Depende diretamente da resposta do Supabase. Em conexões 4G/3G, o "Time to First Byte" (TTFB) pode ser alto.
- **Cache Hit Rate:** O sistema atual usa `OfflineRepository` com estratégia *Stale-While-Revalidate*. A taxa de acerto (Hit Rate) no IndexedDB é alta para dados textuais, mas a percepção de performance (flicker) ocorria devido à falta de sincronia entre o estado React e o cache de disco na inicialização.
- **Mídia:** O carregamento de imagens é o maior gargalo. O `MediaManager` fazia fetches manuais sem aproveitar totalmente a camada de repositório, resultando em re-downloads desnecessários.

### Estratégias de Cache Atuais
- **Camada 1 (Memória - React Context):** Rápida, mas volátil (perde no F5).
- **Camada 2 (Persistente - IndexedDB):** Implementada via `idb-keyval`. Boa, mas a invalidação estava baseada apenas em tempo (`STALE_TIME` de 5 min) ou manual.
- **Camada 3 (Service Worker):** Configurada via `vite-plugin-pwa` para assets estáticos, mas não interceptava chamadas de API do Supabase (o que é correto, pois o Supabase JS Client tem sua própria lógica, mas perdemos o cache de borda).

### Mecanismo Offline
- **SyncQueue:** Existente e funcional para operações de escrita (INSERT/UPDATE/DELETE).
- **Leitura:** O fallback funciona, mas a detecção de "voltou a ficar online" nem sempre disparava a atualização da UI automaticamente em todas as telas.

### Gargalos Identificados
1.  **Fetch Manual no MediaManager:** O componente de mídia reimplementava lógica de fetch em vez de usar o `OfflineRepository`, ignorando a estratégia de cache centralizada.
2.  **Prefetch Passivo:** O prefetch ocorria apenas no `hover` do menu. Para uma experiência "instantânea", dados críticos devem ser carregados no *boot* da aplicação.
3.  **Falta de Feedback Visual de Sync:** O usuário não sabe quando o sistema está sincronizando dados em background.

---

## 2. Plano de Reconstrução e Otimização

### Tecnologias e Arquitetura
- **Persistência:** Manter `idb-keyval` (leve e eficiente para JSON).
- **Cache de Mídia:** Implementar cache agressivo de URLs de imagem ou confiar no Cache-Control do navegador/CDN do Supabase (melhorar headers se possível).
- **Service Layer:** Padronizar TODOS os acessos a dados (incluindo Mídia) através de classes `Repository`.

### Arquitetura de Carregamento Preemptivo (Bootstrapper)
Implementaremos um `DataBootstrapper` que inicia junto com o Dashboard:
1.  Verifica status da rede.
2.  Dispara `getIncremental` para todas as tabelas críticas (`services`, `portfolios`, `pages`, `media_files`) em paralelo e baixa prioridade (`requestIdleCallback` se possível).
3.  Popula o IndexedDB silenciosamente.

### Sistema de Cache em Camadas Aprimorado
1.  **Memória (Zustand/Context):** Estado da UI instantâneo.
2.  **Disco (IndexedDB):** Fonte da verdade "Offline".
3.  **Rede (Supabase):** Fonte da verdade "Final".
- **Melhoria:** O `MediaRepository` será criado para gerenciar metadados de arquivos com a mesma robustez das outras entidades.

### Detecção de Conectividade
- Utilizar `navigator.onLine` combinado com um "ping" real ao Supabase para verificar saúde da conexão, não apenas presença de sinal Wi-Fi.

---

## 3. Especificações Técnicas Alvo

- **Tempo de Resposta (Cache):** < 50ms (leitura de disco/memória).
- **Tempo de Resposta (Rede):** < 200ms (percepção do usuário, usando dados otimistas).
- **Consistência:** Reconciliação automática via `SyncManager` ao retomar conexão.

---

## 4. Cronograma de Implementação (Turno Atual)

1.  **Refatoração do MediaManager:** Criar `MediaRepository` e migrar lógica. (Prioridade Alta)
2.  **Implementação do DataBootstrapper:** Criar componente de pré-carregamento no Dashboard.
3.  **Monitor de Conectividade e Sync:** Criar componente visual discreto na barra superior.
4.  **Testes:** Validar fluxo offline -> online -> sync.

