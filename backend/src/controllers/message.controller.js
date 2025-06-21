import cloudinary from "../lib/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Message } from "../models/message.model.js";
import { encrypt, decrypt } from "../lib/encryption.js";
import crypto from "crypto";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

  const userExists = await User.findById(userTochatId)
  if(!userExists){
    throw new ApiError(400,"user to chat to does not exist")
  }
  const messages = await Message.find({
    $or:[
      {senderId:userId,receiverId:userTochatId},
      {senderId:userTochatId,receiverId:userId}
    ]
  }).sort({ createdAt: 1 })

  const decryptedMessages = messages.map((message) => {
    try {
      // If there's no text, return the message as is
      if (!message.text) {
        return message.toObject();
      }

      // Try to decrypt the text
      const decryptedText = decrypt(message.text, message.iv);
      return {
        ...message.toObject(),
        text: decryptedText
      };
    } catch (error) {
      console.error("Error decrypting message:", error);
      // If decryption fails, return the original message
      return message.toObject();
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, decryptedMessages, "all messages are fetched successfully")
    )
})

const sendMessage = AsyncHandler(async(req,res)=>{
  const {text, image} = req.body
  const {id:receiverId} = req.params
  const userId = req.user._id

  if(!text && !image){
    throw new ApiError(400, "text or image is required")
  }

  let imageUrl;
  if(image){
    const isUploaded = await cloudinary.uploader.upload(image);
    imageUrl = isUploaded.secure_url
  }

  let encryptedText = null;
  let iv = null;
  
  if(text) {
    const encrypted = encrypt(text);
    encryptedText = encrypted.encryptedData;
    iv = encrypted.iv;
  } else {
    // For image-only messages, we don't need encryption
    iv = crypto.randomBytes(16).toString('hex');
  }

  const newMessage = await Message.create({
    senderId: userId,
    receiverId,
    text: encryptedText,
    image: imageUrl,
    iv
  });

  if(!newMessage){
    throw new ApiError(400, "error in creating new message")
  }
  const sender = await User.findById(userId).select("fullname")

  const message= `you have a new message from ${sender.fullname}`
  const notif = {message, read: false};
  await User.findByIdAndUpdate(receiverId,{
    $push:{
      notification:notif
    }
  })
  // Emit socket event
  io.to(receiverId.toString()).emit("newNotification", notif);

  // Return the message with decrypted text if it exists
  const responseMessage = newMessage.toObject();
  if (encryptedText) {
    try {
      responseMessage.text = decrypt(encryptedText, iv);
    } catch (error) {
      console.error("Error decrypting new message:", error);
    }
  }

  const ReceiverSocketId = getReceiverSocketId(receiverId)
  if(ReceiverSocketId){
    // Send the complete message object with all MongoDB fields
    io.to(ReceiverSocketId).emit("newMessage", responseMessage)
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, responseMessage, "message sent successfully")
    )
})

export {
  getAllUsers,
  getMessages,
  sendMessage
}