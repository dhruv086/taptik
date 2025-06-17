import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  reveiverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  text:{
    type:String,
  },
  image:{
    type:String,
  },
  iv:{
    type:String,
    required:true,
  }
},{timestamps:true})

export const Message = mongoose.model("Message",messageSchema)