import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"; // converting pdf to text
import { askAi } from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js"

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Resume is required" });
        }
        const filePath = req.file.path;
        const fileBuffer = await fs.promises.readFile(filePath);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }
        resumeText = resumeText.replace(/\s+/g, " ").trim();
        // Sending message to AskIA fucntion
        const messages = [{
            role: "system",
            content: `Extract structured data from resume text.
                Return strictly JSON :
                {
                  "role" : "string",
                  "experience" : "string",
                  "projects" : ["project1","project2"],
                  "skills" : ["skill1","skill2"]
                }`
        },
        {
            role: "user",
            content: `Resume text:\n${resumeText}`
        }
        ];

        const aiResponse = await askAi(messages); // for Sending response to ai 

        const cleanJson = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson); //
        fs.unlinkSync(filePath); // delete file from server

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        });
    }
    catch (error) {
        console.error("Error analyzing resume — message:", error.message);
        console.error("Error analyzing resume — stack:", error.stack);
        console.error("Error analyzing resume — response:", error.response?.data);
        res.status(500).json({ error: "Failed to analyze resume", detail: error.message });
    }
}

// ------------------------------------------------------------------------------------------------------

export const generateQuestion = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body
        role = role?.trim()
        experience = experience?.trim()
        mode = mode?.trim()
        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience, and Mode are required" })
        }
        // find user by id from middleware req.userId
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (user.credits < 50) {
            return res.status(400).json({
                message: "Not enough credits. Minimum 50 required."

            });
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
        Role: ${role}
        Experience: ${experience}
        InterviewMode: ${mode}
        Projects: ${projectText}
        Skills: ${skillsText},
        Resume: ${safeResume}
        `;
        if (!userPrompt.trim()) {
            return res.status(400).json({ message: "Prompt content is empty" })
        };

        const messages = [
            {
                role: "system",
                content: `You are a real human interviewer conducting a professional interview. 
                Speak simple and natural English as if you are directly talking to the candidate.
                Generate exactly 5 interview questions
                Strict Rules:
                - Each question must contain between 15 and 25 words.
                - Each question must be a single complete sentence.
                - Do NOT number them.
                - Do NOT add explanations.
                - Do NOT add extra text before or after.
                - One question per line only.
                - Keep language simple and conversational.
                - Questions must feel practical and realistic.
                - Difficulty progression:
                Question 1 -> easy
                Question 2 -> easy medium
                Question 3 -> medium
                Question 4 -> medium hard
                Question 5 -> very hard
                Make questions based on the candidate's role, experience, interview mode, project and added resume details 
                `
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        // For sending response to ai 
        const aiResponse = await askAi(messages);
        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({ message: "AI returned empty response." })
        }

        const questionArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (questionArray.length === 0) {
            return res.status(500).json({ message: "Failed to parse questions." })
        }

        user.credits -= 50;
        await user.save(); // User from models schema

        const interview = await Interview.create({
            userId: req.userId, role, experience, mode, resumeText,
            questions: questionArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy-medium", "medium", "medium-hard", "very-hard"][index],
                // time according to index in seconds
                timeLimit: ["30", "45", "60", "75", "90"][index],
            })),
        })
        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        })
    }

    catch (error) {
        console.error("Error generating questions:", error);
        return res.status(500).json({ message: `Failed to generate interview ${error}` });
    }

}

// --------------------------------------------------------------------------------------------------

// user submit answer of particular question it update in interview model
export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;
        const interview = await Interview.findById(interviewId);
        const question = interview.questions[questionIndex]; // Question from index in interview model

        // if time exceeds 
        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time exceeded";
            question.answer = answer;
            await interview.save();
            return res.json({
                feedback: question.feedback
            })
        }
        const messages = [
            {
                role: "system",
                content: `
                You are a professional human interviewer evaluating a candidate's answer in a real interview.
                Evaluate naturally and fairly, like a real person would.
                Score the answer in these areas (0 to 10):
                1. confidence - Does the answer sound clear, confident, and well-presented?
                2. communication - Is the language simple, clear, and easy to understand?
                3. correctness - Is the answer accurate, relevant, and complete?
                Rules :
                - Be realistic and unbiased.
                - Do not give random high scores.
                - If the answer is weak, score low.
                - If the answer is strong and detailed, score high.
                - Consider clarity, structure, and relevance.
                Calculate:
                finalScore = average of confidence, communication, and correctness (rounded to
                nearest whole number).

                Feedback Rules:
                - Write natural human feedback.
                - 10 to 15 words only.
                - Sound like real interview feedback.
                - Can suggest improvement if needed.
                - Do NOT repeat the question.
                - Do NOT explain scoring.
                - Keep tone professional and honest.
                Return ONLY valid JSON in this format:
                {
                    "confidence": number,
                    "communication": number,
                    "correctness": number,
                    "finalScore": number,
                    "feedback": "short human feedback"
                }
                `
            },
            {
                role: "user",
                content: `Question: ${question.question}Answer: ${answer}`
            }
        ]

        const aiResponse = await askAi(messages);
        const parsedResponse = JSON.parse(aiResponse);
        question.answer = answer;
        question.confidence = parsedResponse.confidence;
        question.communication = parsedResponse.communication;
        question.correctness = parsedResponse.correctness;
        question.score = parsedResponse.finalScore;
        question.feedback = parsedResponse.feedback;

        await interview.save();
        return res.status(200).json({
            feedback: parsedResponse.feedback
        })

    }
    catch (error) {
        console.error("Error submitting answer:", error);
        return res.status(500).json({ message: `Failed to submit answer ${error}` });
    }
}

// --------------------------------------------------------------------------------------------------

// controller for final score of entire interview

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body;
        // interview by interview id 
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        // calculate final score by averaging all questions score
        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        // Interview model : question array from first to last 
        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        // calculate final score by averaging all questions score
        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = finalScore;
        interview.status = "completed";

        await interview.save();
        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            }))
        });
    }
    catch (error) {
        console.error("Error submitting interview:", error);
        return res.status(500).json({ message: `Failed to submit interview ${error}` });
    }
}
