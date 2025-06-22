import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    default: null,
  },
  expiry: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema); 