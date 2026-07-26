/**
 * Read a File (image) into a downscaled PNG data URL.
 * Keeps the long edge at most `maxEdge` px and re-encodes via a canvas,
 * which incidentally strips EXIF metadata and normalises orientation.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxEdge = 600
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }
  const bitmap = await createImageBitmap(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge > maxEdge ? maxEdge / longEdge : 1;

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // JPEG keeps localStorage usage low; PNG would inflate ~3-4x for photos.
  return canvas.toDataURL("image/jpeg", 0.9);
}

/** Convert a data URL into a binary Uint8Array (for DOCX ImageRun). */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Get pixel dimensions of a data URL. */
export function dataUrlSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
