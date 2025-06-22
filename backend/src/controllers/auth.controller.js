import { json } from "express";
import cloudinary from "../lib/cloudinary.js";
import { User } from "../models/user.model.js";
import { EmailVerification } from "../models/emailVerification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { io } from "../lib/socket.js";
import { generateOTP, sendOTPEmail } from "../lib/email.js";


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

    const existingUser = await User.findOne({email})
    if(existingUser){
      throw new ApiError(400,"user with this email already exist")
    }

    const usernameExists = await User.findOne({username})
    if(usernameExists){
      throw new ApiError(400,"user with this username already exists")
    }

    

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    
    // Create the new user
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      username,
      isEmailVerified: true,
    })

    if(!newUser){
      throw new ApiError(400,"error while creating a new user")
    }

    // Clean up the email verification record
    await EmailVerification.findOneAndDelete({ email });

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

const sendOTP = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if email format is valid
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in EmailVerification collection
  try {
    const emailVerification = await EmailVerification.findOneAndUpdate(
      { email },
      {
        email: email,
        otp: otp,
        expiry: otpExpiry,
        isVerified: false,
      },
      { upsert: true, new: true }
    );

    // Validate that the OTP was saved
    if (!emailVerification || !emailVerification.otp) {
      throw new Error("Failed to save OTP");
    }
  } catch (error) {
    console.error('Error saving email verification:', error);
    throw new ApiError(500, "Error saving verification data");
  }

  // Send OTP email
  const emailSent = await sendOTPEmail(email, otp);
  if (!emailSent) {
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log(`Development mode: OTP for ${email} is ${otp}`);
      return res
        .status(200)
        .json(
          new ApiResponse(200, { 
            email, 
            otp: otp, // Only in development mode
            message: "OTP sent successfully (development mode - check console for OTP)"
          }, "OTP sent successfully")
        );
    }
    throw new ApiError(500, "Failed to send OTP email. Please check email configuration.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { email }, "OTP sent successfully")
    );
});

const verifyOTP = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const emailVerification = await EmailVerification.findOne({ email });
  if (!emailVerification) {
    throw new ApiError(400, "No verification request found for this email");
  }

  // Check if OTP exists and matches
  if (!emailVerification.otp) {
    throw new ApiError(400, "No OTP found for this email. Please request a new OTP.");
  }

  if (emailVerification.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Check if OTP is expired
  if (!emailVerification.expiry || emailVerification.expiry < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  // Mark email as verified
  emailVerification.isVerified = true;
  emailVerification.otp = null;
  emailVerification.expiry = null;
  await emailVerification.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { email }, "Email verified successfully")
    );
});

export {
  signUp,
  login,
  logout,
  updateProfile,
  getUser,
  fetchNotification,
  markNotificationsAsRead,
  sendOTP,
  verifyOTP
}