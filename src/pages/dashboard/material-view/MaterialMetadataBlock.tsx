import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Material } from "@/lib/types/material.types";
import MaterialFeedbackActions from "./MaterialFeedbackActions";

interface MaterialMetadataBlockProps {
  material: Material;
  onCreatorClick: () => void;
  onFlag: () => void;
  onLike: () => void;
  onDislike: () => void;
  /** compact = sidebar (small text), normal = sheet */
  variant?: "compact" | "normal";
}

const MaterialMetadataBlock: React.FC<MaterialMetadataBlockProps> = ({
  material,
  onCreatorClick,
  onFlag,
  onLike,
  onDislike,
  variant = "compact",
}) => {
  const textSize = variant === "compact" ? "text-xs" : "text-sm";
  const avatarSize = variant === "compact" ? "h-5 w-5" : "h-6 w-6";
  const fallbackText = variant === "compact" ? "text-[10px]" : "text-xs";

  return (
    <>
      {material.targetCourse && (
        <>
          <div className="flex justify-between">
            <span className={`text-gray-600 ${textSize}`}>Course:</span>
            <span className={`font-medium ${textSize}`}>
              {material.targetCourse.courseCode}
            </span>
          </div>
          {material.targetCourse.departments &&
            material.targetCourse.departments.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className={`text-gray-600 ${textSize}`}>Department:</span>
                  <span className={`font-medium ${textSize}`}>
                    {
                      material.targetCourse.departments[0].department.name
                    }
                  </span>
                </div>
                {material.targetCourse.departments[0].department.faculty && (
                  <div className="flex justify-between">
                    <span className={`text-gray-600 ${textSize}`}>Faculty:</span>
                    <span className={`font-medium ${textSize}`}>
                      {
                        material.targetCourse.departments[0].department.faculty
                          .name
                      }
                    </span>
                  </div>
                )}
              </>
            )}
        </>
      )}
      <div
        className={
          variant === "compact"
            ? "flex items-center justify-between gap-2"
            : "flex items-center justify-between gap-2"
        }
      >
        <span className={`text-gray-600 ${textSize}`}>Uploaded by:</span>
        <button
          onClick={onCreatorClick}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Avatar className={avatarSize}>
            <AvatarImage
              src={material.creator?.profilePicture || undefined}
              alt={`${material.creator?.firstName} ${material.creator?.lastName}`}
            />
            <AvatarFallback
              className={`${fallbackText} bg-brand/10 text-brand`}
            >
              {material.creator?.firstName?.[0]}
              {material.creator?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span
            className={`font-medium text-brand hover:text-brand/80 transition-colors ${textSize}`}
          >
            {material.creator?.firstName} {material.creator?.lastName}
          </span>
        </button>
      </div>
      <div className="flex justify-between">
        <span className={`text-gray-600 ${textSize}`}>Date:</span>
        <span className={`font-medium ${textSize}`}>
          {formatRelativeTime(material.createdAt)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className={`text-gray-600 ${textSize}`}>Type:</span>
        <span className={`font-medium uppercase ${textSize}`}>
          {material.type}
        </span>
      </div>
      <div className="flex justify-between">
        <span className={`text-gray-600 ${textSize}`}>Views:</span>
        <span className={`font-medium ${textSize}`}>{material.views}</span>
      </div>
      <div className="flex justify-between">
        <span className={`text-gray-600 ${textSize}`}>Downloads:</span>
        <span className={`font-medium ${textSize}`}>{material.downloads}</span>
      </div>

      <MaterialFeedbackActions
        materialId={material.id}
        onFlag={onFlag}
        onLike={onLike}
        onDislike={onDislike}
        likeCount={material.likes ?? 0}
        dislikeCount={0}
        variant={variant}
      />
    </>
  );
};

export default MaterialMetadataBlock;
