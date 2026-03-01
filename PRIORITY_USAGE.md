# Padrão de Uso do Atributo `priority` em Imagens

Este documento estabelece as diretrizes para o uso do atributo `priority` no componente `OptimizedImage` para garantir a melhor performance e eliminar "refreshes" (layout shifts e flickers) visuais durante a navegação.

## Objetivo
Eliminar a percepção de "refresh" da página causada pelo carregamento tardio de imagens acima da dobra (above-the-fold) e layout shifts associados a skeleton loaders.

## Diretrizes Gerais

O atributo `priority={true}` deve ser utilizado **exclusivamente** em imagens que são visíveis imediatamente após o carregamento da página ou navegação de rota, sem necessidade de scroll.

### 1. Páginas de Detalhes (Hero Images)
Em páginas de detalhes (Serviços, Portfólio, Áreas de Atuação), a imagem principal (Hero) deve sempre ter prioridade.

**Exemplo:**
```tsx
<OptimizedImage 
  src={data.image_url} 
  alt={data.title}
  className="w-full h-96 object-cover"
  priority={true} // Obrigatório para LCP
/>
```

### 2. Listagens (Grid/Cards)
Em listagens, apenas as imagens que aparecem na primeira tela (viewport inicial) devem ter prioridade. Utilize o índice do `map` para determinar isso dinamicamente.

**Regra de Ouro:** Priorize os primeiros 4-6 itens, dependendo do layout (grid de 2, 3 ou 4 colunas).

**Exemplo (Grid de 3 colunas):**
```tsx
{items.map((item, index) => (
  <Card key={item.id}>
    <OptimizedImage 
      src={item.image} 
      priority={index < 6} // Prioriza as 2 primeiras linhas
    />
  </Card>
))}
```

### 3. Home Page e Seções Principais
- **Hero/Banner Principal:** Sempre `priority={true}`.
- **Logotipo (Header):** Sempre `priority={true}`.
- **Seções "Sobre" (se visível no topo):** `priority={true}`.

### 4. Componentes Globais
- **Skeleton Loaders:** Evite renderizar esqueletos para conteúdos que já deveriam estar em cache ou memória (ex: dados vindos de navegação anterior via estado global).
- **Transições:** O `OptimizedImage` desativa automaticamente a transição de opacidade quando `priority={true}` é usado, evitando o efeito de "fade-in" desnecessário.

## Benefícios
1.  **Melhor LCP (Largest Contentful Paint):** O navegador carrega a imagem imediatamente.
2.  **Estabilidade Visual (CLS):** Elimina a troca entre esqueleto/espaço em branco e a imagem final.
3.  **Experiência do Usuário:** Navegação parece instantânea (SPA real).

## Testes de Performance
Para garantir que as diretrizes de performance estão sendo seguidas, foi criado um conjunto de testes em `src/tests/performance/Priority.test.tsx`.
Este teste valida:
- Se as primeiras 4 imagens da seção de Serviços têm prioridade.
- Se as primeiras 4 imagens da seção de Projetos têm prioridade.
- Se os primeiros 6 logotipos de Parceiros têm prioridade.
- Se a imagem da seção Sobre tem prioridade.

Para rodar os testes:
```bash
npm test src/tests/performance/Priority.test.tsx
```

## Correções de Layout Shift (Flickering)
Além do uso de `priority`, foram realizadas correções estruturais para evitar "flickering" de layout:
1. **Remoção de `Suspense` na Home:** Os componentes da Home agora são carregados de forma síncrona (após o bundle inicial) ou via `import` estático para evitar o fallback de carregamento que causava piscadas brancas.
2. **Hidratação de Estado Global:** O `useGlobalStore` persiste dados críticos (Hero, Sobre, Serviços) para que a renderização inicial seja imediata, sem aguardar novo fetch.
3. **Skeleton Inteligente:** O Skeleton da Home só é exibido se **nenhum** conteúdo estiver em cache (primeira visita absoluta). Caso contrário, exibe o conteúdo em cache imediatamente enquanto atualiza em segundo plano (stale-while-revalidate).

---
**Atualizado em:** 21/02/2026
