/**
 * Utility functions for parsing and handling Google Drive URLs
 */

export interface GDriveIdentifier {
  id: string;
  type: 'folder' | 'file' | 'doc' | 'sheet' | 'presentation';
}

/**
 * Extract Google Drive file or folder ID from various URL formats
 */
export function extractGDriveId(url: string): GDriveIdentifier | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Handle folder URLs
    // https://drive.google.com/drive/folders/{folderId}
    // https://drive.google.com/drive/u/0/folders/{folderId}
    if (url.includes('/folders/')) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return { id: match[1], type: 'folder' };
      }
    }

    // Handle file URLs
    // https://drive.google.com/file/d/{fileId}/view
    // https://drive.google.com/open?id={fileId}
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return { id: match[1], type: 'file' };
      }
    }

    // Handle open?id= format
    if (url.includes('open?id=')) {
      const id = urlObj.searchParams.get('id');
      if (id) {
        return { id, type: 'file' };
      }
    }

    // Handle Google Docs URLs
    // https://docs.google.com/document/d/{docId}/edit
    if (hostname.includes('docs.google.com')) {
      if (url.includes('/document/d/')) {
        const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          return { id: match[1], type: 'doc' };
        }
      }

      // https://docs.google.com/spreadsheets/d/{sheetId}/edit
      if (url.includes('/spreadsheets/d/')) {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          return { id: match[1], type: 'sheet' };
        }
      }

      // https://docs.google.com/presentation/d/{presentationId}/edit
      if (url.includes('/presentation/d/')) {
        const match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          return { id: match[1], type: 'presentation' };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing Google Drive URL:', error);
    return null;
  }
}

/**
 * Check if URL is a Google Drive folder
 */
export function isGDriveFolder(url: string): boolean {
  return url.includes('/folders/');
}

/**
 * Convert file ID to various Google Drive URLs
 */
export function getGDriveUrls(fileId: string, mimeType?: string) {
  return {
    view: `https://drive.google.com/file/d/${fileId}/view`,
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    download: `https://drive.google.com/uc?export=download&id=${fileId}`,
    thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,
  };
}

/**
 * Convert Google Workspace file ID to embed URL
 */
export function getGoogleWorkspaceEmbedUrl(
  fileId: string,
  type: 'doc' | 'sheet' | 'presentation'
): string {
  switch (type) {
    case 'doc':
      return `https://docs.google.com/document/d/${fileId}/preview`;
    case 'sheet':
      return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    case 'presentation':
      return `https://docs.google.com/presentation/d/${fileId}/embed`;
    default:
      return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

/**
 * Get file type icon based on MIME type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/vnd.google-apps.folder') return '📁';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('document') || mimeType.includes('doc')) return '📝';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
  return '📎';
}

/**
 * Check if file type is supported for inline viewing
 */
export function isViewableInline(mimeType: string): boolean {
  const viewableTypes = [
    'application/pdf',
    'image/',
    'video/',
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/vnd.openxmlformats-officedocument',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ];

  return viewableTypes.some((type) => mimeType.includes(type));
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

