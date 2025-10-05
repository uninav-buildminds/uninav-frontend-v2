export function dataURLtoFile(dataUrl: string, filename: string): File {
  if (!dataUrl.startsWith("data:")) {
    throw new Error("Invalid data URL format");
  }

  const [header, base64] = dataUrl.split(",");
  if (!base64) {
    throw new Error("Invalid base64 data in data URL");
  }

  // Extract MIME type (default to image/jpeg if missing)
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
}
