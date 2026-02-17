import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768;

function usePreferBottomSheet() {
  const [prefer, setPrefer] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const update = () =>
      setPrefer(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return prefer;
}

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

const inputBase =
  "w-full border border-gray-300 rounded-lg bg-background px-3 py-2 text-sm outline-none focus:ring-0 focus:border-brand transition-colors placeholder:text-muted-foreground";

interface RequestClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestClubModal: React.FC<RequestClubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const useBottomSheet = usePreferBottomSheet();
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a club name");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: call API when backend is ready (e.g. POST /clubs/request)
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Request received. We’ll look into it!");
      setName("");
      setInterest("");
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setName("");
      setInterest("");
      onClose();
    }
  };

  const formContent = (
    <motion.div {...motionProps} className="space-y-6">
      <div
        className={cn(
          "space-y-1 sm:space-y-2",
          useBottomSheet ? "text-left" : "text-center"
        )}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          Request a club
        </h2>
        <p
          className={cn(
            "text-sm sm:text-base text-gray-600",
            useBottomSheet && "text-left"
          )}
        >
          Don’t see the club you’re looking for? Send a request and we’ll consider adding it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="request-club-name" className="text-sm font-medium text-gray-900">
            Club name
          </Label>
          <Input
            id="request-club-name"
            type="text"
            placeholder="e.g. Chess Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBase}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-club-interest" className="text-sm font-medium text-gray-900">
            Interest / category (optional)
          </Label>
          <Textarea
            id="request-club-interest"
            placeholder="e.g. Sports, Tech, Arts"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            rows={2}
            className={cn(inputBase, "min-h-[72px] resize-none")}
          />
        </div>
        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-brand hover:bg-brand/90"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </form>
    </motion.div>
  );

  if (useBottomSheet) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side="bottom"
          priorityZIndex
          className="h-[55vh] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Request a club</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1040] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) =>
            e.target === e.currentTarget && !submitting && handleClose()
          }
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
              disabled={submitting}
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
            <div className="p-4 sm:p-6 pt-10 flex-1 overflow-y-auto">
              {formContent}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default RequestClubModal;
