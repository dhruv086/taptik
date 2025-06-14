import express from "express"
import VerifyToken from "../middleware/auth.middleware.js"
import { getAllUsers,getMessages, sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

router.get("/users",VerifyToken,getAllUsers)
router.get("/:id",VerifyToken,getMessages)

router.post("/send/:id",VerifyToken,sendMessage)


export default router