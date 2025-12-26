import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, AlertCircleIcon, File02Icon, Link01Icon, ArrowLeft01Icon } from "hugeicons-react";
import BatchFileUpload from "./BatchFileUpload";
import BatchLinkUpload from "./BatchLinkUpload";
import UploadSuccess from "../UploadSuccess";
import { BatchCreateMaterialsResponse } from "@/api/materials.api";

export type BatchUploadTab = "files" | "links";
export type BatchUploadStep = "upload" | "success" | "error";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void; // Optional callback to go back to Step1
}

const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<BatchUploadTab>("files");
  const [currentStep, setCurrentStep] = useState<BatchUploadStep>("upload");
  const [uploadResult, setUploadResult] = useState<BatchCreateMaterialsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (result: BatchCreateMaterialsResponse) => {
    setUploadResult(result);
    setCurrentStep("success");
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setCurrentStep("error");
  };

  const handleClose = () => {
    setCurrentStep("upload");
    setActiveTab("files");
    setUploadResult(null);
    setErrorMessage(null);
    setIsUploading(false);
    onClose();
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setCurrentStep("upload");
  };

  const renderContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-1 sm:space-y-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Batch Upload Materials
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Upload multiple files or links at once
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("files")}
                disabled={isUploading}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "files"
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <File02Icon size={18} />
                <span>Files</span>
              </button>
              <button
                onClick={() => setActiveTab("links")}
                disabled={isUploading}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "links"
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <Link01Icon size={18} />
                <span>Links (CSV)</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "files" ? (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <BatchFileUpload
                      onComplete={handleUploadComplete}
                      onError={handleError}
                      onUploadingChange={setIsUploading}
                      onBack={onBack}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="links"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <BatchLinkUpload
                      onComplete={handleUploadComplete}
                      onError={handleError}
                      onUploadingChange={setIsUploading}
                      onBack={onBack}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <UploadSuccess
              onComplete={handleClose}
            />
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-8 px-6 text-center"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircleIcon size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Failed
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {errorMessage || "Something went wrong during the batch upload process."}
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
          </motion.div>
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
          onClick={(e) => e.target === e.currentTarget && !isUploading && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={isUploading}
              className={`absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10 ${
                isUploading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <Cancel01Icon size={20} className="text-gray-500" />
            </button>

            {/* Modal content */}
            <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BatchUploadModal;
