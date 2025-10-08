import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon } from "hugeicons-react";
import Step1 from "./upload/Step1";
import Step2FileUpload from "./upload/Step2FileUpload";
import Step2HelpfulLink from "./upload/Step2HelpfulLink";
import UploadSuccess from "./upload/UploadSuccess";
import {
  createMaterials,
  updateMaterial,
  CreateMaterialForm,
  uploadMaterialPreview,
  cleanupTempPreview,
} from "@/api/materials.api";
import { Material, ResourceTypeEnum } from "@/lib/types/material.types";
import { dataURLtoFile } from "../Preview/urlToFile";

export type MaterialType = "file" | "link";
export type UploadStep = "type-selection" | "upload-details" | "success";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial?: Material | null; // Material to edit (if in editing mode)
  onEditComplete?: () => void; // Callback after successful edit
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  editingMaterial = null,
  onEditComplete,
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

  // Reset state when modal opens/closes or editing material changes
  useEffect(() => {
    if (isOpen && editingMaterial) {
      setCurrentStep("upload-details");
      setMaterialType(
        editingMaterial.resource?.resourceType === ResourceTypeEnum.URL
          ? "link"
          : "file"
      );
    } else if (isOpen && !editingMaterial) {
      setCurrentStep("type-selection");
      setMaterialType(null);
    }
  }, [isOpen, editingMaterial]);

  const handleMaterialTypeSelect = (type: MaterialType) => {
    setMaterialType(type);
    setCurrentStep("upload-details");
  };

  const handleUploadComplete = async (data: CreateMaterialForm) => {
    setUploadData(data);
    setSubmitting(true); // Start loader
    try {
      if (isEditMode && editingMaterial) {
        // Update existing material
        const result = await updateMaterial(editingMaterial.id, data);
        console.log("Update result:", result);
        onEditComplete?.();
        handleClose();
      } else {
        // Create new material
        const result = await createMaterials(data);

        if (result.data?.id && data.filePreview instanceof File) {
          // Handle file-based previews (PDF/DOCX thumbnails) - upload separately
          console.log("Uploading preview file...");
          const uploadResponse = await uploadMaterialPreview(
            result.data.id,
            data.filePreview
          );
          // Store preview URL in result so frontend can render without refetch
          result.data.previewUrl = uploadResponse.data?.previewUrl;
          console.log(
            "Final preview URL stored in material:",
            result.data.previewUrl
          );
        } else if (typeof data.filePreview === "string") {
          // String-based previews (YouTube/Google Drive URLs) are sent during creation
          console.log(
            "Preview URL was sent during material creation:",
            data.filePreview
          );
          // The preview URL should already be set by the backend, but ensure it's available
          result.data.previewUrl = result.data.previewUrl || data.filePreview;
          console.log(
            "Final preview URL stored in material:",
            result.data.previewUrl
          );
        } else {
          console.log("No preview to process");
        }

        setCurrentStep("success");
      }
    } catch (error) {
      console.error(isEditMode ? "Update failed:" : "Upload failed:", error);
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
    onClose();
  };

  const handleSuccessComplete = () => {
    handleClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case "type-selection":
        return <Step1 onSelectType={handleMaterialTypeSelect} />;
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
  );
};

export default UploadModal;
