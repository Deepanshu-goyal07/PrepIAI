import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/connectDB.js"
import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"

const app = express();

app.use(cors({
    origin: "https://prepai-client-ylxu.onrender.com",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectDB();
}) 
