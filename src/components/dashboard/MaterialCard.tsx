import React, { useState, useRef, useEffect } from "react";
import { MoreVerticalIcon, BookOpen01Icon, Download01Icon, Bookmark01Icon, Share01Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

interface MaterialCardProps {
  id: string;
  name: string;
  uploadTime: string;
  downloads: number;
  previewImage: string;
  pages?: number;
  onDownload?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  scrollParentRef?: React.RefObject<HTMLElement>;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  id,
  name,
  uploadTime,
  downloads,
  previewImage,
  pages,
  onDownload,
  onSave,
  onShare,
  onRead,
  onEdit,
  onDelete,
  scrollParentRef,
}) => {
  const [showActions, setShowActions] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [menuPlacementAbove, setMenuPlacementAbove] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect || !showActions) return;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const openAbove = spaceBelow < 200; // flip if not enough space below
    setMenuPlacementAbove(openAbove);
    setMenuPosition({ x: rect.right, y: openAbove ? rect.top : rect.bottom });
  };

  // RAF loop to keep the menu glued to the trigger while open
  useEffect(() => {
    if (!showActions) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const loop = () => {
      updatePosition();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showActions]);

  // Recompute on scroll/resize as well
  useEffect(() => {
    if (!showActions) return;
    const node = scrollParentRef?.current;
    node?.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      node?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showActions, scrollParentRef]);

  const actionItems = [
    { label: "Read", icon: BookOpen01Icon, action: () => onRead?.(id) },
    { label: "Download", icon: Download01Icon, action: () => onDownload?.(id) },
    { label: "Save", icon: Bookmark01Icon, action: () => onSave?.(id) },
    { label: "Share", icon: Share01Icon, action: () => onShare?.(id) },
  ];

  return (
    <div className="group relative">
      {/* File Preview */}
      <div className="aspect-square overflow-hidden rounded-xl mb-3">
        <img
          src={previewImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Name */}
        <h4 className="font-medium text-sm text-gray-900 leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {name}
        </h4>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate">
            {uploadTime} • {downloads} downloads{typeof pages === 'number' ? ` • ${pages} pages` : ''}
          </div>

          {/* Action Button */}
          <button
            ref={triggerRef}
            onClick={() => setShowActions((s) => !s)}
            className="p-1 rounded-lg hover:bg-[#DCDFFE] transition-colors duration-200"
            aria-label="More actions"
          >
            <MoreVerticalIcon size={18} className="text-brand" />
          </button>
        </div>
      </div>

      {/* Action Menu - fixed so it escapes any overflow */}
      <AnimatePresence>
        {showActions && menuPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-[1000] w-44 bg-white rounded-lg border border-gray-200 shadow-lg py-1"
            style={{ left: menuPosition.x, top: menuPosition.y, transform: menuPlacementAbove ? "translate(-100%, -100%)" : "translate(-100%, 6px)" }}
          >
            {actionItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                <item.icon size={16} className="text-gray-700" />
                <span className="text-gray-700">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialCard;
