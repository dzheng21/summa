import axios from "axios";
import { expenseExtractionPrompt } from "@/lib/utils";

interface ApiResponse {
  choices?: { message?: { content?: string } }[];
}

function parseGpt4oResponse(apiResponse: ApiResponse) {
  try {
    const content = apiResponse?.choices?.[0]?.message?.content || "";
    const cleanedContent = content.replace(/```json|```/g, "");
    return JSON.parse(cleanedContent);
  } catch (e) {
    console.log(e.message);
    throw new Error("Failed to parse GPT-4o response");
  }
}

export default async function gpt4oProvider(file?: File | undefined) {
  let base64File = "";

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      base64File = reader.result?.toString().split(",")[1] || "";
    };
    await new Promise((resolve) => (reader.onloadend = resolve));
    console.log("This is the file that is received", base64File);
  }

  const payload = {
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            // text: "This is a test prompt, please respond with 'Hello!'",
            text: expenseExtractionPrompt, // Utilize the expenseExtractionPrompt
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              // TODO: ASSUMES PNG, EXPAND TO OTHER FILES after testing
              url: `data:image/png;base64,${base64File}`, // Include the base64 encoded file in the message
            },
          },
        ],
      },
    ],
    temperature: 0.7,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 800,
    stop: null,
    stream: false,
  };

  const config = {
    method: "post",
    // maxBodyLength: Infinity,
    url: "YOUR_API_URL",
    headers: {
      "Content-Type": "application/json",
      "api-key": "YOUR_API_KEY",
    },
    data: JSON.stringify(payload),
  };

  try {
    const response = await axios.request(config);
    console.log("Returned result: \n", JSON.stringify(response.data));
    const parsed = parseGpt4oResponse(response.data);
    return parsed;
  } catch (error) {
    console.log(
      "Error in gpt4oProvider:",
      (error as Error).message,
      (error as Error).stack
    );
    return null;
  }
}
