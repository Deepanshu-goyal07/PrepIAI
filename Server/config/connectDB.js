import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) {
        return;
    }
    isConnecting = true;
    try {
        const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/prepAI";
        if (!process.env.MONGODB_URL) {
            console.warn("⚠️ Warning: MONGODB_URL is not set in environment variables. Falling back to localhost (this will fail in cloud environments like Render).");
        }
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        console.error("👉 Tip: For Render deployments, ensure MONGODB_URL is set in Render Environment Variables and MongoDB Atlas Network Access has 0.0.0.0/0 allowed.");
    } finally {
        isConnecting = false;
    }
};

export default connectDB;