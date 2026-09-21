import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ServerUrl } from "../App";
import S3Report from "../components/S3Report";

function InterviewReport() {
    const { id } = useParams();
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const result = await axios.get(`${ServerUrl}/api/interview/report/${id}`, { withCredentials: true });
                setReport(result.data);
            } catch (error) {
                console.log(error);
                alert("Error fetching report");
            }
        };
        fetchReport();
    }, [id]);

    if (!report)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                    Loading report...
                </p>
            </div>
        );

    return <S3Report report={report} />;
}

export default InterviewReport;