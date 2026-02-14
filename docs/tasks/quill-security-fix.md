# Task: Atualizar react-quill-new para corrigir XSS (GHSA-v3m3-f69x-jf25)

## Contexto
- Vulnerabilidade low-severity no pacote `quill` (XSS via exportação HTML)
- `npm audit fix --force` propõe instalar `react-quill-new@3.7.0` (breaking change)

## Passos sugeridos
1. Criar branch `fix/quill-security`
2. Executar `npm audit fix --force`
3. Rodar testes e validar funcionalidade do editor
4. Se OK, mergear; se quebrar, avaliar substituição por Tiptap ou Slate

## Critérios de aceitação
- `npm audit` sem vulnerabilidades
- Editor rico funcional em Settings, Páginas, Serviços
- Build e testes passando

## Prioridade
Alta (segurança)