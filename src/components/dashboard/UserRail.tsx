import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isProfileIncomplete } from "@/utils/profile.utils";

type Props = {
  avatarUrl?: string;
  userName?: string;
};

const UserRail: React.FC<Props> = ({ avatarUrl, userName = "User" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileIncomplete = isProfileIncomplete(user);

  const handleProfileClick = () => {
    navigate("/dashboard/settings");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid place-items-center pb-2">
      <div className="relative">
        <div
          className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/50 focus:outline-none focus:ring-brand/50 transition-shadow cursor-pointer hover:ring-brand/70"
          onClick={handleProfileClick}
          title={profileIncomplete ? "Complete your profile for recommendations" : "Go to Settings"}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="h-full w-full object-cover"
              alt="User"
            />
          ) : (
            <div className="h-full w-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
              {getInitials(userName)}
            </div>
          )}
        </div>
        
        {/* Profile Incomplete Badge - Outside the circle */}
        {profileIncomplete && (
          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-md" />
        )}
      </div>
    </div>
  );
};

export default UserRail;
