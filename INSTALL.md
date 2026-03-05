# Guia de Instalação - KoreBiz-Pro

Este documento descreve como instalar e configurar o sistema KoreBiz-Pro em um novo ambiente.

## Pré-requisitos

1.  **Conta no Supabase**: Crie uma conta em [supabase.com](https://supabase.com) e inicie um novo projeto.
2.  **Ambiente de Hospedagem**:
    *   Vercel (Recomendado)
    *   OU Hospedagem Compartilhada (Hostinger, KingHost, etc.)
    *   OU Servidor Local (Node.js instalado para desenvolvimento)

---

## Método 1: Instalação via Wizard (Recomendado)

O sistema possui um instalador web integrado que facilita a configuração inicial.

1.  **Deploy do Código**:
    *   Faça o upload dos arquivos (pasta `dist` gerada pelo build) para seu servidor.
    *   Ao acessar o site pela primeira vez (sem configuração), você será redirecionado ou poderá acessar `/install` manualmente.
    
2.  **Acesse o Instalador**:
    *   Abra `https://seu-dominio.com/install`

3.  **Siga as Etapas**:
    *   **Conexão**: Insira a `Project URL` e `Anon Key` do seu projeto Supabase.
    *   **Banco de Dados**: O instalador fornecerá o código SQL necessário.
        *   Copie o código.
        *   Vá no Dashboard do Supabase -> SQL Editor.
        *   Cole e execute (Run).
        *   Volte ao instalador e clique em "Verificar".
    *   **Admin**: Crie seu usuário administrador.
    *   **Finalizar**:
        *   Se estiver na Vercel: Copie as variáveis e configure no painel da Vercel.
        *   Se estiver em Hospedagem Compartilhada: Baixe o `config.json` e suba para a raiz do site via FTP.

---

## Método 2: Instalação Manual

### 1. Configuração do Supabase

1.  Vá em **SQL Editor** no Supabase.
2.  Execute o script de migração completo localizado em `src/data/install_schema.ts` (você precisará extrair o SQL de lá ou usar o fornecido pelo desenvolvedor).
3.  Vá em **Storage** e crie um bucket público chamado `media`.
4.  Vá em **Authentication** -> **URL Configuration** e adicione a URL do seu site em "Site URL" e "Redirect URLs".

### 2. Configuração de Variáveis de Ambiente

**Para Vercel:**
Adicione as seguintes Environment Variables nas configurações do projeto:
- `VITE_SUPABASE_URL`: Sua URL do Supabase.
- `VITE_SUPABASE_ANON_KEY`: Sua chave pública (anon).

**Para Hospedagem Compartilhada:**
Crie um arquivo chamado `config.json` na raiz do site (pasta `public_html`) com o conteúdo:
```json
{
  "VITE_SUPABASE_URL": "https://seu-projeto.supabase.co",
  "VITE_SUPABASE_ANON_KEY": "sua-chave-publica-aqui"
}
```

---

## Troubleshooting (Resolução de Problemas)

**Erro: "DNS address could not be found" ou Falha de Conexão**
*   Verifique se a URL do Supabase está correta.
*   Verifique se o projeto no Supabase não está pausado (projetos gratuitos pausam após inatividade).

**Erro: Tela Branca ou 404 em subpáginas (Hospedagem Compartilhada)**
*   Certifique-se de que o arquivo `.htaccess` foi enviado para o servidor. Ele é responsável por redirecionar as rotas para o `index.html`.

**Erro ao fazer Upload de Imagens**
*   Verifique se as Policies do Storage foram criadas (passo do SQL).
*   Verifique se o usuário está logado como Admin ou Editor.

**Esqueci a senha do Admin**
*   Use a funcionalidade de "Recuperar Senha" na tela de login (requer configuração de SMTP no Supabase) ou crie um novo usuário via Signup e altere o papel manualmente no banco de dados se tiver acesso direto.
