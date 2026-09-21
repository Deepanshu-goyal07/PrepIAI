import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";

const InterviewHistory = () => {
    const [interviews, setInterviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterView = async () => {
            try {
                const result = await axios.get(`${ServerUrl}/api/interview/get-Interview`, { withCredentials: true });
                setInterviews(result.data.interviews || result.data.interview || []);
            } catch (error) {
                console.log(error);
                alert("Error getting interviews");
            }
        };
        getMyInterView();
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10 px-4 md:px-10">
            <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">
                <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/")}
                        className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition cursor-pointer">
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div className="">
                        <h1 className="text-3xl font-bold text-gray-800 flex-nowrap">Interview History</h1>
                        <p className="text-gray-500 mt-2">Review your past interviews</p>
                    </div>
                </div>
                {interviews.length === 0 ? (
                    <div className="bg-white p-10 rounded-2xl shadow text-center ">
                        <p className="text-gray-500 text-lg">No interviews yet start your first interview</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {interviews.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border-gray-100 cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Role: {item.role}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Experience: {item.experience} . Mode: {item.mode}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 ">
                                            Date: {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-emerald-600 ">
                                                {item.finalScore || 0}/10
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Overall score
                                            </p>
                                        </div>
                                        <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                                            item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewHistory;