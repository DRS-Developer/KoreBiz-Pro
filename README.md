# KoreBiz-Pro Platform (React + TypeScript + Vite)

Este repositório contém o código fonte da plataforma KoreBiz-Pro.

## Desenvolvimento

### Setup

```bash
npm install
npm run dev
```

### Build e validação

```bash
npm run check
npm run build
```

### Testes

```bash
npm test
npm run test:e2e:forms
npm run test:e2e:editor
npm run test:e2e:home-builder
```

### Home Widget Builder v2

- Documentação da arquitetura: `docs/HOME_WIDGET_BUILDER_ARCH.md`
- Contrato de API: `docs/HOME_WIDGET_API.md`
- Plano de migração e rollback: `docs/HOME_WIDGET_MIGRATION.md`
- Fallback legado: `site_settings.layout_settings.home_builder_v2_enabled = false`

## Visão Geral

KoreBiz-Pro é uma solução completa para gestão de serviços de instalação e manutenção, incluindo:
- Site Institucional (Landing Page, Serviços, Portfólio)
- Painel Administrativo (CMS)
- Gestão de Mídia e Parceiros


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
