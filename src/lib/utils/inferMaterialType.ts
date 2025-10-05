/**
 * Utility function to infer material type from file extension or URL
 */
import { MaterialTypeEnum } from "@/lib/types/material.types";

export function inferMaterialType(input: File | string): MaterialTypeEnum {
  // Handle file input
  if (input instanceof File) {
    const extension = input.name.split(".").pop()?.toLowerCase();
    return getTypeFromExtension(extension);
  }

  // Handle URL input
  if (typeof input === "string") {
    try {
      const url = new URL(input);
      return getTypeFromUrl(url);
    } catch {
      // If URL parsing fails, try to extract extension from the string
      const extension = input.split(".").pop()?.toLowerCase();
      return getTypeFromExtension(extension);
    }
  }

  return MaterialTypeEnum.OTHER;
}

function getTypeFromExtension(extension?: string): MaterialTypeEnum {
  if (!extension) return MaterialTypeEnum.OTHER;

  const extensionMap: Record<string, MaterialTypeEnum> = {
    // Documents
    pdf: MaterialTypeEnum.PDF,
    doc: MaterialTypeEnum.DOCS,
    docx: MaterialTypeEnum.DOCS,
    txt: MaterialTypeEnum.DOCS,
    rtf: MaterialTypeEnum.DOCS,

    // Presentations
    ppt: MaterialTypeEnum.PPT,
    pptx: MaterialTypeEnum.PPT,

    // Spreadsheets
    xls: MaterialTypeEnum.EXCEL,
    xlsx: MaterialTypeEnum.EXCEL,
    csv: MaterialTypeEnum.EXCEL,

    // Images
    jpg: MaterialTypeEnum.IMAGE,
    jpeg: MaterialTypeEnum.IMAGE,
    png: MaterialTypeEnum.IMAGE,
    gif: MaterialTypeEnum.IMAGE,
    svg: MaterialTypeEnum.IMAGE,
    webp: MaterialTypeEnum.IMAGE,
    bmp: MaterialTypeEnum.IMAGE,

    // Videos
    mp4: MaterialTypeEnum.VIDEO,
    avi: MaterialTypeEnum.VIDEO,
    mov: MaterialTypeEnum.VIDEO,
    wmv: MaterialTypeEnum.VIDEO,
    flv: MaterialTypeEnum.VIDEO,
    webm: MaterialTypeEnum.VIDEO,
    mkv: MaterialTypeEnum.VIDEO,
    m4v: MaterialTypeEnum.VIDEO,
  };

  return extensionMap[extension] || MaterialTypeEnum.OTHER;
}

function getTypeFromUrl(url: URL): MaterialTypeEnum {
  const hostname = url.hostname.toLowerCase();

  // Check for specific platforms
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return MaterialTypeEnum.VIDEO;
  }

  if (
    hostname.includes("drive.google.com") ||
    hostname.includes("docs.google.com")
  ) {
    return MaterialTypeEnum.GDRIVE;
  }

  if (hostname.includes("vimeo.com")) {
    return MaterialTypeEnum.VIDEO;
  }

  if (
    hostname.includes("wikipedia.org") ||
    hostname.includes("medium.com") ||
    hostname.includes("blog")
  ) {
    return MaterialTypeEnum.ARTICLE;
  }

  // Check for file extension in URL path
  const pathname = url.pathname.toLowerCase();
  const extension = pathname.split(".").pop();

  if (extension && extension !== pathname) {
    return getTypeFromExtension(extension);
  }

  return MaterialTypeEnum.OTHER;
}

/**
 * Generate a default title from filename or URL
 */
export function generateDefaultTitle(input: File | string): string {
  // Handle file input
  if (input instanceof File) {
    // Remove extension and clean up filename
    const nameWithoutExt = input.name.replace(/\.[^/.]+$/, "");
    return cleanTitle(nameWithoutExt);
  }

  // Handle URL input
  if (typeof input === "string") {
    try {
      const url = new URL(input);

      // Special handling for common platforms
      if (url.hostname.includes("youtube.com")) {
        // Extract video ID and create a basic title
        const videoId = url.searchParams.get("v");
        return videoId ? `YouTube Video - ${videoId}` : "YouTube Video";
      }

      if (url.hostname.includes("youtu.be")) {
        const videoId = url.pathname.slice(1);
        return videoId ? `YouTube Video - ${videoId}` : "YouTube Video";
      }

      if (url.hostname.includes("drive.google.com")) {
        return "Google Drive Document";
      }

      // For other URLs, try to get filename from path or use domain
      const pathname = url.pathname;
      const filename = pathname.split("/").pop();

      if (filename && filename.includes(".")) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        return cleanTitle(nameWithoutExt);
      }

      // Use domain as fallback
      return cleanTitle(url.hostname);
    } catch {
      return "Material";
    }
  }

  return "Material";
}

function cleanTitle(title: string): string {
  return title
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Title case
    .join(" ")
    .trim();
}
