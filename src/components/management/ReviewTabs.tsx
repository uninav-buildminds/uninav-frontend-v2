import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApprovalStatusEnum } from "@/lib/types/response.types";
import { cn } from "@/lib/utils";
import {
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface ReviewTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  allCount?: number;
  children: React.ReactNode;
}

const ReviewTabs: React.FC<ReviewTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  allCount = 0,
  children,
}) => {
  const tabItems: Array<{
    value: string;
    label: string;
    icon: LucideIcon;
    count: number;
    badgeClass: string;
    activeClass: string;
  }> = [
    {
      value: "ALL",
      label: "All",
      icon: Eye,
      count: allCount,
      badgeClass: "bg-blue-200 text-blue-900",
      activeClass:
        "data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200",
    },
    {
      value: ApprovalStatusEnum.PENDING,
      label: "Pending",
      icon: Clock,
      count: pendingCount,
      badgeClass: "bg-amber-200 text-amber-900",
      activeClass:
        "data-[state=active]:bg-amber-50 data-[state=active]:border-amber-200",
    },
    {
      value: ApprovalStatusEnum.APPROVED,
      label: "Approved",
      icon: CheckCircle,
      count: approvedCount,
      badgeClass: "bg-green-200 text-green-900",
      activeClass:
        "data-[state=active]:bg-green-50 data-[state=active]:border-green-200",
    },
    {
      value: ApprovalStatusEnum.REJECTED,
      label: "Rejected",
      icon: XCircle,
      count: rejectedCount,
      badgeClass: "bg-red-200 text-red-900",
      activeClass:
        "data-[state=active]:bg-red-50 data-[state=active]:border-red-200",
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 w-full mb-4 rounded-lg bg-muted/40 p-0 border overflow-hidden">
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-2 h-11 sm:h-12 px-1 sm:px-2 md:px-4 text-xs sm:text-sm font-medium rounded-none border-r last:border-r-0 border-transparent data-[state=active]:border data-[state=active]:shadow-none transition-colors",
              "hover:bg-background/50",
              tab.activeClass
            )}
          >
            <tab.icon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span
              className={cn(
                "min-w-[18px] sm:min-w-[20px] text-[9px] sm:text-[10px] leading-none px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md font-semibold flex items-center justify-center",
                tab.badgeClass
              )}
            >
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab} className="m-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default ReviewTabs;
