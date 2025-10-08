import {
  searchMaterials,
  uploadMaterialPreview,
  getDownloadUrl,
  getMaterialById,
} from "@/api/materials.api";
import { httpClient } from "@/api/api";
import { Material, MaterialTypeEnum } from "@/lib/types/material.types";
import { generatePdfPreviewBlob } from "@/components/Preview/PdfPreviewer";
import {
  extractGDriveId,
  generateGDrivePreviewBlob,
  listFolderFiles,
} from "@/lib/gdrive-preview";

export interface BatchUpdateProgress {
  totalPages: number;
  currentPage: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  totalToProcess: number;
  status: "idle" | "running" | "completed" | "error";
  currentTask: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Root API key for batch operations
const ROOT_API_KEY = "DKDddEK3K39SFfadfdfKDF$%$@#$#$@#$#@$#22";

// Upload material preview with root API key (bypasses ownership checks)
async function uploadMaterialPreviewWithRootKey(
  materialId: string,
  previewFile: File
): Promise<any> {
  console.log("Uploading file:", {
    name: previewFile.name,
    size: previewFile.size,
    type: previewFile.type,
    lastModified: previewFile.lastModified,
  });

  const formData = new FormData();
  formData.append("preview", previewFile, "preview.jpg");

  // Debug FormData contents
  console.log("FormData entries:");
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const response = await httpClient.post(
    `/materials/preview/upload/${materialId}`,
    formData,
    {
      headers: {
        "X-Root-API-Key": ROOT_API_KEY,
      },
    }
  );

  return response.data;
}

export async function runBatchPreviewUpdate(
  onProgress: (progress: BatchUpdateProgress) => void
) {
  let progress: BatchUpdateProgress = {
    totalPages: 0,
    currentPage: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    totalToProcess: 0,
    status: "running",
    currentTask: "Starting batch update...",
  };

  onProgress(progress);

  try {
    // Initial fetch to get total pages
    const initialData = await searchMaterials({ page: 1, limit: 50 });
    if (initialData.status !== "success") {
      throw new Error("Failed to fetch initial data");
    }

    progress.totalPages = initialData.data.pagination.totalPages;
    progress.totalToProcess = initialData.data.pagination.total; // Use total count
    onProgress({ ...progress });

    for (let page = 1; page <= progress.totalPages; page++) {
      progress.currentPage = page;
      progress.currentTask = `Fetching page ${page} of ${progress.totalPages}...`;
      onProgress({ ...progress });

      const pageData = await searchMaterials({ page, limit: 50 });
      if (pageData.status !== "success") {
        console.warn(`Failed to fetch page ${page}, skipping...`);
        continue;
      }

      const materialsToProcess = pageData.data.items.filter(
        (m) =>
          !m.previewUrl && // Only process materials without preview
          (m.type === MaterialTypeEnum.PDF ||
            m.type === MaterialTypeEnum.GDRIVE)
      );

      console.log(
        `Page ${page}: Processing ${materialsToProcess.length} materials`
      );
      console.log(
        "Material types found:",
        materialsToProcess.map((m) => ({
          id: m.id,
          label: m.label,
          type: m.type,
        }))
      );

      for (const material of materialsToProcess) {
        progress.currentTask = `Processing: ${material.label}`;
        onProgress({ ...progress });

        let previewBlob: Blob | null = null;
        try {
          if (material.type === MaterialTypeEnum.PDF) {
            console.log(`Processing PDF: ${material.label}`);
            const downloadUrl = await getDownloadUrl(material.id);
            previewBlob = await generatePdfPreviewBlob(downloadUrl);
          } else if (material.type === MaterialTypeEnum.GDRIVE) {
            console.log(`Found GDrive material: ${material.label}`);

            // Fetch full material details to get resource information
            console.log(`Fetching full material details for: ${material.id}`);
            const fullMaterial = await getMaterialById(material.id);

            // Small delay to avoid overwhelming the API
            await sleep(200);

            if (
              fullMaterial.status === "success" &&
              fullMaterial.data.resource?.resourceAddress
            ) {
              console.log(
                `Processing GDrive: ${material.label} - ${fullMaterial.data.resource.resourceAddress}`
              );
              const gdriveId = extractGDriveId(
                fullMaterial.data.resource.resourceAddress
              );
              console.log(`Extracted GDrive ID:`, gdriveId);

              if (gdriveId) {
                if (gdriveId.type === "file") {
                  console.log(
                    `GDrive file detected, generating preview directly for file ID: ${gdriveId.id}`
                  );
                  previewBlob = await generateGDrivePreviewBlob(gdriveId.id);
                } else if (gdriveId.type === "folder") {
                  console.log(
                    `GDrive folder detected, listing contents for folder ID: ${gdriveId.id}`
                  );
                  // For folders, we need to list contents and get the first file
                  const folderContents = await listFolderFiles(gdriveId.id);
                  if (folderContents.files.length > 0) {
                    // Get the first non-folder file
                    const firstFile =
                      folderContents.files.find(
                        (f) =>
                          f.mimeType !== "application/vnd.google-apps.folder"
                      ) || folderContents.files[0];

                    console.log(
                      `Using first file from folder: ${firstFile.name} (${firstFile.id})`
                    );
                    previewBlob = await generateGDrivePreviewBlob(firstFile.id);
                  } else {
                    console.warn(`GDrive folder is empty: ${gdriveId.id}`);
                  }
                }
              } else {
                console.warn(
                  `Could not extract GDrive ID from: ${fullMaterial.data.resource.resourceAddress}`
                );
              }
            } else {
              console.warn(
                `GDrive material ${material.label} has no resourceAddress after fetching full details:`,
                fullMaterial.status === "success"
                  ? fullMaterial.data?.resource
                  : "Failed to fetch material"
              );
            }
          } else {
            console.log(
              `Skipping material type: ${material.type} for ${material.label}`
            );
          }

          if (previewBlob && previewBlob.size > 0) {
            console.log("Valid preview blob generated:", {
              size: previewBlob.size,
              type: previewBlob.type,
            });

            // Ensure the blob has the correct MIME type
            const blob = new Blob([previewBlob], { type: "image/jpeg" });
            const previewFile = new File([blob], "preview.jpg", {
              type: "image/jpeg",
            });

            // Use root API key for batch updates
            await uploadMaterialPreviewWithRootKey(material.id, previewFile);
            progress.successful++;
            progress.currentTask = `✅ Successfully updated: ${material.label}`;
          } else {
            progress.skipped++;
            progress.currentTask = `⏭️ Skipped (no preview source): ${material.label}`;
          }
        } catch (error) {
          progress.failed++;
          progress.currentTask = `❌ Failed: ${material.label}`;
          console.error(`Failed to process material ${material.id}:`, error);
        }

        progress.processed++;
        onProgress({ ...progress });
        await sleep(1000); // 1-second delay between each material
      }

      if (page < progress.totalPages) {
        progress.currentTask = `Page ${page} complete. Waiting before next page...`;
        onProgress({ ...progress });
        await sleep(5000); // 5-second delay between pages
      }
    }

    progress.status = "completed";
    progress.currentTask = "Batch update completed successfully!";
    onProgress({ ...progress });
  } catch (error) {
    progress.status = "error";
    progress.currentTask = `An error occurred: ${
      (error as Error).message
    }. Please check the console.`;
    onProgress({ ...progress });
    console.error("Batch preview update failed:", error);
  }
}

// Test function to verify FormData creation
export async function testFormDataCreation() {
  console.log("🧪 Testing FormData creation...");

  try {
    // Create a simple test blob
    const testBlob = new Blob(["test image data"], { type: "image/jpeg" });
    const testFile = new File([testBlob], "test.jpg", { type: "image/jpeg" });

    console.log("Test file created:", {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type,
    });

    // Create FormData
    const formData = new FormData();
    formData.append("preview", testFile, "preview.jpg");

    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    console.log("✅ FormData test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ FormData test failed:", error);
    return false;
  }
}

// Test function to verify enum values
export function testEnumValues() {
  console.log("🧪 Testing MaterialTypeEnum values...");

  console.log("Available enum values:");
  console.log("PDF:", MaterialTypeEnum.PDF);
  console.log("GDRIVE:", MaterialTypeEnum.GDRIVE);
  console.log("YOUTUBE:", MaterialTypeEnum.YOUTUBE);
  console.log("DOCS:", MaterialTypeEnum.DOCS);

  // Test comparison
  const testType = "gdrive";
  const isGDrive = testType === MaterialTypeEnum.GDRIVE;
  console.log(`"gdrive" === MaterialTypeEnum.GDRIVE:`, isGDrive);

  console.log("✅ Enum test completed!");
  return true;
}

// Test function to check material structure
export async function testMaterialStructure() {
  console.log("🧪 Testing material structure...");

  try {
    const testData = await searchMaterials({ page: 1, limit: 10 });
    if (testData.status === "success") {
      const gdriveMaterials = testData.data.items.filter(
        (m) => m.type === MaterialTypeEnum.GDRIVE
      );
      console.log(
        `Found ${gdriveMaterials.length} GDrive materials from search:`
      );

      // Test first GDrive material by fetching full details
      if (gdriveMaterials.length > 0) {
        const firstGDrive = gdriveMaterials[0];
        console.log(
          `Fetching full details for first GDrive material: ${firstGDrive.label}`
        );

        const fullMaterial = await getMaterialById(firstGDrive.id);
        if (fullMaterial.status === "success") {
          console.log(`Full GDrive Material details:`, {
            id: fullMaterial.data.id,
            label: fullMaterial.data.label,
            type: fullMaterial.data.type,
            resource: fullMaterial.data.resource,
            hasResource: !!fullMaterial.data.resource,
            hasResourceAddress: !!fullMaterial.data.resource?.resourceAddress,
            resourceAddress: fullMaterial.data.resource?.resourceAddress,
          });

          // Test GDrive ID extraction
          if (fullMaterial.data.resource?.resourceAddress) {
            const gdriveId = extractGDriveId(
              fullMaterial.data.resource.resourceAddress
            );
            console.log(`Extracted GDrive ID:`, gdriveId);
            if (gdriveId) {
              console.log(
                `GDrive type: ${gdriveId.type} (${
                  gdriveId.type === "file" ? "Direct file" : "Folder"
                })`
              );
            }
          }
        } else {
          console.error("Failed to fetch full material details:", fullMaterial);
        }
      }
    }

    console.log("✅ Material structure test completed!");
    return true;
  } catch (error) {
    console.error("❌ Material structure test failed:", error);
    return false;
  }
}

// Make function available globally for browser console
if (typeof window !== "undefined") {
  (window as any).runBatchPreviewUpdate = runBatchPreviewUpdate;
  (window as any).testFormDataCreation = testFormDataCreation;
  (window as any).testEnumValues = testEnumValues;
  (window as any).testMaterialStructure = testMaterialStructure;
}
