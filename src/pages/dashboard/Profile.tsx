import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft01Icon,
  StarIcon,
  Folder01Icon,
  UserCircleIcon,
  UserAdd01Icon,
  CrownIcon,
  EyeIcon,
  Download01Icon,
  LinkSquare02Icon,
} from "hugeicons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getUserById } from "@/api/user.api";
import { searchMaterials } from "@/api/materials.api";
import { UserProfile } from "@/lib/types/user.types";
import { Material } from "@/lib/types/material.types";
import { ApprovalStatusEnum } from "@/lib/types/response.types";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);

  const isOwner = currentUser?.id === userId;

  // Get badges dynamically based on user data
  const getBadges = (user: UserProfile): Badge[] => {
    const badges: Badge[] = [];
    const joinDate = new Date(user.createdAt);
    const now = new Date();
    const daysSinceJoin = Math.floor(
      (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceJoin <= 30) {
      badges.push({
        id: "pioneer",
        name: "Pioneer",
        description: "Joined in the first month",
        icon: <StarIcon size={16} className="text-amber-500" />,
      });
    }

    if (user.uploadCount && user.uploadCount >= 50) {
      badges.push({
        id: "helper",
        name: "Helper",
        description: "Helped 50+ students",
        icon: <StarIcon size={16} className="text-blue-500" />,
      });
    }

    // Star Contributor badge - check if user has materials with high ratings/views
    if (userMaterials.some((m) => m.views > 1000)) {
      badges.push({
        id: "star-contributor",
        name: "Star Contributor",
        description: "Had 3 uploads featured by admins",
        icon: <StarIcon size={16} className="text-yellow-500" />,
      });
    }

    return badges;
  };

  useEffect(() => {
    if (!userId) {
      console.error("Profile: userId is missing from URL params");
      toast.error("Invalid profile URL");
      navigate("/dashboard");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        console.log("Profile: Fetching user with ID:", userId);
        // Fetch user profile
        const user = await getUserById(userId);
        console.log("Profile: User fetched:", user);
        setProfileUser(user);

        // Fetch user's materials
        const materialsResponse = await searchMaterials({
          creatorId: userId,
          limit: 100,
          reviewStatus: ApprovalStatusEnum.APPROVED, // Only show approved materials
        });

        if (materialsResponse.status === "success") {
          setUserMaterials(materialsResponse.data.items || []);
        }

        // TODO: Fetch followers count, following status, and points from API
        // For now, these are null and will show empty states until API is implemented
        setFollowersCount(null);
        setPoints(null);
      } catch (error: unknown) {
        console.error("Profile: Error fetching profile:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load profile. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleFollow = async () => {
    try {
      // TODO: Implement follow/unfollow API call
      setIsFollowing(!isFollowing);
      // Update followers count optimistically
      if (followersCount !== null) {
        setFollowersCount((prev) => (prev! + (isFollowing ? -1 : 1)));
      }
      toast.success(isFollowing ? "Unfollowed" : "Following");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update follow status. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const badges = getBadges(profileUser);
  const initials = `${profileUser.firstName?.[0] || ""}${profileUser.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      {/* Header */}
      <div className="relative z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft01Icon size={18} />
                  Back to Dashboard
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                  Profile
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Explore profile information and contributions
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-[#DCDFFE] border p-4 sm:p-6 text-center h-full flex flex-col">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                <AvatarImage
                  src={profileUser.profilePicture || undefined}
                  alt={`${profileUser.firstName} ${profileUser.lastName}`}
                />
                <AvatarFallback className="bg-brand/10 text-brand text-xl sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                {profileUser.firstName} {profileUser.lastName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">@{profileUser.username}</p>
              
              {/* Contributor Status */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 mb-4">
                <CrownIcon size={16} className="text-amber-500" />
                <span className="text-xs sm:text-sm font-medium text-brand">
                  Top Contributor
                </span>
              </div>

              {/* Follow Button (only for non-owners) */}
              {!isOwner && (
                <button
                  onClick={handleFollow}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    isFollowing
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-brand text-white hover:bg-brand/90 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserAdd01Icon size={18} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Other Details - 3 Column Layout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-[#DCDFFE] border p-4 sm:p-6 h-full flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Other Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Academic Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Department</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {profileUser.department?.name || (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Faculty</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {profileUser.department?.faculty?.name || (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Institution</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {/* TODO: Get institution from API */}
                      <span className="text-gray-400 italic">Not available</span>
                    </p>
                  </div>
                </div>

                {/* Middle Column - Activity Stats */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Downloads</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {profileUser.downloadCount?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Followers</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {followersCount !== null ? followersCount.toLocaleString() : (
                        <span className="text-gray-400 italic">Not available</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Points</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {points !== null ? points.toLocaleString() : (
                        <span className="text-gray-400 italic">Not available</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Uploads</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {profileUser.uploadCount?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>

                {/* Right Column - Badges */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">Badges</p>
                    {badges.length > 0 ? (
                      <div className="space-y-2">
                        {badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-start gap-2"
                          >
                            {badge.icon}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900">
                                {badge.name}
                              </p>
                              <p className="text-xs text-brand leading-relaxed">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <StarIcon size={16} />
                        <span className="text-xs sm:text-sm italic">No badges yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl border-[#DCDFFE] border p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Bio</h3>
          {profileUser.courses && profileUser.courses.length > 0 ? (
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Passionate about algorithms and helping others succeed. Uploading notes for{" "}
              {profileUser.courses
                .slice(0, 3)
                .map((c) => c.course.courseCode)
                .join(", ")}
              .
            </p>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <UserCircleIcon size={20} />
              <span className="text-sm italic">No bio available</span>
            </div>
          )}
        </div>

        {/* Uploads Section */}
        <div className="bg-white rounded-2xl border-[#DCDFFE] border p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Uploads
          </h3>
          {userMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Folder01Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No uploads yet</p>
            </div>
          ) : (
            <>
              {/* Desktop/Tablet: Table View */}
              <div className="hidden md:block overflow-y-auto scrollbar-thin relative rounded-xl" style={{ maxHeight: '600px' }}>
                <table className="w-full rounded-xl overflow-hidden">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Course Code
                      </th>
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Title
                      </th>
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Type
                      </th>
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Metrics
                      </th>
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Status
                      </th>
                      <th className="text-right text-xs sm:text-sm font-medium text-gray-700 py-3 px-3 sm:px-5">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userMaterials.map((material) => {
                      return (
                        <tr
                          key={material.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-3 sm:px-5">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {material.targetCourse?.courseCode || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-5 max-w-[200px]">
                            <span className="text-xs sm:text-sm text-gray-900 truncate block" title={material.label}>
                              {material.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-5">
                            <span className="text-xs sm:text-sm text-gray-600">
                              {material.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Download01Icon size={14} className="text-brand" />
                                <span className="text-xs sm:text-sm font-medium text-gray-900">
                                  {material.downloads || "0"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">|</span>
                              <div className="flex items-center gap-1">
                                <EyeIcon size={14} className="text-brand" />
                                <span className="text-xs sm:text-sm text-gray-600">
                                  {material.views}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-5">
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm text-green-600 font-medium">
                                Approved
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(material.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-5 text-right">
                            <button
                              onClick={() => navigate(`/dashboard/material/${material.id}`)}
                              className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-brand hover:bg-brand/10 rounded-lg transition-all duration-200 hover:scale-110"
                              aria-label="View material"
                            >
                              <LinkSquare02Icon size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card View - Scrollable Container */}
              <div className="md:hidden overflow-y-auto scrollbar-thin relative rounded-xl" style={{ maxHeight: '600px' }}>
                <div className="space-y-3">
                  {userMaterials.map((material) => {
                    return (
                      <div
                        key={material.id}
                        onClick={() => navigate(`/dashboard/material/${material.id}`)}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {material.label}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {material.targetCourse?.courseCode || "N/A"} • {material.type.replace("_", " ")}
                            </p>
                          </div>
                          {/* Link icon and Approved status top-right */}
                          <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/material/${material.id}`);
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 text-gray-400 hover:text-brand rounded-lg transition-all duration-200 hover:scale-110"
                              aria-label="View material"
                            >
                              <LinkSquare02Icon size={16} />
                            </button>
                            <span className="text-xs text-green-600 font-medium">
                              Approved
                            </span>
                          </div>
                        </div>
                        {/* Bottom row: timestamp and metrics */}
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-500">
                            {formatRelativeTime(material.createdAt)}
                          </span>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Download01Icon size={14} className="text-brand" />
                              <span className="font-medium text-gray-900">
                                {material.downloads || "0"}
                              </span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <div className="flex items-center gap-1">
                              <EyeIcon size={14} className="text-brand" />
                              <span className="text-gray-600">
                                {material.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Activity Summary - Only visible to owner */}
        {isOwner && (
          <div className="bg-white rounded-2xl border-[#DCDFFE] border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Activity Summary
            </h3>
            {userMaterials.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-2 px-2 sm:px-4">
                        Date
                      </th>
                      <th className="text-left text-xs sm:text-sm font-medium text-gray-700 py-2 px-2 sm:px-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userMaterials.slice(0, 5).map((material) => (
                      <tr
                        key={material.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2 sm:px-4">
                          <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                            {new Date(material.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span className="text-xs sm:text-sm text-gray-900">
                            You uploaded '{material.label}' to the course{" "}
                            {material.targetCourse?.courseCode || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Folder01Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No activity yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
