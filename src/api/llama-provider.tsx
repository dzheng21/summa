import axios from "axios";
import dotenv from "dotenv";
// import { expenseExtractionPrompt } from "@/lib/utils"; // TODO: UTILIZE THIS PROMPT WHEN NEEDED

dotenv.config();

const data = JSON.stringify({
  messages: [
    {
      role: "system",
      content: "You are an AI assistant that helps people find information.",
    },
  ],
  past_messages: 10,
  max_tokens: 800,
  temperature: 0.7,
  frequency_penalty: 0,
  presence_penalty: 0,
  best_of: 1,
  top_p: 0.95,
  stop: null,
});

export default async function llamaProvider(file?: File | undefined) {
  const formData = new FormData();
  formData.append("file", file ? file : "");
  formData.append("data", data);

  const config = {
    method: "post",
    url: process.env.LLAMA_ENDPOINT || "YOUR_API_ENDPOINT",
    headers: {
      "api-key": process.env.LLAMA_API_KEY || "YOUR_API_KEY",
      "x-ms-model-mesh-model-name": "Llama-3.2-90B-Vision-Instruct",
    },
    data: formData,
  };

  try {
    const response = await axios.request(config);
    console.log("Parsed results", JSON.stringify(response.data));
    return response.data;
  } catch (error: unknown) {
    console.log(
      "Error in llamaProvider:",
      (error as Error).message,
      (error as Error).stack
    );
    return null;
  }
}
