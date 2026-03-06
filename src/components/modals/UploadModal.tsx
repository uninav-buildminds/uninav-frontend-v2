import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Step2FileUpload from "./upload/Step2FileUpload";
import UploadSuccess from "./upload/UploadSuccess";
import { BatchUploadModal } from "./upload/batch";
import {
  createMaterials,
  updateMaterial,
  CreateMaterialForm,
  uploadMaterialPreview,
} from "@/api/materials.api";
import { reportError } from "@/api/error-reports.api";
import { Material, ResourceTypeEnum } from "@/lib/types/material.types";

export type MaterialType = "file" | "link";
export type UploadStep = "upload-details" | "success" | "error";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial?: Material | null;
  onEditComplete?: () => void;
  onCreateComplete?: (material: Material) => void;
  folderId?: string;
  currentFolder?: { id: string; label: string; description?: string };
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  editingMaterial = null,
  onEditComplete,
  onCreateComplete,
  folderId,
  currentFolder,
}) => {
  const isEditMode = !!editingMaterial;

  const [currentStep, setCurrentStep] = useState<UploadStep>("upload-details");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("upload-details");
      setErrorMessage(null);
    }
  }, [isOpen, editingMaterial]);

  // Non-edit mode: delegate entirely to BatchUploadModal
  if (!isEditMode) {
    return (
      <BatchUploadModal
        isOpen={isOpen}
        onClose={onClose}
        folderId={folderId}
        currentFolder={currentFolder}
      />
    );
  }

  // Edit mode: keep existing file-edit flow
  const handleUploadComplete = async (data: CreateMaterialForm) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingMaterial) {
        const result = await updateMaterial(editingMaterial.id, data);
        if (!result || result.status !== "success" || !result.data) {
          throw new Error("Material update failed - no data returned");
        }
        onEditComplete?.();
        handleClose();
      } else {
        const result = await createMaterials(data);
        if (!result || result.status !== "success" || !result.data?.id) {
          throw new Error("Material creation failed - no data or ID returned");
        }

        if (data.filePreview instanceof File) {
          try {
            const uploadResponse = await uploadMaterialPreview(result.data.id, data.filePreview);
            if (uploadResponse?.data?.previewUrl) {
              result.data.previewUrl = uploadResponse.data.previewUrl;
            }
          } catch (previewError) {
            console.warn("Preview upload failed, but material was created successfully:", previewError);
          }
        }

        onCreateComplete?.(result.data);
        setCurrentStep("success");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      try {
        await reportError(
          isEditMode ? "Material Update Failed" : "Material Upload Failed",
          error,
          {
            errorType: isEditMode ? "material_update_failure" : "material_upload_failure",
            severity: "high",
            additionalMetadata: {
              isEditMode,
              materialTitle: data.materialTitle,
              hasFile: "file" in data && !!data.file,
              hasPreview: !!data.filePreview,
            },
          }
        );
      } catch (reportingError) {
        console.warn("Failed to report error:", reportingError);
      }
      setErrorMessage("Upload failed. The issue has been forwarded to our development team and will be resolved shortly. Please try again later.");
      setCurrentStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("upload-details");
    setErrorMessage(null);
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case "upload-details":
        return (
          <Step2FileUpload
            onComplete={handleUploadComplete}
            onBack={handleClose}
            editingMaterial={editingMaterial}
            isEditMode={isEditMode}
            folderId={folderId}
            currentFolder={currentFolder}
          />
        );
      case "success":
        return <UploadSuccess onComplete={handleClose} />;
      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Failed</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {errorMessage || "Something went wrong during the upload process."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setErrorMessage(null); setCurrentStep("upload-details"); }}
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

  return createPortal(
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
            {submitting && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10"
              disabled={submitting}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={20} className="text-gray-500" />
            </button>

            <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
              {renderStep()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UploadModal;
