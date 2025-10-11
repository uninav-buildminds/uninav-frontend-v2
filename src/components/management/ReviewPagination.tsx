import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const ReviewPagination: React.FC<ReviewPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between pt-6 ${className}`}>
      <p className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={14} /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          disabled={currentPage >= totalPages}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default ReviewPagination;
