import React, { useRef, useState } from "react";
import { PencilEdit01Icon, ImageUpload01Icon } from "hugeicons-react";
import { Switch } from "@/components/ui/switch";

const AccountSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("Tee Daniels");
  const [username, setUsername] = useState("@tee_daniels");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/80?img=12");
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickAvatar = () => fileRef.current?.click();
  const onAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile & Visibility</h3>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90">
            Edit <PencilEdit01Icon size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90">Save Changes</button>
          </div>
        )}
      </div>
      <hr className="my-4 border-gray-200" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
            {isEditing && (
              <button onClick={onPickAvatar} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center">
                <ImageUpload01Icon size={16} className="text-gray-700" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>
          <div>
            {!isEditing ? (
              <>
                <div className="text-sm font-medium text-gray-900">{fullName}</div>
                <div className="text-xs text-gray-500">{username}</div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Full Name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea disabled={!isEditing} className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60" rows={4} placeholder="Tell others about your academic interests..."></textarea>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">Make my profile public</div>
            <div className="text-xs text-gray-500">If off, your profile and uploads are only visible to you.</div>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-brand" />
        </div>
      </div>
    </div>
  );
};

export default AccountSection;


