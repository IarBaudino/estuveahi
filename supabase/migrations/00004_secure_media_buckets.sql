-- Hacer buckets de fotos privados (solo acceso vía API con service role)
UPDATE storage.buckets SET public = false
WHERE id IN ('photos-preview', 'photos-thumbnail');

-- Eliminar lectura pública directa de previews/thumbnails
DROP POLICY IF EXISTS "preview_public_read" ON storage.objects;

-- Solo el dueño puede subir variantes
-- (lectura: exclusivamente service_role / API backend)
