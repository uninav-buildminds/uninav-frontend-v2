import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Add01Icon,
  Link04Icon,
  Image01Icon,
  Target01Icon,
  ArrowDown01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import {
  Club,
  ClubTargetingEnum,
  CreateClubDto,
  UpdateClubDto,
} from "@/lib/types/club.types";
import { CLUB_INTERESTS } from "@/data/clubs.constants";
import { getAllFaculties } from "@/api/faculty.api";
import { Faculty } from "@/lib/types/faculty.types";
import { ResponseStatus } from "@/lib/types/response.types";

interface PostClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClubDto) => void;
  isSubmitting?: boolean;
  /** If provided, modal becomes "Edit Club" with pre-filled data */
  editingClub?: Club | null;
}

const PostClubModal: React.FC<PostClubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  editingClub = null,
}) => {
  const isEditMode = !!editingClub;

  // Faculty/department data for the targeting picker
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [deptSearch, setDeptSearch] = useState("");
  const [deptPickerOpen, setDeptPickerOpen] = useState(false);

  useEffect(() => {
    getAllFaculties().then((res) => {
      if (res?.status === ResponseStatus.SUCCESS) setFaculties(res.data);
    });
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [targeting, setTargeting] = useState<ClubTargetingEnum>(
    ClubTargetingEnum.PUBLIC,
  );
  const [targetDeptIds, setTargetDeptIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (isOpen && editingClub) {
      setName(editingClub.name);
      setDescription(editingClub.description);
      setExternalLink(editingClub.externalLink);
      setSelectedInterests(editingClub.interests || []);
      setTags(editingClub.tags || []);
      setTargeting(editingClub.targeting);
      setTargetDeptIds(
        editingClub.targetDepartments?.map((td) => td.departmentId) ?? [],
      );
      // Show existing image as preview but clear any previously selected file
      // so the old image is only replaced if the user explicitly picks a new one
      setImageFile(null);
      setImagePreview(editingClub.imageUrl || null);
      setDeptSearch("");
      setDeptPickerOpen(false);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editingClub]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setExternalLink("");
    setSelectedInterests([]);
    setTags([]);
    setTagInput("");
    setTargeting(ClubTargetingEnum.PUBLIC);
    setTargetDeptIds([]);
    setImageFile(null);
    setImagePreview(null);
    setDeptSearch("");
    setDeptPickerOpen(false);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
          ? [...prev, interest]
          : prev,
    );
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleDept = (deptId: string) => {
    setTargetDeptIds((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId],
    );
  };

  const isValid =
    name.trim() &&
    description.trim() &&
    externalLink.trim() &&
    selectedInterests.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const dto: CreateClubDto = {
      name: name.trim(),
      description: description.trim(),
      externalLink: externalLink.trim(),
      tags,
      interests: selectedInterests,
      targeting,
      targetDepartmentIds:
        targeting !== ClubTargetingEnum.PUBLIC ? targetDeptIds : [],
    };
    if (imageFile) dto.image = imageFile;
    onSubmit(dto);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal-backdrop flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={1.5}
                size={20}
                className="text-gray-500"
              />
            </button>

            <div className="p-6 pt-8 max-h-[85vh] overflow-y-auto scroll-surface">
              {/* Header */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center">
                  <HugeiconsIcon
                    icon={Add01Icon}
                    strokeWidth={1.5}
                    size={28}
                    className="text-brand"
                  />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
                {isEditMode ? "Edit Club" : "Post a Club"}
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                {isEditMode
                  ? "Update your club's details below."
                  : "Help students discover your community."}
              </p>

              {/* Form */}
              <div className="space-y-5">
                {/* Club Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Club Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AI Research Club"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's your club about? Who should join?"
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none transition-all"
                  />
                </div>

                {/* External Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    External Link <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Link04Icon}
                      strokeWidth={1.5}
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="url"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/... or Google Form link"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Club Image / Banner
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer border border-dashed border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <HugeiconsIcon
                          icon={Image01Icon}
                          strokeWidth={1.5}
                          size={20}
                          className="text-gray-400"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {imageFile
                          ? imageFile.name
                          : imagePreview
                            ? "Click to replace image"
                            : "Upload image"}
                      </span>
                      <p className="text-xs text-gray-400">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Interests <span className="text-red-400">*</span>{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      Pick 1–5
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto scroll-surface">
                    {CLUB_INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${
                          selectedInterests.includes(interest)
                            ? "bg-brand text-white border-brand"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tags{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      Custom keywords (max 10)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type and press Enter"
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                  />
                </div>

                {/* Targeting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HugeiconsIcon
                      icon={Target01Icon}
                      strokeWidth={1.5}
                      size={14}
                      className="inline mr-1"
                    />
                    Targeting
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { v: ClubTargetingEnum.PUBLIC, l: "Everyone" },
                        { v: ClubTargetingEnum.SPECIFIC, l: "Specific Depts" },
                        { v: ClubTargetingEnum.EXCLUDE, l: "Exclude Depts" },
                      ] as const
                    ).map(({ v, l }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setTargeting(v);
                          if (v === ClubTargetingEnum.PUBLIC) {
                            setDeptPickerOpen(false);
                            setDeptSearch("");
                          }
                        }}
                        className={`text-xs font-medium py-2 rounded-xl transition-colors border ${
                          targeting === v
                            ? "bg-brand text-white border-brand"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  {targeting !== ClubTargetingEnum.PUBLIC && (
                    <div className="mt-3 space-y-2">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setDeptPickerOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-left hover:border-brand/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                      >
                        <span className="text-gray-500">
                          {targetDeptIds.length === 0
                            ? "Search and select departments…"
                            : `${targetDeptIds.length} department${targetDeptIds.length !== 1 ? "s" : ""} selected`}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          strokeWidth={1.5}
                          size={16}
                          className={`text-gray-400 transition-transform ${deptPickerOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Inline dropdown */}
                      {deptPickerOpen && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          {/* Search input */}
                          <div className="px-3 py-2 border-b border-gray-100">
                            <input
                              type="text"
                              value={deptSearch}
                              onChange={(e) => setDeptSearch(e.target.value)}
                              placeholder="Search departments…"
                              className="w-full text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                              autoFocus
                            />
                          </div>

                          {/* List grouped by faculty */}
                          <div className="max-h-48 overflow-y-auto scroll-surface">
                            {faculties.map((faculty) => {
                              const filtered = (faculty.departments ?? []).filter(
                                (d) =>
                                  d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
                                  faculty.name.toLowerCase().includes(deptSearch.toLowerCase()),
                              );
                              if (filtered.length === 0) return null;
                              return (
                                <div key={faculty.id}>
                                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    {faculty.name}
                                  </p>
                                  {filtered.map((dept) => {
                                    const selected = targetDeptIds.includes(dept.id);
                                    return (
                                      <button
                                        key={dept.id}
                                        type="button"
                                        onClick={() => toggleDept(dept.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                                          selected
                                            ? "bg-brand/5 text-brand"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        <span
                                          className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${
                                            selected
                                              ? "bg-brand border-brand"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {selected && (
                                            <HugeiconsIcon
                                              icon={Tick01Icon}
                                              strokeWidth={2}
                                              size={10}
                                              className="text-white"
                                            />
                                          )}
                                        </span>
                                        <span className="truncate">{dept.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })}
                            {faculties.every(
                              (f) =>
                                !(f.departments ?? []).some(
                                  (d) =>
                                    d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
                                    f.name.toLowerCase().includes(deptSearch.toLowerCase()),
                                ),
                            ) && (
                              <p className="px-3 py-4 text-sm text-gray-400 text-center">
                                No departments found
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selected chips */}
                      {targetDeptIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {targetDeptIds.map((id) => {
                            const dept = faculties
                              .flatMap((f) => f.departments ?? [])
                              .find((d) => d.id === id);
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-brand/8 text-brand"
                              >
                                {dept?.name ?? id}
                                <button
                                  type="button"
                                  onClick={() => toggleDept(id)}
                                  className="hover:text-brand/60 leading-none"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="flex-1 px-4 py-3 text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Add01Icon}
                        strokeWidth={1.5}
                        size={16}
                      />
                      {isEditMode ? "Save Changes" : "Post Club"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PostClubModal;
