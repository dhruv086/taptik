import express from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"

dotenv.config()

const app = express();
import authRoute from "./routes/auth.route.js"


app.use("/api/auth",authRoute)
app.use(express.json)

app.listen(process.env.PORT,()=>{
  console.log("server is running",process.env.PORT)
  connectDB();
})