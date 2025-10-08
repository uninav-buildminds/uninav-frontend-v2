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

export async function generatePdfPreviewBlob(
  fileUrl: string
): Promise<Blob | null> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const canvas = document.createElement("canvas");
    const viewport = page.getViewport({ scale: 1.5 }); // Use a slightly higher scale for better quality
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8)
    );
  } catch (error) {
    console.error("Error generating PDF preview blob:", error);
    return null;
  }
}
