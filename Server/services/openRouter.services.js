import axios from "axios";

import https from "https";

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Message array is invalid or empty.");
        }

        const response = await axios.post(
            OPENROUTER_API,
            {
                model: "openai/gpt-4o-mini",
                messages: messages
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY?.trim()}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );

        const content = response?.data?.choices[0]?.message?.content;
        if (!content || !content.trim()) {
            throw new Error("No content received from OpenRouter.");
        }
        return content; 

    } catch (error) {
        console.error("Error calling OpenRouter:", error.response?.data || error.message);
        throw error;
    }
};