import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logout01Icon } from "hugeicons-react";

type Props = {
  avatarUrl?: string;
  onLogout?: () => void;
};

const UserRail: React.FC<Props> = ({ avatarUrl = "https://i.pravatar.cc/80?img=12", onLogout }) => {
  return (
    <div className="grid place-items-center pb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/50 focus:outline-none focus:ring-brand/50 transition-shadow" aria-label="Open user menu">
            <img src={avatarUrl} className="h-full w-full object-cover" alt="User" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="min-w-[140px]">
          <DropdownMenuItem onClick={onLogout} className="text-red-600">
            <Logout01Icon size={14} className="mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserRail;
