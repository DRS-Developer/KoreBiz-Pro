# Changelog - Remoção de Efeitos Visuais

## [Unreleased]

### Removido
- **Home.tsx**:
  - Removidas todas as animações do `framer-motion` (`motion.div`, `variants`, `initial`, `animate`, `whileInView`).
  - Removidos efeitos de hover em botões (`hover:bg-*`, `hover:text-*`, `hover:border-*`).
  - Removidos efeitos de hover em cards (`hover:shadow-xl`, `group-hover:*`).
  - Removidas transições CSS (`transition-colors`, `transition-shadow`, `transition-transform`, `duration-*`).
  - Removido efeito de zoom em imagens (`hover:scale-105`).
  - Removido efeito de opacidade em parceiros (`opacity-70`, `hover:opacity-100`).
  - Removido `HomeSkeleton` animado (substituído por indicador de carregamento estático se necessário, ou mantido apenas como estrutura sem pulsação se for CSS puro).
  - Substituída renderização direta de tags `<p>` por componente `HtmlContent` para evitar exibição literal de tags HTML em descrições dinâmicas.
  
- **Empresa.tsx**:
  - Removidas animações do `framer-motion`.
  - Removidos efeitos de transição e hover em elementos visuais.
  - Removido `PageSkeleton` animado.
  - Substituída renderização direta de tags `<p>` por componente `HtmlContent` para evitar exibição literal de tags HTML.

- **WhatsAppButton.tsx**:
  - Removida animação de entrada (slide up/fade in).
  - Removido efeito de pulsação (`animate-ping`).
  - Removidos efeitos de hover e transições no botão e tooltip.

- **CardSkeleton.tsx**:
  - Removida classe `animate-pulse` dos skeletons de cards.

- **LoadingSpinner.tsx**:
  - Removida classe `animate-spin` do loader (agora é estático).

- **Header.tsx & Footer.tsx**:
  - Removidas classes `transition-colors` e `duration-*` dos links e botões para eliminar transições suaves de cor no hover (a mudança de cor agora é instantânea).

- **Arquivos Admin**:
  - Removidos efeitos de hover e transições em `MediaManager.tsx`, `MediaPreviewModal.tsx`, `Contacts/List.tsx`, `Users/List.tsx`, `Servicos/index.tsx`, `EmailSettingsTab.tsx`, `SectionsTab.tsx`, `ErrorBoundary.tsx`, `ConfirmationModal.tsx`, `ImageEditorModal.tsx`.
  - Removidos tooltips dinâmicos em `EmailSettingsTab.tsx` (substituídos por texto estático).
  - Removidos efeitos de hover em tabelas e botões de ação.
  - Removidos spinners de carregamento (`RefreshCw`, `Loader2`, spinner CSS) nas páginas de Admin (Home, PracticeAreas, Partners, Users), substituídos por texto estático ("Carregando...", "Salvando...").

- **Global**:
  - Removido efeito de blur padrão no componente `OptimizedImage`. Agora o carregamento de imagens é instantâneo sem transição de desfoque.

### Mantido
- Layout responsivo (Grid, Flexbox).
- Estrutura semântica HTML.
- Acessibilidade (contrastes padrão, atributos ARIA, navegação por teclado - agora sem interferência de animações).
