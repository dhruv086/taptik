import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
   requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked"],
    default: "pending",
  },
  
},{timeStamps:true})

export const Friend = mongoose.model("Friend",friendSchema)