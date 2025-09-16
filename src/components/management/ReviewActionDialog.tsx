import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalStatusEnum } from "@/lib/types/response.types";

interface ReviewActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: ApprovalStatusEnum, comment: string) => void;
  action: ApprovalStatusEnum;
  contentType: string;
}

const ReviewActionDialog: React.FC<ReviewActionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  contentType,
}) => {
  const [comment, setComment] = useState("");
  const isApprove = action === ApprovalStatusEnum.APPROVED;

  const handleSubmit = () => {
    onConfirm(action, comment);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve" : "Reject"} {contentType}</DialogTitle>
          <DialogDescription>
            {isApprove
              ? `Provide an optional comment for approving this ${contentType.toLowerCase()}.`
              : `Please provide a reason for rejecting this ${contentType.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea
            placeholder={isApprove ? "Optional comment..." : "Reason for rejection..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewActionDialog;