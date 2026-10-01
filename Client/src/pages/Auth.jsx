import React, { useState } from 'react';
import axios from 'axios';

import { GiVintageRobot } from "react-icons/gi";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice';

function Auth({ isModel = false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            setAuthError("");
            const response = await signInWithPopup(auth, provider);
            let User = response.user;  // Get user data from response
            let name = User.displayName;
            let email = User.email;
            
            const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true });
            if (result.data.success) {
                if (result.data.token) {
                    localStorage.setItem("token", result.data.token);
                    axios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`;
                }
                dispatch(setUserData(result.data.user)); // Dispatch user data to Redux store
                navigate('/');
            } else {
                setAuthError(result.data.message || "Login failed on server.");
                dispatch(setUserData(null));
            }
        } catch (error) {
            console.error("Google Auth error:", error);
            let message = "Failed to sign in with Google.";
            if (error.code === "auth/popup-closed-by-user") {
                message = "Sign-in popup was closed before completion.";
            } else if (error.code === "auth/unauthorized-domain") {
                message = "This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.";
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message?.includes("Network Error")) {
                message = "Backend server is waking up or temporarily unavailable. Please wait 30 seconds and try again.";
            } else if (error.message) {
                message = error.message;
            }
            setAuthError(message);
            dispatch(setUserData(null)); // Set user data to null
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={`w-full ${isModel ? 'py-4' : 'min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20'}`}>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.25 }}
                className={`w-full bg-white shadow-2xl border border-gray-200 ${isModel ? 'max-w-md p-8 rounded-3xl' : 'max-w-lg p-12 rounded-[32px]'}`}
            >
                {/* Header */}
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <GiVintageRobot size={24} />
                    </div>
                    <h1 className='font-semibold font-stretch-100% text-lg'>PrepAI</h1>
                </div>

                {/* Title */}
                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                    Continue With <br />
                    <span className='bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full inline-flex items-center justify-center gap-2 mt-2 text-xl'>
                        <IoSparkles /> Smart PrepAI
                    </span>
                </h1>

                <p className='text-center text-gray-500 text-sm leading-relaxed mb-6'>
                    Sign in to Start AI-Powered mock Interviews, track your progress, and unlock detailed performance insights.
                </p>

                {authError && (
                    <div className='mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center leading-relaxed'>
                        {authError}
                    </div>
                )}

                <motion.button
                    disabled={loading}
                    onClick={handleGoogleAuth}
                    whileHover={{ opacity: 1, scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`w-full bg-black flex items-center justify-center gap-3 py-3 text-white rounded-full shadow-md transition-opacity ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-800'}`}>
                    <FcGoogle size={20} /> {loading ? "Signing in..." : "Continue with Google"}
                </motion.button>
            </motion.div>
        </div>
    );
}

export default Auth;