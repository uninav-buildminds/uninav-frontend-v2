import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
  Material,
} from "@/lib/types/material.types";
import { UserRole } from "@/lib/types/response.types";
import {
  updateMaterial,
  getDownloadUrl,
  getMaterialById,
} from "@/api/materials.api";
import {
  BookOpen,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  Globe,
  Lock,
  FileText,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { ResponseStatus } from "@/lib/types/response.types";

interface MaterialReviewModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const MaterialReviewModal: React.FC<MaterialReviewModalProps> = ({
  material,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);
  const [fullMaterial, setFullMaterial] = useState<Material | null>(material);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    type: MaterialTypeEnum.OTHER,
    tags: [] as string[],
    visibility: VisibilityEnum.PUBLIC,
    restriction: RestrictionEnum.READONLY,
    targetCourseId: "",
  });
  const [tagInput, setTagInput] = useState("");

  // Fetch full material data when modal opens
  useEffect(() => {
    const fetchFullMaterial = async () => {
      if (material && isOpen) {
        setIsLoadingMaterial(true);
        try {
          const response = await getMaterialById(material.id);
          if (response.status === ResponseStatus.SUCCESS) {
            setFullMaterial(response.data);
          } else {
            // Fallback to the passed material if fetch fails
            setFullMaterial(material);
          }
        } catch (error) {
          console.error("Error fetching full material:", error);
          // Fallback to the passed material if fetch fails
          setFullMaterial(material);
        } finally {
          setIsLoadingMaterial(false);
        }
      } else if (!isOpen) {
        // Reset when modal closes
        setFullMaterial(null);
      }
    };

    fetchFullMaterial();
  }, [material, isOpen]);

  // Initialize form data when full material changes
  useEffect(() => {
    if (fullMaterial) {
      setFormData({
        label: fullMaterial.label || "",
        description: fullMaterial.description || "",
        type: fullMaterial.type || MaterialTypeEnum.OTHER,
        tags: fullMaterial.tags || [],
        visibility: fullMaterial.visibility || VisibilityEnum.PUBLIC,
        restriction: fullMaterial.restriction || RestrictionEnum.READONLY,
        targetCourseId: fullMaterial.targetCourseId || "",
      });
      setTagInput("");
      setIsEditing(false);
    }
  }, [fullMaterial]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!fullMaterial) return;

    setSaving(true);
    try {
      const updateData = {
        materialTitle: formData.label,
        description: formData.description,
        type: formData.type,
        tags: formData.tags,
        visibility: formData.visibility,
        accessRestrictions: formData.restriction,
        targetCourseId: formData.targetCourseId || undefined,
      };

      const response = await updateMaterial(fullMaterial.id, updateData);

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Material updated successfully",
        });
        setIsEditing(false);
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: "Failed to update material",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update material",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (
      !fullMaterial?.resource ||
      fullMaterial.resource.resourceType !== "upload"
    )
      return;

    setIsLoadingDownload(true);
    try {
      const downloadUrl = await getDownloadUrl(fullMaterial.id);
      window.open(downloadUrl, "_blank");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get download URL",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDownload(false);
    }
  };

  const handleVisitResource = () => {
    if (fullMaterial?.resource?.resourceAddress) {
      window.open(fullMaterial.resource.resourceAddress, "_blank");
    }
  };

  const handleViewInDashboard = () => {
    if (fullMaterial) {
      window.open(`/dashboard/material/${fullMaterial.id}`, "_blank");
    }
  };

  if (!material) return null;

  // Show loading state while fetching full material data
  if (isLoadingMaterial) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Material Review
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading material details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Use fullMaterial if available, otherwise fallback to material
  const displayMaterial = fullMaterial || material;

  const isAdmin = user?.role === UserRole.ADMIN;
  const canEdit = isAdmin; // Only admins can edit in review modal

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Material Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Material Preview */}
          <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {displayMaterial.previewUrl ? (
              <img
                src={displayMaterial.previewUrl}
                alt={displayMaterial.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="h-16 w-16 text-gray-300" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-600 text-white">
                {displayMaterial.type.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleViewInDashboard}
              className="gap-2"
              variant="outline"
            >
              <Eye className="h-4 w-4" />
              View in Dashboard
            </Button>

            {displayMaterial.resource?.resourceAddress && (
              <Button
                onClick={handleVisitResource}
                className="gap-2"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Resource
              </Button>
            )}

            {displayMaterial.resource?.resourceType === "upload" && (
              <Button
                onClick={handleDownload}
                disabled={isLoadingDownload}
                className="gap-2"
                variant="outline"
              >
                {isLoadingDownload ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </Button>
            )}
          </div>

          {/* Material Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={formData.label}
                    onChange={(e) => handleInputChange("label", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold mt-1">
                    {displayMaterial.label}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-600 mt-1">
                    {displayMaterial.description || "No description provided"}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleInputChange("type", value as MaterialTypeEnum)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MaterialTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 capitalize">
                    {displayMaterial.type.replace(/_/g, " ")}
                  </p>
                )}
              </div>

              {/* Visibility */}
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                {isEditing ? (
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      handleInputChange("visibility", value as VisibilityEnum)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VisibilityEnum.PUBLIC}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value={VisibilityEnum.PRIVATE}>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {displayMaterial.visibility === VisibilityEnum.PUBLIC ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span className="capitalize">
                      {displayMaterial.visibility}
                    </span>
                  </div>
                )}
              </div>

              {/* Restriction */}
              <div>
                <Label htmlFor="restriction">Access Restriction</Label>
                {isEditing ? (
                  <Select
                    value={formData.restriction}
                    onValueChange={(value) =>
                      handleInputChange("restriction", value as RestrictionEnum)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RestrictionEnum.READONLY}>
                        Read Only
                      </SelectItem>
                      <SelectItem value={RestrictionEnum.DOWNLOADABLE}>
                        Downloadable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 capitalize">
                    {displayMaterial.restriction.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Creator */}
              <div>
                <Label>Creator</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={displayMaterial.creator?.profilePicture || undefined}
                      alt={`${displayMaterial.creator?.firstName} ${displayMaterial.creator?.lastName}`}
                    />
                    <AvatarFallback className="text-sm bg-brand/10 text-brand">
                      {displayMaterial.creator?.firstName?.[0]}
                      {displayMaterial.creator?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {displayMaterial.creator?.firstName}{" "}
                      {displayMaterial.creator?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{displayMaterial.creator?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {displayMaterial.views}
                    </p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {displayMaterial.downloads}
                    </p>
                    <p className="text-sm text-gray-500">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {displayMaterial.likes}
                    </p>
                    <p className="text-sm text-gray-500">Likes</p>
                  </div>
                </div>
              </div>

              {/* Course */}
              {displayMaterial.targetCourse && (
                <div>
                  <Label>Target Course</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {displayMaterial.targetCourse.courseCode} -{" "}
                      {displayMaterial.targetCourse.courseName}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <Label>Dates</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created:{" "}
                      {new Date(displayMaterial.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Updated:{" "}
                      {new Date(displayMaterial.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Status */}
              <div>
                <Label>Review Status</Label>
                <div className="mt-1">
                  <Badge
                    className={
                      displayMaterial.reviewStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : displayMaterial.reviewStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {displayMaterial.reviewStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {displayMaterial.tags && displayMaterial.tags.length > 0 ? (
                  displayMaterial.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No tags</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Edit Material
                  </Button>
                )}
              </>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialReviewModal;
