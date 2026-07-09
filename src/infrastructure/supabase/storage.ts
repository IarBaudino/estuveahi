import { createStorageAdminClient, createStorageAdminClientIfConfigured } from "./admin";

export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  cacheControl = "private, no-cache, no-store",
): Promise<void> {
  const supabase = createStorageAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl,
  });
  if (error) throw error;
}

export async function downloadFile(
  bucket: string,
  path: string,
): Promise<Buffer> {
  const supabase = createStorageAdminClientIfConfigured();
  if (!supabase) throw new Error("Supabase Storage no configurado");

  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw error ?? new Error("Archivo no encontrado");

  return Buffer.from(await data.arrayBuffer());
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createStorageAdminClientIfConfigured();
  if (!supabase) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createStorageAdminClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
