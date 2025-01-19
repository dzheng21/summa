import { ViewMode } from "@/lib/utils";

export interface ApiSuccessResponse {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export async function analyzeImage(
  base64File: string,
  mode: ViewMode,
  signal: AbortSignal
): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64File,
        mode,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    return {
      success: false,
      error: (error as Error).message || "Failed to analyze image",
    };
  }
}
