import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, PlusSignIcon } from "hugeicons-react";
import { toast } from "sonner";
import { createCourse } from "@/api/course.api";
import { getDepartments } from "@/api/department.api";
import { Department } from "@/lib/types/department.types";
import { Course } from "@/lib/types/course.types";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: (course: Course) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
    departmentId: "",
    level: 100,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await getDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = "Course name is required";
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (formData.courseCode.length > 7) {
      newErrors.courseCode = "Course code cannot exceed 7 characters";
    } else if (/\s/.test(formData.courseCode)) {
      newErrors.courseCode = "Course code cannot contain spaces";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for course code
    if (name === "courseCode") {
      const cleanedValue = value.replace(/\s+/g, "").toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: cleanedValue.slice(0, 7) }));
    } else if (name === "level") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createCourse(formData);

      if (response && response.status === "success" && response.data) {
        toast.success("Course created successfully!");
        onCourseCreated?.(response.data);
        handleClose();
      } else {
        throw new Error("Failed to create course");
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseName: "",
      courseCode: "",
      description: "",
      departmentId: "",
      level: 100,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[10001] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              disabled={isSubmitting}
            >
              <Cancel01Icon size={20} className="text-gray-500" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <PlusSignIcon size={24} className="text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Course
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a new course to the system
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Course Name */}
            <div>
              <label
                htmlFor="courseName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.courseName
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:ring-brand/30 focus:border-brand"
                }`}
                placeholder="e.g., Introduction to Computer Science"
                disabled={isSubmitting}
              />
              {errors.courseName && (
                <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>
              )}
            </div>

            {/* Course Code */}
            <div>
              <label
                htmlFor="courseCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors uppercase ${
                  errors.courseCode
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:ring-brand/30 focus:border-brand"
                }`}
                placeholder="e.g., CSC101"
                maxLength={7}
                disabled={isSubmitting}
              />
              {errors.courseCode && (
                <p className="mt-1 text-sm text-red-600">{errors.courseCode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Max 7 characters, no spaces
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
                placeholder="Brief description of the course"
                disabled={isSubmitting}
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="departmentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.departmentId
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:ring-brand/30 focus:border-brand"
                }`}
                disabled={isSubmitting || isLoadingDepartments}
              >
                <option value="">
                  {isLoadingDepartments ? "Loading departments..." : "Select department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Level <span className="text-red-500">*</span>
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                disabled={isSubmitting}
              >
                <option value={100}>100 Level</option>
                <option value={200}>200 Level</option>
                <option value={300}>300 Level</option>
                <option value={400}>400 Level</option>
                <option value={500}>500 Level</option>
              </select>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateCourseModal;
