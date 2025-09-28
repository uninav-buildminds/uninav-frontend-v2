import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  avatarUrl?: string;
  userName?: string;
};

const UserRail: React.FC<Props> = ({
  avatarUrl = "https://i.pravatar.cc/80?img=12",
  userName = "User",
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/dashboard/settings");
  };

  return (
    <div className="grid place-items-center pb-2">
      <div
        className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/50 focus:outline-none focus:ring-brand/50 transition-shadow cursor-pointer hover:ring-brand/70"
        onClick={handleProfileClick}
        title="Go to Settings"
      >
        <img
          src={avatarUrl}
          className="h-full w-full object-cover"
          alt="User"
        />
      </div>
    </div>
  );
};

export default UserRail;
