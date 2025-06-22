import express from "express"

import { signUp,login,logout,updateProfile, getUser,fetchNotification, markNotificationsAsRead, sendOTP, verifyOTP } from "../controllers/auth.controller.js"
import VerifyToken from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",logout)
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)
router.put("/update-profile",VerifyToken,updateProfile)
router.get("/getuser",VerifyToken,getUser)
router.get("/notification",VerifyToken,fetchNotification)
router.put("/mark-notifications-read",VerifyToken,markNotificationsAsRead)

export default router;