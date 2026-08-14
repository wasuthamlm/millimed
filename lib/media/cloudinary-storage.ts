import { v2 as cloudinary } from "cloudinary";

// Cloud replacement for local-storage.ts (disk has no persistence across deploys).
// Same signature as the disk version so nothing that calls uploadToStorage/deleteFromStorage
// needs to know which backend is active.
const FOLDER = "millimed";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToStorage(filename: string, buffer: Buffer, _contentType: string) {
  const publicId = filename.replace(/\.[^.]+$/, "");
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: FOLDER, public_id: publicId, resource_type: "auto" }, (error, result) => {
      if (error || !result) reject(error ?? new Error("Cloudinary upload returned no result"));
      else resolve(result);
    });
    stream.end(buffer);
  });
  return result.secure_url;
}

export async function deleteFromStorage(publicUrl: string) {
  const match = publicUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return;

  await cloudinary.uploader.destroy(match[1]).catch(() => {
    // best-effort delete, matching the disk version's storage-error swallowing
  });
}
