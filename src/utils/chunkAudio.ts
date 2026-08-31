/** Client-side chunk limits. Keep in sync with server/config.ts. */
export const MAX_CHUNK_BYTES = 9 * 1024 * 1024;
export const CHUNK_DURATION_MS = 6 * 60 * 1000;

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Split a blob so each piece is under the Gemini inline-audio cap.
 * In-app recording already rotates MediaRecorder every 6 min (valid webm files).
 * Byte-slicing uploaded files is last-resort and may fail for some containers.
 */
export function splitBlob(blob: Blob, maxBytes = MAX_CHUNK_BYTES): Blob[] {
  if (blob.size <= maxBytes) return [blob];
  const parts: Blob[] = [];
  let offset = 0;
  while (offset < blob.size) {
    parts.push(blob.slice(offset, offset + maxBytes, blob.type));
    offset += maxBytes;
  }
  return parts;
}

export async function blobsToChunks(blobs: Blob[]): Promise<Blob[]> {
  return blobs.flatMap((b) => splitBlob(b));
}
