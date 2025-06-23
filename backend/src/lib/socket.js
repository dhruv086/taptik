import { Server } from "socket.io";
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
  cors:{
    origin: ["http://localhost:5173"],
    credentials: true
  }
})

export function getReceiverSocketId(userId){
  return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection",(socket)=>{
  // console.log("a user connected", socket.id)

  const userId = socket.handshake.query.userId
  if(userId) {
    // console.log("User connected with ID:", userId)
    userSocketMap[userId] = socket.id
    // Join a room for this userId
    socket.join(userId);
    // Emit updated online users list to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    console.log('[socket.io] userSocketMap:', userSocketMap);
  }

  socket.on("typing", ({ receiverId, sender }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { sender });
    }
  });

  socket.on("stopTyping", ({ receiverId, sender }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { sender });
    }
  });

  // --- WebRTC signaling for video calls ---
  socket.on('webrtc_call_request', ({ to, from }) => {
    console.log('[socket.io] Received webrtc_call_request', { to, from });
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_call_request', { from });
      console.log('[socket.io] Relayed webrtc_call_request to', targetSocket);
    } else {
      console.log('[socket.io] Target user not online:', to);
    }
  });

  socket.on('webrtc_call_reject', ({ to }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_call_reject');
    }
  });

  socket.on('webrtc_offer', ({ to, offer }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_offer', { from: userId, offer });
    }
  });

  socket.on('webrtc_answer', ({ to, answer }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_answer', { from: userId, answer });
    }
  });

  socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_ice_candidate', { from: userId, candidate });
    }
  });

  socket.on('webrtc_call_ended', ({ to }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('webrtc_call_ended');
    }
  });
  // --- End WebRTC signaling ---

  socket.on("disconnect",()=>{
    // console.log("User disconnected:", socket.id)
    // Find and remove the disconnected user
    const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id)
    if(userId) {
      // console.log("User removed from online list:", userId)
      delete userSocketMap[userId]
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
      console.log('[socket.io] userSocketMap:', userSocketMap);
      // console.log("Updated online users:", Object.keys(userSocketMap))
    }
  })
})

export {io, app, server}