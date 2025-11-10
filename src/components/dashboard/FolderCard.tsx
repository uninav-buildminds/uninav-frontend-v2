import React, { useState } from "react";
import { MoreVerticalIcon, Share08Icon, PencilEdit02Icon, Delete02Icon } from "hugeicons-react";
import { Collection } from "@/lib/types/collection.types";
import { motion, AnimatePresence } from "framer-motion";

interface FolderCardProps {
  folder: Collection;
  onClick: () => void;
  onShare?: () => void;
  onEdit?: (folder: Collection) => void;
  onDelete?: (folderId: string) => void;
  materialCount?: number;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onShare,
  onEdit,
  onDelete,
  materialCount = 0,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onShare?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(folder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(folder.id);
  };

  return (
    <section className="relative group flex flex-col items-center justify-center w-full h-full cursor-pointer">
      <div
        className="file relative w-full h-40 cursor-pointer origin-bottom [perspective:1500px] z-50"
        onClick={onClick}
      >
        <div className="work-5 bg-brand w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-brand after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-brand before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]" />

        <div className="work-4 absolute inset-1 bg-[#7480FB] rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)]" />

        <div className="work-3 absolute inset-1 bg-[#8892FB] rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]" />

        <div className="work-2 absolute inset-1 bg-[#DCDFFE] rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)]" />

        <div className="work-1 absolute bottom-0 bg-gradient-to-t from-brand via-brand/80 to-brand/70 w-full h-[156px] rounded-2xl before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_rgba(59,130,246,0.3),_inset_0_-20px_40px_rgba(37,99,235,0.3)] group-hover:[transform:rotateX(-46deg)_translateY(1px)]" />
      </div>

      {/* Folder Info - Matching MaterialCard styling */}
      <div className="mt-3 w-full space-y-1">
        {/* Name - Left aligned, matching MaterialCard */}
        <h3 className="font-medium text-sm text-gray-900 leading-tight truncate">
          {folder.label}
        </h3>
        {/* Metadata and Action Icons - Matching MaterialCard */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate flex-1">
            {materialCount} {materialCount === 1 ? "material" : "materials"}
          </div>
          {/* Action Icons - Menu */}
          <div className="flex items-center gap-1 ml-2 relative z-[60]">
            <button
              onClick={handleMenuClick}
              className="p-1 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200 relative z-[60]"
              aria-label="Folder options"
            >
              <MoreVerticalIcon size={16} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {onEdit && (
                        <button
                          onClick={handleEdit}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <PencilEdit02Icon size={16} />
                          Edit Name
                        </button>
                      )}
                      {onShare && (
                        <button
                          onClick={handleShare}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Share08Icon size={16} />
                          Share Folder
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <Delete02Icon size={16} />
                          Delete Folder
                        </button>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FolderCard;

