import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, checkAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully!");
        window.location.reload();
      } catch {
        toast.error("Failed to update profile picture.");
      }
    };
  };

  return (
    <div className="min-h-screen bg-[#0e0b1f] text-white antialiased px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1a162b] rounded-2xl p-8 shadow-[0_0_20px_rgba(139,92,246,0.1)] space-y-10">
          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
            <p className="text-sm text-zinc-400">Manage your identity on Taptik</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="relative size-32 rounded-full overflow-hidden ring-4 ring-[#3a3055] shadow-[0_0_15px_#6d28d980] transition duration-300">
                <img
                  src={selectedImg || authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 p-2 bg-[#3a3055] rounded-full cursor-pointer hover:scale-105 transition duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click camera to update"}
            </p>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-[#2b2540] rounded-lg border border-[#443c63]">
                {authUser?.fullname}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-[#2b2540] rounded-lg border border-[#443c63]">
                {authUser?.email}
              </p>
            </div>

            <button
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 rounded-lg font-semibold transition-all duration-200"
              onClick={() => (window.location.href = "/reset-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Account Details */}
          <div className="mt-6 bg-[#2b2540] rounded-xl p-6 border border-[#443c63]">
            <h2 className="text-lg font-semibold mb-4">Account Details</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between py-2 border-b border-[#443c63]">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
