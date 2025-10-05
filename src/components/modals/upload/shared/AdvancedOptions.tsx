import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CustomSelect,
  CustomSelectOption,
} from "@/components/dashboard/CustomSelect";
import {
  Tag01Icon,
  Image01Icon,
  Download01Icon,
  ArrowDown01Icon,
} from "hugeicons-react";

interface AdvancedOptionsProps {
  visibility: string;
  accessRestrictions: string;
  tags: string[];
  tagInput: string;
  selectedImage: File | null;
  description: string;
  classification: string;
  onVisibilityChange: (value: string) => void;
  onAccessRestrictionsChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (index: number) => void;
  onTagInputChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onDescriptionChange: (value: string) => void;
  onClassificationChange: (value: string) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  visibility,
  accessRestrictions,
  tags,
  tagInput,
  selectedImage,
  description,
  classification,
  onVisibilityChange,
  onAccessRestrictionsChange,
  onTagAdd,
  onTagRemove,
  onTagInputChange,
  onImageChange,
  onDescriptionChange,
  onClassificationChange,
  imageInputRef,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Define options for dropdowns
  const visibilityOptions: CustomSelectOption[] = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" },
    { value: "Unlisted", label: "Unlisted" },
  ];

  const accessRestrictionsOptions: CustomSelectOption[] = [
    { value: "Downloadable", label: "Downloadable" },
    { value: "View Only", label: "View Only" },
    { value: "Restricted", label: "Restricted" },
  ];

  const classificationOptions: CustomSelectOption[] = [
    { value: "exam-past-questions", label: "Exam Past Questions" },
    { value: "lecture-notes", label: "Lecture Notes" },
    { value: "assignments", label: "Assignments" },
    { value: "tutorials", label: "Tutorials" },
    { value: "lab-reports", label: "Lab Reports" },
    { value: "study-guides", label: "Study Guides" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-brand hover:text-brand/80 transition-colors"
      >
        <span>Advanced options</span>
        <ArrowDown01Icon
          size={16}
          className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        />
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 p-4 bg-gray-50 rounded-lg"
        >
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="e.g., Covers key formulas from lectures 4 & 5"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none outline-none text-sm sm:text-base"
            />
            <p className="text-xs text-gray-600 mt-1">
              What's good about this? What does it cover?
            </p>
          </div>

          {/* Classification */}
          <div>
            <CustomSelect
              label="Select Upload Classification (Optional)"
              value={classification}
              onChange={onClassificationChange}
              options={classificationOptions}
              placeholder="e.g., Exam past question and Answers"
            />
          </div>

          {/* Visibility and Access Restrictions - Same Line */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Visibility"
                value={visibility}
                onChange={onVisibilityChange}
                options={visibilityOptions}
              />
            </div>

            <div>
              <CustomSelect
                label="Access Restrictions"
                value={accessRestrictions}
                onChange={onAccessRestrictionsChange}
                options={accessRestrictionsOptions}
              />
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
                    if (
                      e.key === "Backspace" &&
                      tagInput === "" &&
                      tags.length > 0
                    ) {
                      onTagRemove(tags.length - 1);
                    }
                  }}
                  placeholder={
                    tags.length === 0 ? "Add a tag, press enter" : ""
                  }
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
                {selectedImage ? selectedImage.name : "No file chosen"}
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
