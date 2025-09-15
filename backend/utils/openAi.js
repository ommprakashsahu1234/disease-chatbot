import 'dotenv/config';
import axios from "axios";
// const getOpenAiApiResponse=async (message) => {
//         try {
//         const url="https://api.openai.com/v1/chat/completions";
//         const response=await axios.post(url,{
//             model:"gpt-4o-mini",
//             messages:[
//                 {
//                 role: "user",
//                 content:message
//                 }
//             ]
//         },{
//             headers:{
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` 
//             }
//         });
//        return response.data.choices[0].message.content;
//     } catch (error) {
//         console.log(error);
//         throw new Error("Failed to fetch AI response");
//     }
// }
// export default getOpenAiApiResponse;

const classifyQuery = async (message) => {
    const url = "https://api.openai.com/v1/chat/completions";
    try {
        const response = await axios.post(url, {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a classifier. Reply with only 'YES' if the question is health-related, otherwise reply 'NO'." },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.log("Classification error:", error.message);
        return "NO"; // default safe response
    }
};

const getOpenAiApiResponse = async (message) => {
    try {
        // Step 1: Filter
        const isHealthRelated = await classifyQuery(message);

        if (isHealthRelated !== "YES") {
            return "❌ I can only provide health-related advice. Please ask a health-related question.";
        }

        // Step 2: Generate Health Response
        const url = "https://api.openai.com/v1/chat/completions";
        const response = await axios.post(url, {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful medical assistant. Only provide health-related solutions." },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        return response.data.choices[0].message.content;

    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch AI response");
    }
};

export {classifyQuery,getOpenAiApiResponse};
