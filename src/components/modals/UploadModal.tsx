import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon } from "hugeicons-react";
import Step1 from "./upload/Step1";
import Step2FileUpload from "./upload/Step2FileUpload";
import Step2HelpfulLink from "./upload/Step2HelpfulLink";
import UploadSuccess from "./upload/UploadSuccess";
import { createMaterials } from "@/api/materials.api";

export type MaterialType = "file" | "link";
export type UploadStep = "type-selection" | "upload-details" | "success";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>("type-selection");
  const [materialType, setMaterialType] = useState<MaterialType | null>(null);
  const [uploadData, setUploadData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false); // Loader state

  // useEffect(() => {
  //   console.log("uploadData changed:", uploadData);
  // }, [uploadData]);

  const handleMaterialTypeSelect = (type: MaterialType) => {
    setMaterialType(type);
    setCurrentStep("upload-details");
  };

  const handleUploadComplete = async (data: any) => {
    setUploadData(data);
    setSubmitting(true); // Start loader
    try {
      const result = await createMaterials(data);
      console.log("Upload result:", result);
      setCurrentStep("success");
    } catch (error) {
      console.error("Upload failed:", error);
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

  const handleClose = () => {
    setCurrentStep("type-selection");
    setMaterialType(null);
    setUploadData({});
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
            />
          );
        } else if (materialType === "link") {
          return (
            <Step2HelpfulLink
              onComplete={handleUploadComplete}
              onBack={handleBack}
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
