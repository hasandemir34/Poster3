import { createClient } from "./client";

/**
 * Uploads a poster PNG blob to the 'posters' bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadPoster(userId: string, blob: Blob): Promise<string> {
  const supabase = createClient();
  const fileName = `${userId}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("posters")
    .upload(fileName, blob, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Baskı dosyası yüklenirken bir hata oluştu.");
  }

  const { data: urlData } = supabase.storage
    .from("posters")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
