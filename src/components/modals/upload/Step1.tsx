import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon, Layers01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import HeaderStepper from './shared/HeaderStepper';
import { MaterialType } from '../UploadModal';

interface Step1Props {
  onSelectType: (type: MaterialType) => void;
  onBatchUpload?: () => void;
}

const Step1: React.FC<Step1Props> = ({ onSelectType, onBatchUpload }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <HeaderStepper
        title="Share Your Notes, Earn Your Rewards"
        subtitle="Help your fellow students while earning points on UniNav"
        currentStep={1}
        totalSteps={2}
      />

      {/* Material type selection */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center">
          What are you sharing?
        </h3>
        
        <div className="space-y-4">
          {/* File Upload Option */}
          <motion.button
            onClick={() => onSelectType('file')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all duration-200 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/20 rounded-lg flex items-center justify-center group-hover:bg-brand/30 transition-colors">
                <HugeiconsIcon icon={File02Icon} strokeWidth={1.5} size={16} className="sm:w-5 sm:h-5 text-brand" />
              </div>
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">File Upload</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Drag your PDF, PPT, or DOC file or browse
                </p>
              </div>
            </div>
          </motion.button>

          {/* Helpful Link Option */}
          <motion.button
            onClick={() => onSelectType('link')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all duration-200 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/20 rounded-lg flex items-center justify-center group-hover:bg-brand/30 transition-colors">
                <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} size={16} className="sm:w-5 sm:h-5 text-brand" />
              </div>
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Helpful Link</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Paste the URL
                </p>
              </div>
            </div>
          </motion.button>

          {/* Batch Upload Option */}
          {onBatchUpload && (
            <motion.button
              onClick={onBatchUpload}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all duration-200 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/20 rounded-lg flex items-center justify-center group-hover:bg-brand/30 transition-colors">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.5} size={16} className="sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Batch Upload</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Upload multiple files or import links via CSV
                  </p>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Step1;
