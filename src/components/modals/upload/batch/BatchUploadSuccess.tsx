import React from "react";
import { motion } from "framer-motion";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "hugeicons-react";
import { BatchCreateMaterialsResponse } from "@/api/materials.api";

interface BatchUploadSuccessProps {
  result: BatchCreateMaterialsResponse;
  onComplete: () => void;
}

const BatchUploadSuccess: React.FC<BatchUploadSuccessProps> = ({
  result,
  onComplete,
}) => {
  const allSuccessful = result.totalFailed === 0;
  const allFailed = result.totalSucceeded === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-8 px-6 text-center"
    >
      {/* Icon */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          allFailed
            ? "bg-red-50"
            : allSuccessful
            ? "bg-green-50"
            : "bg-yellow-50"
        }`}
      >
        {allFailed ? (
          <AlertCircleIcon size={40} className="text-red-500" />
        ) : (
          <CheckmarkCircle02Icon size={40} className={allSuccessful ? "text-green-500" : "text-yellow-500"} />
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {allFailed
          ? "Upload Failed"
          : allSuccessful
          ? "Upload Complete!"
          : "Partially Uploaded"}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 mb-6">
        {allFailed
          ? "All materials failed to upload. Please try again."
          : allSuccessful
          ? `Successfully uploaded ${result.totalSucceeded} material${
              result.totalSucceeded !== 1 ? "s" : ""
            }!`
          : `${result.totalSucceeded} uploaded successfully, ${result.totalFailed} failed.`}
      </p>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {result.totalSucceeded}
          </div>
          <div className="text-xs text-gray-500">Succeeded</div>
        </div>
        {result.totalFailed > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {result.totalFailed}
            </div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
        )}
      </div>

      {/* Failed items details */}
      {result.totalFailed > 0 && (
        <div className="w-full max-w-md mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 text-left">
            Failed items:
          </h4>
          <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {result.results
              .filter((r) => !r.success)
              .map((r) => (
                <div
                  key={r.index}
                  className="flex items-start gap-2 text-left text-sm py-1"
                >
                  <AlertCircleIcon
                    size={14}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-gray-700">{r.label}</span>
                    {r.error && (
                      <span className="text-red-600 ml-1">- {r.error}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Points earned notice */}
      {result.totalSucceeded > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-lg px-4 py-3 mb-6 max-w-md">
          <p className="text-sm text-brand">
            🎉 You earned{" "}
            <span className="font-bold">{result.totalSucceeded * 5} points</span>{" "}
            for your uploads!
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
      >
        Done
      </button>
    </motion.div>
  );
};

export default BatchUploadSuccess;
