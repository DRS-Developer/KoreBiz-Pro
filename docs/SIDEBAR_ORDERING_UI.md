# Interface de Ordenação da SideBar

## Objetivo

Padronizar feedback visual durante drag-and-drop dos botões configuráveis sem recarregar a página.

## Estados da Interface

- `idle`: exibe `Menu Configurável` + toggle global de ordenação à direita
- `processing`: exibe `Reordenando` + spinner animado à direita
- `success`: exibe `Reordenado com sucesso`
- `error`: exibe `Falha ao reordenar` e retorna ao padrão após temporização

## Componente

Arquivo: `src/components/Admin/OrderingStatusLabel.tsx`

### Exemplo de uso

```tsx
<OrderingStatusLabel
  phase="idle"
  allSortingEnabled={true}
  onToggleAllSorting={(enabled) => console.log(enabled)}
/>
```

## Fluxo no AdminLayout

- Início do drag válido: `phase = processing` (mínimo de `2000ms`)
- Requisição concluída com sucesso: `phase = success`
- Falha de persistência/reordenação: `phase = error`
- Reset automático para `idle`: `2000ms` após sucesso/erro
- Toggle global aparece somente em `idle` e controla todos os botões do grupo configurável

## Modal de Configuração

- O modal mantém controle de exibição individual por botão
- O controle individual de `Modo de Ordenação` foi removido do modal
- A ordenação agora é habilitada/desabilitada em lote no cabeçalho do grupo

## Spinner

O spinner segue o mesmo padrão visual já usado no painel admin:

- `border-2`
- `border-t-transparent`
- `rounded-full`
- `animate-spin`

## Testes

Arquivo: `src/components/Admin/OrderingStatusLabel.test.tsx`

Cobre:

- estado inicial
- processamento com spinner
- retorno pós-sucesso
- erro sem spinner
- acionamento do toggle global
