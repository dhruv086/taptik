import { useState } from "react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const ResetPasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1c2c] text-white antialiased pt-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#26203a] p-6 rounded-2xl shadow-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-gray-400 mt-1">Change your account password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#3a3055] border border-[#453f5d] rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#3a3055] border border-[#453f5d] rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#3a3055] border border-[#453f5d] rounded-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
