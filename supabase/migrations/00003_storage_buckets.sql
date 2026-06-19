-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('photos-original', 'photos-original', false),
  ('photos-preview', 'photos-preview', true),
  ('photos-thumbnail', 'photos-thumbnail', true),
  ('avatars', 'avatars', true),
  ('event-covers', 'event-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Originals: only photographer owner
CREATE POLICY "originals_owner_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos-original'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "originals_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos-original'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public preview/thumbnail
CREATE POLICY "preview_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('photos-preview', 'photos-thumbnail', 'avatars', 'event-covers'));

CREATE POLICY "preview_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('photos-preview', 'photos-thumbnail')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
