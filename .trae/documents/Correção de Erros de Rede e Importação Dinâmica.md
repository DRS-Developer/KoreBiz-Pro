O plano a seguir visa corrigir os erros críticos de rede e importação dinâmica identificados nos logs, focando na estabilidade do cache e na confiabilidade das requisições ao Supabase.

### **Diagnóstico e Correções**

#### **1. Erro `Failed to fetch dynamically imported module`**
Este erro ocorre quando o navegador tenta carregar um chunk JS antigo que não existe mais no servidor após um deploy.
- **Ação Imediata**: Implementar um "Reload Prompt" na aplicação para detectar novas versões e forçar a atualização.
- **Correção no Vite**: Ajustar a configuração do `vite-plugin-pwa` para garantir que o service worker assuma o controle mais rapidamente (`skipWaiting`, `clientsClaim`).
- **Tratamento de Erro Global**: Reforçar o `ErrorBoundary` para detectar especificamente erros de carregamento de chunk e recarregar a página automaticamente uma vez (evitando loops).

#### **2. Erro `net::ERR_ABORTED` nas requisições Supabase**
Identificamos que o `CacheManager` está limpando agressivamente o `localStorage`, removendo o token de sessão do Supabase e causando o aborto das requisições autenticadas.
- **Correção Crítica**: Alterar `CacheManager.ts` para limpar apenas chaves prefixadas com a aplicação, preservando as chaves `sb-*` do Supabase.
- **Otimização de Requisições**: Refatorar o `Dashboard.tsx` para usar `Promise.all` nas chamadas de contagem, reduzindo a chance de bloqueio por limite de conexões simultâneas do navegador.

### **Plano de Execução**

1.  **Refatorar `CacheManager.ts`**:
    *   Substituir `localStorage.clear()` por uma limpeza seletiva.
    *   Implementar prefixo padrão para todas as chaves de cache da aplicação.

2.  **Melhorar `Dashboard.tsx`**:
    *   Agrupar as chamadas de estatísticas (`services`, `portfolios`, `pages`, etc.) em um único `Promise.all` para execução controlada.

3.  **Aprimorar Resiliência de Build e PWA**:
    *   Verificar/Ajustar `vite.config.ts` para garantir configurações ótimas de PWA.
    *   Adicionar um componente `ReloadPrompt` (se ainda não existir) para notificar o usuário sobre atualizações.

4.  **Testes**:
    *   Verificar se o login persiste após limpeza de cache.
    *   Validar o carregamento do Dashboard sem erros de rede.
    *   Executar `npm run build` para garantir integridade.
