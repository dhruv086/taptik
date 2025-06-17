import cloudinary from "../lib/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

import { Message} from "../models/message.model.js"
import { encrypt } from "../lib/encryption.js";
import { decrypt } from "dotenv";

const getAllUsers = AsyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "User not authenticated");
  }

  const userId = req.user._id;
  const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
  if (!filteredUsers) {
    throw new ApiError(500, "Error while fetching users");
  }
  
  // console.log(filteredUsers)
  return res
    .status(200)
    .json(
      new ApiResponse(200, filteredUsers, "All users fetched successfully")
    );
});


const getMessages = AsyncHandler(async(req,res)=>{
  const {id:userTochatId} = req.params
  const userId = req.user._id

  const userExists  = await User.findById(userTochatId)
  if(!userExists){
    throw new ApiError(400,"user to chat to does not exist")
  }
  const messages = await Message.find({
    $or:[
      {senderId:userId,receiverId:userTochatId},
      {senderId:userTochatId,receiverId:userId}
    ]
  })

  const decryptedMessages = messages.map((message)=>({
    ...message.toObject(),
    text:decrypt(message.text,message.iv),
  }))

  // if(!messages||messages.length===0){
  //   throw new ApiError(400,"error in fetching all the messages")
  // }

  return res
  .status(200)
  .json(
    new ApiResponse(200,decryptedMessages,"all messages are fetched successfully")
  )
  
})

const sendMessage = AsyncHandler(async(req,res)=>{
  const {text,image}= req.body
  const {id:receiverId}=req.params
  const userId = req.user._id

  if(!text||!image){
    throw new ApiError(400,"text or image is required")
  }
  let imageUrl;
  if(image){
    const isUploaded = await cloudinary.uploader.upload(image);
    imageUrl = isUploaded.secure_url
  }

  const {encryptedText,iv} = encrypt(text)
  const sendMessage = await Message.create({
    userId,
    receiverId,
    text:encryptedText,
    image,
    iv,
  })
  if(!sendMessage){
    throw new ApiError(400,"error in creating new message")
  }
  res
  .status(200)
  .json(200,sendMessage,"message sent successfully")
})

export {
  getAllUsers,
  getMessages,
  sendMessage
}