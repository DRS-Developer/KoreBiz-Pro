O plano a seguir visa corrigir os erros de hidratação do React e os abortos de requisição do Supabase, estabilizando a aplicação.

### **Diagnóstico e Correções**

#### **1. Erro de Hidratação (Minified React Error #418)**
- **Causa**: Manipulação direta do DOM no `AnalyticsProvider.tsx` durante a montagem inicial.
- **Ação**: Refatorar o componente para usar uma abordagem mais segura de injeção de scripts (assíncrona) ou garantir que a renderização não dependa desses efeitos colaterais imediatos.

#### **2. Requisições Supabase Abortadas (`net::ERR_ABORTED`)**
- **Causa**: Race condition no gerenciamento de sessão. O `ProtectedRoute` verifica a sessão a cada navegação, causando cancelamento de requisições anteriores.
- **Ação**: Centralizar a lógica de autenticação no `App.tsx` (ou um novo `AuthProvider` dedicado) para que a sessão seja verificada apenas uma vez na inicialização. Simplificar o `ProtectedRoute` para apenas ler o estado do store global.

### **Plano de Execução**

1.  **Refatorar `App.tsx`**:
    *   Mover a lógica de inicialização de sessão (`checkSession` e `onAuthStateChange`) para o `App.tsx`.
    *   Gerenciar o estado global de autenticação (`useAuthStore`) diretamente na raiz.

2.  **Simplificar `ProtectedRoute.tsx`**:
    *   Remover toda a lógica de `useEffect` que chama o Supabase.
    *   Fazer com que ele dependa exclusivamente do estado `user` e `loading` do `useAuthStore` já inicializado.

3.  **Ajustar `AnalyticsProvider.tsx`**:
    *   Garantir que a injeção do GTM/GA4 seja feita de forma assíncrona e não bloqueante, evitando conflitos de hidratação.

4.  **Verificação**:
    *   Testar navegação entre rotas protegidas (Admin) para confirmar que não há requisições abortadas.
    *   Verificar se o erro #418 desapareceu do console.
    *   Rodar build de produção.
