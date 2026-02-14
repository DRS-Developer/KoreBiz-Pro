# Comparativo Técnico: Integração Supabase x Vercel
## Native Marketplace Integration vs. Configuração Manual

Este documento técnico apresenta uma análise comparativa detalhada entre duas abordagens de integração do Supabase com aplicações hospedadas na Vercel: a **Integração Nativa** (via Vercel Marketplace) e a **Configuração Manual** (via Dashboard Supabase).

---

## 1. Matriz Comparativa Executiva

| Critério | Integração Nativa (Marketplace) | Configuração Manual (Externa) |
| :--- | :--- | :--- |
| **Facilidade de Setup** | **Alta**. Poucos cliques no dashboard da Vercel. Criação automática de projetos. | **Média**. Requer criação manual no Supabase e cópia de chaves. |
| **Gestão de Variáveis** | **Automática**. Sincroniza chaves e URLs (`NEXT_PUBLIC_...`) automaticamente. | **Manual**. Controle total, mas requer atualização manual em rotação de chaves. |
| **Segurança** | **Alta**. Reduz erro humano na cópia de segredos. Gestão de acesso via time Vercel. | **Alta**. Permite controle granular de quais chaves são expostas. |
| **Billing (Faturamento)** | **Unificado**. Cobrado na fatura da Vercel. | **Separado**. Cobrado diretamente pelo Supabase. |
| **Controle de Versão** | **Vinculado**. Deployments Vercel ligados a projetos Supabase específicos. | **Independente**. Qualquer branch pode apontar para qualquer projeto DB. |
| **Branching (Preview)** | **Limitado/Complexo**. Requer workflows específicos para injetar DBs de preview. | **Flexível**. Configurável via scripts de CI/CD customizados. |
| **Compatibilidade** | Otimizado para Next.js (`NEXT_PUBLIC_` prefix). | Agnóstico (funciona igual para Vite, React, Vue, etc). |

---

## 2. Análise Detalhada

### 2.1. Integração Nativa (Vercel Marketplace)
A rota "oficial" promovida pela Vercel. Ideal para quem busca *zero-config* e gestão centralizada.

**Vantagens:**
*   **Speed to Market:** Criação de banco de dados e deploy em segundos.
*   **Sincronização:** Alterações de chaves no Supabase refletem automaticamente na Vercel (após redeploy).
*   **SSO/Acesso:** Membros do time Vercel ganham acesso correspondente no Supabase Organization.

**Desvantagens:**
*   **Prefixos Fixos:** Força o uso de `NEXT_PUBLIC_SUPABASE_URL`. Projetos Vite (como este) precisam de adaptação ou mapeamento.
*   **Vendor Lock-in (Billing):** A gestão financeira fica atrelada à Vercel. Migrar o billing depois pode ser burocrático.
*   **Rigidez:** Menos flexibilidade para apontar um ambiente de Staging da Vercel para um projeto de Prod do Supabase (ou vice-versa) sem "desligar" a integração.

### 2.2. Configuração Manual
A abordagem "clássica". Você cria o projeto no `supabase.com` e cola as chaves na Vercel.

**Vantagens:**
*   **Controle Total:** Você decide o nome das variáveis (`VITE_SUPABASE_URL`, `MY_APP_DB_KEY`).
*   **Desacoplamento:** O ciclo de vida do banco de dados não depende da conta da Vercel.
*   **Agnosticismo:** Funciona exatamente igual se você mudar da Vercel para Netlify, AWS ou Docker.
*   **Segurança por Isolamento:** Um desenvolvedor com acesso à Vercel não ganha automaticamente acesso administrativo ao Supabase.

**Desvantagens:**
*   **Erro Humano:** Risco de colar chaves erradas ou esquecer de atualizar após rotação.
*   **Setup Inicial:** Mais passos manuais (copiar/colar chaves, configurar pooling).

---

## 3. Checklist de Infraestrutura & Requisitos

### Cenário A: Integração Nativa
- [ ] Conta Vercel com permissões de Owner/Admin.
- [ ] Cartão de crédito vinculado na Vercel (para uso excedente).
- [ ] **Não** ter um projeto Supabase pré-existente que se deseja "vincular" (a integração prefere criar novos, embora vincular existentes seja possível, é propenso a falhas de permissão).
- [ ] **Variáveis Auto-Injetadas:**
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `POSTGRES_URL` (Connection Pooler)
    - `POSTGRES_URL_NON_POOLING` (Direct)

### Cenário B: Configuração Manual (Recomendado para este Projeto Vite)
- [ ] Projeto criado em `app.supabase.com`.
- [ ] Connection Pooling (Supavisor) ativado nas configurações do Supabase (porta 6543).
- [ ] **Variáveis de Ambiente (Vite Padrão):**
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
- [ ] **Script de Deploy:** Nenhuma alteração necessária, apenas garantir que as env vars existam no painel da Vercel.

---

## 4. Guia de Migração & Código

### 4.1. Cliente Universal (Implementado)
O código do projeto **já foi atualizado** para suportar ambas as estratégias nativamente. Isso significa que o sistema detecta automaticamente qual conjunto de variáveis está disponível, sem necessidade de alterações no código.

**Como funciona (Prioridade):**
1.  **Runtime Config** (`window.ENV`): Para injeção dinâmica (Docker/Containers).
2.  **Vite Env** (`VITE_...`): Para desenvolvimento local ou configuração manual clássica.
3.  **Vercel Env** (`NEXT_PUBLIC_...`): Para integração nativa do Marketplace.

**Arquivo: `src/lib/supabase.ts`**

```typescript
// ... (código implementado)
const getEnvVar = (key: string, nextKey: string) => {
  // Lógica de fallback automática
  // ...
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
// ...
```

### 4.2. Migração: Manual -> Nativa
1.  Vá ao Dashboard da Vercel > Settings > Integrations > Marketplace.
2.  Instale "Supabase".
3.  Selecione o projeto Vercel e escolha "Link Existing Project" (se suportado) ou "Create New".
4.  **Atenção:** A integração injetará `NEXT_PUBLIC_...`.
5.  Atualize seu código (como acima) ou adicione um `vite.config.ts` define para mapear as variáveis:
    ```typescript
    // vite.config.ts
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }
    ```

### 4.3. Migração: Nativa -> Manual
1.  Vá ao Dashboard Vercel > Integrations > Supabase > Manage > **Uninstall/Disconnect**.
    *   *Cuidado: Verifique se a opção "Delete connected Supabase project" está DESMARCADA para não perder dados.*
2.  Vá ao Supabase Dashboard > Settings > API.
3.  Copie URL e Anon Key.
4.  Vá ao Vercel > Settings > Environment Variables.
5.  Adicione manualmente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
6.  Realize um novo Deploy.

---

## 5. Recomendação Técnica

Para o projeto **ArsInstalações**, considerando que:
1.  É um projeto **Vite** (SPA), não Next.js.
2.  Já possui uma convenção estabelecida de `VITE_...`.
3.  A infraestrutura atual já está estável.

**Recomendação: MANTER A CONFIGURAÇÃO MANUAL.**

**Justificativa:**
A integração nativa é fortemente opinativa para o ecossistema Next.js (`NEXT_PUBLIC_`). Adotá-la agora exigiria refatoração da camada de configuração (`vite.config.ts` ou `supabase.ts`) sem trazer ganho real de funcionalidade, apenas conveniência de billing. A configuração manual oferece o isolamento e controle ideais para uma aplicação que pode, no futuro, ser migrada para outra plataforma de hospedagem sem depender de hooks proprietários da Vercel.

**Melhoria Sugerida (Concluída):**
O código "Universal" já foi implementado. O projeto está tecnicamente pronto para qualquer uma das abordagens, eliminando o risco de *vendor lock-in* técnico. A decisão agora é puramente administrativa/financeira.
