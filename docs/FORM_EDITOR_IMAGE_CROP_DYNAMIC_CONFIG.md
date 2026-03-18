# Editor de Formulários: Configuração Dinâmica de Corte de Imagens

## Objetivo

Implementar um fluxo centralizado para configurar regras de corte por formulário no admin, com persistência em banco, aplicação automática no upload/editor e API REST para gerenciamento.

## Funcionalidades Entregues

- Configuração dinâmica por formulário com chave única (`formKey`).
- Definição de proporção (`aspectWidth` x `aspectHeight`) por formulário.
- Validação de dimensões mínimas e máximas por formulário.
- Preview visual em tempo real da proporção e limites.
- Aplicação automática das regras no componente de upload e no editor avançado.
- API REST para listar, criar/atualizar e restaurar configurações.
- Persistência das configurações em tabela dedicada no banco.

## Arquitetura

### Frontend

- Perfis padrão e tipos: `src/config/formImageCropProfiles.ts`
- Serviço de API com cache: `src/services/formImageCropConfigService.ts`
- Hook de consumo por formulário: `src/hooks/useFormImageCropConfig.ts`
- UI de configuração no admin:
  - `src/pages/Admin/Settings/components/FormCropSettingsPanel.tsx`
  - Integrado em `src/pages/Admin/Settings/index.tsx`
- Aplicação no upload/editor:
  - `src/components/Admin/ImageUpload.tsx`
  - Valores dinâmicos aplicados em `activeValidationRules` e no modal de edição.

### Backend (Supabase)

- Migração de banco:
  - `supabase/migrations/20260308113000_create_form_image_crop_configs.sql`
- Edge Function REST:
  - `supabase/functions/form-image-crop-configs/index.ts`

## Modelo de Dados

Tabela: `public.form_image_crop_configs`

Campos principais:

- `form_key` (TEXT, único)
- `label` (TEXT)
- `description` (TEXT)
- `aspect_width` (INTEGER > 0)
- `aspect_height` (INTEGER > 0)
- `min_width` / `min_height` (INTEGER > 0)
- `max_width` / `max_height` (INTEGER > 0)
- `is_active` (BOOLEAN)
- `updated_by` (UUID, referência `auth.users`)

Restrições:

- `min_width <= max_width`
- `min_height <= max_height`

RLS:

- Leitura/escrita permitida para `admin` e `editor` via `is_admin_or_editor()`.

## API REST

Endpoint base: `/functions/v1/form-image-crop-configs`

### GET

- Lista todas as configurações.
- Query opcional: `formKey` para buscar configuração específica.

### PUT / POST

- Upsert por `formKey`.
- Payload:
  - `formKey`
  - `label`
  - `description`
  - `aspectWidth`, `aspectHeight`
  - `minWidth`, `minHeight`
  - `maxWidth`, `maxHeight`
  - `isActive`

### DELETE

- Remove configuração customizada por `formKey`.
- O frontend restaura automaticamente o perfil padrão local para o formulário.

## Aplicação das Regras no Upload

- Cada formulário passa `formKey` para `ImageUpload`.
- O hook `useFormImageCropConfig` resolve a configuração dinâmica + fallback padrão.
- Regras aplicadas:
  - `aspectRatio`
  - `minWidth` e `minHeight`
  - `maxWidth` e `maxHeight`
- Limites máximos finais combinam regra dinâmica e regra de redimensionamento global/contextual.

## Mapeamento de Formulários

- `services.featured`
- `portfolio.cover`
- `portfolio.gallery`
- `pages.featured`
- `partners.logo`
- `practice-areas.image`
- `home.hero`
- `home.about`
- `settings.logo`
- `settings.og`

## Tratamento de Erros

- API:
  - sessão inválida (`401`)
  - permissão insuficiente (`403`)
  - payload inválido (`400`)
  - erro de persistência (`500`)
- Frontend:
  - mensagens amigáveis via toast para carga/salvamento/restauração.
  - fallback para perfil padrão quando configuração customizada estiver inativa.
- Upload:
  - rejeição de arquivo fora de tipo, tamanho, proporção e limites dimensionais.

## Testes

### Unitários

- `src/config/formImageCropProfiles.test.ts`
  - valida consistência dos perfis padrão
  - valida cálculo de proporção e override

### Integração (hook)

- `src/hooks/useFormImageCropConfig.test.tsx`
  - valida aplicação de configuração dinâmica
  - valida fallback quando configuração está inativa

### Verificação de Build/Tipos

- `npm run check`

## Considerações de Performance

- Cache em memória no serviço de configuração (`TTL` de 5 minutos).
- Deduplicação de requisições concorrentes para a mesma listagem.
- Reuso do fluxo de upload existente, sem duplicar pipeline de compressão/validação.
