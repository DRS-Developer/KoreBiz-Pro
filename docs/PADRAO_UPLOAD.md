# Padrão de Componente de Upload de Imagem (KoreBiz-Pro)

Este documento descreve o padrão oficial para implementação de uploads de imagem na plataforma KoreBiz-Pro, utilizando o componente centralizado `ImageUpload`.

## Visão Geral

O componente `ImageUpload` foi padronizado para oferecer uma experiência de usuário consistente, responsiva e robusta. Ele integra:
- Upload de arquivos locais (drag & drop).
- Seleção da biblioteca de mídia existente.
- Edição básica de imagem (recorte/crop).
- Visualização (preview) com ações claras.
- Feedback de progresso e erros.
- Padronização visual com Tailwind CSS.

## Localização

O componente está localizado em: `src/components/Admin/ImageUpload.tsx`

## Como Usar

### Importação

```tsx
import ImageUpload from '../../../components/Admin/ImageUpload';
```

### Exemplo Básico

```tsx
<ImageUpload
  label="Imagem de Capa"
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  folder="portfolio"
/>
```

### Props Disponíveis

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `label` | `string` | Não | `'Imagem'` | Rótulo exibido acima do componente. |
| `value` | `string` | Não | - | URL da imagem atual. |
| `onChange` | `(url: string) => void` | Sim | - | Função chamada quando a imagem muda (upload, seleção ou remoção). Retorna a URL ou string vazia. |
| `folder` | `string` | Não | `'media'` | Pasta lógica para organização no Supabase (ex: 'portfolio', 'services'). |
| `error` | `string` | Não | - | Mensagem de erro de validação a ser exibida. |
| `aspectRatio` | `number` | Não | `16/9` | Proporção desejada para o recorte (ex: 16/9, 4/3, 1). |
| `minWidth` | `number` | Não | `800` | Largura mínima recomendada (apenas informativo/validacão interna). |
| `minHeight` | `number` | Não | `450` | Altura mínima recomendada. |
| `description` | `string` | Não | - | Texto de ajuda ou instrução extra exibido no rodapé do componente. |
| `pageKey` | `PageKey` | Não | - | Chave da página para buscar imagens padrão gerenciadas. |
| `role` | `ImageRole` | Não | - | Papel da imagem (ex: 'hero', 'card') para configuração de padrões. |

### Exemplo Completo com React Hook Form

```tsx
<div className="space-y-4">
  <ImageUpload
    label="Imagem Destacada"
    value={watch('image_url')}
    onChange={(url) => setValue('image_url', url, { shouldDirty: true, shouldValidate: true })}
    folder="services"
    error={errors.image_url?.message}
    aspectRatio={4/3}
    minWidth={800}
    minHeight={600}
    description="Formato recomendado: 800x600px (Proporção 4:3)"
    pageKey="servicos:list"
    role="card"
  />
</div>
```

## Diretrizes de Design e UX

1.  **Labels:** Sempre use a prop `label` em vez de criar um `<label>` externo. Isso garante consistência de fonte e espaçamento.
2.  **Layout:** O componente ocupa 100% da largura do pai (`w-full`). Controle a largura usando o container pai (ex: grid cols).
3.  **Feedback:** Use a prop `error` para exibir mensagens de validação (ex: do YUP/React Hook Form). O componente estiliza o erro automaticamente.
4.  **Descrições:** Use a prop `description` para fornecer dicas úteis sobre dimensões ou formato, em vez de textos soltos na interface.
5.  **Responsividade:** O componente se adapta a telas móveis, movendo ações para overlays ou menus acessíveis.

## Estados Visuais e Acessibilidade

O componente implementa três estados visuais principais, todos otimizados para acessibilidade (WCAG) e responsividade.

### 1. Estado Vazio (Placeholder)
- **Visual:** Exibe ícone de upload grande e instruções claras.
- **Interação:** Clique em qualquer lugar ou arraste um arquivo.
- **Acessibilidade:** Botões focáveis, texto de alto contraste.

### 2. Estado com Imagem Padrão (Default)
- **Visual:** Exibe a imagem padrão do sistema com overlay semitransparente.
- **Overlay:** `bg-white/40` com `backdrop-blur`.
- **Ações:** Botões "Fazer Upload" (Azul) e "Biblioteca" (Branco/Cinza) centralizados.
- **Acessibilidade:** Botões com `aria-label`, foco visível (`ring`), tamanho de toque adequado (>44px).

### 3. Estado Preenchido (Com Imagem)
- **Visual:** Imagem ocupa o container mantendo a proporção (`object-contain`).
- **Ações:** Overlay escuro (`bg-black/60`) que aparece no **Hover** ou **Foco**.
- **Botões:** Editar (Recorte), Trocar e Remover.
- **Acessibilidade:** Overlay aparece automaticamente ao navegar via teclado (`focus-within`). Todos os botões possuem `aria-label` descritivos.

## Manutenção

Ao modificar o `ImageUpload.tsx`:
- Mantenha a compatibilidade com as props existentes.
- Teste o comportamento de "Estado Vazio", "Carregando", "Com Imagem" e "Com Erro".
- **Verifique a acessibilidade:** Navegue usando apenas o teclado (Tab) e garanta que todas as ações sejam alcançáveis e visíveis.
- Verifique a responsividade em mobile (botões devem quebrar linha se necessário).
- Não remova as integrações com `MediaLibraryModal` e `AdvancedImageEditorModal` sem fornecer alternativas equivalentes.
