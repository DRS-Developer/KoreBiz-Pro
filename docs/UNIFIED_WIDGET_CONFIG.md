# Sistema Unificado de Configuração de Widgets

## Visão Geral
Como parte da evolução da arquitetura do Builder V2, o sistema de configuração de elementos da página inicial foi unificado. Anteriormente, as configurações de layout, variação e visibilidade eram realizadas através de uma coluna lateral à direita no gerenciador de widgets. Agora, todas as opções foram migradas para modais dinâmicos focados no contexto de cada elemento.

## O que Mudou?

1. **Remoção da Coluna Direita:**
   - O painel lateral de configurações no `HomeWidgetManager` foi completamente removido, permitindo que a lista de widgets ocupe uma área centralizada, mais limpa e focada no Drag-and-Drop.

2. **Novo Botão "Configurar Elemento":**
   - Todos os widgets da lista (independente de terem modais de conteúdo legado ou não) agora possuem um botão padronizado `Configurar`.
   - Este botão aciona o novo modal de configurações.

3. **Modal Unificado (`WidgetSettingsModal`):**
   - Foi criado um modal inteligente que carrega as opções específicas baseando-se na propriedade `widgetType`.
   - Propriedades globais (como `Variante` e `Elemento Habilitado`) são consistentes para todos os blocos.
   - Opções específicas (como limites, colunas, autoplay) são renderizadas condicionalmente.

4. **Harmonia com Modais de Conteúdo:**
   - Widgets como *Banner Principal*, *Sobre Nós* e *Chamada para Ação (CTA)* mantiveram seus botões coloridos específicos. Eles foram renomeados para **Conteúdo** para diferenciar claramente da ação de configuração estrutural.
   - Agora o administrador tem total controle entre:
     - **Conteúdo**: O que o widget exibe (textos, imagens).
     - **Configurar**: Como o widget se comporta (variantes de layout, visibilidade).

## Como Funciona

- O componente `SortableWidgetItem` foi estendido para receber a propriedade `onConfigure`.
- O `HomeWidgetManager` gerencia o estado `isSettingsModalOpen` e injeta a instância do widget selecionado no `WidgetSettingsModal`.
- O modal em si utiliza estados locais (`draftVariant`, `draftEnabled`, etc.) e só consolida as alterações no banco de dados quando o usuário clica em "Salvar Configurações".

## Critérios de Aceitação Atendidos
✅ Todos os widgets possuem o botão "Configurar" funcional.
✅ Modal dinâmico criado contemplando todos os cards de configuração de elementos.
✅ Acesso através da coluna direita removido.
✅ Consistência visual mantida (Tailwind CSS, ícones Lucide).
