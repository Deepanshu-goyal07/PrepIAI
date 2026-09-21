import React from "react";
import maleViedo from "../assets/Videos/male-ai.mp4";
import femaleViedo from "../assets/Videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useState, useRef, useEffect } from "react";
import { ServerUrl } from "../App";
import axios from "axios";
import { BsArrowRight } from 'react-icons/bs';

function S2Interview({ interviewData, onFinish }) {

    const { interviewId, questions, userName } = interviewData;
    const [isIntroPhase, setIsIntroPhase] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);
    const isMicOnRef = useRef(true);
    const recognitionRef = useRef(null);

    const [isAIPlaying, setIsAIPlaying] = useState(false);
    const isAIPlayingRef = useRef(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(
        questions[0]?.timeLimit || 45
    );

    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");

    const viedoRef = useRef(null);

    const currentQuestion = questions[currentIndex];

    // Keep refs updated for async callbacks
    useEffect(() => {
        isMicOnRef.current = isMicOn;
    }, [isMicOn]);

    useEffect(() => {
        isAIPlayingRef.current = isAIPlaying;
    }, [isAIPlaying]);

    // Request microphone permission on mount
    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
                console.warn("Microphone access warning:", err);
            });
        }
    }, []);

    useEffect(() => {
        const loadVoice = () => {
            const voices = window.speechSynthesis.getVoices();

            if (!voices.length) return;

            const femaleVoice = voices.find(
                (v) =>
                    v.name.toLowerCase().includes("zira") ||
                    v.name.toLowerCase().includes("samantha") ||
                    v.name.toLowerCase().includes("female")
            );

            if (femaleVoice) {
                setSelectedVoice(femaleVoice);
                setVoiceGender("female");
                return;
            }

            const maleVoice = voices.find(
                (v) =>
                    v.name.toLowerCase().includes("david") ||
                    v.name.toLowerCase().includes("mark") ||
                    v.name.toLowerCase().includes("male")
            );

            if (maleVoice) {
                setSelectedVoice(maleVoice);
                setVoiceGender("male");
                return;
            }
            // Fallback first voice
            setSelectedVoice(voices[0]);
            setVoiceGender("female");
        };

        loadVoice();
        window.speechSynthesis.onvoiceschanged = loadVoice;

    }, []);

    const viedoSource = voiceGender === "male" ? maleViedo : femaleViedo;

    const startMic = () => {
        if (!recognitionRef.current || isAIPlayingRef.current) return;
        try {
            recognitionRef.current.start();
        } catch (e) {
            // Already started or busy - safe to ignore
        }
    };

    const stopMic = () => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (e) {
            // Safe to ignore
        }
    };

    const toggleMic = () => {
        if (isMicOn) {
            stopMic();
        } else {
            startMic();
        }
        setIsMicOn(!isMicOn);
    };

    // Speak function
    const speakText = (text) => {
        return new Promise((res) => {
            if (!window.speechSynthesis || !selectedVoice) {
                res();
                return;
            }
            // stop if there is a previous speech
            window.speechSynthesis.cancel();
            // Add natural pauses after commas and periods
            const humanText = text
                .replace(/,/g, ", ... ")
                .replace(/\./g, ". ... ");

            const utterance = new SpeechSynthesisUtterance(humanText);
            utterance.rate = 0.92;
            utterance.voice = selectedVoice;
            utterance.pitch = 1.05;
            utterance.volume = 1;

            utterance.onstart = () => {
                setIsAIPlaying(true);
                isAIPlayingRef.current = true;
                stopMic();
                viedoRef.current?.play().catch(() => {}); // Video start playing
            };

            utterance.onend = () => {
                viedoRef.current?.pause();
                if (viedoRef.current) {
                    viedoRef.current.currentTime = 0; // Restart Video
                }
                setIsAIPlaying(false);
                isAIPlayingRef.current = false;

                if (isMicOnRef.current) startMic();

                setTimeout(() => {
                    setSubtitle("");
                    res();
                }, 300);
            };

            utterance.onerror = () => {
                setIsAIPlaying(false);
                isAIPlayingRef.current = false;
                if (isMicOnRef.current) startMic();
                setSubtitle("");
                res();
            };

            setSubtitle(text); // Subtitle show when ai is speaking
            window.speechSynthesis.speak(utterance);
        });
    };

    useEffect(() => {
        if (!selectedVoice) return;

        const runIntro = async () => {
            if (isIntroPhase) {
                await speakText(
                    `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
                );
                await speakText(
                    "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
                );
                setIsIntroPhase(false);
            } else if (currentQuestion) {
                await new Promise((res) => setTimeout(res, 800));

                if (currentIndex === questions.length - 1) {
                    await speakText("Alright, this final question might be a bit more challenging.");
                }

                await speakText(currentQuestion.question);

                if (isMicOnRef.current) {
                    startMic();
                }
            }
        };
        runIntro();

    }, [selectedVoice, isIntroPhase, currentIndex]);

    // Timer Interval
    useEffect(() => {
        if (isIntroPhase || !currentQuestion || isSubmitting || isAutoAdvancing) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isIntroPhase, currentIndex, isSubmitting, isAutoAdvancing]);

    // Reset time left on question change
    useEffect(() => {
        if (!isIntroPhase && currentQuestion) {
            setTimeLeft(currentQuestion.timeLimit || 45);
        }
    }, [currentIndex, isIntroPhase]);

    // Speech recognition setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition is not supported in your browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            if (!transcript) {
                transcript = event.results[event.results.length - 1][0].transcript;
            }
            if (transcript.trim()) {
                setAnswer((prev) => (prev ? prev.trim() + " " : "") + transcript.trim() + " ");
            }
        };

        recognition.onend = () => {
            // Auto restart if mic is enabled and AI is not speaking
            if (isMicOnRef.current && !isAIPlayingRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // Safe ignore
                }
            }
        };

        recognition.onerror = (event) => {
            if (event.error === "no-speech") return;
            console.warn("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, []);

    const submitAnswer = async () => {
        if (isSubmitting) return;
        stopMic();
        setIsSubmitting(true);
        try {
            const timeTaken = Math.max(1, (currentQuestion.timeLimit || 45) - timeLeft);
            const result = await axios.post(
                ServerUrl + "/api/interview/submit-answer",
                {
                    interviewId,
                    questionIndex: currentIndex,
                    answer,
                    timeTaken
                },
                { withCredentials: true }
            );

            setFeedback(result.data.feedback);
            await speakText(result.data.feedback);
            setIsSubmitting(false);

        } catch (error) {
            console.log("Submit answer error:", error.response?.data?.message || error.message);
            const fallbackMsg = "Answer recorded. Let's move to the next question.";
            setFeedback(fallbackMsg);
            setIsSubmitting(false);
        }
    };

    const handleTimeout = async () => {
        if (isSubmitting || isAutoAdvancing) return;
        setIsAutoAdvancing(true);
        stopMic();
        setIsSubmitting(true);

        try {
            const result = await axios.post(
                ServerUrl + "/api/interview/submit-answer",
                {
                    interviewId,
                    questionIndex: currentIndex,
                    answer: answer || "",
                    timeTaken: currentQuestion.timeLimit || 45 // exact limit triggers time exceeded
                },
                { withCredentials: true }
            );

            const timeoutMsg = result.data.feedback || "Time limit exceeded. 0 marks awarded.";
            setFeedback(timeoutMsg);
            await speakText("Time is up! Moving to the next question.");

            setIsSubmitting(false);
            setIsAutoAdvancing(false);
            handleNext(true);

        } catch (error) {
            console.log("Timeout error:", error);
            setFeedback("Time limit exceeded. 0 marks awarded.");
            await speakText("Time is up! Moving to the next question.");
            setIsSubmitting(false);
            setIsAutoAdvancing(false);
            handleNext(true);
        }
    };

    // Auto-advance trigger when timeLeft reaches 0
    useEffect(() => {
        if (isIntroPhase || !currentQuestion) return;
        if (timeLeft === 0 && !isSubmitting && !feedback && !isAutoAdvancing) {
            handleTimeout();
        }
    }, [timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback, isAutoAdvancing]);

    const handleNext = async (skipAnnouncement = false) => {
        setAnswer("");
        setFeedback("");

        if (currentIndex + 1 >= questions.length) {
            finishInterview();
            return;
        }

        if (!skipAnnouncement) {
            await speakText("Alright, let's move to the next question.");
        }

        setCurrentIndex((prev) => prev + 1);

        setTimeout(() => {
            if (isMicOnRef.current) {
                startMic();
            }
        }, 500);
    };

    const finishInterview = async () => {
        stopMic();
        setIsMicOn(false);
        isMicOnRef.current = false;
        try {
            const result = await axios.post(
                ServerUrl + "/api/interview/finish",
                { interviewId },
                { withCredentials: true }
            );
            console.log(result.data);
            onFinish(result.data);
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 
        flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-6xl min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200
             flex flex-col lg:flex-row overflow-hidden">
                {/* video section */}
                <div className="w-full lg:w-[35%] bg-white flex flex-col items-center 
                p-6 space-y-6 border-r border-gray-200">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
                        <video
                            src={viedoSource} key={viedoSource} ref={viedoRef} preload="auto" playsInline muted
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* subtitle */}
                    {subtitle && (
                        <div className="w-full max-w-md bg-gray-50 border-gray-200 rounded-xl p-4 shadow-sm">
                            <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">{subtitle}</p>
                        </div>
                    )}

                    {/* timer card */}
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl
                    shadow-md p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Interview Status</span>
                            {isAIPlaying ? (
                                <span className="text-sm font-semibold text-blue-600">AI Speaking...</span>
                            ) : isMicOn ? (
                                <span className="text-sm font-semibold text-emerald-600 animate-pulse">● Listening</span>
                            ) : (
                                <span className="text-sm font-semibold text-gray-400">Mic Paused</span>
                            )}
                        </div>

                        {/* divide */}
                        <div className="h-px bg-gray-200"></div>

                        {/* Timer */}
                        <div className="flex justify-center">
                            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 45} />
                        </div>

                        {/* divide */}
                        <div className="h-px bg-gray-200"></div>

                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                                <span className="text-2xl font-bold text-blue-600"> {currentIndex + 1} </span>
                                <span className="text-xs text-gray-400 block"> Current Question </span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-blue-600"> {questions.length} </span>
                                <span className="text-xs text-gray-400 block"> Total Questions </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* text section */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                            AI Smart Interview
                        </h2>
                        {currentQuestion?.difficulty && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                currentQuestion.difficulty === "easy"
                                    ? "bg-green-100 text-green-700"
                                    : currentQuestion.difficulty === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                                {currentQuestion.difficulty}
                            </span>
                        )}
                    </div>

                    {!isIntroPhase && currentQuestion && (
                        <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <p className="text-xs sm:text-sm text-gray-400 mb-2">Question {currentIndex + 1} of {questions.length}</p>
                            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</div>
                        </div>
                    )}

                    <textarea
                        value={answer}
                        placeholder="Type or speak your answer here..."
                        onChange={(e) => setAnswer(e.target.value)}
                        className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 
                        focus:ring-2 focus:ring-blue-500 transition text-gray-800"
                    />

                    {!feedback ? (
                        <div className="flex items-center gap-4 mt-6">
                            <motion.button
                                onClick={toggleMic}
                                whileTap={{ scale: 0.9 }}
                                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center
                                rounded-full text-white shadow-lg transition ${
                                    isMicOn ? "bg-black hover:bg-gray-800" : "bg-red-500 hover:bg-red-600"
                                }`}>
                                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                            </motion.button>

                            <motion.button
                                onClick={submitAnswer}
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 sm:py-4 
                                rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500">
                                {isSubmitting ? "Submitting..." : "Submit Answer"}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div
                            onClick={() => handleNext(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm cursor-pointer">
                            <p className="text-blue-700 font-medium mb-4">{feedback}</p>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 
                        rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 font-semibold cursor-pointer">
                                {currentIndex + 1 >= questions.length ? "Finish Interview & View Report" : "Next Question"} <BsArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default S2Interview;