"use server";

import axios from "axios";
import { ViewMode, getPromptForMode } from "@/lib/utils";

interface ApiResponse {
  choices?: { message?: { content?: string } }[];
}

function parseGpt4oResponse(apiResponse: ApiResponse) {
  try {
    const content = apiResponse?.choices?.[0]?.message?.content || "";
    const cleanedContent = content.replace(/```json|```/g, "");
    return JSON.parse(cleanedContent);
  } catch (e) {
    console.log((e as Error).message);
    throw new Error("Failed to parse GPT-4o response");
  }
}

export default async function gpt4oProvider(
  base64File: string,
  mode: ViewMode
) {
  const payload = {
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: getPromptForMode(mode),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64File}`,
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
    url: process.env.GPT4O_ENDPOINT || "YOUR_API_URL",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.GPT4O_API_KEY || "YOUR_API_KEY",
    },
    data: JSON.stringify(payload),
  };

  try {
    const response = await axios.request(config);
    const parsed = parseGpt4oResponse(response.data);
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Error in gpt4oProvider:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to process receipt",
    };
  }
}
