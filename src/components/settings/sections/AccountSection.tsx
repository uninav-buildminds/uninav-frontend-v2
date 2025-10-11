import React, { useRef, useState, useEffect } from "react";
import {
  PencilEdit01Icon,
  ImageUpload01Icon,
  Logout01Icon,
} from "hugeicons-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { LogoutModal } from "@/components/modals";
import { updateUserProfile, updateProfilePicture } from "@/api/user.api";
import { useToast } from "@/hooks/use-toast";
import { UserIcon } from "hugeicons-react";

const AccountSection: React.FC = () => {
  const { logOut, user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      if (user.profilePicture) {
        setAvatar(user.profilePicture);
      }
    }
  }, [user]);

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    setProfilePictureFile(file);
  };

  const handleProfilePictureUpdate = async () => {
    if (!profilePictureFile) return { success: false, user: null };
    try {
      const updatedUser = await updateProfilePicture(profilePictureFile);
      setUser(updatedUser);
      setProfilePictureFile(null);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture.",
        variant: "destructive",
      });
      return { success: false, user: null };
    }
  };

  const handleProfileInfoUpdate = async () => {
    const profileData = {
      firstName,
      lastName,
      username,
    };
    try {
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
      return { success: false, user: null };
    }
  };

  const handleSaveChanges = async () => {
    let pictureUpdateSuccess = false;
    let profileUpdateSuccess = false;
    const updates: string[] = [];

    // Handle profile picture update if a new file is selected
    if (profilePictureFile) {
      const pictureResult = await handleProfilePictureUpdate();
      pictureUpdateSuccess = pictureResult.success;
      if (pictureUpdateSuccess) {
        updates.push("profile picture");
      }
    }

    // Handle profile info update
    const profileResult = await handleProfileInfoUpdate();
    profileUpdateSuccess = profileResult.success;
    if (profileUpdateSuccess) {
      updates.push("profile information");
    }

    // Show success message only if at least one update was successful
    if (updates.length > 0) {
      toast({
        title: "Success",
        description: `Updated ${updates.join(" and ")} successfully!`,
      });
      setIsEditing(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logOut();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Profile & Visibility
          </h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90"
          >
            Edit <PencilEdit01Icon size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
      <hr className="my-4 border-gray-200" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <UserIcon size={56} />
            )}
            {isEditing && (
              <button
                onClick={onPickAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center"
              >
                <ImageUpload01Icon size={16} className="text-gray-700" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div>
            {!isEditing ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">@{user?.username}</div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-600">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            disabled
            className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
            rows={4}
            placeholder="Tell others about your academic interests..."
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Make my profile public
            </div>
            <div className="text-xs text-gray-500">
              If off, your profile and uploads are only visible to you.
            </div>
          </div>
          <Switch
            disabled
            defaultChecked
            className="data-[state=checked]:bg-brand"
          />
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Account Actions
              </div>
              <div className="text-xs text-gray-500">
                Manage your session and account security.
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Logout01Icon size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        userName={user?.firstName || "User"}
      />
    </div>
  );
};

export default AccountSection;
