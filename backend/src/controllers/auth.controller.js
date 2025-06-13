import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'


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
  const {fullname,email,password}=req.body
 
    if(!fullname||!email||!password){
      throw new ApiError(400,"all fields are required")
    }


    if(password.length<8){
      throw new ApiError(400,"password must be at least 8 characters")
    }
    const user = await User.findOne({email})
    if(user){
      throw new ApiError(400,"user with this email already exist")
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    
    const newUser = await User.create({
      fullname,
      email,
      password:hashedPassword,
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
  const {email,password} = req.body

  if(!email||!password){
    throw new ApiError(400,"all field are required")
  }
  if(password.length<8){
    throw new ApiError(400,"password has to be at least 8 characters")
  }
  const user = await User.findOne({email})
  if(!user){
    throw new ApiError(400,"invalid credentials")
  }

  const isPasswordCorrect = await bcrypt.compare(password,user.password)
  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid credentials")
  }
  generateToken(user._id,res)

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
  
})


export {
  signUp,
  login,
  logout,
  updateProfile
}