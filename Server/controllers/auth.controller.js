import mongoose from "mongoose";
import User from "../models/user.model.js";
import generateToken from "../config/token.js";
import connectDB from "../config/connectDB.js";

export const googleAuth = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            connectDB(); // Attempt reconnection
            return res.status(503).json({
                success: false,
                message: "Database connection not ready. Please verify MONGODB_URL is set in Render Environment Variables and MongoDB Atlas IP access list allows 0.0.0.0/0."
            });
        }

        const { name, email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        let user = await User.findOne({ email }); // Find user by email

        if (!user) {
            user = await User.create({ name: name || "User", email }); // Create new user if not found
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in environment variables!");
            return res.status(500).json({
                success: false,
                message: "Server configuration error: JWT_SECRET environment variable is not set."
            });
        }

        let token = await generateToken(user._id);

        res.cookie("token", token, { // Set token in cookie
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            user,
            token
        });

    } catch (error) {
        console.error("Error in googleAuth controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token"); // Clear token from cookie
        return res.status(200).json({
            success: true,
            message: "Logged out successfully" // Send success response
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging out" // Send error response
        });
    }
};