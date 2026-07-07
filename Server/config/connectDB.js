import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/prepAI");
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection fail", error);
        process.exit(1);
    }
};

export default connectDB;