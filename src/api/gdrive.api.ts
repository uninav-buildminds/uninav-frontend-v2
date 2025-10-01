/**
 * Google Drive API integration
 * Uses Google Drive API v3 with API key authentication
 */

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/drive/v3';

// Log API key status on module load (only in development)
if (import.meta.env.DEV) {
  if (!API_KEY) {
    console.warn(
      '⚠️ VITE_GOOGLE_DRIVE_API_KEY is not set. Google Drive features will not work.\n' +
      'Please add it to your .env file. See GDRIVE_SETUP.md for instructions.'
    );
  } else {
    console.log('✅ Google Drive API key detected');
  }
}

export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
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
  if (!API_KEY) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const query = `'${folderId}' in parents and trashed=false`;
    const fields = 'files(id,name,mimeType,iconLink,thumbnailLink,webViewLink,webContentLink,size,createdTime,modifiedTime),nextPageToken';
    
    let url = `${BASE_URL}/files?q=${encodeURIComponent(query)}&key=${API_KEY}&fields=${encodeURIComponent(fields)}&orderBy=folder,name`;
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. This folder may not be publicly accessible.');
      }
      if (response.status === 404) {
        throw new Error('Folder not found. It may have been deleted or the link is incorrect.');
      }
      throw new Error(`Failed to fetch folder contents: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error: any) {
    console.error('Error fetching Google Drive folder:', error);
    throw error;
  }
}

/**
 * Get metadata for a single Google Drive file
 */
export async function getFileMetadata(fileId: string): Promise<GDriveFile> {
  if (!API_KEY) {
    throw new Error('Google Drive API key is not configured');
  }

  try {
    const fields = 'id,name,mimeType,iconLink,thumbnailLink,webViewLink,webContentLink,size,createdTime,modifiedTime';
    const url = `${BASE_URL}/files/${fileId}?key=${API_KEY}&fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. This file may not be publicly accessible.');
      }
      if (response.status === 404) {
        throw new Error('File not found. It may have been deleted or the link is incorrect.');
      }
      throw new Error(`Failed to fetch file metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching Google Drive file metadata:', error);
    throw error;
  }
}

/**
 * Check if a file or folder is accessible
 */
export async function checkAccess(id: string): Promise<boolean> {
  try {
    await getFileMetadata(id);
    return true;
  } catch (error) {
    return false;
  }
}

