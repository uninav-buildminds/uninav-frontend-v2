import React from 'react';
import { motion } from 'framer-motion';

interface UploadSuccessProps {
  onComplete: () => void;
}

const UploadSuccess: React.FC<UploadSuccessProps> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="text-center space-y-6"
    >
      {/* Success Image */}
      <div className="flex justify-center">
        <img 
          src="/assets/upload-received.svg" 
          alt="Upload Received" 
          className="w-24 h-24"
        />
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Received!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Thanks for sharing! Our content moderators will review your submission within 24 hours. 
          You'll get a notification and your badge once it's approved.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="w-full px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
      >
        Submit
      </button>
    </motion.div>
  );
};

export default UploadSuccess;
