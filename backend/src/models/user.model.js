import mongoose, { Schema } from "mongoose";

const userSchema= new mongoose.Schema({
  email:{
    type:String,
    required:true,
    unique:true,
  },
  fullname:{
    type:String,
    required:true,
  },
  username:{
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
    required:true,
    minlength:8,
  },
  profilePic:{
    type:String,
    default:"",
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  notification:[
    {
    type: new mongoose.Schema({
      message: { 
        type: String,
        required: true 
      },
      createdAt: {
        type: Date,
        default: Date.now 
      },
      read: {
        type: Boolean, 
        default: false 
      },
    }, { _id: false })
  },
],
  lastNotificationSeenAt:{ 
    type: Date,
    default: null 
  }
},{timestamps:true})

export const User = mongoose.model("User",userSchema)