import Payment from "../models/payment.razorpay.js"
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js"
import crypto from "crypto";

export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;
        if (!amount || !credits) {
            return res.status(400).json({ success: false, message: "Invalid plan data" });
        }

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: `order_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        await Payment.create({
            userId: req.userId,
            planId,
            amount: Number(amount),
            credits: Number(credits),
            razorpayOrderId: order.id,
            status: "created"
        });
        return res.status(200).json({ success: true, order });

    }
    catch (error) {
        console.error("Razorpay order creation error:", error);
        return res.status(500).json({ success: false, message: "Failed to create razorpay order." });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
        const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
        const signature = req.body.signature || req.body.razorpay_signature;

        if (!razorpayOrderId || !razorpayPaymentId || !signature) {
            return res.status(400).json({ success: false, message: "Missing required payment verification details" });
        }

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature === signature) {
            const payment = await Payment.findOne({
                razorpayOrderId: razorpayOrderId,
            });

            if (!payment) {
                return res.status(404).json({ success: false, message: "Payment record not found" });
            }
            if (payment.status === "paid") {
                const user = await User.findById(payment.userId).select("-password");
                return res.status(200).json({ success: true, message: "Already processed", user });
            }

            payment.status = "paid";
            payment.razorpayPaymentId = razorpayPaymentId;
            await payment.save();

            const updatedUser = await User.findByIdAndUpdate(
                payment.userId,
                { $inc: { credits: payment.credits } },
                { new: true }
            ).select("-password");

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully.",
                user: updatedUser
            });
        }

        return res.status(400).json({ success: false, message: "Invalid signature" });

    }
    catch (error) {
        console.error("Razorpay verify error:", error);
        return res.status(500).json({ success: false, message: "Failed to verify razorpay order" });
    }
};