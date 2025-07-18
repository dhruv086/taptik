import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, CircleUserRound, CheckCircle, Send } from 'lucide-react';
import { Link } from "react-router-dom";
import AuthImagePattern from '../components/authImagePattern';
import toast, { Toaster } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    username: '',
  })
  const { signup, isSigningUp } = useAuthStore();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      return toast.error("Please enter an email first");
    }
    if (!validateEmail(formData.email)) {
      return toast.error("Please enter a valid email");
    }

    setIsSendingOTP(true);
    try {
      const response = await axiosInstance.post('/auth/send-otp', { email: formData.email });
      toast.success('OTP sent to your email!');
      setShowOTPInput(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      return toast.error("Please enter the OTP");
    }
    if (otp.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }

    setIsVerifyingOTP(true);
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { 
        email: formData.email, 
        otp: otp 
      });
      toast.success('Email verified successfully!');
      setIsEmailVerified(true);
      setShowOTPInput(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error("Full name is required");
    if (!formData.username.trim()) return toast.error("Username is required");
    if (/\S+@\S+\.\S+/.test(formData.username)) return toast.error("Username cannot be an email");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!isEmailVerified) return toast.error("Please verify your email first");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-9'>
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isEmailVerified}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || isEmailVerified}
                >
                  {isEmailVerified ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : isSendingOTP ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <Send className="size-5 text-primary hover:text-primary/80" />
                  )}
                </button>
              </div>
            </div>

            {/* OTP Input */}
            {showOTPInput && !isEmailVerified && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Enter OTP</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOTP}
                    disabled={isVerifyingOTP}
                  >
                    {isVerifyingOTP ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp || !isEmailVerified}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  )
}

export default SignUpPage
