/**
 * Google Drive Preview Generation
 * Generates previews from GDrive files and uploads to Cloudinary
 */

import { gdriveRotation } from "./gdrive-rotation";
import { ENV } from "./env.config";

export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
}

export interface GDriveFolderContents {
  files: GDriveFile[];
  nextPageToken?: string;
}

/**
 * List files in a Google Drive folder
 */
export async function listFolderFiles(
  folderId: string,
  pageToken?: string
): Promise<GDriveFolderContents> {
  const urlBuilder = (apiKey: string) => {
    const query = `'${folderId}' in parents and trashed=false`;
    const fields =
      "files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size),nextPageToken";
    let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&key=${apiKey}&fields=${encodeURIComponent(fields)}&orderBy=folder,name`;

    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    return url;
  };

  const response = await gdriveRotation.fetchWithRotation(urlBuilder);
  const data = await response.json();

  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Get metadata for a single Google Drive file
 */
export async function getFileMetadata(fileId: string): Promise<GDriveFile> {
  const urlBuilder = (apiKey: string) => {
    const fields =
      "id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size";
    return `https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}&fields=${encodeURIComponent(
      fields
    )}`;
  };

  const response = await gdriveRotation.fetchWithRotation(urlBuilder);
  return response.json();
}

/**
 * Generate preview from GDrive file and upload to Cloudinary
 * Handles Google's origin restrictions by using a proxy approach
 */
export async function generateAndUploadPreview(
  fileId: string,
  fileName: string
): Promise<string | null> {
  try {
    console.log("Generating preview for:", { fileId, fileName });

    // Get file metadata to check for thumbnail
    const fileMeta = await getFileMetadata(fileId);
    console.log("File metadata:", {
      name: fileMeta.name,
      hasThumbnail: !!fileMeta.thumbnailLink,
      thumbnailUrl: fileMeta.thumbnailLink,
    });

    if (!fileMeta.thumbnailLink) {
      console.warn("No thumbnail available for file:", fileName);
      return null;
    }

    // Try multiple approaches to handle Google's origin restrictions
    let imageData: Blob | null = null;

    // Approach 1: Try canvas method (handles CORS)
    try {
      imageData = await fetchThumbnailViaCanvas(fileMeta.thumbnailLink);
    } catch (error) {
      console.warn("Canvas method failed:", error);
    }

    // Approach 2: Try direct fetch (may fail due to CORS)
    if (!imageData) {
      try {
        const response = await fetch(fileMeta.thumbnailLink);
        if (response.ok) {
          imageData = await response.blob();
        }
      } catch (error) {
        console.warn("Direct fetch failed:", error);
      }
    }

    if (!imageData) {
      console.warn("All methods failed to extract thumbnail data");
      return null;
    }

    // Create file from canvas data
    const file = new File([imageData], `${fileName}-preview.jpg`, {
      type: "image/jpeg",
    });

    // Upload to backend's temp preview route
    const formData = new FormData();
    formData.append("preview", file);

    const uploadResponse = await fetch(
      `${ENV.API_BASE_URL}/materials/preview/upload/temp`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!uploadResponse.ok) {
      console.warn("Failed to upload preview:", uploadResponse.status);
      return null;
    }

    const result = await uploadResponse.json();
    console.log("Upload successful:", result);
    return result.data?.previewUrl || null;
  } catch (error) {
    console.error("Preview generation failed:", error);
    return null;
  }
}

/**
 * Generate a preview Blob from a GDrive file ID without uploading it.
 * This is useful for batch processing.
 */
export async function generateGDrivePreviewBlob(
  fileId: string
): Promise<Blob | null> {
  try {
    const fileMeta = await getFileMetadata(fileId);
    if (!fileMeta.thumbnailLink) {
      console.warn("No thumbnail available for GDrive file:", fileId);
      return null;
    }
    // Use the canvas method to bypass CORS issues with the thumbnail link
    const imageData = await fetchThumbnailViaCanvas(fileMeta.thumbnailLink);
    return imageData;
  } catch (error) {
    console.error("GDrive preview blob generation failed:", error);
    return null;
  }
}

/**
 * Fetch thumbnail via canvas to bypass origin restrictions
 */
async function fetchThumbnailViaCanvas(
  thumbnailUrl: string
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS

    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        console.error("Canvas processing failed:", error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.warn("Failed to load thumbnail image");
      resolve(null);
    };

    // Set the source to trigger loading
    img.src = thumbnailUrl;
  });
}

/**
 * Extract Google Drive file/folder ID from URL
 */
export function extractGDriveId(
  url: string
): { id: string; type: "folder" | "file" } | null {
  try {
    const urlObj = new URL(url);

    // Handle folder URLs
    if (url.includes("/folders/")) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return { id: match[1], type: "folder" };
      }
    }

    // Handle file URLs
    if (url.includes("/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return { id: match[1], type: "file" };
      }
    }

    // Handle open?id= format
    if (url.includes("open?id=")) {
      const id = urlObj.searchParams.get("id");
      if (id) {
        return { id, type: "file" };
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing Google Drive URL:", error);
    return null;
  }
}
