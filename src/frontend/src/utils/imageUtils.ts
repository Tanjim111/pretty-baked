/**
 * Convert a Uint8Array (from backend Blob) to a data URL for display
 */
export function blobToDataUrl(
  blob: Uint8Array,
  mimeType = "image/jpeg",
): string {
  const base64 = uint8ArrayToBase64(blob);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert a data URL (from file input or generated image) to Uint8Array for upload
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Uint8Array> {
  const response = await fetch(dataUrl);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert a File object to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image file using canvas — reduces file size while preserving quality.
 * @param file    The source image File
 * @param maxWidth Maximum width/height in pixels (aspect ratio preserved)
 * @param quality JPEG quality 0–1 (0.85 = high quality, visually lossless)
 * @returns A base-64 data URL of the compressed image
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;

        // Downscale only if needed — never upscale
        if (width > maxWidth || height > maxWidth) {
          if (width >= height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src); // fallback to original if canvas not supported
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG for photos; preserve PNG for images with transparency
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Check if a string is a valid image URL or data URL
 */
export function isValidImageSrc(src: string): boolean {
  return (
    src.startsWith("data:image/") ||
    src.startsWith("http") ||
    src.startsWith("/")
  );
}

/**
 * Get display URL from either a data URL, external URL, or fallback to placeholder
 */
export function getImageSrc(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/assets/images/placeholder.svg";
  if (isValidImageSrc(imageUrl)) return imageUrl;
  return "/assets/images/placeholder.svg";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
