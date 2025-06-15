import express from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const app = express();
import authRoute from "./routes/auth.route.js"
import messageRoute from "./routes/message.route.js"


app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin:"http://localhost:5173",
  credentials: true,
}))



app.use("/api/auth",authRoute)
app.use("/api/message",messageRoute)

app.listen(process.env.PORT,()=>{
  console.log("server is running",process.env.PORT)
  connectDB();
})