import express from "express"

import { signUp,login,logout } from "../controllers/auth.controller.js"

const router = express.Router();

router.post("/signup",signUp)
router.post("/login",login)
router.post("/logout",logout)


export default router;