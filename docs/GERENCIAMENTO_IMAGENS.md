# Sistema de Gerenciamento de Imagens (KoreBiz-Pro)

Este documento descreve a arquitetura e o funcionamento do sistema de gerenciamento de imagens implementado no projeto, utilizando o Supabase Storage.

## 1. Visão Geral

O sistema foi projetado para garantir organização, segurança e integridade dos dados, com as seguintes características principais:
- **Estrutura de Pastas Padronizada**: Cada entidade (serviços, portfólio, sistema) possui sua própria pasta.
- **CRUD Robusto**: Operações de Upload, Delete e Update centralizadas em um serviço.
- **Backup Temporário (Trash)**: Imagens deletadas ou substituídas são movidas para uma pasta `trash/` antes de serem removidas permanentemente.
- **Validações**: Verificação de tipo e tamanho de arquivo antes do upload.

## 2. Estrutura de Pastas

As imagens são organizadas no bucket `media` seguindo a estrutura definida no arquivo `src/services/storage/folderStructure.ts`:

- `sistema/`: Logos, banners, favicons e assets de configuração.
- `servicos/`: Imagens relacionadas aos serviços oferecidos.
- `portfolio/`: Imagens dos projetos do portfólio.
- `parceiros/`: Logos e imagens de parceiros.
- `posts/`: Imagens utilizadas em posts do blog/notícias.
- `equipe/`: Fotos dos membros da equipe.
- `geral/`: Imagens genéricas que não se encaixam nas categorias acima.
- `trash/`: Lixeira para backup temporário de arquivos excluídos/substituídos (estrutura: `trash/YYYY-MM-DD/timestamp_nome`).

### Adicionando Novas Pastas

Para adicionar uma nova pasta ao sistema:
1. Adicione a nova chave no enum `StorageFolder` em `src/services/storage/folderStructure.ts`.
2. Atualize o mapeamento no componente `ImageUpload.tsx` (função `mapStringToStorageFolder`).

## 3. Serviço de Storage (`storageService.ts`)

O serviço localizado em `src/services/storage/storageService.ts` centraliza todas as operações.

### Funções Principais

#### `uploadImage(file: File, folder: StorageFolder, oldUrl?: string)`
Realiza o upload de uma imagem.
- **Valida** o arquivo (tipo e tamanho).
- **Move** a imagem antiga para `trash/` se `oldUrl` for fornecido.
- **Gera** um nome único para o arquivo.
- **Retorna** a URL pública e o caminho do arquivo.

#### `deleteImage(url: string)`
Remove uma imagem do sistema (move para `trash/`).
- Deve ser chamado sempre que um registro for excluído.

#### `updateImage(file: File, oldUrl: string, folder: StorageFolder)`
Wrapper para `uploadImage` que facilita a substituição de imagens.

## 4. Componente de Upload (`ImageUpload.tsx`)

O componente `ImageUpload` foi atualizado para utilizar o `storageService`.
- Ele detecta automaticamente a pasta de destino baseada na prop `folder`.
- Realiza otimização de imagem (WebP) antes do upload.
- Gerencia a substituição e exclusão de imagens através do serviço.

## 5. Fluxo de Backup e Limpeza

### Lixeira (`trash/`)
Quando uma imagem é "deletada" ou "substituída", ela **não é removida imediatamente** do bucket. Em vez disso, ela é movida para a pasta `trash/` com um timestamp.

Isso previne a perda acidental de dados e permite recuperação manual se necessário.

### Limpeza Permanente
Atualmente, a limpeza da pasta `trash/` deve ser feita manualmente ou através de uma política de ciclo de vida (Lifecycle Policy) configurada diretamente no Supabase Storage (recomendado: expirar objetos em `trash/` após 30 dias).

## 6. Testes

O sistema possui testes unitários em `src/services/storage/storageService.test.ts` que validam:
- Upload bem-sucedido.
- Tratamento de erros.
- Movimentação para trash (backup).
- Exclusão lógica.

Para rodar os testes:
```bash
npm run test src/services/storage/storageService.test.ts
```
