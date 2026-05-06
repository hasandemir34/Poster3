import { createClient } from "./client";

/**
 * Uploads a poster PNG blob to the 'posters' bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadPoster(userId: string, blob: Blob): Promise<string> {
  const supabase = createClient();
  const fileName = `${userId}/${Date.now()}.jpg`;

  const uploadPromise = supabase.storage
    .from("posters")
    .upload(fileName, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.")), 30_000)
  );

  const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Baskı dosyası yüklenirken bir hata oluştu: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("posters")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
