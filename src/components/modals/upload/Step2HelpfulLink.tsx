import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Link01Icon,
  ArrowLeft01Icon,
  Tag01Icon,
  Download01Icon,
  ArrowDown01Icon,
} from "hugeicons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  uploadLinkSchema,
  type UploadLinkInput,
} from "@/lib/validation/upload";
import { toast } from "sonner";
import HeaderStepper from "./shared/HeaderStepper";
import AdvancedOptions from "./shared/AdvancedOptions";
import {
  inferMaterialType,
  generateDefaultTitle,
} from "@/lib/utils/inferMaterialType";
import { CreateMaterialLinkForm } from "@/api/materials.api";

interface Step2HelpfulLinkProps {
  onComplete: (data: CreateMaterialLinkForm) => void;
  onBack: () => void;
}

const Step2HelpfulLink: React.FC<Step2HelpfulLinkProps> = ({
  onComplete,
  onBack,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [classification, setClassification] = useState<string>("");
  const [targetCourseId, setTargetCourseId] = useState<string>("");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadLinkInput>({
    resolver: zodResolver(uploadLinkSchema),
    mode: "onBlur",
    defaultValues: {
      visibility: "Public",
      accessRestrictions: "Downloadable",
      tags: [],
    },
  });

  const watchedValues = watch();

  // Handle URL input change to auto-populate title
  const handleUrlChange = (url: string) => {
    setValue("url", url);

    // Auto-populate title if current title is empty and URL is valid
    if (!watchedValues.materialTitle && url.trim()) {
      try {
        new URL(url); // Validate URL
        const defaultTitle = generateDefaultTitle(url);
        setValue("materialTitle", defaultTitle);
      } catch {
        // Invalid URL, don't auto-populate
      }
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  // Add classification value as tag if not already present
  const handleClassificationChange = (value: string) => {
    setClassification(value);
    if (value && !tags.includes(value)) {
      const newTags = [...tags, value];
      setTags(newTags);
      setValue("tags", newTags);
    }
  };

  const handleTargetCourseIdChange = (value: string) => {
    setTargetCourseId(value);
  };

  const handleTagRemove = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const onSubmit = (data: UploadLinkInput) => {
    // Infer material type from URL
    const inferredType = inferMaterialType(data.url);

    const formData: CreateMaterialLinkForm = {
      materialTitle: data.materialTitle,
      description: data.description || "",
      type: inferredType,
      classification: classification || "",
      visibility: data.visibility,
      accessRestrictions: data.accessRestrictions,
      tags: data.tags || [],
      targetCourseId: targetCourseId || undefined,
      url: data.url,
      image: selectedImage,
    };

    onComplete(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <HeaderStepper
        title="Share Your Notes, Earn Your Rewards"
        subtitle="Help your fellow students while earning points on UniNav"
        currentStep={2}
        totalSteps={2}
      />

      {/* Add URL file Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Add URL file</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paste your URL file here
          </label>
          <div className="relative">
            <input
              type="url"
              value={watchedValues.url || ""}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Link01Icon size={16} className="text-gray-400" />
            </div>
          </div>
          {errors.url && (
            <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>
          )}
        </div>
      </div>

      {/* Tell us about it Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Tell us about it
        </h3>

        {/* Material Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Title
          </label>
          <input
            type="text"
            {...register("materialTitle")}
            placeholder='e.g., "Week 5 - Introduction to Thermodynamics"'
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
          />
          {errors.materialTitle && (
            <p className="mt-1 text-xs text-red-600">
              {errors.materialTitle.message}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Be descriptive so everyone knows what's inside.
          </p>
        </div>
      </div>

      <AdvancedOptions
        visibility={watchedValues.visibility}
        accessRestrictions={watchedValues.accessRestrictions}
        tags={tags}
        tagInput={tagInput}
        selectedImage={selectedImage}
        description={watchedValues.description || ""}
        classification={classification}
        targetCourseId={targetCourseId}
        onVisibilityChange={(value) => setValue("visibility", value)}
        onAccessRestrictionsChange={(value) =>
          setValue("accessRestrictions", value)
        }
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        onTagInputChange={setTagInput}
        onImageChange={setSelectedImage}
        onDescriptionChange={(value) => setValue("description", value)}
        onClassificationChange={handleClassificationChange}
        onTargetCourseIdChange={handleTargetCourseIdChange}
        imageInputRef={imageInputRef}
      />

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft01Icon size={16} />
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
        >
          Upload
        </button>
      </div>
    </motion.div>
  );
};

export default Step2HelpfulLink;
