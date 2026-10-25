// biggest file we'll even try to read (phones can crash on giant images)
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

// runs in the browser before uploading a photo:
// shrinks it to max 1280px and saves it as webp.
// redrawing it on a canvas also throws away the hidden metadata
// (phone photos often have the GPS location of where they were taken).
export async function compressImage(file, maxSize = 1280, quality = 0.8) {
  if (!file.type.startsWith("image/")) {
    throw new Error("that's not an image");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("that photo is too big (max 15 MB)");
  }

  let bitmap;
  try {
    // "from-image" rotates phone photos the right way up
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // iphones save HEIC by default, and most browsers can't open it
    throw new Error("can't read this photo. if it's from an iphone, take a screenshot of it or pick a jpg/png");
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("couldn't process that photo"))),
      // older safari can't make webp and quietly hands back a png instead,
      // that's fine because the upload uses whatever type we actually got
      "image/webp",
      quality
    );
  });
}

// upload a photo to supabase storage inside the user's own folder, return its url
export async function uploadImage(supabase, bucket, userId, file) {
  const blob = await compressImage(file);
  const extension = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) {
    throw new Error(error.message?.includes("size") ? "that photo is still too big after shrinking" : "photo upload failed, try again");
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// "https://x.supabase.co/storage/v1/object/public/listing-images/abc/1.webp" -> "abc/1.webp"
export function storagePathFromUrl(url, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}
