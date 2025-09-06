import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag01Icon, Image01Icon, Download01Icon, ArrowDown01Icon } from 'hugeicons-react';

interface AdvancedOptionsProps {
  visibility: string;
  accessRestrictions: string;
  tags: string[];
  tagInput: string;
  selectedImage: File | null;
  onVisibilityChange: (value: string) => void;
  onAccessRestrictionsChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (index: number) => void;
  onTagInputChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  visibility,
  accessRestrictions,
  tags,
  tagInput,
  selectedImage,
  onVisibilityChange,
  onAccessRestrictionsChange,
  onTagAdd,
  onTagRemove,
  onTagInputChange,
  onImageChange,
  imageInputRef
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-brand hover:text-brand/80 transition-colors"
      >
        <span>Advanced options</span>
        <ArrowDown01Icon 
          size={16} 
          className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
        />
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 p-4 bg-gray-50 rounded-lg"
        >
          {/* Visibility and Access Restrictions - Same Line */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <Select value={visibility} onValueChange={onVisibilityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1060]">
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Restrictions
              </label>
              <Select value={accessRestrictions} onValueChange={onAccessRestrictionsChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1060]">
                  <SelectItem value="Downloadable">Downloadable</SelectItem>
                  <SelectItem value="View Only">View Only</SelectItem>
                  <SelectItem value="Restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="relative">
              <div className="flex flex-wrap items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand transition-colors min-h-[40px] outline-none">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-brand/10 text-brand rounded-md text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => onTagRemove(index)}
                      className="text-brand/70 hover:text-brand ml-1"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => onTagInputChange(e.target.value)}
                  onKeyPress={onTagAdd}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                      onTagRemove(tags.length - 1);
                    }
                  }}
                  placeholder={tags.length === 0 ? "Add a tag, press enter" : ""}
                  className="flex-1 min-w-[120px] border-none outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Add Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Image
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Image01Icon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Choose file</span>
              </button>
              <span className="text-sm text-gray-500">
                {selectedImage ? selectedImage.name : 'No file chosen'}
              </span>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onImageChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedOptions;
