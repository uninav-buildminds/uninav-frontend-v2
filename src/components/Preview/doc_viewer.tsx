import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { renderAsync } from "docx-preview"; // 👈 npm install docx-preview
import html2canvas from "html2canvas"; // 👈 npm install html2canvas

// react-pdf CSS
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./docx.css";

// Import worker as static asset - Vite will handle it correctly in both dev and prod
const workerSrc = "/pdf.worker.min.mjs";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export const Previewer = ({
  file,
  onPreviewReady,
}: {
  file: File;
  onPreviewReady?: (file: File) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docxContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("Previewer - Processing file:", file.name, "Type:", file.type);

  const fileType = file.type;

  useEffect(() => {
    if (!file) return;

    // DOCX preview
    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result && docxContainerRef.current) {
          // Clear old preview
          docxContainerRef.current.innerHTML = "";

          // Render DOCX into container
          await renderAsync(
            e.target.result as ArrayBuffer,
            docxContainerRef.current
          );

          // Wait for render, then capture preview
          setTimeout(async () => {
            if (docxContainerRef.current) {
              const canvas = await html2canvas(docxContainerRef.current, {
                scale: 0.3, // Smaller scale for thumbnail
                backgroundColor: "#fff",
              });

              // Convert canvas to File (not base64)
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const previewFile = new File([blob], "preview-image.jpeg", {
                      type: "image/jpeg",
                    });
                    console.log("DOCX preview file generated:", previewFile);
                    // Pass the generated file (File object) back
                    if (onPreviewReady) onPreviewReady(previewFile);
                  }
                },
                "image/jpeg",
                0.8
              );
            }
            setLoading(false);
          }, 500);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, fileType, onPreviewReady]);

  const handleRenderSuccess = () => {
    console.log("PDF render success, generating preview...");
    if (canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const previewFile = new File([blob], "preview-image.jpeg", {
              type: "image/jpeg",
            });
            console.log("PDF preview file generated:", previewFile);
            // Pass the generated file (File object) back
            if (onPreviewReady) onPreviewReady(previewFile);
          }
        },
        "image/jpeg",
        0.8
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {loading && (
        <div className="flex items-center justify-center w-[180px] h-[230px] border border-gray-200 rounded bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* PDF Preview */}
      {fileType === "application/pdf" && (
        <Document file={file}>
          <Page
            pageNumber={1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={180}
            canvasRef={canvasRef}
            onRenderSuccess={handleRenderSuccess}
          />
        </Document>
      )}

      {/* DOCX Preview */}
      {fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
        <div
          className="w-[180px] h-[230px] overflow-hidden border rounded bg-white relative"
          style={{ display: loading ? "none" : "block" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "540px",
              height: "690px",
              transform: "scale(0.333)",
              transformOrigin: "top left",
              background: "white",
            }}
          >
            <div ref={docxContainerRef} className="docx-preview-container" />
          </div>
        </div>
      )}
    </div>
  );
};
