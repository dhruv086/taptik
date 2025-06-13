import express from "express"

import { signUp,login,logout,updateProfile } from "../controllers/auth.controller.js"
import VerifyToken from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",logout)
router.put("/update-profile",VerifyToken,updateProfile)

export default router;