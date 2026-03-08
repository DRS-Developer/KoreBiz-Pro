# Padrão de Testes de Formulários

## Objetivo

Padronizar organização, nomenclatura e cobertura dos testes de formulários para reduzir regressões e facilitar manutenção.

## Estrutura recomendada

- Testes unitários/integrados de formulário:
  - `src/pages/**/Form.form.test.tsx`
  - `src/pages/**/Login.form.test.tsx`
- Testes de interface (navegação real):
  - `scripts/test-e2e-admin-forms.js`
  - `scripts/test-e2e-editor-filerobot.js`
- Evidências de execução:
  - `reports/e2e-forms/`
  - `reports/e2e-editor/`

## Convenção de nomenclatura

- Arquivo: `<Componente>.form.test.tsx`
- Bloco principal: `describe('<Nome do Formulário> Form', ...)`
- Cenários:
  - `valida ...`
  - `submete ... com sucesso`
  - `trata erro ...`
  - `adiciona/remove ...` para interação de usuário

## Convenção de logs em testes

- Para cenários que disparam `console.error` esperado, usar helper compartilhado:
  - [silenceConsoleError.ts](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/tests/utils/silenceConsoleError.ts)
- Padrão de uso por suíte:
  - `useSilenceConsoleError()` no escopo do `describe`
- Objetivo:
  - manter saída de teste limpa sem alterar assertivas de erro

## Matriz mínima por formulário

Cada formulário deve ter, no mínimo:

1. **Validação de campos**
   - obrigatórios
   - formato inválido (email/url/slug/senha)
   - limites e consistência (ex.: confirmação de senha)
2. **Submissão de sucesso**
   - payload esperado
   - feedback de sucesso
   - redirecionamento esperado
3. **Tratamento de erro**
   - falha de serviço/repositório
   - feedback de erro para usuário
4. **Interação de usuário**
   - alteração de campo
   - estados de loading/disable quando aplicável
   - componentes interativos (lista dinâmica, upload, rich-text)

## Cobertura implementada nesta fase

- **Unitário/Integração (Vitest + RTL)**
  - [Login.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Login.form.test.tsx)
  - [Users/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Users/Form.form.test.tsx)
  - [Partners/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Partners/Form.form.test.tsx)
  - [PracticeAreas/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/PracticeAreas/Form.form.test.tsx)
  - [Services/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Services/Form.form.test.tsx)
  - [Portfolio/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Portfolio/Form.form.test.tsx)
  - [Pages/Form.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Pages/Form.form.test.tsx)
  - [Settings.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Settings/Settings.form.test.tsx)
  - [ContactInfoEditor.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/components/Admin/ContactInfoEditor.form.test.tsx)
  - [HeroTab.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Home/tabs/HeroTab.form.test.tsx)
  - [ContentEditorTab.form.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Admin/Home/tabs/ContentEditorTab.form.test.tsx)
- **Interface (E2E)**
  - [test-e2e-admin-forms.js](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/scripts/test-e2e-admin-forms.js)
  - Rotas cobertas: serviços, portfólio, páginas, parceiros, áreas de atuação e usuários

## Catálogo de testes existentes (referência)

- Página pública de contato:
  - [Contato.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/pages/Contato.test.tsx)
- Editor de imagem:
  - [AdvancedImageEditorModal.test.tsx](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/components/Admin/ImageEditor/AdvancedImageEditorModal.test.tsx)
- Storage/validações:
  - [storageService.test.ts](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/services/storage/storageService.test.ts)
  - [validations.test.ts](file:///c:/Users/danie/Projetos_IA/KoreBiz-Pro/src/services/storage/validations.test.ts)

## Execução

- Suíte unitária/integrada completa:
  - `npm test`
- Somente testes novos de formulários:
  - `npm run test -- src/pages/Admin/**/*.form.test.tsx`
- E2E formulários:
  - `npm run test:e2e:forms`
  - Requer: `E2E_ADMIN_EMAIL` e `E2E_ADMIN_PASSWORD`
