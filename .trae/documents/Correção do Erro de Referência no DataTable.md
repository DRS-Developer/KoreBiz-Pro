O erro `ReferenceError: getPreviewLink is not defined` ocorre porque a propriedade `getPreviewLink` está sendo utilizada no JSX do componente `DataTable`, mas não foi declarada na interface de props nem desestruturada nos argumentos da função.

Vou corrigir isso imediatamente atualizando a definição do componente.

### **Plano de Execução**

1.  **Corrigir `DataTable.tsx`**:
    *   Adicionar `getPreviewLink` à interface `DataTableProps`.
    *   Desestruturar `getPreviewLink` dos argumentos do componente `DataTable`.
2.  **Verificar e Validar**:
    *   Confirmar se a tipagem está correta (função opcional que recebe um item e retorna string ou null).
    *   Executar o build novamente para garantir que não haja outros erros de referência.
