import express from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { app,server } from "./lib/socket.js"
import path from "path"


dotenv.config()


import authRoute from "./routes/auth.route.js"
import messageRoute from "./routes/message.route.js"

const __dirname = path.resolve()


app.use(express.json({limit:'10mb'}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin:"http://localhost:5173",
  credentials: true,
}))



app.use("/api/auth",authRoute)
app.use("/api/messages",messageRoute)

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  }); 
}

server.listen(process.env.PORT,()=>{
  console.log("server is running",process.env.PORT)
  connectDB();
})