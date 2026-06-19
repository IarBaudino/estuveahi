-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_select_public_photographers" ON photographer_profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Photographer profiles
CREATE POLICY "photographer_profiles_select" ON photographer_profiles
  FOR SELECT USING (true);

CREATE POLICY "photographer_profiles_insert_own" ON photographer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "photographer_profiles_update_own" ON photographer_profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Events
CREATE POLICY "events_public_read" ON events
  FOR SELECT USING (
    (status = 'published' AND is_public = true)
    OR photographer_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "events_owner_write" ON events
  FOR ALL USING (photographer_id = auth.uid() OR is_admin());

-- Photos
CREATE POLICY "photos_public_read" ON photos
  FOR SELECT USING (
    is_visible AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = photos.event_id
        AND e.status = 'published'
        AND e.is_public = true
    )
    OR photographer_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "photos_owner_write" ON photos
  FOR ALL USING (photographer_id = auth.uid() OR is_admin());

-- Favorites
CREATE POLICY "favorites_owner" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- Purchase requests
CREATE POLICY "purchase_requests_select" ON purchase_requests
  FOR SELECT USING (
    client_id = auth.uid()
    OR photographer_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "purchase_requests_client_create" ON purchase_requests
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "purchase_requests_photographer_update" ON purchase_requests
  FOR UPDATE USING (photographer_id = auth.uid() OR is_admin());

CREATE POLICY "purchase_requests_client_cancel" ON purchase_requests
  FOR UPDATE USING (client_id = auth.uid() AND status = 'pending');
