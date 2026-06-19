import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  assertSupabaseStorageConfigured,
  getSupabaseServiceKey,
  getSupabaseUrl,
  isSupabaseStorageConfigured,
} from "./config";

/** Cliente admin solo para Storage (subida/descarga de imágenes). */
export function createStorageAdminClient(): SupabaseClient {
  assertSupabaseStorageConfigured();
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createStorageAdminClientIfConfigured(): SupabaseClient | null {
  if (!isSupabaseStorageConfigured()) return null;
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
