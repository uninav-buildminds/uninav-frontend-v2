import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import ClubCard from "@/components/dashboard/cards/ClubCard";
import ClubDetailView, {
  ClubDetailFooter,
} from "@/components/dashboard/viewers/ClubDetailView";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import RequestClubModal from "@/components/modals/RequestClubModal";
import { DEMO_CLUBS, type DemoClub } from "@/data/clubs.demo";

const MOBILE_BREAKPOINT = 768;

function usePreferBottomSheet() {
  const [prefer, setPrefer] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const update = () =>
      setPrefer(window.innerWidth < MOBILE_BREAKPOINT);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return prefer;
}

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

interface ClubDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: DemoClub | null;
}

function ClubDetailModal({ isOpen, onClose, club }: ClubDetailModalProps) {
  const useBottomSheet = usePreferBottomSheet();

  const handleClose = () => onClose();

  if (!club) return null;

  const content = (
    <motion.div {...motionProps} className="space-y-4">
      <ClubDetailView club={club} buttonsInFooter={useBottomSheet} />
    </motion.div>
  );

  // Mobile: bottom sheet, buttons visible in footer, backdrop above nav
  if (useBottomSheet) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side="bottom"
          priorityZIndex
          className="rounded-t-2xl h-[55vh] flex flex-col p-0 gap-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{club.name}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 pt-6 scrollbar-hide">
            <ClubDetailView club={club} buttonsInFooter />
          </div>
          <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-gray-100 bg-white">
            <ClubDetailFooter club={club} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: portal modal, smaller (like FlagReportModal)
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1040] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[1050] flex flex-col overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={1.5}
                size={20}
                className="text-gray-500"
              />
            </button>
            <div className="p-4 sm:p-5 pt-12 flex-1 overflow-y-auto scrollbar-hide">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

const Clubs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<DemoClub | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return DEMO_CLUBS;
    const q = searchQuery.toLowerCase().trim();
    return DEMO_CLUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <>
      <PageHeader
        title="Clubs"
        subtitle="Discover and join student clubs and societies."
        searchPlaceholder="Search clubs..."
        showSearch={true}
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="px-2 sm:px-4 pb-24 sm:pb-6">
        {filteredClubs.length === 0 ? (
          <EmptyState onRequestClub={() => setShowRequestModal(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={() => setSelectedClub(club)}
              />
            ))}
          </div>
        )}
      </div>

      <ClubDetailModal
        isOpen={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        club={selectedClub}
      />

      <RequestClubModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </>
  );
};

function EmptyState({ onRequestClub }: { onRequestClub: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-full"
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-gray-400"
          strokeWidth={1.5}
        />
      </motion.div>
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
        No clubs match your search
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-md leading-relaxed px-2">
        Request a club and we’ll look into it.
      </p>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRequestClub}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg bg-brand text-white text-sm sm:text-base font-medium hover:bg-brand/90 transition-colors"
      >
        Request a club
      </motion.button>
    </motion.div>
  );
}

export default Clubs;
