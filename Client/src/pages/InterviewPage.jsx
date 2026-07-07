import { useState } from "react";
import S1SetUp from "../components/S1SetUp";
import S2Interview from "../components/S2Interview";
import S3Report from "../components/S3Report";

function InterviewPage() {
    const [step, setStep] = useState(1);
    const [interviewData, setInterviewData] = useState(null);
    return (
        <div className="min-h-screen bg-gray-50">
            {step == 1 && <S1SetUp onStart={(data) => {setInterviewData(data);setStep(2)}} />}
            {step == 2 && <S2Interview interviewData={interviewData} onFinish={(report) => {setInterviewData(report);setStep(3)}} />}
            {step == 3 && <S3Report report={interviewData} />}
        </div>
    );
}

export default InterviewPage;
