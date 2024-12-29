import axios from "axios";
import { expenseExtractionPrompt } from "@/lib/utils"; // TODO: UTILIZE THIS PROMPT WHEN NEEDED

function parseGpt4oResponse(apiResponse: any) {
  try {
    const content = apiResponse?.choices?.[0]?.message?.content || "";
    const cleanedContent = content.replace(/```json|```/g, "");
    return JSON.parse(cleanedContent);
  } catch (e) {
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
  } catch (error: any) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.log(
        "Error in gpt4oProvider:",
        error.response.data,
        error.response.status,
        error.response.headers
      );
    } else if (error.request) {
      // Request was made but no response received
      console.log(
        "Error in gpt4oProvider: No response received",
        error.request
      );
    } else {
      // Something happened in setting up the request
      console.log("Error in gpt4oProvider:", error.message);
    }
    console.log("Error config:", error.config);
    return null;
  }
}
