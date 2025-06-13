import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


const signUp = AsyncHandler(async(req,res)=>{
  const {fullname,email,password}=req.body
  try {
    if(password.length<8){
      throw new ApiError(400,"password must be at least 8 characters")
    }
    const user = await User.findOne(email)
    if(user){
      throw new ApiError(400,"")
    }
  } catch (error) {
    
  }
})


const login = AsyncHandler(async(req,res)=>{

})

const logout =  AsyncHandler(async(req,res)=>{

})


export {
  signUp,
  login,
  logout
}