import { getBucketAndPath } from "@/infrastructure/storage/storage.constants";
import { deleteFile } from "@/infrastructure/supabase/storage";

export async function deletePhotoStorageFiles(photo: {
  thumbnailPath: string;
  previewPath: string;
}): Promise<void> {
  const fullPaths = [photo.thumbnailPath, photo.previewPath].filter(Boolean);

  await Promise.all(
    fullPaths.map(async (fullPath) => {
      try {
        const { bucket, path } = getBucketAndPath(fullPath);
        await deleteFile(bucket, path);
      } catch (error) {
        console.error("[deletePhotoStorageFiles]", fullPath, error);
      }
    }),
  );
}
