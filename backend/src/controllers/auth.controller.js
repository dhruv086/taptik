import { json } from "express";
import cloudinary from "../lib/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { io } from "../lib/socket.js";


const generateToken = (userId,res)=>{
  const token = jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:"7D"
  })

  res.cookie("token",token,{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV !== "development",
  })

  return  token
}

const signUp = AsyncHandler(async(req,res)=>{
  const {fullname,email,password,username}=req.body
 
    if(!fullname||!email||!password||!username){
      throw new ApiError(400,"all fields are required")
    }


    if(password.length<8){
      throw new ApiError(400,"password must be at least 8 characters")
    }
    const user = await User.findOne({email})
    if(user){
      throw new ApiError(400,"user with this email already exist")
    }
    const usernameExists = await User.findOne({username})

    if(usernameExists){
      throw new ApiError(400,"user with this email already exists")
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    
    const newUser = await User.create({
      fullname,
      email,
      password:hashedPassword,
      username,
    })

    if(!newUser){
      throw new ApiError(400,"error while creating a new user")
    }
    generateToken(newUser._id,res);

    return res
    .status(200)
    .json(
      new ApiResponse(200,newUser,"new user signedUp successfully")
    )

})


const login = AsyncHandler(async(req,res)=>{
  const {userId,password} = req.body

  if(!userId&&!password){
    throw new ApiError(400,"all field are required")
  }
  if(password.length<8){
    throw new ApiError(400,"password has to be at least 8 characters")
  }

  
  const user = await User.findOne({ $or: [{ email: userId }, { username: userId }] })
  if(!user){
    throw new ApiError(400,"invalid credentials 1")
  }

  const isPasswordCorrect = await bcrypt.compare(password,user.password)
  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid credentials 2")
  }
  generateToken(user._id,res)
  const message= `Somebody logged into your account on ${new Date().toLocaleString()}`
  const notif = {message, read: false,isSerious:true};
  await User.findByIdAndUpdate(user,{
    $push:{
      notification:notif
    }
  })
  // Emit socket event
  io.to(user._id.toString()).emit("newNotification", notif);
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"user is logged in successfully")
  )
})

const logout =  AsyncHandler(async(req,res)=>{
  res.cookie("token","",{maxAge:0})
  return res
  .status(200)
  .json(
    new ApiResponse(200,null,"logged out successfully")
  )
})

const updateProfile = AsyncHandler(async(req,res)=>{
  const {profilePic} = req.body

  const userId = req.user._id

  if(!profilePic){
    throw new ApiError(400,"please provide profile pic")
  }

  const user= await User.findById(userId)

  if(!user){
    throw new ApiError(400,"user does not exist")
  }

  const isUploaded = await cloudinary.uploader.upload(profilePic)
  if(!isUploaded){
    throw new ApiError(400,"error in uploading file to cloudinary")
  }

  const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:isUploaded.secure_url},{new:true})

  if(!updatedUser){
    throw new ApiError(400,"error in updating file")
  }

  const message= `you updated your profile picture on ${new Date().toLocaleString()}`
  const notif = {message, read: false};
  await User.findByIdAndUpdate(user,{
    $push:{
      notification:notif
    }
  })
  // Emit socket event
  io.to(user._id.toString()).emit("newNotification", notif);

  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedUser,"profile pic updated successfully")
  )
})


const getUser =  AsyncHandler(async(req,res)=>{
  try{
    return res
      .status(200)
      .json(
        new ApiResponse(200, req.user, "User fetched successfully")
      )
  }catch(error){
    // console.log("error in checkAuth controller",error.message)
    throw new ApiError(400,"internal server error")
  }
})







const fetchNotification = AsyncHandler(async(req,res)=>{
  const userId = req.user._id

  const user = await User.findById(userId)

  if(!user)throw new ApiError(400,"user not found")
    const sortedNotifications = user.notification.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return res
  .status(200)
  .json(
    new ApiResponse(200,sortedNotifications,"all notification fetched successfully")
  )
})

const markNotificationsAsRead = AsyncHandler(async(req,res)=>{
  const userId = req.user._id

  const user = await User.findById(userId)

  if(!user)throw new ApiError(400,"user not found")

  // First, update any notifications that don't have the read field
  const notificationsWithRead = user.notification.map(notif => {
    const notifObj = notif.toObject ? notif.toObject() : notif;
    return {
      ...notifObj,
      read: notifObj.read !== undefined ? notifObj.read : false
    };
  });

  // Mark all notifications as read
  const updatedNotifications = notificationsWithRead.map(notif => ({
    ...notif,
    read: true
  }));

  const updatedUser = await User.findByIdAndUpdate(
    userId, 
    { notification: updatedNotifications },
    { new: true }
  )

  if(!updatedUser)throw new ApiError(400,"error updating notifications")

  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedUser.notification,"notifications marked as read successfully")
  )
})

export {
  signUp,
  login,
  logout,
  updateProfile,
  getUser,
  fetchNotification,
  markNotificationsAsRead
}