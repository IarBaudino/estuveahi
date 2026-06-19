-- Perfil extendido y bloqueo de usuarios
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- Migrar full_name existente
UPDATE profiles
SET
  first_name = COALESCE(
    first_name,
    NULLIF(trim(split_part(COALESCE(full_name, ''), ' ', 1)), '')
  ),
  last_name = COALESCE(
    last_name,
    NULLIF(
      trim(substring(COALESCE(full_name, '') FROM position(' ' IN COALESCE(full_name, '')) + 1)),
      ''
    )
  )
WHERE full_name IS NOT NULL
  AND (first_name IS NULL OR last_name IS NULL);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
DECLARE
  v_first TEXT := NEW.raw_user_meta_data->>'first_name';
  v_last TEXT := NEW.raw_user_meta_data->>'last_name';
  v_full TEXT := NEW.raw_user_meta_data->>'full_name';
BEGIN
  IF v_first IS NULL AND v_full IS NOT NULL THEN
    v_first := NULLIF(trim(split_part(v_full, ' ', 1)), '');
    v_last := NULLIF(trim(substring(v_full FROM position(' ' IN v_full) + 1)), '');
  END IF;

  INSERT INTO profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      v_full,
      NULLIF(trim(concat_ws(' ', v_first, v_last)), '')
    ),
    v_first,
    v_last,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política: avatares propios
CREATE POLICY "avatars_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
