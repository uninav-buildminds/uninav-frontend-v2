/**
 * Utility functions for counting pages in PDF/DOCX files
 * and counting files in Google Drive folders
 */

import * as pdfjsLib from "pdfjs-dist";
import { listFolderFiles } from "@/api/gdrive.api";
import { extractGDriveId } from "@/lib/utils/gdriveUtils";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Count pages in a PDF file
 * @param file - The PDF file to count pages from
 * @returns Promise<number> - The number of pages in the PDF
 */
export async function countPdfPages(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("Error counting PDF pages:", error);
    return 0;
  }
}

/**
 * Estimate page count for DOCX files
 * This is an approximation based on file size and content analysis
 * @param file - The DOCX file to estimate pages from
 * @returns Promise<number> - Estimated number of pages
 */
export async function estimateDocxPages(file: File): Promise<number> {
  try {
    // For DOCX files, we'll use a simple heuristic based on file size
    // Average DOCX page is roughly 20-30KB with text and some formatting
    const fileSizeKB = file.size / 1024;
    
    // Conservative estimate: 25KB per page
    const estimatedPages = Math.max(1, Math.round(fileSizeKB / 25));
    
    return estimatedPages;
  } catch (error) {
    console.error("Error estimating DOCX pages:", error);
    return 0;
  }
}

/**
 * Count pages in a file (PDF or DOCX)
 * @param file - The file to count pages from
 * @returns Promise<number> - The number of pages
 */
export async function countFilePages(file: File): Promise<number> {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType === "application/pdf") {
    return countPdfPages(file);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return estimateDocxPages(file);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  ) {
    // For PPT files, use similar estimation as DOCX
    // Average PPT slide is roughly 50-100KB
    const fileSizeKB = file.size / 1024;
    return Math.max(1, Math.round(fileSizeKB / 75));
  }
  
  // For other file types, return 0 (not applicable)
  return 0;
}

/**
 * Recursively count all files in a Google Drive folder
 * @param folderId - The Google Drive folder ID
 * @returns Promise<number> - Total number of files (excluding folders)
 */
export async function countGDriveFolderFiles(folderId: string): Promise<number> {
  let totalCount = 0;
  let pageToken: string | undefined;
  
  try {
    do {
      const folderContents = await listFolderFiles(folderId, pageToken);
      
      for (const file of folderContents.files) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          // Recursively count files in subfolders
          const subfolderCount = await countGDriveFolderFiles(file.id);
          totalCount += subfolderCount;
        } else {
          // Count regular files
          totalCount++;
        }
      }
      
      pageToken = folderContents.nextPageToken;
    } while (pageToken);
    
    return totalCount;
  } catch (error) {
    console.error("Error counting Google Drive folder files:", error);
    return 0;
  }
}

/**
 * Count files from a Google Drive URL
 * @param url - The Google Drive folder URL
 * @returns Promise<number> - Total number of files
 */
export async function countGDriveUrlFiles(url: string): Promise<number> {
  try {
    const identifier = extractGDriveId(url);
    
    if (!identifier) {
      console.error("Invalid Google Drive URL");
      return 0;
    }
    
    if (identifier.type === "folder") {
      return countGDriveFolderFiles(identifier.id);
    } else {
      // Single file
      return 1;
    }
  } catch (error) {
    console.error("Error counting files from Google Drive URL:", error);
    return 0;
  }
}
