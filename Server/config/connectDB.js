import mongoose from "mongoose";

let isConnecting = false;
export let lastDbError = null;

export const getSanitizedMongoUrl = () => {
    let mongoUrl = (process.env.MONGODB_URL || "mongodb://localhost:27017/prepAI").trim();
    if ((mongoUrl.startsWith('"') && mongoUrl.endsWith('"')) || (mongoUrl.startsWith("'") && mongoUrl.endsWith("'"))) {
        mongoUrl = mongoUrl.slice(1, -1).trim();
    }
    return mongoUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
};

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    if (isConnecting) {
        return;
    }
    isConnecting = true;
    try {
        let mongoUrl = (process.env.MONGODB_URL || "mongodb://localhost:27017/prepAI").trim();
        if ((mongoUrl.startsWith('"') && mongoUrl.endsWith('"')) || (mongoUrl.startsWith("'") && mongoUrl.endsWith("'"))) {
            mongoUrl = mongoUrl.slice(1, -1).trim();
        }

        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL environment variable is not defined in Render! Defaulting to localhost fails on cloud servers.");
        }

        if (mongoUrl.includes("<password>") || mongoUrl.includes("<db_password>")) {
            throw new Error("MONGODB_URL contains '<password>' placeholder. Please replace <password> with your actual MongoDB user password in Render Dashboard -> Environment.");
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