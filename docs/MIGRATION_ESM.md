# Migração para ESM Puro (ECMAScript Modules)

Este projeto foi migrado completamente para o ecossistema ESM. Isso significa que não utilizamos mais CommonJS (`require`/`module.exports`) e adotamos o padrão oficial do JavaScript para módulos.

## Principais Mudanças

1.  **package.json**: Definido `"type": "module"`. Todos os arquivos `.js` e `.ts` são tratados como módulos ESM por padrão.
2.  **Scripts de Build/Automação**:
    - Todos os scripts em `scripts/` utilizam `import` e `export`.
    - `__dirname` e `__filename` foram substituídos por:
      ```javascript
      import { fileURLToPath } from 'url';
      import path from 'path';
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      ```
3.  **Dependências**:
    - `node-fetch` atualizado para v3 (ESM-only).
    - `fix_deps.cjs` convertido para `fix_deps.js`.

## Guia para Desenvolvedores

Ao criar novos scripts ou arquivos:

1.  **Use `import`/`export`**:
    ```javascript
    // ✅ Correto
    import fs from 'fs';
    export const myFunction = () => {};

    // ❌ Incorreto
    const fs = require('fs');
    module.exports = { myFunction };
    ```

2.  **Extensões Explícitas**:
    Ao importar arquivos locais, **sempre inclua a extensão do arquivo** (`.js`, `.ts`):
    ```javascript
    import { helper } from './utils/helper.js'; // ✅ Obrigatório em ESM puro no Node
    ```

3.  **JSON Imports**:
    Para importar arquivos JSON, use assertions (dependendo da versão do Node) ou leia com `fs`:
    ```javascript
    import config from './config.json' with { type: 'json' }; // Node recente
    // OU
    import fs from 'fs';
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    ```

## Validação

Para validar o ambiente:
```bash
npm run build
node scripts/generate-sitemap.js
```
Ambos devem executar sem erros de "require is not defined" ou "Cannot use import statement outside a module".
