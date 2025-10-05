pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

import { materialPreview } from "@/api/materials.api";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function generatePreviewAndUpload(file: File, materialId: string) {
  // 1. Read file as arrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // 2. Load PDF with pdf.js
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  // 3. Get first page
  const page = await pdf.getPage(1);

  // 4. Create an offscreen canvas
  const canvas = document.createElement("canvas");
  const viewport = page.getViewport({ scale: 1 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  // 5. Convert to Blob once and send
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );

  if (!blob) return;

  try {
    // your API call — adjust if you need FormData
    const res = await materialPreview(materialId, blob);
    return res.data;
  } catch (err) {
    console.error("Error sending preview:", err);
  }
}
