import dotenv from "dotenv"
dotenv.config();
import connectDB, { lastDbError } from "./config/connectDB.js"
import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://prepai-client-ylxu.onrender.com",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Root and Health Check routes
app.get("/", (req, res) => {
    res.json({
        name: "PrepAI API",
        status: "active",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = states[mongoose.connection.readyState] || "unknown";
    res.json({
        status: "ok",
        mongodb: dbState,
        dbError: lastDbError,
        environment: {
            hasMongoUrl: Boolean(process.env.MONGODB_URL),
            hasJwtSecret: Boolean(process.env.JWT_SECRET),
            hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
            hasRazorpayKey: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
            clientUrl: process.env.CLIENT_URL || "https://prepai-client-ylxu.onrender.com"
        }
    });
});

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectDB();
})
