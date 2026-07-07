import React from "react";
import maleViedo from "../assets/Videos/male-ai.mp4";
import femaleViedo from "../assets/Videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";


function S2Interview({ interviewData, onFinish }) {

    const { interviewId, questions, userName } = interviewData
    const [currentQuestion, setCurrentQuestion] = React.useState(0)
    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white-to-teal-100 
        flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200
             flex flex-col lg:flex-row overflow-hidden ">
                {/* video section */}
                <div className="w-full lg:w-[35%] bg-white flex flex-col items-center 
                p-6 space-y-6 border-r border-gray-200">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
                        <video
                            src={femaleViedo}
                            preload="auto"
                            playsInline
                            muted
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* subtitle  */}

                    {/* timer */}
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl
                    shadow-md p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Interview Status</span>
                            <span className="text-sm font-semibold text-blue-600">AI Speaking</span>
                        </div>

                        {/* divide */}
                        <div className="h-px bg-gray-200"></div>

                        {/* Timer */}
                        <div className="flex justify-center"> <Timer timeLeft="30" totalTime="60" /> </div>

                        {/* divide */}
                        <div className="h-px bg-gray-200"></div>

                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                                <span className="text-2xl font-bold text-blue-600"> {currentQuestion + 1} </span>
                                <span className="text-xs text-gray-400"> Current Questions </span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-blue-600"> {questions.length} </span>
                                <span className="text-xs text-gray-400"> Total Questions </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* text section */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 md: p-8 relative ">
                    <h2 className="text-xl sm:tex-2xl font bold text-blue-600 mb-6">
                        AI Smart Interview
                    </h2>
                    <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border-gray shadow-sm">
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">Question 1 of 5 </p>
                        <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">First Question</div>
                    </div>
                    <textarea
                        placeholder="Type your  answer here ..."
                        className="felx-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-noneborder border-gray-200 
                        focus:ring-2 focus:ring-blue-500 transition text-gray-800" />
                </div>
            </div>
        </div>
    );
}

export default S2Interview;