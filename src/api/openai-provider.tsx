import axios from "axios";
import dotenv from "dotenv";
import { expenseExtractionPrompt } from "@/lib/utils"; // TODO: UTILIZE THIS PROMPT WHEN NEEDED

dotenv.config();

export default async function gpt4oProvider(file?: File | undefined) {
  // TODO: Include base64 encoding of the user image
  const data = JSON.stringify({
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that helps people find information. Respond with 'Hello!' when ready.", // Replace with expenseExtractionPrompt.
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
    top_p: 0.95,
    stop: null,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "YOUR_URL",
    headers: {
      "Content-Type": "application/json",
      "api-key": "YOUR_API_KEY",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("Parsed results", JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    console.log("Error in gpt4oProvider:", error.message, error.stack);
    return null;
  }
}
