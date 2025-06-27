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
import friendRoute from "./routes/friend.route.js"

const __dirname = path.resolve()


app.use(express.json({limit:'10mb'}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// CORS configuration for production and development
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || "https://your-frontend-domain.vercel.app"]
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))



app.use("/api/auth",authRoute)
app.use("/api/messages",messageRoute)
app.use("/api/friends", friendRoute)

// Serve static files in production (if needed)
if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  }); 
}

const port = process.env.PORT || 5001;

// Only start server if not in production (Vercel handles this)
if (process.env.NODE_ENV !== 'production') {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;