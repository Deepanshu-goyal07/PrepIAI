import React from 'react';
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
    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth, provider)
            let User = response.user  // Get user data from response
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
            if (result.data.success) {
                dispatch(setUserData(result.data.user)); // Dispatch user data to Redux store
                navigate('/');
            }

        } catch (error) {
            console.log(error)
            dispatch(setUserData(null)); // Set user data to null
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

                <p className='text-center text-gray-500 text-sm leading-relaxed mb-8'>
                    Sign in to Start AI-Powered mock Interviews, track your progress, and unlock detailed performance insights.
                </p>

                <motion.button
                    onClick={handleGoogleAuth}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    className='w-full bg-black flex items-center justify-center gap-3 py-3 black text-white rounded-full shadow-md'>
                    <FcGoogle size={20} /> Continue with Google
                </motion.button>
            </motion.div>
        </div>
    );
}

export default Auth;