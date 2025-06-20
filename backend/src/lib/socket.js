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
    
    // Emit updated online users list to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
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

  socket.on("disconnect",()=>{
    // console.log("User disconnected:", socket.id)
    // Find and remove the disconnected user
    const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id)
    if(userId) {
      // console.log("User removed from online list:", userId)
      delete userSocketMap[userId]
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
      // console.log("Updated online users:", Object.keys(userSocketMap))
    }
  })
})

export {io, app, server}