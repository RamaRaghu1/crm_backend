import mongoose from "mongoose";


console.log("________________", process.env.DB_URL)
export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DB_URL);
   
    console.log(`mongodb connect on port: ${connectionInstance.connection.port}`);
  } catch (error) {
    console.log(error)
    console.log("MongoDB connection error", error.message);
    process.exit(1)
  }
};
