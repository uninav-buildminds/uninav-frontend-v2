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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createErrorReport } from "@/api/error-reports.api";
import { cn } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768;

function usePreferBottomSheet(isMobileProp: boolean) {
  const [prefer, setPrefer] = useState(() => {
    if (typeof window === "undefined") return isMobileProp;
    return isMobileProp || window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const update = () => {
      setPrefer(isMobileProp || window.innerWidth < MOBILE_BREAKPOINT);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isMobileProp]);

  return prefer;
}

const FLAG_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "wrong_course", label: "Wrong course or category" },
  { value: "broken_file", label: "Broken or missing file" },
  { value: "spam", label: "Spam" },
  { value: "copyright", label: "Copyright concern" },
  { value: "other", label: "Other" },
] as const;

interface FlagReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialSlug: string;
  materialTitle: string;
  isMobile?: boolean;
}

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

const inputBase =
  "w-full border border-gray-300 rounded-lg bg-background px-3 py-2 text-sm outline-none focus:ring-0 focus:border-brand transition-colors placeholder:text-muted-foreground";

/** Dropdown must render above modal - use high z-index so SelectContent portal appears on top */
const SELECT_CONTENT_CLASS = "!z-[9999] rounded-lg border border-gray-200";

const FlagReportModal: React.FC<FlagReportModalProps> = ({
  isOpen,
  onClose,
  materialId,
  materialSlug,
  materialTitle,
  isMobile = false,
}) => {
  const useBottomSheet = usePreferBottomSheet(isMobile);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please select a reason");
      return;
    }
    setSubmitting(true);
    try {
      const reasonLabel =
        FLAG_REASONS.find((r) => r.value === reason)?.label ?? reason;
      await createErrorReport({
        title: `Material report: ${materialTitle}`,
        description: details.trim() || reasonLabel,
        errorType: "material_report",
        severity: "medium",
        metadata: {
          materialId,
          materialSlug,
          reportReason: reason,
          reportReasonLabel: reasonLabel,
        },
      });
      toast.success("Report submitted. Thank you for your feedback.");
      setReason("");
      setDetails("");
      onClose();
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReason("");
      setDetails("");
      onClose();
    }
  };

  const formContent = (
    <motion.div {...motionProps} className="space-y-6">
      <div className={cn("space-y-1 sm:space-y-2", useBottomSheet ? "text-left" : "text-center")}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          Report material
        </h2>
        <p className={cn("text-sm sm:text-base text-gray-600", useBottomSheet && "text-left")}>
          Help us understand what's wrong so we can improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="flag-reason" className="text-sm font-medium text-gray-900">
            What's wrong with this material?
          </Label>
          <Select value={reason} onValueChange={setReason} required>
            <SelectTrigger
              id="flag-reason"
              className={cn(
                inputBase,
                "h-10 flex items-center justify-between [&>span]:line-clamp-1 ring-0 focus:ring-0 focus:ring-offset-0"
              )}
            >
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {FLAG_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value} className="rounded-md">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="flag-details" className="text-sm font-medium text-gray-900">
            Additional details (optional)
          </Label>
          <Textarea
            id="flag-details"
            placeholder="Anything else we should know?"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className={cn(
              inputBase,
              "min-h-[80px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />
        </div>
        <div className="flex space-x-3 pt-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 outline-none focus:ring-0 focus:border-brand"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 outline-none focus:ring-0"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </motion.div>
  );

  // Mobile: use Sheet so it looks exactly like MaterialInfoSheet
  if (useBottomSheet) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side="bottom"
          className="h-[55vh] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Report material</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: createPortal with same shell as UploadModal / BatchUploadModal
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && !submitting && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
          >
            <button
              onClick={handleClose}
              disabled={submitting}
              className={`absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10 ${
                submitting ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={20} className="text-gray-500" />
            </button>

            <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
              {formContent}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FlagReportModal;
