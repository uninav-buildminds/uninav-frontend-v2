import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UploadSquare01Icon,
  ArrowLeft01Icon,
  File01Icon,

} from "hugeicons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  uploadFileSchema,
  type UploadFileInput,
} from "@/lib/validation/upload";
import { toast } from "sonner";
import HeaderStepper from "./shared/HeaderStepper";
import { Previewer } from "@/components/Preview/doc_viewer";
import AdvancedOptions from "./shared/AdvancedOptions";
import {
  inferMaterialType,
  generateDefaultTitle,
} from "@/lib/utils/inferMaterialType";
import { CreateMaterialFileForm } from "@/api/materials.api";
import {
  VisibilityEnum,
  RestrictionEnum,
  Material,
} from "@/lib/types/material.types";
import { SelectCourse } from "./shared/SelectCourse";
import { countFilePages } from "@/lib/utils/pageCounter";

interface Step2FileUploadProps {
  onComplete: (data: CreateMaterialFileForm) => void;
  onBack: () => void;
  editingMaterial?: Material | null;
  isEditMode?: boolean;
}

const Step2FileUpload: React.FC<Step2FileUploadProps> = ({
  onComplete,
  onBack,
  editingMaterial = null,
  isEditMode = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [classification, setClassification] = useState<string>("");
  const [targetCourseId, setTargetCourseId] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [isCountingPages, setIsCountingPages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadFileInput>({
    resolver: zodResolver(uploadFileSchema),
    mode: "onBlur",
    defaultValues: {
      visibility: VisibilityEnum.PUBLIC,
      accessRestrictions: RestrictionEnum.DOWNLOADABLE,
      tags: [],
    },
  });

  const watchedValues = watch();

  // Prefill form when in edit mode
  useEffect(() => {
    if (isEditMode && editingMaterial) {
      setValue("materialTitle", editingMaterial.label);
      setValue("description", editingMaterial.description || "");
      setValue("visibility", editingMaterial.visibility);
      setValue("accessRestrictions", editingMaterial.restriction);

      if (editingMaterial.tags && editingMaterial.tags.length > 0) {
        setTags(editingMaterial.tags);
        setValue("tags", editingMaterial.tags);
      }

      if (editingMaterial.targetCourseId) {
        setTargetCourseId(editingMaterial.targetCourseId);
      }
    }
  }, [isEditMode, editingMaterial, setValue]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection and enforce max upload size
  const handleFile = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      // 500MB limit
      alert("File size must be less than 500MB");
      return;
    }
    setSelectedFile(file);

    // Auto-populate title if current title is empty
    if (!watchedValues.materialTitle) {
      const defaultTitle = generateDefaultTitle(file);
      setValue("materialTitle", defaultTitle);
    }

    // Non-blocking page count calculation
    setIsCountingPages(true);
    countFilePages(file)
      .then((count) => {
        if (count > 0) {
          setPageCount(count);
          console.log(`Counted ${count} pages in file: ${file.name}`);
        }
      })
      .catch((error) => {
        console.error("Error counting pages:", error);
        // Silent fail - page count is optional
      })
      .finally(() => {
        setIsCountingPages(false);
      });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
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

  const onSubmit = (data: UploadFileInput) => {
    // In edit mode, file is optional (user might just update metadata)
    if (!isEditMode && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Infer material type from file (or use existing type in edit mode)
    const inferredType = selectedFile
      ? inferMaterialType(selectedFile)
      : editingMaterial?.type || "other";

    console.log("Step2FileUpload - Before form submission:", {
      filePreview: filePreview,
      filePreviewType: typeof filePreview,
      filePreviewConstructor: filePreview?.constructor?.name,
      filePreviewInstanceofFile: filePreview instanceof File,
      pageCount: pageCount,
    });

    const formData: CreateMaterialFileForm = {
      materialTitle: data.materialTitle,
      description: data.description || "",
      type: inferredType,
      classification: classification || "",
      visibility: data.visibility,
      accessRestrictions: data.accessRestrictions,
      tags: data.tags || [],
      targetCourseId: targetCourseId || undefined,
      pageCount: pageCount, // Include page count
      ...(selectedFile && { file: selectedFile }),
      ...(selectedImage && { image: selectedImage }),
      ...(filePreview && { filePreview: filePreview }), // Include file preview
    } as CreateMaterialFileForm;

    console.log("Step2FileUpload - Form data created:", {
      hasFilePreview: !!formData.filePreview,
      filePreviewInFormData: formData.filePreview,
      filePreviewType: typeof formData.filePreview,
      pageCount: formData.pageCount,
    });

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
        title={
          isEditMode
            ? "Edit Your Material"
            : "Share Your Notes, Earn Your Rewards"
        }
        subtitle={
          isEditMode
            ? "Update your material information"
            : "Help your fellow students while earning points on UniNav"
        }
        currentStep={2}
        totalSteps={2}
      />

      {/* Upload File Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {isEditMode ? "Update File (Optional)" : "Upload File"}
        </h3>
        {isEditMode && !selectedFile && (
          <p className="text-xs text-gray-600">
            Leave empty to keep the existing file
          </p>
        )}

        <div
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors ${
            dragActive
              ? "border-brand bg-brand/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-3">
              {/* Check if file is PDF or DOCX */}
              {selectedFile.type === "application/pdf" ||
              selectedFile.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                <Previewer
                  file={selectedFile}
                  onPreviewReady={(file: File) => {
                    setFilePreview(file); // Handle the preview file as needed
                  }}
                />
              ) : filePreview ? (
                // Render image preview if available
                <img
                  src={URL.createObjectURL(filePreview)}
                  alt={selectedFile.name}
                  className="mx-auto sm:w-24 sm:h-24 object-contain rounded"
                />
              ) : (
                // Fallback icon if no preview is available
                <File01Icon
                  size={40}
                  className="text-brand mx-auto sm:w-12 sm:h-12"
                />
              )}

              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {/* Show page count when available */}
                {isCountingPages ? (
                  <p className="text-xs text-gray-500 mt-1 animate-pulse">
                    Counting pages...
                  </p>
                ) : pageCount !== undefined && pageCount > 0 ? (
                  <p className="text-xs text-brand font-medium mt-1">
                    {pageCount} {pageCount === 1 ? "page" : "pages"}
                  </p>
                ) : null}
              </div>

            
            </div>
          ) : (
            <div className="space-y-3">
              <UploadSquare01Icon
                size={40}
                className="text-gray-400 mx-auto sm:w-12 sm:h-12"
              />
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  Click to Upload or Drag and Drop
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  [Max. file size: 500MB]
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Choose File
          </button>
        </div>
      </div>

      {/* Tell us about it Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none"
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

      {/* Target Course Selection */}
      <div className="space-y-3">
        <SelectCourse
          label="Target Course (Optional)"
          currentValue={targetCourseId}
          onChange={handleTargetCourseIdChange}
        />
      </div>

      <AdvancedOptions
        visibility={watchedValues.visibility}
        accessRestrictions={watchedValues.accessRestrictions}
        tags={tags}
        tagInput={tagInput}
        selectedImage={selectedImage}
        description={watchedValues.description || ""}
        classification={classification}
        onVisibilityChange={(value) =>
          setValue("visibility", value as VisibilityEnum)
        }
        onAccessRestrictionsChange={(value) =>
          setValue("accessRestrictions", value as RestrictionEnum)
        }
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        onTagInputChange={setTagInput}
        onImageChange={setSelectedImage}
        onDescriptionChange={(value) => setValue("description", value)}
        onClassificationChange={handleClassificationChange}
        imageInputRef={imageInputRef}
      />

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-3">
        {!isEditMode && (
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft01Icon size={16} />
            <span>Back</span>
          </button>
        )}
        <button
          onClick={handleSubmit(onSubmit)}
          className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
        >
          {isEditMode ? "Done" : "Upload"}
        </button>
      </div>
    </motion.div>
  );
};

export default Step2FileUpload;
