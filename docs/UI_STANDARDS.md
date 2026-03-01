# Guia de Padronização Visual e Layout

Este documento estabelece as diretrizes de layout e espaçamento para o Painel Administrativo, garantindo consistência visual entre todas as telas.

## Referência Visual
As telas **Dashboard** e **Diagnóstico do Sistema** são os padrões de referência para:
- Espaçamentos (Paddings/Margins)
- Largura de conteúdo
- Gaps entre elementos

## Sistema de Espaçamento (Grid System)

Utilizamos o sistema de espaçamento do Tailwind CSS, padronizado nas seguintes variáveis (definidas em `src/index.css`):

| Variável CSS | Classe Tailwind | Valor (px) | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| `--spacing-xs` | `p-1`, `m-1`, `gap-1` | 4px | Pequenos ajustes |
| `--spacing-sm` | `p-2`, `m-2`, `gap-2` | 8px | Ícones, botões pequenos |
| `--spacing-md` | `p-4`, `m-4`, `gap-4` | 16px | Cards internos, listas compactas |
| **`--spacing-lg`** | **`p-6`, `m-6`, `gap-6`** | **24px** | **Padrão Global (Containers, Headers, Grids)** |
| `--spacing-xl` | `p-8`, `m-8`, `gap-8` | 32px | Seções grandes |
| `--spacing-2xl` | `p-12`, `m-12` | 48px | Espaçamento amplo |

## Diretrizes de Implementação

### 1. Containers de Página
*   **Regra:** O componente de página (ex: `ServicesList.tsx`) **NÃO deve ter padding interno** (`p-6`) em seu elemento raiz.
*   **Motivo:** O `AdminLayout` já fornece um padding padrão (`p-6`) para a área de conteúdo principal. Adicionar padding na página resulta em duplicidade (48px).
*   **Correto:**
    ```tsx
    return (
      <div> {/* Sem classe p-6 */}
        <div className="mb-6">...Header...</div>
        <DataTable ... />
      </div>
    );
    ```
*   **Incorreto:** `<div className="p-6">...</div>`

### 2. Cabeçalhos de Página
*   **Margem Inferior:** Sempre utilize **`mb-6`** (24px) para separar o título/cabeçalho do conteúdo principal.
*   **Alinhamento:** Use Flexbox para alinhar título e botões de ação.
    ```tsx
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Título</h1>
      <Button>Ação</Button>
    </div>
    ```

### 3. Largura de Conteúdo
*   **Listagens e Dashboards:** Devem ocupar **100% da largura** disponível (`w-full`). Não use `max-w-7xl` ou similares, salvo exceções de UX muito específicas.
*   **Formulários de Edição:** Devem ter largura limitada para melhor legibilidade.
    *   Padrão: **`max-w-4xl mx-auto`**
    *   Padrão Estreito (Login/Simples): `max-w-2xl mx-auto`

### 4. Grids e Cards
*   **Gap Padrão:** Utilize **`gap-6`** para grids de cards (Dashboard, Settings).
*   **Padding de Card:** Utilize **`p-6`** para o conteúdo interno de cards.

### 5. Layouts de Altura Fixa (Split-View)
*   Para páginas que precisam de rolagem interna independente (ex: Chat, Gerenciador de Mídia):
    *   Use **`h-full`** no container raiz.
    *   Garanta que o pai (`AdminLayout`) permita o preenchimento correto.
    *   Evite cálculos manuais como `h-[calc(100vh-64px)]` se possível, preferindo Flexbox.

---

## Checklist de Validação

Antes de aprovar uma nova tela ou alteração, verifique:

- [ ] **Padding do Container:** O elemento raiz da página **NÃO** possui `p-6`? (Deve herdar do Layout).
- [ ] **Margem do Header:** O título possui `mb-6` de espaçamento inferior?
- [ ] **Largura:**
    - Listagens: Ocupam a largura total?
    - Formulários: Estão centralizados com `max-w-4xl` (ou `2xl`)?
- [ ] **Consistência de Gaps:** Grids e listas usam `gap-6`?
- [ ] **Responsividade:** O layout quebra corretamente em mobile (coluna única) e desktop?
- [ ] **Navegadores:** Testado em Chrome/Edge (Engine Chromium) e Firefox/Safari?

---

## Variáveis CSS Globais
Disponíveis em `src/index.css`:
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;  /* Padrão Principal */
  --spacing-xl: 32px;
}
```
