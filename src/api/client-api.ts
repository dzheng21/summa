import { ViewMode } from "@/lib/utils";
import gpt4oProvider from "@/api/openai-provider";

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
    const response = await gpt4oProvider(base64File, mode);
    // Same shape as ApiResponse
    return response;
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}
