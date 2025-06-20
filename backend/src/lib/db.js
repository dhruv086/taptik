import mongoose from "mongoose"

const connectDB = async()=>{
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MONGODB CONNECTED : ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("Error connecting to the database",error)
  }
}

export default connectDB