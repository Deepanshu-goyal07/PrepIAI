import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function Pricing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    const [selectedPlan, setSelectedPlan] = useState("free");
    const [loadingPlan, setLoadingPlan] = useState(null);

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "₹0",
            amount: 0,
            credits: 100,
            description: "Perfect for beginners starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performance Report",
                "Voice Interview Access",
                "Limited History Tracking",
            ],
            default: true,
        },
        {
            id: "basic",
            name: "Starter Pack",
            price: "₹100",
            amount: 100,
            credits: 150,
            description: "Great for focused practice and skill improvement.",
            features: [
                "150 AI Interview Credits",
                "Detailed Feedback",
                "Performance Analytics",
                "Full Interview History",
            ],
        },
        {
            id: "pro",
            name: "Pro Pack",
            price: "₹500",
            amount: 500,
            credits: 650,
            description: "Best value for serious job preparation.",
            features: [
                "650 AI Interview Credits",
                "Advanced AI Feedback",
                "Skill Trend Analysis",
                "Priority AI Processing",
            ],
            badge: "Best Value",
        }
    ];

    const handlePayment = async (plan) => {
        if (!userData) {
            alert("Please sign in first to purchase credits.");
            navigate("/auth");
            return;
        }

        if (typeof window.Razorpay === "undefined") {
            alert("Razorpay payment gateway failed to load. Please check your internet connection.");
            return;
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
            alert("Razorpay Key ID is missing from environment configuration.");
            return;
        }

        try {
            setLoadingPlan(plan.id);
            const amount = plan.amount ?? (plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0);

            const result = await axios.post(ServerUrl + "/api/payment/order", {
                planId: plan.id,
                amount: amount,
                credits: plan.credits,
            }, { withCredentials: true });

            if (!result.data?.order?.id) {
                throw new Error(result.data?.message || "Failed to create order");
            }

            const options = {
                key: razorpayKey,
                amount: result.data.order.amount,
                currency: "INR",
                name: "PrepAI",
                description: `${plan.name} - ${plan.credits} Credits`,
                order_id: result.data.order.id,
                prefill: {
                    name: userData?.name || "",
                    email: userData?.email || "",
                },
                handler: async (response) => {
                    try {
                        const verifPay = await axios.post(ServerUrl + "/api/payment/verify", {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { withCredentials: true });

                        if (verifPay.data.success) {
                            if (verifPay.data.user) {
                                dispatch(setUserData(verifPay.data.user));
                            }
                            alert("Payment Successful! Your credits have been added.");
                            navigate("/");
                        } else {
                            alert(verifPay.data.message || "Payment verification failed.");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert(err?.response?.data?.message || "Payment verification failed. Please contact support.");
                    } finally {
                        setLoadingPlan(null);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoadingPlan(null);
                    }
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                console.error("Payment failed:", response.error);
                alert(`Payment failed: ${response.error?.description || "Transaction declined"}`);
                setLoadingPlan(null);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment error:", error);
            alert(error?.response?.data?.message || "Failed to initiate payment. Please try again.");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-6">
            <div className="max-w-6xl mx-auto mb-14 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button onClick={() => navigate("/")} className="p-3 rounded-full bg-white shadow hover:shadow-md transition" title="Back to Home">
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            Choose Your Plan
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">
                            Flexible pricing to match your interview preparation goals.
                        </p>
                    </div>
                </div>

                {userData && (
                    <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200">
                        <BsCoin className="text-amber-500 text-xl" />
                        <span className="text-sm font-semibold text-gray-700">
                            Current Balance: <span className="text-blue-600 font-bold">{userData?.credits ?? 0}</span> Credits
                        </span>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <motion.div key={plan.id}
                            whileHover={!plan.default ? { scale: 1.03 } : {}}
                            onClick={() => !plan.default && setSelectedPlan(plan.id)}
                            className={`relative rounded-3xl p-8 transition-all duration-300 border flex flex-col justify-between
                                ${isSelected ? "border-blue-500 shadow-2xl bg-white ring-2 ring-blue-500/20" : "border-gray-200 bg-white shadow-md hover:border-gray-300"}
                                ${plan.default ? "cursor-default" : "cursor-pointer"}
                            `}
                        >
                            <div>
                                {/* badge */}
                                {plan.badge && (
                                    <div className="absolute top-6 right-6 bg-blue-600 text-white text-xs px-4 py-1 rounded-full shadow font-medium">
                                        {plan.badge}
                                    </div>
                                )}
                                {/* default tag */}
                                {plan.default && (
                                    <div className="absolute top-6 right-6 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                                        Current / Default
                                    </div>
                                )}
                                {/* plan name */}
                                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>

                                {/* price */}
                                <div className="mt-4">
                                    <span className="text-3xl font-extrabold text-blue-600">
                                        {plan.price}
                                    </span>
                                    <p className="text-gray-600 mt-1 font-medium">
                                        {plan.credits} Credits
                                    </p>
                                </div>
                                {/* description */}
                                <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                                    {plan.description}
                                </p>

                                {/* Features */}
                                <div className="mt-6 space-y-3 text-left">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <FaCheckCircle className="text-blue-500 text-sm flex-shrink-0" />
                                            <span className="text-gray-700 text-sm">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!plan.default ? (
                                <button
                                    disabled={loadingPlan === plan.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isSelected) {
                                            setSelectedPlan(plan.id);
                                        }
                                        handlePayment(plan);
                                    }}
                                    className={`w-full mt-8 py-3 rounded-xl font-semibold transition cursor-pointer shadow-sm
                                      ${isSelected
                                            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
                                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                        } ${loadingPlan === plan.id ? "opacity-75 cursor-not-allowed" : ""}`}>
                                    {loadingPlan === plan.id
                                        ? "Opening Checkout..."
                                        : isSelected
                                            ? "Proceed to Pay"
                                            : `Select & Pay ${plan.price}`}
                                </button>
                            ) : (
                                <div className="w-full mt-8 py-3 rounded-xl text-center text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100">
                                    Default Free Plan
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default Pricing;
