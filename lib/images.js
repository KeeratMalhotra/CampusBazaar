// runs in the browser before uploading a photo:
// shrinks it to max 1280px and saves it as webp.
// redrawing it on a canvas also throws away the hidden metadata
// (phone photos often have the GPS location of where they were taken).
export async function compressImage(file, maxSize = 1280, quality = 0.8) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("couldn't read that image"))),
      "image/webp",
      quality
    );
  });
}

// upload a photo to supabase storage inside the user's own folder, return its url
export async function uploadImage(supabase, bucket, userId, file) {
  const blob = await compressImage(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// "https://x.supabase.co/storage/v1/object/public/listing-images/abc/1.webp" -> "abc/1.webp"
export function storagePathFromUrl(url, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}
