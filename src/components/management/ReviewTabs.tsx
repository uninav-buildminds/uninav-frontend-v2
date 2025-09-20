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
      badgeClass: "bg-amber-200 text-amber-900",
      activeClass: "data-[state=active]:bg-amber-50 data-[state=active]:border-amber-200",
    },
    {
      value: ApprovalStatusEnum.APPROVED,
      label: "Approved",
      count: approvedCount,
      badgeClass: "bg-green-200 text-green-900",
      activeClass: "data-[state=active]:bg-green-50 data-[state=active]:border-green-200",
    },
    {
      value: ApprovalStatusEnum.REJECTED,
      label: "Rejected",
      count: rejectedCount,
      badgeClass: "bg-red-200 text-red-900",
      activeClass: "data-[state=active]:bg-red-50 data-[state=active]:border-red-200",
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList
        className="grid grid-cols-3 w-full mb-4 rounded-lg bg-muted/40 p-0 border overflow-hidden"
      >
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center justify-center gap-2 h-11 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none border-r last:border-r-0 border-transparent data-[state=active]:border data-[state=active]:shadow-none transition-colors",
              "hover:bg-background/50",
              tab.activeClass
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "min-w-[20px] text-[10px] leading-none px-1.5 py-1 rounded-md font-semibold flex items-center justify-center",
                tab.badgeClass
              )}
            >
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab} className="m-0">{children}</TabsContent>
    </Tabs>
  );
};

export default ReviewTabs;