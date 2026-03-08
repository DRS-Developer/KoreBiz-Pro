# Auditoria de Regras de Redimensionamento de Imagens

## Escopo auditado

- Formulários administrativos com upload de imagem via `ImageUpload`.
- Módulo de Configurações de Imagens em `Admin > Settings`.
- Fluxo de validação e upload em `storageService` e `validations`.

## Matriz de conformidade por formulário

| Formulário | Situação anterior | Status atual |
|---|---|---|
| Páginas (imagem destacada) | `pageKey` fixo em `home`, sem contexto por slug | Corrigido com resolução dinâmica de `pageKey` por slug |
| Portfólio (capa) | Já possuía regra de dimensão/proporção | Mantido |
| Portfólio (galeria) | Sem regra explícita (sem min/proporção/role/pageKey) | Corrigido com 800x600, 4:3, `role=card`, `pageKey=portfolio:detail` |
| Serviços (imagem destacada) | Regra inconsistente (`aspectRatio=4`, `200x50`) | Corrigido para 800x600, 4:3 e descrição padronizada |
| Áreas de Atuação | Contexto de página apontando para `servicos:list` | Corrigido para `areas:list` |
| Parceiros (logo) | Proporção divergente (`16:9`) | Corrigido para 2:1, mínimo 240x120, `role=logo` |
| Home Hero | Usava pasta `general` sem contexto dedicado em settings | Coberto com novo contexto `general` |
| Home Sobre (ContentEditor) | Usava pasta `general` sem contexto dedicado em settings | Coberto com novo contexto `general` |
| Configurações (logo/OG) | Usava pasta `settings` sem contexto dedicado em settings | Coberto com novo contexto `settings` |

## Lacunas de configuração corrigidas no módulo de Settings

- Inclusão de novos contextos de redimensionamento:
  - `partners`
  - `settings`
  - `general`
- Inclusão de campos completos no schema/form para esses contextos:
  - `*_resize_enabled`
  - `*_max_width`
  - `*_max_height`
- Persistência completa no `image_settings.contexts` ao salvar.
- Recuperação de defaults ao carregar configurações.
- Restauração de padrões incluindo os novos contextos.

## Regras de validação implementadas no backend de upload

- Validação de formatos aceitos por configuração (`output_formats` + tipos permitidos).
- Validação de tamanho máximo e mínimo de arquivo.
- Validação de largura/altura mínimas e máximas.
- Validação de proporção (`aspectRatio`) com tolerância.
- Tratamento explícito de erro quando não for possível aferir dimensões.
- Aplicação das regras no `uploadImage` com opção de `validationRules` e `inputDimensions`.

## Compressão e saída

- Qualidade aplicada a partir da configuração ativa (contexto/global).
- Formato de saída preferencial respeitando `output_formats` configurados.
- Fallback seguro para o formato original quando a compressão falhar.

## Testes automatizados adicionados/atualizados

- `storageService.test.ts`:
  - valida falha por regra de validação;
  - valida passagem de regras de serviço para o fluxo de upload.
- `validations.test.ts`:
  - cobre casos de sucesso;
  - tipo inválido;
  - limite de tamanho;
  - dimensão mínima;
  - proporção inválida.
