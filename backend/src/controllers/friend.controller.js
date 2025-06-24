import { User } from "../models/user.model.js";
import { Friend } from "../models/friends.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { io } from "../lib/socket.js";
import { sendFriendRequestEmail } from "../lib/email.js";
import { Message } from "../models/message.model.js";

const searchUsers = AsyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user._id;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const users = await User.find({
    $and: [
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { fullname: { $regex: query, $options: "i" } },
        ],
      },
      { _id: { $ne: userId } },
    ],
  }).select("-password");

  const friendships = await Friend.find({
    $or: [
      { requester: userId },
      { recipient: userId },
    ],
    status: "accepted",
  });
  const friendIds = friendships.map(f =>
    f.requester.toString() === userId.toString() ? f.recipient.toString() : f.requester.toString()
  );

  const pendingRequests = await Friend.find({
    requester: userId,
    status: "pending",
  });
  const pendingIds = pendingRequests.map(f => f.recipient.toString());

  const usersWithStatus = users.map(u => {
    if (friendIds.includes(u._id.toString())) {
      return { ...u.toObject(), friendshipStatus: "friends" };
    } else if (pendingIds.includes(u._id.toString())) {
      return { ...u.toObject(), friendshipStatus: "pending" };
    } else {
      return { ...u.toObject(), friendshipStatus: "none" };
    }
  });

  if (!usersWithStatus.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No users found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Users found successfully", usersWithStatus));
});

const sendFriendRequest = AsyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id;

  if (!recipientId) {
    throw new ApiError(400, "Recipient ID is required");
  }

  if (recipientId.toString() === requesterId.toString()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, "Recipient not found");
  }

  const existingRequest = await Friend.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === 'accepted') {
      throw new ApiError(400, "You are already friends with this user");
    }
    if (existingRequest.status === 'pending') {
      throw new ApiError(400, "Friend request already sent");
    }
     if (existingRequest.status === 'rejected' && existingRequest.requester.toString() === requesterId.toString()) {
      throw new ApiError(400, "You cannot send a friend request to a user who has rejected your previous request.");
    }
  }

  const newRequest = await Friend.create({
    requester: requesterId,
    recipient: recipientId,
  });

  // Send email notification to recipient
  const requesterUser = await User.findById(requesterId);
  if (recipient.email) {
    sendFriendRequestEmail(
      recipient.email,
      recipient.fullname,
      requesterUser.fullname,
      requesterUser.username
    );
  }

  io.to(recipientId.toString()).emit("newFriendRequest", newRequest);

  return res
    .status(201)
    .json(new ApiResponse(201, "Friend request sent successfully", newRequest));
});

const getPendingRequests = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    const requests = await Friend.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "username fullname profilePic");
  
    if (!requests.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, "No pending friend requests", []));
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Pending friend requests fetched successfully", requests)
      );
  });

const updateFriendRequest = AsyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["accepted", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const request = await Friend.findById(requestId);

    if (!request) {
        throw new ApiError(404, "Friend request not found");
    }

    if (request.recipient.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this request");
    }

    if (request.status !== 'pending') {
        throw new ApiError(400, `This request is already ${request.status}`);
    }

    request.status = status;
    await request.save();

    // Send notification to the requester
    const recipientUser = await User.findById(userId);
    const notifMessage = status === 'accepted'
      ? `${recipientUser.fullname} (@${recipientUser.username}) accepted your friend request.`
      : `${recipientUser.fullname} (@${recipientUser.username}) declined your friend request.`;
    const notif = { message: notifMessage, read: false };
    await User.findByIdAndUpdate(request.requester, {
      $push: { notification: notif }
    });
    // Emit socket event to requester
    io.to(request.requester.toString()).emit("newNotification", notif);

    // real-time notification to the requester (already present)
    io.to(request.requester.toString()).emit("friendRequestUpdated", request);

    return res
        .status(200)
        .json(new ApiResponse(200, `Friend request ${status}`, request));
});

const getFriends = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const friendships = await Friend.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: "accepted",
    })
    .populate("requester", "username fullname profilePic")
    .populate("recipient", "username fullname profilePic");

    // For each friend, get the last message exchanged
    const friendsWithLastMessage = await Promise.all(friendships.map(async (friendship) => {
        const friend =
            friendship.requester._id.toString() === userId.toString()
                ? friendship.recipient
                : friendship.requester;
        // Find the last message between user and this friend
        const lastMessage = await Message.findOne({
            $or: [
                { senderId: userId, receiverId: friend._id },
                { senderId: friend._id, receiverId: userId },
            ],
        })
        .sort({ createdAt: -1 });
        return {
            ...friend.toObject(),
            lastMessage: lastMessage ? {
                text: lastMessage.text,
                image: lastMessage.image,
                createdAt: lastMessage.createdAt,
                read: lastMessage.read,
                senderId: lastMessage.senderId,
            } : null,
        };
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, "Friends list fetched successfully", friendsWithLastMessage));
});

export { searchUsers, sendFriendRequest, getPendingRequests, updateFriendRequest, getFriends }; 