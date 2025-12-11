import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, AlertCircleIcon } from "hugeicons-react";
import Step1 from "./upload/Step1";
import Step2FileUpload from "./upload/Step2FileUpload";
import Step2HelpfulLink from "./upload/Step2HelpfulLink";
import UploadSuccess from "./upload/UploadSuccess";
import { BatchUploadModal } from "./upload/batch";
import {
  createMaterials,
  updateMaterial,
  CreateMaterialForm,
  uploadMaterialPreview,
  cleanupTempPreview,
} from "@/api/materials.api";
import { reportError } from "@/api/error-reports.api";
import { Material, ResourceTypeEnum } from "@/lib/types/material.types";
import { dataURLtoFile } from "../Preview/urlToFile";

export type MaterialType = "file" | "link";
export type UploadStep =
  | "type-selection"
  | "upload-details"
  | "success"
  | "error";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial?: Material | null; // Material to edit (if in editing mode)
  onEditComplete?: () => void; // Callback after successful edit
  onCreateComplete?: (material: Material) => void; // Callback after successful creation
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  editingMaterial = null,
  onEditComplete,
  onCreateComplete,
}) => {
  const isEditMode = !!editingMaterial;

  const [currentStep, setCurrentStep] = useState<UploadStep>(
    isEditMode ? "upload-details" : "type-selection"
  );
  const [materialType, setMaterialType] = useState<MaterialType | null>(
    isEditMode
      ? editingMaterial.resource?.resourceType === ResourceTypeEnum.URL
        ? "link"
        : "file"
      : null
  );
  const [uploadData, setUploadData] = useState<CreateMaterialForm | null>(null);
  const [submitting, setSubmitting] = useState(false); // Loader state
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null); // Track temp preview for cleanup
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state for user feedback
  const [showBatchUpload, setShowBatchUpload] = useState(false); // Batch upload modal state

  // Reset state when modal opens/closes or editing material changes
  useEffect(() => {
    if (isOpen && editingMaterial) {
      setCurrentStep("upload-details");
      setMaterialType(
        editingMaterial.resource?.resourceType === ResourceTypeEnum.URL
          ? "link"
          : "file"
      );
      setErrorMessage(null); // Clear any previous errors
    } else if (isOpen && !editingMaterial) {
      setCurrentStep("type-selection");
      setMaterialType(null);
      setErrorMessage(null); // Clear any previous errors
    }
  }, [isOpen, editingMaterial]);

  const handleMaterialTypeSelect = (type: MaterialType) => {
    setMaterialType(type);
    setCurrentStep("upload-details");
  };

  const handleBatchUpload = () => {
    // Close the regular modal and open batch upload
    handleClose();
    setShowBatchUpload(true);
  };

  const handleBatchUploadClose = () => {
    setShowBatchUpload(false);
  };

  const handleUploadComplete = async (data: CreateMaterialForm) => {
    setUploadData(data);
    setSubmitting(true); // Start loader
    setErrorMessage(null); // Clear any previous errors

    try {
      if (isEditMode && editingMaterial) {
        // Update existing material
        const result = await updateMaterial(editingMaterial.id, data);
        console.log("Update result:", result);

        // Verify the update was successful
        if (!result || result.status !== "success" || !result.data) {
          throw new Error("Material update failed - no data returned");
        }

        onEditComplete?.();
        handleClose();
      } else {
        // Create new material
        const result = await createMaterials(data);

        // Verify the creation was successful
        if (
          !result ||
          result.status !== "success" ||
          !result.data ||
          !result.data.id
        ) {
          throw new Error("Material creation failed - no data or ID returned");
        }

        // Handle preview upload for file-based materials
        if (data.filePreview instanceof File) {
          try {
            console.log("Uploading preview file...");
            const uploadResponse = await uploadMaterialPreview(
              result.data.id,
              data.filePreview
            );

            // Verify preview upload was successful
            if (!uploadResponse || !uploadResponse.data?.previewUrl) {
              console.warn(
                "Preview upload failed, but material was created successfully"
              );
              // Don't throw error here as the main material was created successfully
            } else {
              result.data.previewUrl = uploadResponse.data.previewUrl;
              console.log(
                "Final preview URL stored in material:",
                result.data.previewUrl
              );
            }
          } catch (previewError) {
            console.warn(
              "Preview upload failed, but material was created successfully:",
              previewError
            );
            // Don't throw error here as the main material was created successfully
          }
        } else if (typeof data.filePreview === "string") {
          // String-based previews (YouTube/Google Drive URLs) are sent during creation
          console.log(
            "Preview URL was sent during material creation:",
            data.filePreview
          );
          result.data.previewUrl = result.data.previewUrl || data.filePreview;
          console.log(
            "Final preview URL stored in material:",
            result.data.previewUrl
          );
        } else {
          console.log("No preview to process");
        }

        // Let callers update their local state immediately
        onCreateComplete?.(result.data);

        setCurrentStep("success");
      }
    } catch (error: any) {
      console.error(isEditMode ? "Update failed:" : "Upload failed:", error);

      // Report the error to the development team
      try {
        await reportError(
          isEditMode ? "Material Update Failed" : "Material Upload Failed",
          error,
          {
            errorType: isEditMode
              ? "material_update_failure"
              : "material_upload_failure",
            severity: "high",
            additionalMetadata: {
              materialType,
              isEditMode,
              materialTitle: data.materialTitle,
              hasFile: "file" in data && !!data.file,
              hasUrl: "url" in data && !!data.url,
              hasPreview: !!data.filePreview,
            },
          }
        );
      } catch (reportingError) {
        console.warn("Failed to report error:", reportingError);
      }

      // Set user-friendly error message
      const errorMsg =
        error?.message ||
        (isEditMode
          ? "Failed to update material"
          : "Failed to upload material");

      setErrorMessage(
        `Upload failed. The issue has been forwarded to our development team and will be resolved shortly. Please try again later.`
      );
      setCurrentStep("error");
    } finally {
      setSubmitting(false); // Stop loader
    }
  };

  const handleBack = () => {
    if (currentStep === "upload-details") {
      setCurrentStep("type-selection");
      setMaterialType(null);
    }
  };

  const handleClose = async () => {
    // Cleanup temp preview if it exists
    if (tempPreviewUrl) {
      try {
        await cleanupTempPreview(tempPreviewUrl);
        console.log("Temp preview cleaned up successfully");
      } catch (error) {
        console.warn("Failed to cleanup temp preview:", error);
      }
    }

    setCurrentStep("type-selection");
    setMaterialType(null);
    setUploadData(null);
    setTempPreviewUrl(null);
    setErrorMessage(null); // Clear error state
    onClose();
  };

  const handleSuccessComplete = () => {
    handleClose();
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setCurrentStep("upload-details");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "type-selection":
        return (
          <Step1
            onSelectType={handleMaterialTypeSelect}
            onBatchUpload={!isEditMode ? handleBatchUpload : undefined}
          />
        );
      case "upload-details":
        if (materialType === "file") {
          return (
            <Step2FileUpload
              onComplete={handleUploadComplete}
              onBack={handleBack}
              editingMaterial={editingMaterial}
              isEditMode={isEditMode}
            />
          );
        } else if (materialType === "link") {
          return (
            <Step2HelpfulLink
              onComplete={handleUploadComplete}
              onBack={handleBack}
              editingMaterial={editingMaterial}
              isEditMode={isEditMode}
              onTempPreviewChange={setTempPreviewUrl}
            />
          );
        }
        return null;
      case "success":
        return <UploadSuccess onComplete={handleSuccessComplete} />;
      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircleIcon size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Failed
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {errorMessage ||
                "Something went wrong during the upload process."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={(e) => e.target === e.currentTarget && handleClose()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
              >
                {/* Loader overlay */}
                {submitting && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10"
                  disabled={submitting}
                >
                  <Cancel01Icon size={20} className="text-gray-500" />
                </button>

                {/* Modal content */}
                <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
                  {renderStep()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Batch Upload Modal */}
      <BatchUploadModal
        isOpen={showBatchUpload}
        onClose={handleBatchUploadClose}
      />
    </>
  );
};

export default UploadModal;
