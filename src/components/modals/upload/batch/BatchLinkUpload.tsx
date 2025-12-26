import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  AlertCircleIcon,
  FileDownloadIcon,
  Upload01Icon,
  ArrowLeft01Icon,
} from "hugeicons-react";
import { toast } from "sonner";
import {
  BatchCreateMaterialsResponse,
  batchCreateMaterials,
  BatchMaterialItem,
} from "@/api/materials.api";
import {
  inferMaterialType,
  generateDefaultTitle,
} from "@/lib/utils/inferMaterialType";
import {
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
} from "@/lib/types/material.types";
import { SelectCourse } from "../shared/SelectCourse";
import { checkIsYouTubeUrl } from "@/components/Preview/youtube";
import { checkIsGoogleDriveUrl } from "@/components/Preview/gDrive";
import { isGDriveFolder } from "@/lib/utils/gdriveUtils";
import {
  SelectModal,
  SelectOption,
} from "@/components/modals/shared/SearchSelectModal";
import { getMyFolders, Folder } from "@/api/folder.api";
import {
  extractGDriveId,
  findFirstFileInFolder,
  getFileMetadata,
  getGDriveFolderInfo,
  getGDriveName,
  listFolderFiles,
} from "@/lib/gdrive-preview";

interface BatchLinkItem {
  id: string;
  url: string;
  title: string;
  previewUrl: string | null;
  type: MaterialTypeEnum;
  isLoadingPreview: boolean;
  isLoadingTitle: boolean;
  status: "pending" | "ready" | "error";
  error?: string;
}

interface BatchLinkUploadProps {
  onComplete: (result: BatchCreateMaterialsResponse) => void;
  onError: (error: string) => void;
  onUploadingChange: (isUploading: boolean) => void;
  onBack?: () => void;
}

const MAX_LINKS = 50;

const BatchLinkUpload: React.FC<BatchLinkUploadProps> = ({
  onComplete,
  onError,
  onUploadingChange,
  onBack,
}) => {
  const [links, setLinks] = useState<BatchLinkItem[]>([]);
  const [csvInput, setCsvInput] = useState("");
  const [targetCourseId, setTargetCourseId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [folderId, setFolderId] = useState<string>("");
  const [folderOptions, setFolderOptions] = useState<SelectOption[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);

  // Load user's folders for optional folder selection in batch link upload
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
        console.error("Failed to fetch folders for batch links:", error);
      } finally {
        setFoldersLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Helper to detect URL pattern
  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      // Also check for URLs without protocol
      if (str.match(/^[\w-]+(\.[\w-]+)+(\/.*)?$/)) {
        return true;
      }
      return false;
    }
  };

  // Helper to normalize URL (add https if missing)
  const normalizeUrl = (url: string): string => {
    const trimmed = url
      .trim()
      .replace(/^[@"']+/, "")
      .replace(/["']+$/, "");
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // Generate preview URL based on link type
  const generatePreviewUrl = async (url: string): Promise<string | null> => {
    // YouTube
    if (checkIsYouTubeUrl(url)) {
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    }

    // Google Drive
    if (checkIsGoogleDriveUrl(url)) {
      const identifier = extractGDriveId(url);
      if (!identifier) return null;

      if (identifier.type === "folder") {
        // For folders, recursively find first actual file
        try {
          const firstFile = await findFirstFileInFolder(identifier.id);
          if (firstFile) {
            return `https://drive.google.com/thumbnail?id=${firstFile.id}&sz=w400-h300`;
          }
        } catch (error) {
          console.error("Error getting folder preview:", error);
        }
        return null;
      } else {
        // Single file - use its ID directly
        return `https://drive.google.com/thumbnail?id=${identifier.id}&sz=w400-h300`;
      }
    }

    return null;
  };

  // Fetch actual title from the source (Google Drive API, YouTube oEmbed, etc.)
  const fetchActualTitle = async (url: string): Promise<string | null> => {
    // Google Drive - get actual folder/file name
    if (checkIsGoogleDriveUrl(url)) {
      const identifier = extractGDriveId(url);
      if (identifier) {
        try {
          const name = await getGDriveName(identifier.id);
          return name;
        } catch (error) {
          console.error("Error fetching GDrive name:", error);
        }
      }
    }

    // YouTube - get video title via oEmbed API (same as single upload)
    if (checkIsYouTubeUrl(url)) {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            url
          )}&format=json&maxwidth=320&maxheight=180`
        );
        if (response.ok) {
          const data = await response.json();
          return data.title || null;
        }
      } catch (error) {
        console.error("Error fetching YouTube title via oEmbed:", error);
      }
    }

    return null;
  };

  // Parse CSV content
  const parseCSV = useCallback(
    async (content: string) => {
      setIsParsing(true);

      try {
        const lines = content
          .split(/[\r\n]+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length === 0) {
          toast.error("No valid lines found in CSV");
          return;
        }

        if (links.length + lines.length > MAX_LINKS) {
          toast.error(`Maximum ${MAX_LINKS} links allowed per batch`);
          return;
        }

        // Detect delimiter (comma, tab, or semicolon)
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes("\t")) delimiter = "\t";
        else if (firstLine.includes(";")) delimiter = ";";

        const parsedItems: BatchLinkItem[] = [];

        for (const line of lines) {
          const parts = line
            .split(delimiter)
            .map((p) => p.trim().replace(/^["']|["']$/g, ""));

          // Detect which column is URL and which is title
          let url = "";
          let title = "";
          let needsRemoteTitleFetch = false;

          if (parts.length >= 2) {
            // Two columns: detect which is URL
            if (
              isValidUrl(parts[0]) ||
              parts[0].includes("http") ||
              parts[0].includes("drive.google") ||
              parts[0].includes("youtube")
            ) {
              url = parts[0];
              title = parts[1];
            } else if (
              isValidUrl(parts[1]) ||
              parts[1].includes("http") ||
              parts[1].includes("drive.google") ||
              parts[1].includes("youtube")
            ) {
              url = parts[1];
              title = parts[0];
            } else {
              // Assume first is title, second is URL
              title = parts[0];
              url = parts[1];
            }
          } else if (parts.length === 1) {
            // Single column: must be URL, will fetch title from source
            url = parts[0];
            title = "";
            needsRemoteTitleFetch = true;
          }

          if (!url) continue;

          const normalizedUrl = normalizeUrl(url);
          const type = checkIsYouTubeUrl(normalizedUrl)
            ? MaterialTypeEnum.YOUTUBE
            : inferMaterialType(normalizedUrl);

          // Use placeholder title if we need to fetch it remotely
          const placeholderTitle = needsRemoteTitleFetch
            ? "Loading title..."
            : title || generateDefaultTitle(normalizedUrl);

          const item: BatchLinkItem = {
            id: generateId(),
            url: normalizedUrl,
            title: placeholderTitle,
            previewUrl: null,
            type,
            isLoadingPreview: true,
            isLoadingTitle: needsRemoteTitleFetch,
            status: "pending",
          };

          parsedItems.push(item);
        }

        if (parsedItems.length === 0) {
          toast.error("No valid URLs found in CSV");
          return;
        }

        // Add items first with loading state
        setLinks((prev) => [...prev, ...parsedItems]);

        // Generate previews and fetch titles in background
        for (const item of parsedItems) {
          // Fetch preview
          generatePreviewUrl(item.url)
            .then((preview) => {
              setLinks((prev) =>
                prev.map((l) =>
                  l.id === item.id
                    ? {
                        ...l,
                        previewUrl: preview,
                        isLoadingPreview: false,
                        status: !l.isLoadingTitle ? "ready" : l.status,
                      }
                    : l
                )
              );
            })
            .catch(() => {
              setLinks((prev) =>
                prev.map((l) =>
                  l.id === item.id
                    ? {
                        ...l,
                        isLoadingPreview: false,
                        status: !l.isLoadingTitle ? "ready" : l.status,
                      }
                    : l
                )
              );
            });

          // Fetch actual title if needed
          if (item.isLoadingTitle) {
            fetchActualTitle(item.url)
              .then((actualTitle) => {
                setLinks((prev) =>
                  prev.map((l) =>
                    l.id === item.id
                      ? {
                          ...l,
                          title: actualTitle || generateDefaultTitle(item.url),
                          isLoadingTitle: false,
                          status: l.isLoadingPreview ? l.status : "ready",
                        }
                      : l
                  )
                );
              })
              .catch(() => {
                setLinks((prev) =>
                  prev.map((l) =>
                    l.id === item.id
                      ? {
                          ...l,
                          title: generateDefaultTitle(item.url),
                          isLoadingTitle: false,
                          status: l.isLoadingPreview ? l.status : "ready",
                        }
                      : l
                  )
                );
              });
          }
        }

        // Update status to ready when both preview and title are done
        // (This is handled in the individual callbacks above)

        setCsvInput("");
        toast.success(`Added ${parsedItems.length} links`);
      } finally {
        setIsParsing(false);
      }
    },
    [links.length]
  );

  const handlePasteCSV = () => {
    if (!csvInput.trim()) {
      toast.error("Please paste CSV content first");
      return;
    }
    parseCSV(csvInput);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a CSV or TXT file");
      return;
    }

    const content = await file.text();
    parseCSV(content);
    e.target.value = "";
  };

  const updateLinkTitle = (id: string, title: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, title } : l)));
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpload = async () => {
    if (links.length === 0) {
      toast.error("Please add at least one link");
      return;
    }

    // Validate all titles are filled
    const emptyTitles = links.filter(
      (l) => !l.title.trim() || l.title === "Loading title..."
    );
    if (emptyTitles.length > 0) {
      toast.error("Please fill in all material titles");
      return;
    }

    // Wait for all previews and titles to finish loading
    const stillLoading = links.some(
      (l) => l.isLoadingPreview || l.isLoadingTitle
    );
    if (stillLoading) {
      toast.error("Please wait for all data to load");
      return;
    }

    setIsUploading(true);
    onUploadingChange(true);

    try {
      const materials: BatchMaterialItem[] = links.map((l) => ({
        label: l.title,
        type: l.type,
        resourceAddress: l.url,
        previewUrl: l.previewUrl || undefined,
        visibility: VisibilityEnum.PUBLIC,
        restriction: RestrictionEnum.DOWNLOADABLE,
        targetCourseId: targetCourseId || undefined,
        folderId: folderId || undefined,
      }));

      const result = await batchCreateMaterials(materials);
      // Result is Response<BatchCreateMaterialsResponse>
      if ("data" in result && result.data) {
        onComplete(result.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      onError(error?.message || "Batch upload failed");
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
    }
  };

  const getPreviewImage = (item: BatchLinkItem) => {
    if (item.isLoadingPreview) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Loading03Icon size={16} className="text-gray-400 animate-spin" />
        </div>
      );
    }
    if (item.previewUrl) {
      return (
        <img
          src={item.previewUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }
    return <Link01Icon size={24} className="text-gray-400" />;
  };

  const getTypeLabel = (type: MaterialTypeEnum) => {
    const labels: Record<MaterialTypeEnum, string> = {
      [MaterialTypeEnum.YOUTUBE]: "YouTube",
      [MaterialTypeEnum.GDRIVE]: "Google Drive",
      [MaterialTypeEnum.PDF]: "PDF",
      [MaterialTypeEnum.DOCS]: "Document",
      [MaterialTypeEnum.PPT]: "Presentation",
      [MaterialTypeEnum.EXCEL]: "Spreadsheet",
      [MaterialTypeEnum.IMAGE]: "Image",
      [MaterialTypeEnum.VIDEO]: "Video",
      [MaterialTypeEnum.ARTICLE]: "Article",
      [MaterialTypeEnum.OTHER]: "Link",
    };
    return labels[type] || "Link";
  };

  const downloadSampleCSV = () => {
    const sample = `Title,URL
Introduction to Python,https://www.youtube.com/watch?v=dQw4w9WgXcQ
Course Materials Folder,https://drive.google.com/drive/folders/1234567890
Week 1 Lecture Notes,https://docs.google.com/document/d/abc123`;

    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-upload-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* CSV Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Paste CSV content (Title, URL)
          </label>
          <button
            onClick={downloadSampleCSV}
            className="text-xs text-brand hover:text-brand/80 flex items-center gap-1"
          >
            <FileDownloadIcon size={14} />
            Download Sample
          </button>
        </div>

        <textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          disabled={isUploading || isParsing}
          placeholder={`Paste your CSV content here...

Format: Title,URL (one per line)
Example:
Introduction to Python,https://youtube.com/watch?v=...
Course Notes,https://drive.google.com/file/d/...

Or just URLs (titles will be fetched from source):
https://youtube.com/watch?v=...
https://drive.google.com/drive/folders/...`}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none text-sm disabled:opacity-50"
        />

        <div className="flex gap-2">
          <button
            onClick={handlePasteCSV}
            disabled={isUploading || isParsing || !csvInput.trim()}
            className="flex-1 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isParsing ? "Parsing..." : "Parse CSV"}
          </button>

          <label className="flex-1">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              disabled={isUploading || isParsing}
              className="hidden"
            />
            <span className="flex items-center justify-center gap-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium">
              <Upload01Icon size={16} />
              Upload CSV File
            </span>
          </label>
        </div>
      </div>

      {/* Links Grid */}
      {links.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Links to upload ({links.length}/{MAX_LINKS})
            </h4>
            {!isUploading && (
              <button
                onClick={() => setLinks([])}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
            <AnimatePresence>
              {links.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative flex items-start gap-3 p-3 border rounded-lg bg-white border-gray-200"
                >
                  {/* Preview */}
                  <div className="w-14 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {getPreviewImage(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateLinkTitle(item.id, e.target.value)
                        }
                        disabled={isUploading || item.isLoadingTitle}
                        className={`w-full text-sm font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-brand focus:outline-none bg-transparent truncate disabled:opacity-75 ${
                          item.isLoadingTitle ? "text-gray-400 italic" : ""
                        }`}
                        placeholder="Enter title..."
                      />
                      {item.isLoadingTitle && (
                        <Loading03Icon
                          size={12}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                        {getTypeLabel(item.type)}
                      </span>
                      <button
                        onClick={() =>
                          window.open(item.url, "_blank", "noopener,noreferrer")
                        }
                        className="text-xs text-gray-400 hover:text-brand hover:underline truncate transition-colors cursor-pointer"
                        title={`Click to open: ${item.url}`}
                      >
                        {new URL(item.url).hostname}
                      </button>
                    </div>
                  </div>

                  {/* Remove button */}
                  {!isUploading && (
                    <button
                      onClick={() => removeLink(item.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Cancel01Icon size={14} className="text-gray-400" />
                    </button>
                  )}
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
            Select a folder to organize all uploaded links
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-3">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isUploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft01Icon size={16} />
            <span>Back</span>
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={
            isUploading ||
            links.length === 0 ||
            links.some((l) => l.isLoadingPreview)
          }
          className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isUploading
            ? "Uploading..."
            : links.some((l) => l.isLoadingPreview)
            ? "Loading previews..."
            : `Upload ${links.length} Link${links.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
};

export default BatchLinkUpload;
