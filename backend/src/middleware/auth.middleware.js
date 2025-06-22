import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

const VerifyToken = AsyncHandler(async(req,res,next)=>{
  const token = req.cookies.token

  try {
    if(!token){
      throw new ApiError(401,"unauthorized _no token provided")
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
  
    if(!decoded){
      throw  new ApiError(401,"unauthorized  invalid token")
    }
    const user = await User.findById(decoded.userId).select("-password")
  
    if(!user){
      throw new ApiError(401,"user not found")
    }
  
    req.user=user
  
    next();
  } catch (error) {
    // Don't log expected auth errors to reduce console noise
    if (error?.message?.includes('unauthorized') || error?.message?.includes('invalid')) {
      throw new ApiError(401, "Unauthorized access")
    }
    throw new ApiError(401, error?.message || "invalid access token")
  }

})

export default VerifyToken