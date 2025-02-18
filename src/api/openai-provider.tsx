"use server";

import axios from "axios";
import { ViewMode, getPromptForMode } from "@/lib/utils";

interface ApiResponse {
  choices?: { message?: { content?: string } }[];
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
    if (!response.data) {
      throw new Error("No data received from GPT-4 API");
    }

    const parsed =
      mode === "receipt"
        ? parseReceiptGpt4oResponse(response.data)
        : parseExpenseGpt4Response(response.data);

    return { success: true, data: parsed };
  } catch (error) {
    console.error("Error in gpt4oProvider:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to process receipt",
    };
  }
}

function parseReceiptGpt4oResponse(apiResponse: ApiResponse) {
  try {
    const content = apiResponse?.choices?.[0]?.message?.content;
    if (!content) {
      console.log("No content in GPT-4 response");
      return null;
    }

    // If content is just a string without JSON markers, return it as is
    if (!content.includes("{")) {
      console.log("Content is not JSON:", content);
      return content;
    }

    console.log("Content is JSON (most likely):", content);

    // Try to extract JSON content from markdown code blocks if present
    let jsonContent = content;
    if (content.includes("```")) {
      jsonContent = content.replace(/```json\s*|\s*```/g, "").trim();
    }

    // First try to parse as complete JSON
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.vendor_info || parsed.line_items) {
        return parsed;
      }
    } catch (parseError) {
      console.log(
        "Failed to parse complete JSON, attempting to handle truncation"
      );
    }

    // If we get here, the JSON might be truncated
    // Find the last complete object structure
    const vendorMatch = jsonContent.match(/"vendor_info"\s*:\s*({[^}]+})/);
    const lineItemsMatch = jsonContent.match(
      /"line_items"\s*:\s*\[(.*?)(?:\]|$)/s
    );

    const partialResult: any = {};

    // Extract vendor info if available
    if (vendorMatch) {
      try {
        partialResult.vendor_info = JSON.parse(vendorMatch[1]);
      } catch (e) {
        console.log("Failed to parse vendor_info");
      }
    }

    // Extract line items if available
    if (lineItemsMatch) {
      try {
        // Split by closing braces and filter for complete items
        const items = lineItemsMatch[1]
          .split(/},?\s*/)
          .filter(
            (item) =>
              item.includes('"item_name"') &&
              item.includes('"subtotal"') &&
              item.includes('"unit_price"')
          )
          .map((item) => {
            // Clean and complete each item object
            const cleanItem = item.trim();
            const itemToProcess = cleanItem.endsWith("}")
              ? cleanItem
              : cleanItem + "}";
            try {
              return JSON.parse(itemToProcess);
            } catch {
              return null;
            }
          })
          .filter(
            (item): item is { item_name: string; subtotal: number } =>
              item !== null &&
              typeof item.item_name === "string" &&
              typeof item.subtotal === "number"
          );

        if (items.length > 0) {
          partialResult.line_items = items;
        }
      } catch (e) {
        console.log("Failed to parse line_items:", e);
      }
    }

    // Return partial result if we have any valid data
    if (Object.keys(partialResult).length > 0) {
      return partialResult;
    }

    throw new Error("Failed to parse receipt data");
  } catch (e) {
    console.error("Error processing GPT-4 response:", e);
    throw e;
  }
}

function parseExpenseGpt4Response(apiResponse: ApiResponse) {
  try {
    const content = apiResponse?.choices?.[0]?.message?.content;
    if (!content) {
      console.log("No content in GPT-4 response");
      return null;
    }

    // If content is just a string without JSON markers, return it as is
    if (!content.includes("{")) {
      console.log("Content is not JSON:", content);
      return content;
    }

    // Extract JSON content
    let jsonContent = content;

    // Remove markdown code blocks if present
    jsonContent = jsonContent.replace(/```(?:json)?\s*|\s*```/g, "");

    // Clean up any remaining whitespace
    jsonContent = jsonContent.trim();

    console.log("Cleaned JSON content:", jsonContent);

    // Wrap the content in array brackets if it's not already an array
    if (!jsonContent.startsWith("[")) {
      jsonContent = "[" + jsonContent + "]";
    }

    try {
      const parsed = JSON.parse(jsonContent);
      // Ensure we have an array of transactions
      const transactions = Array.isArray(parsed) ? parsed : [parsed];

      // Process each transaction
      return transactions.map((transaction) => ({
        vendor_name: transaction.vendor_name || "Unknown Vendor",
        expense_amount: parseFloat(transaction.expense_amount) || 0,
        date: transaction.date ? new Date(transaction.date) : new Date(),
        category: transaction.category || undefined,
        description: transaction.description || undefined,
      }));
    } catch (parseError) {
      console.log("Failed to parse expense JSON:", parseError);
      throw parseError;
    }

    throw new Error("Failed to parse expense data");
  } catch (e) {
    console.error("Error processing GPT-4 response:", e);
    throw e;
  }
}
