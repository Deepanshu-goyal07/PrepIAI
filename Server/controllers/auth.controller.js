import User from "../models/user.model.js";
import generateToken from "../config/token.js"

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;
        let user = await User.findOne({ email }); // Find user by email

        if (!user) {
            user = await User.create({ name, email }); // Create new user if not found
        }

        let token = await generateToken(user._id); // gentoken function import from ../config/token.js

        res.cookie("token", token, { // Set token in cookie
            httpOnly: true, // if true, cookie cannot be accessed by client-side javascript
            secure: false, // in development mode, set to true
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
            message: "Internal Server Error"
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