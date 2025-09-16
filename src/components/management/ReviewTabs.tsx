import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApprovalStatusEnum } from "@/lib/types/response.types";
import { cn } from "@/lib/utils";

interface ReviewTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  children: React.ReactNode;
}

const ReviewTabs: React.FC<ReviewTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  children,
}) => {
  const tabItems = [
    {
      value: ApprovalStatusEnum.PENDING,
      label: "Pending",
      count: pendingCount,
      className: "data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800",
    },
    {
      value: ApprovalStatusEnum.APPROVED,
      label: "Approved",
      count: approvedCount,
      className: "data-[state=active]:bg-green-100 data-[state=active]:text-green-800",
    },
    {
      value: ApprovalStatusEnum.REJECTED,
      label: "Rejected",
      count: rejectedCount,
      className: "data-[state=active]:bg-red-100 data-[state=active]:text-red-800",
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-lg mb-6 bg-gray-100 p-1 rounded-xl">
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:shadow",
              tab.className
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-semibold",
                tab.value === ApprovalStatusEnum.PENDING && "bg-amber-200 text-amber-900",
                tab.value === ApprovalStatusEnum.APPROVED && "bg-green-200 text-green-900",
                tab.value === ApprovalStatusEnum.REJECTED && "bg-red-200 text-red-900"
              )}
            >
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>{children}</TabsContent>
    </Tabs>
  );
};

export default ReviewTabs;