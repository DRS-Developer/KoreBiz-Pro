# Padrão de Layout e Estilo para Formulários (KoreBiz-Pro)

Este documento define o padrão unificado para criação e manutenção de formulários no painel administrativo do sistema KoreBiz-Pro. O objetivo é garantir consistência visual, usabilidade (UX) e responsividade em toda a aplicação.

## 1. Estrutura Geral do Layout

Todos os formulários devem seguir um fluxo **vertical de coluna única** para a estrutura principal. Isso evita problemas de quebra de layout em telas intermediárias e melhora a leitura.

### Regra de Ouro:
> **"Mobile-First, Single Column Flow"**

### Estrutura Padrão (JSX):

```tsx
<form className="space-y-8">
  <div className="flex flex-col gap-8">
    
    {/* Seção 1: Imagem de Destaque (Se houver) */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
       <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Imagem de Capa</h2>
       {/* Componente ImageUpload Centralizado */}
    </div>

    {/* Seção 2: Informações Principais */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
       <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações Principais</h2>
       
       {/* Grid Interno para campos pequenos (inputs) */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos... */}
       </div>
    </div>

    {/* Seção 3: Conteúdo Rico / SEO */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
       {/* ... */}
    </div>

  </div>

  {/* Rodapé com Ações */}
  <div className="flex justify-end gap-4">
     <button>Cancelar</button>
     <button>Salvar</button>
  </div>
</form>
```

## 2. Componente de Imagem (ImageUpload)

Imagens de destaque (Banners, Capas, Logos) devem seguir uma regra estrita de exibição para não dominarem a tela em desktops, mas permanecerem usáveis em mobile.

### Regra de Exibição:
- **Mobile (< 768px):** Largura total (`w-full`).
- **Desktop (>= 768px):** Máximo de 50% da largura, centralizado (`md:max-w-[50%] mx-auto`).

### Implementação:

```tsx
<div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
    <ImageUpload
        label="Imagem de Capa"
        value={watch('image_url')}
        onChange={...}
        folder="portfolio"
        aspectRatio={16/9} // ou 4/3, etc.
        minWidth={800}     // Sempre definir dimensões explícitas
        minHeight={450}
        // NÃO usar 'description' para repetir dimensões. O componente já exibe.
    />
</div>
```

## 3. Grids de Campos (Inputs)

Embora a estrutura macro seja uma coluna única, campos de texto curtos (ex: Título, Slug, Data, Categoria) devem ser agrupados em grids responsivos dentro dos cards.

### Padrão de Grid:
`grid grid-cols-1 md:grid-cols-2 gap-6`

Isso garante que em mobile os campos fiquem um abaixo do outro (1 col), e em desktop fiquem lado a lado (2 cols), otimizando o espaço vertical.

## 4. Estilos de Tipografia e Espaçamento

Mantenha a consistência utilizando as classes utilitárias do Tailwind já padronizadas:

- **Títulos de Seção:** `text-lg font-semibold text-gray-800 border-b pb-4`
- **Labels de Input:** `block text-sm font-medium text-gray-700 mb-1`
- **Inputs/Selects:** `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`
- **Mensagens de Erro:** `text-red-500 text-sm mt-1`
- **Containers (Cards):** `bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6`

## 5. Checklist de Verificação

Ao criar ou refatorar um formulário, verifique:

- [ ] O layout principal usa `flex-col` e não `grid` para as seções maiores?
- [ ] A imagem de destaque está no topo ou em destaque?
- [ ] A imagem tem o container `md:max-w-[50%] mx-auto`?
- [ ] As dimensões da imagem (`minWidth`, `minHeight`) estão passadas como props?
- [ ] Não há textos de ajuda redundantes duplicando o tamanho da imagem?
- [ ] Campos curtos estão agrupados em `grid-cols-1 md:grid-cols-2`?
- [ ] O formulário é totalmente responsivo em largura de celular (320px+)?
