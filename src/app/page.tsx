"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense, Receipt, ViewMode } from "../lib/utils";
// import llamaProvider from "@/api/llama-provider";
import gpt4oProvider from "@/api/openai-provider";
import { HelpGuide } from "../components/HelpGuide";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import ReceiptView from "@/components/ReceiptView";

// Add response type
interface ApiSuccessResponse {
  success: true;
  data: Expense[] | Receipt;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("expense");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setExpenses([]);
    setReceipt(null);

    // Automatically process the file
    processFile(file);
  }, []);

  // New function to handle file processing
  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await callGpt4oProvider(file, viewMode);
      console.log("Process File Response:", response);

      if (!response.success) {
        throw new Error(response.error);
      }

      if (viewMode === "expense") {
        if (!Array.isArray(response.data)) {
          throw new Error("Expected array of expenses");
        }
        setExpenses(response.data as Expense[]);
        setReceipt(null);
      } else {
        if (Array.isArray(response.data)) {
          throw new Error("Expected receipt object");
        }
        setReceipt(response.data as Receipt);
        setExpenses([]);
      }
      console.log("State Updated:", {
        viewMode,
        expenses: viewMode === "expense" ? response.data : [],
        receipt: viewMode === "receipt" ? response.data : null,
      });
    } catch (err) {
      console.error("Process File Error:", err);
      setError((err as Error).message || "Failed to process receipt");
      setExpenses([]);
      setReceipt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleDelete = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setExpenses([]);
    setReceipt(null);
    setError(null);
  };

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen">
      {/* Fixed header area */}
      <div className="w-full px-8 pt-8 sm:px-20">
        <div className="mb-4 flex justify-between items-center max-w-[60%] mx-auto">
          <Image
            className="dark:invert"
            src="/summa.svg"
            alt="summa logo"
            width={100}
            height={37}
            priority
          />
          <div className="absolute top-8 right-8">
            <HelpGuide />
          </div>
        </div>
        {!uploadedFile && !expenses.length && !receipt && (
          <div className="mb-8 max-w-[60%] mx-auto">
            <h1 className="text-2xl font-semibold">Welcome to Summa</h1>
            <h2 className="text-l text-gray-500">Upload your file below</h2>
          </div>
        )}
      </div>

      {/* Mode Toggle centered */}
      <div className="w-full flex justify-center mb-6">
        <ViewModeToggle mode={viewMode} onChange={handleModeChange} />
      </div>

      {/* Content area */}
      <div className="px-8 sm:px-20">
        <div className="flex flex-col gap-6 max-w-[60%] mx-auto">
          {uploadedFile && (
            <div className="flex justify-end">
              <div className="flex items-center gap-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!uploadedFile && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-6 rounded-lg h-24 flex items-center text-gray-400 justify-center w-full ${
                isDragActive
                  ? "border-blue-400 bg-blue-50 text-blue-400"
                  : "border-gray-200"
              } hover:border-blue-400 hover:cursor-pointer hover:text-blue-400 hover:bg-blue-50`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm w-80 text-center">
                  Drop the files here...
                </p>
              ) : (
                <p className="text-sm w-80 text-center">
                  Drag & drop files here, or click to select files
                </p>
              )}
            </div>
          )}

          {uploadedFile && previewUrl && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="relative w-[10%] aspect-auto overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
              >
                <Image
                  src={previewUrl}
                  alt="Receipt preview"
                  width={100}
                  height={100}
                  className="object-contain w-full h-full"
                />
              </button>
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  <span className="bg-blue-100 text-blue-600 font-semibold p-2 mr-2 rounded">
                    {uploadedFile.name}
                  </span>
                </p>
                <button onClick={handleDelete} className="text-red-500">
                  <Image
                    src="/trash.svg"
                    alt="Delete icon"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Image Preview Modal */}
          {isPreviewOpen && previewUrl && (
            <>
              {/* Backdrop - clicking anywhere on it closes the modal */}
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsPreviewOpen(false)}
              />
              {/* Modal content */}
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  // Close if clicking the outer container, but not the image
                  if (e.target === e.currentTarget) {
                    setIsPreviewOpen(false);
                  }
                }}
              >
                <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    aria-label="Close preview"
                  >
                    <span className="text-xl font-semibold">×</span>
                  </button>
                  <Image
                    src={previewUrl}
                    alt="Receipt preview"
                    width={800}
                    height={800}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 text-sm">Analyzing your receipt...</p>
            </div>
          )}

          {viewMode === "expense" && expenses?.length > 0 && (
            <ExpenseTable expenses={expenses} />
          )}

          {viewMode === "receipt" && receipt && receipt.items && (
            <ReceiptView receipt={receipt} />
          )}

          {!isLoading &&
            !expenses?.length &&
            !receipt?.items &&
            !uploadedFile &&
            !error && (
              <p className="text-gray-300 text-xs">No data to display yet!</p>
            )}
        </div>
      </div>
    </div>
  );
}

async function callGpt4oProvider(
  file: File | undefined,
  mode: ViewMode
): Promise<ApiResponse> {
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  let base64File = "";

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    base64File = reader.result?.toString().split(",")[1] || "";
  };

  await new Promise((resolve) => (reader.onloadend = resolve));

  try {
    const response = await gpt4oProvider(base64File, mode);
    console.log("GPT4O Response:", response);
    return response;
  } catch (error) {
    console.error("Error calling gpt4oProvider:", error);
    return { success: false, error: "Failed to process receipt" };
  }
}

function isExpense(expense: unknown): expense is Expense {
  // TODO: Implement a more robust type guard, try catch if necessary

  return (
    typeof expense === "object" &&
    expense !== null &&
    "vendor_name" in expense &&
    "expense_amount" in expense &&
    "date" in expense
  );
}
