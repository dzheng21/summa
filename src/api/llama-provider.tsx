import axios from "axios";
import FormData from "form-data";
import { expenseExtractionPrompt } from "@/lib/utils"; // TODO: UTILIZE THIS PROMPT WHEN NEEDED

export default async function llamaProvider(file?: File | undefined) {
  const formData = new FormData();
  //   formData.append("file", file);
  formData.append(
    "data",
    JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps people find information.",
        },
      ],
      past_messages: [],
      max_tokens: 800,
      temperature: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      best_of: 1,
      top_p: 0.95,
      stop: null,
    })
  );

  const config = {
    method: "post",
    url:
      //   process.env.LLAMA_ENDPOINT ||
      "YOUR_ENDPOINT",
    headers: {
      "api-key":
        // process.env.LLAMA_API_KEY ||
        "YOUR_API_KEY",
      "x-ms-model-mesh-model-name": "Llama-3.2-90B-Vision-Instruct",
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  };

  function parseLlamaResponse(apiResponse: any) {
    try {
      return JSON.parse(JSON.stringify(apiResponse)); // TODO: MODIFY, Skeleton parsing
    } catch (e) {
      throw new Error("Failed to parse Llama response");
    }
  }

  try {
    const response = await axios.request(config);
    console.log("Parsed results", JSON.stringify(response.data));
    const parsed = parseLlamaResponse(response.data);
    return parsed;
  } catch (error: any) {
    if (error.response) {
      console.log(
        "Error in llamaProvider:",
        error.response.data,
        error.response.status,
        error.response.headers
      );
    } else if (error.request) {
      console.log(
        "Error in llamaProvider: No response received",
        error.request
      );
    } else {
      console.log("Error in llamaProvider:", error.message);
    }
    console.log("Error config:", error.config);
    return null;
  }
}
