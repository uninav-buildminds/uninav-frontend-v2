import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadSquare01Icon,
  File01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  AlertCircleIcon,
  Pdf01Icon,
  PresentationBarChart01Icon,
  FileAttachmentIcon,
} from "hugeicons-react";
import { toast } from "sonner";
import {
  BatchCreateMaterialsResponse,
  batchCreateFilesMaterials,
  BatchMaterialResult,
} from "@/api/materials.api";
import {
  VisibilityEnum,
  RestrictionEnum,
  MaterialTypeEnum,
} from "@/lib/types/material.types";
import {
  inferMaterialType,
  generateDefaultTitle,
} from "@/lib/utils/inferMaterialType";
import { SelectCourse } from "../shared/SelectCourse";
import { countFilePages } from "@/lib/utils/pageCounter";
import { pdfjs } from "react-pdf";
import {
  SelectModal,
  SelectOption,
} from "@/components/dashboard/SearchSelectModal";
import { getMyFolders, Folder } from "@/api/folder.api";

// Configure PDF.js worker
const workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface BatchFileItem {
  id: string;
  file: File;
  title: string;
  preview: File | null;
  previewUrl: string | null;
  pageCount?: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  materialId?: string;
}

interface BatchFileUploadProps {
  onComplete: (result: BatchCreateMaterialsResponse) => void;
  onError: (error: string) => void;
  onUploadingChange: (isUploading: boolean) => void;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// Generate PDF thumbnail
async function generatePdfThumbnail(
  file: File
): Promise<{ preview: File; url: string } | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const scale = 0.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewFile = new File([blob], `${file.name}-preview.jpg`, {
              type: "image/jpeg",
            });
            const url = URL.createObjectURL(blob);
            resolve({ preview: previewFile, url });
          } else {
            resolve(null);
          }
        },
        "image/jpeg",
        0.7
      );
    });
  } catch (e) {
    console.error("PDF thumbnail generation failed:", e);
    return null;
  }
}

// Get file icon based on type
const getFileIcon = (file: File) => {
  if (file.type === "application/pdf") {
    return <Pdf01Icon size={24} className="text-red-500" />;
  }
  if (file.type.includes("presentation") || file.name.match(/\.pptx?$/i)) {
    return <PresentationBarChart01Icon size={24} className="text-orange-500" />;
  }
  if (file.type.includes("word") || file.name.match(/\.docx?$/i)) {
    return <FileAttachmentIcon size={24} className="text-blue-500" />;
  }
  return <File01Icon size={24} className="text-gray-400" />;
};

const BatchFileUpload: React.FC<BatchFileUploadProps> = ({
  onComplete,
  onError,
  onUploadingChange,
}) => {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState<string>("");
  const [folderId, setFolderId] = useState<string>("");
  const [folderOptions, setFolderOptions] = useState<SelectOption[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Load user's folders for optional folder selection in batch file upload
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setFoldersLoading(true);
        const response = await getMyFolders();
        if (response?.data) {
          const options: SelectOption[] = response.data.map(
            (folder: Folder) => ({
              value: folder.id,
              label: folder.label,
              description: folder.description,
            })
          );
          setFolderOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch folders for batch files:", error);
      } finally {
        setFoldersLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const processFile = useCallback(
    async (file: File): Promise<BatchFileItem> => {
      const item: BatchFileItem = {
        id: generateId(),
        file,
        title: generateDefaultTitle(file),
        preview: null,
        previewUrl: null,
        status: "pending",
      };

      // Generate preview for PDFs
      if (file.type === "application/pdf") {
        const result = await generatePdfThumbnail(file);
        if (result) {
          item.preview = result.preview;
          item.previewUrl = result.url;
        }
      }

      // Count pages in background
      try {
        const pageCount = await countFilePages(file);
        if (pageCount > 0) {
          item.pageCount = pageCount;
        }
      } catch (e) {
        // Silent fail - page count is optional
      }

      return item;
    },
    []
  );

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Validate file count
      if (files.length + fileArray.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed per batch`);
        return;
      }

      // Validate file sizes
      const invalidFiles = fileArray.filter((f) => f.size > MAX_FILE_SIZE);
      if (invalidFiles.length > 0) {
        toast.error(
          `${invalidFiles.length} file(s) exceed 500MB limit and were skipped`
        );
      }

      const validFiles = fileArray.filter((f) => f.size <= MAX_FILE_SIZE);

      // Process files
      const newItems = await Promise.all(validFiles.map(processFile));
      setFiles((prev) => [...prev, ...newItems]);
    },
    [files.length, processFile]
  );

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  const updateFileTitle = (id: string, title: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please add at least one file");
      return;
    }

    // Validate all titles are filled
    const emptyTitles = files.filter((f) => !f.title.trim());
    if (emptyTitles.length > 0) {
      toast.error("Please fill in all material titles");
      return;
    }

    setIsUploading(true);
    onUploadingChange(true);
    setUploadProgress({ current: 0, total: files.length });

    // Mark first file as uploading
    setFiles((prev) =>
      prev.map((f, idx) => (idx === 0 ? { ...f, status: "uploading" } : f))
    );

    try {
      const filesToUpload = files.map((f) => ({
        file: f.file,
        materialTitle: f.title,
        type: inferMaterialType(f.file),
        visibility: VisibilityEnum.PUBLIC,
        accessRestrictions: RestrictionEnum.DOWNLOADABLE,
        targetCourseId: targetCourseId || undefined,
        pageCount: f.pageCount,
        filePreview: f.preview || undefined,
        folderId: folderId || undefined,
      }));

      const result = await batchCreateFilesMaterials(
        filesToUpload,
        (current, total, itemResult) => {
          setUploadProgress({ current, total });

          // Update individual file status
          setFiles((prev) =>
            prev.map((f, idx) => {
              if (idx === itemResult.index) {
                return {
                  ...f,
                  status: itemResult.success ? "success" : "error",
                  error: itemResult.error,
                  materialId: itemResult.materialId,
                };
              }
              // Mark next file as uploading
              if (idx === itemResult.index + 1 && idx < total) {
                return { ...f, status: "uploading" };
              }
              return f;
            })
          );
        }
      );

      onComplete(result);
    } catch (error: any) {
      onError(error?.message || "Batch upload failed");
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
      setUploadProgress(null);
    }
  };

  const getStatusIcon = (status: BatchFileItem["status"]) => {
    switch (status) {
      case "uploading":
        return <Loading03Icon size={16} className="text-brand animate-spin" />;
      case "success":
        return <CheckmarkCircle02Icon size={16} className="text-green-500" />;
      case "error":
        return <AlertCircleIcon size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? "border-brand bg-brand/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadSquare01Icon size={40} className="text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-900">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Max {MAX_FILES} files, 500MB each • PDF, PPT, DOC supported
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
        >
          Select Files
        </button>
      </div>

      {/* Files Grid - Horizontal Layout */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Files to upload ({files.length}/{MAX_FILES})
            </h4>
            {!isUploading && (
              <button
                onClick={() => {
                  files.forEach((f) => {
                    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                  });
                  setFiles([]);
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence>
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative flex items-start gap-3 p-3 border rounded-lg bg-white ${
                    item.status === "error"
                      ? "border-red-200 bg-red-50"
                      : item.status === "success"
                      ? "border-green-200 bg-green-50"
                      : item.status === "uploading"
                      ? "border-brand/30 bg-brand/5"
                      : "border-gray-200"
                  }`}
                >
                  {/* Preview/Icon */}
                  <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(item.file)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateFileTitle(item.id, e.target.value)}
                      disabled={isUploading}
                      className="w-full text-sm font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-brand focus:outline-none bg-transparent truncate disabled:opacity-75"
                      placeholder="Enter title..."
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      {item.pageCount && (
                        <span className="text-xs text-brand">
                          {item.pageCount} pages
                        </span>
                      )}
                      {item.error && (
                        <span
                          className="text-xs text-red-500 truncate"
                          title={item.error}
                        >
                          {item.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status/Actions */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                    {!isUploading && item.status === "pending" && (
                      <button
                        onClick={() => removeFile(item.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Cancel01Icon size={14} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Course & Folder Selection */}
      <div className="pt-2 space-y-3">
        <SelectCourse
          label="Target Course (Optional - applies to all)"
          currentValue={targetCourseId}
          onChange={setTargetCourseId}
        />

        <div>
          <SelectModal
            label="Add to Folder (Optional - applies to all)"
            value={folderId}
            onChange={setFolderId}
            options={folderOptions}
            placeholder="Search and select a folder..."
            searchable={true}
            loading={foldersLoading}
            emptyMessage="No folders found. Create a folder first."
            displayValue={(value, selectedOption) => {
              if (!value) return "";
              return selectedOption?.label || "";
            }}
          />
          <p className="text-xs text-gray-600 mt-1">
            Select a folder to organize all uploaded files
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-brand/5 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700">Uploading...</span>
            <span className="text-brand font-medium">
              {uploadProgress.current}/{uploadProgress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (uploadProgress.current / uploadProgress.total) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="w-full py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isUploading
          ? "Uploading..."
          : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
};

export default BatchFileUpload;
