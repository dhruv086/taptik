import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
  CircleUserRound,
  CheckCircle,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    username: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSendOTP = async () => {
    if (!formData.email.trim()) return toast.error("Please enter an email");
    if (!validateEmail(formData.email)) return toast.error("Invalid email");

    setIsSendingOTP(true);
    try {
      await axiosInstance.post("/auth/send-otp", { email: formData.email });
      toast.success("OTP sent to your email!");
      setShowOTPInput(true);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return toast.error("Please enter the OTP");
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");

    setIsVerifyingOTP(true);
    try {
      await axiosInstance.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      toast.success("Email verified successfully!");
      setIsEmailVerified(true);
      setShowOTPInput(false);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to verify OTP";
      toast.error(message);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error("Full name is required");
    if (!formData.username.trim()) return toast.error("Username is required");
    if (/\S+@\S+\.\S+/.test(formData.username)) return toast.error("Username cannot be an email");
    if (!validateEmail(formData.email)) return toast.error("Invalid email");
    if (!isEmailVerified) return toast.error("Please verify your email");
    if (!formData.password || formData.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() === true) signup(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f1c2c] text-white antialiased px-4">
      <div
        className="w-full max-w-md bg-[#26203a] rounded-2xl shadow-2xl p-8 space-y-8"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-sm text-gray-400">Get started with your free account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-[#3a3055] text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
          </div>

          {/* Username */}
          <div className="relative">
            <CircleUserRound className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="your_username"
              className="w-full bg-[#3a3055] text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="you@example.com"
              disabled={isEmailVerified}
              className="w-full bg-[#3a3055] text-white placeholder-gray-400 pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button
              type="button"
              onClick={handleSendOTP}
              className="absolute right-3 top-2.5 text-gray-400"
              disabled={isSendingOTP || isEmailVerified}
            >
              {isEmailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : isSendingOTP ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              ) : (
                <Send className="w-5 h-5 text-purple-400" />
              )}
            </button>
          </div>

          {/* OTP */}
          {showOTPInput && !isEmailVerified && (
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full bg-[#3a3055] text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
                disabled={isVerifyingOTP}
              >
                {isVerifyingOTP ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#3a3055] text-white placeholder-gray-400 pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-500 hover:brightness-110 text-white font-semibold shadow-lg transition-all duration-200"
            disabled={isSigningUp || !isEmailVerified}
          >
            {isSigningUp ? (
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
