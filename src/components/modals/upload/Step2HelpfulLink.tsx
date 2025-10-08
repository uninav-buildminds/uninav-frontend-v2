import React, { useState, useRef, useEffect } from "react";
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
  YoutubePreview,
  checkIsYouTubeUrl,
} from "@/components/Preview/youtube";
import {
  GDrivePreview,
  checkIsGoogleDriveUrl,
} from "@/components/Preview/gDrive";
import {
  listFolderFiles,
  generateAndUploadPreview,
  extractGDriveId,
} from "@/lib/gdrive-preview";
import { isGDriveFolder } from "@/lib/utils/gdriveUtils";
import {
  inferMaterialType,
  generateDefaultTitle,
} from "@/lib/utils/inferMaterialType";
import {
  CreateMaterialLinkForm,
  getGDriveThumbnail,
} from "@/api/materials.api";
import {
  VisibilityEnum,
  RestrictionEnum,
  Material,
} from "@/lib/types/material.types";
import { SelectCourse } from "./shared/SelectCourse";

interface Step2HelpfulLinkProps {
  onComplete: (data: CreateMaterialLinkForm) => void;
  onBack: () => void;
  editingMaterial?: Material | null;
  isEditMode?: boolean;
  onTempPreviewChange?: (url: string | null) => void; // Callback to track temp preview
}

const Step2HelpfulLink: React.FC<Step2HelpfulLinkProps> = ({
  onComplete,
  onBack,
  editingMaterial = null,
  isEditMode = false,
  onTempPreviewChange,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [classification, setClassification] = useState<string>("");
  const [targetCourseId, setTargetCourseId] = useState<string>("");
  const [derivedPreviewUrl, setDerivedPreviewUrl] = useState<string | null>(
    null
  );
  const [resolvingGDrivePreview, setResolvingGDrivePreview] =
    useState<boolean>(false);

  // Helper function to safely get hostname from URL
  const getUrlHostname = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Helper function to validate if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

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

      // Prefill URL if it exists in resource
      if (editingMaterial.resource?.resourceAddress) {
        setValue("url", editingMaterial.resource.resourceAddress);
      }

      if (editingMaterial.tags && editingMaterial.tags.length > 0) {
        setTags(editingMaterial.tags);
        setValue("tags", editingMaterial.tags);
      }

      if (editingMaterial.targetCourseId) {
        setTargetCourseId(editingMaterial.targetCourseId);
      }
    }
  }, [isEditMode, editingMaterial, setValue]);

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

  // When URL looks like a Google Drive folder, fetch the first file and derive a thumbnail
  useEffect(() => {
    const url = watchedValues.url || "";
    // reset when url changes
    setDerivedPreviewUrl(null);
    // Clear temp preview tracking when URL changes
    onTempPreviewChange?.(null);

    if (!url || !checkIsGoogleDriveUrl(url)) return;

    // Only attempt special handling for folders
    if (!isGDriveFolder(url)) return;

    const identifier = extractGDriveId(url);
    if (!identifier || identifier.type !== "folder") return;

    let cancelled = false;
    const resolvePreview = async () => {
      try {
        setResolvingGDrivePreview(true);
        const contents = await listFolderFiles(identifier.id);
        if (cancelled) return;

        // Prefer the first non-folder file; otherwise fallback to first entry
        const firstFile =
          contents.files.find(
            (f) => f.mimeType !== "application/vnd.google-apps.folder"
          ) || contents.files[0];

        if (!firstFile) return; // empty folder => no preview

        // Generate preview and upload to Cloudinary
        const cloudinaryUrl = await generateAndUploadPreview(
          firstFile.id,
          firstFile.name
        );
        if (cloudinaryUrl) {
          setDerivedPreviewUrl(cloudinaryUrl);
          // Notify parent component about temp preview
          onTempPreviewChange?.(cloudinaryUrl);
        }
      } catch (err) {
        // Silent fail; user can still submit without preview
        setDerivedPreviewUrl(null);
      } finally {
        setResolvingGDrivePreview(false);
      }
    };

    resolvePreview();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues.url]);

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

  // Utility function to generate YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string | null => {
    if (!checkIsYouTubeUrl(url)) return null;

    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  };

  // Utility function to generate Google Drive thumbnail URL
  const getGoogleDriveThumbnail = (url: string): string | null => {
    if (!checkIsGoogleDriveUrl(url)) return null;

    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400-h300`;
      }
    }
    return null;
  };

  // Generate preview URL based on the URL type
  const generatePreviewUrl = (url: string): string | null => {
    if (checkIsYouTubeUrl(url)) {
      return getYouTubeThumbnail(url);
    } else if (checkIsGoogleDriveUrl(url)) {
      // For folders, use the derived preview we resolved via API; for files, compute directly
      if (isGDriveFolder(url)) {
        return derivedPreviewUrl;
      }
      return getGoogleDriveThumbnail(url);
    }
    return null;
  };

  const onSubmit = (data: UploadLinkInput) => {
    // Infer material type from URL
    const inferredType = inferMaterialType(data.url);

    // Generate preview URL if possible
    const previewUrl = generatePreviewUrl(data.url);

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
      filePreview: previewUrl || undefined, // Add the preview URL (supports GDrive folders)
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

        {/* URL Preview Section */}
        {watchedValues.url && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>

            {!isValidUrl(watchedValues.url) ? (
              <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                <div className="text-center">
                  <div className="text-yellow-600 mb-2">⚠️</div>
                  <p className="text-sm text-yellow-700 font-medium">
                    Invalid URL format
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Please enter a valid URL starting with http:// or https://
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Valid URL Previews */}

                {checkIsYouTubeUrl(watchedValues.url) ? (
                  <div className="flex justify-center">
                    <YoutubePreview
                      url={watchedValues.url}
                      width={280}
                      height={157}
                      className="shadow-sm"
                    />
                  </div>
                ) : checkIsGoogleDriveUrl(watchedValues.url) ? (
                  isGDriveFolder(watchedValues.url) ? (
                    <div className="flex justify-center">
                      <div
                        className="rounded-lg overflow-hidden shadow-sm bg-white border border-gray-200 w-[200px] h-[120px] flex items-center justify-center"
                        title="Google Drive folder preview"
                      >
                        {resolvingGDrivePreview ? (
                          <div className="text-xs text-gray-500">
                            Resolving preview…
                          </div>
                        ) : derivedPreviewUrl ? (
                          <img
                            src={derivedPreviewUrl}
                            alt="Google Drive folder preview"
                            className="w-full h-full object-cover"
                            onError={() => undefined}
                          />
                        ) : (
                          <div className="text-center p-4 text-xs text-gray-500">
                            No preview available for this folder
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <GDrivePreview
                        url={watchedValues.url}
                        width={280}
                        height={157}
                        className="shadow-sm"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Link01Icon
                        size={32}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-600 font-medium">
                        {getUrlHostname(watchedValues.url)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Link preview available
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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

export default Step2HelpfulLink;
