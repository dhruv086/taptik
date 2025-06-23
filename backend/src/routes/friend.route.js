import express from "express";
import VerifyToken from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  updateFriendRequest,
  getFriends,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(VerifyToken);

router.get("/search", searchUsers);
router.get("/", getFriends);
router.get("/requests/pending", getPendingRequests);
router.post("/request", sendFriendRequest);
router.put("/request/:requestId", updateFriendRequest);


export default router; 