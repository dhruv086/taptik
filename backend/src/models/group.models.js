import mongoose from "mongoose";

const groupSchemas = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  groupIcon: {
    type: String,
    default: "avatar.png"
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  maxMembers: {
    type: Number,
    default: 50,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }],
}, { timestamps: true });

// Add index for faster queries
groupSchemas.index({ title: 'text', description: 'text' });

export const Group = mongoose.model("Group", groupSchemas);