import React, { useState, useRef, useEffect } from "react";
import { MoreVerticalIcon, Share08Icon, PencilEdit02Icon, Delete02Icon } from "hugeicons-react";
import { Collection } from "@/lib/types/collection.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderCardProps {
  folder: Collection;
  onClick: () => void;
  onShare?: () => void;
  onEdit?: (folderId: string, newName: string) => void;
  onDelete?: (folderId: string) => void;
  materialCount?: number;
  isRenaming?: boolean;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onShare,
  onEdit,
  onDelete,
  materialCount = 0,
  isRenaming = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(folder.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Only update edited name if we're not currently editing or renaming
    if (!isEditing && !isRenaming) {
      setEditedName(folder.label);
    }
  }, [folder.label, isEditing, isRenaming]);

  const handleEditClick = () => {
    if (onEdit) {
      setIsEditing(true);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = () => {
    // Don't blur if we're renaming (spinner is showing)
    if (isRenaming) return;
    
    if (editedName.trim() && editedName.trim() !== folder.label) {
      onEdit?.(folder.id, editedName.trim());
    } else {
      setEditedName(folder.label);
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editedName.trim() && editedName.trim() !== folder.label && !isRenaming) {
        onEdit?.(folder.id, editedName.trim());
        // Keep editing state true to show spinner - don't blur
      }
    } else if (e.key === "Escape") {
      if (!isRenaming) {
        setEditedName(folder.label);
        setIsEditing(false);
      }
    }
  };

  const handleShare = () => {
    onShare?.();
  };

  const handleDelete = () => {
    onDelete?.(folder.id);
  };

  return (
    <section className="relative group flex flex-col w-full cursor-pointer">
      {/* Folder Icon Container - Aligned with MaterialCard image */}
      <div className="relative w-full aspect-square mb-3 flex items-end justify-center">
        <div
          className="file relative w-[95%] aspect-[4/3] cursor-pointer origin-bottom [perspective:1500px] z-50"
          onClick={onClick}
        >
        <div className="work-5 bg-brand w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-brand after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-brand before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]" />

        <div className="work-4 absolute inset-1 bg-[#7480FB] rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)]" />

        <div className="work-3 absolute inset-1 bg-[#8892FB] rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]" />

        <div className="work-2 absolute inset-1 bg-[#DCDFFE] rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)]" />

        <div className="work-1 absolute bottom-0 bg-gradient-to-t from-brand via-[#0619EF] to-[#2436F9] w-full h-full rounded-2xl before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_rgba(59,130,246,0.3),_inset_0_-20px_40px_rgba(37,99,235,0.3)] group-hover:[transform:rotateX(-46deg)_translateY(1px)]" />
        </div>
      </div>

      {/* Folder Info - Matching MaterialCard styling */}
      <div className="w-full space-y-1">
        {/* Name - Inline editable */}
        {isEditing ? (
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              disabled={isRenaming}
              className="w-full font-medium text-sm text-gray-900 leading-tight border border-brand rounded px-2 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60 disabled:cursor-wait"
              onClick={(e) => e.stopPropagation()}
            />
            {isRenaming && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <h3 className="font-medium text-sm text-gray-900 leading-tight truncate">
            {folder.label}
          </h3>
        )}
        {/* Metadata and Action Icons - Matching MaterialCard */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate flex-1">
            {materialCount} {materialCount === 1 ? "material" : "materials"}
          </div>
          {/* Action Icons - Menu */}
          <div className="flex items-center gap-1 ml-2 relative z-[60]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200 relative z-[60] focus:outline-none focus-visible:outline-none"
                  aria-label="Folder options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVerticalIcon size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 z-[60]"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <PencilEdit02Icon size={16} />
                    Edit Name
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Share08Icon size={16} />
                    Share Folder
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Delete02Icon size={16} />
                    Delete Folder
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FolderCard;

