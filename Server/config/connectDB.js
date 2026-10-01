import mongoose from "mongoose";

let isConnecting = false;
export let lastDbError = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) {
        return;
    }
    isConnecting = true;
    try {
        let mongoUrl = (process.env.MONGODB_URL || "mongodb://localhost:27017/prepAI").trim();
        // Automatically strip quotes if copied directly from .env file
        if ((mongoUrl.startsWith('"') && mongoUrl.endsWith('"')) || (mongoUrl.startsWith("'") && mongoUrl.endsWith("'"))) {
            mongoUrl = mongoUrl.slice(1, -1).trim();
        }

        if (!process.env.MONGODB_URL) {
            console.warn("⚠️ Warning: MONGODB_URL is not set in environment variables. Falling back to localhost (this will fail in cloud environments like Render).");
        }

        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 8000
        });
        lastDbError = null;
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        lastDbError = error.message;
        console.error("❌ MongoDB connection error:", error.message);
        console.error("👉 Tip: For Render deployments, ensure MONGODB_URL is set in Render Environment Variables and MongoDB Atlas Network Access has 0.0.0.0/0 allowed.");
    } finally {
        isConnecting = false;
    }
};

export default connectDB;