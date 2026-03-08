-- Correção de Permissões do Storage (Bucket 'media')

-- 1. Garantir que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpar políticas antigas (para evitar duplicação/conflito)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Media Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Media Authenticated Delete" ON storage.objects;

-- 3. Criar Novas Políticas

-- Permite acesso público para leitura (necessário para o site exibir imagens)
CREATE POLICY "Media Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- Permite upload apenas para usuários autenticados
CREATE POLICY "Media Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'media' );

-- Permite atualização apenas para usuários autenticados
CREATE POLICY "Media Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'media' );

-- Permite deleção apenas para usuários autenticados
CREATE POLICY "Media Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'media' );
