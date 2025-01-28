"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense, Receipt, ViewMode } from "../lib/utils";
import { analyzeImage, type ApiResponse } from "@/api/client-api";
import { HelpGuide } from "../components/HelpGuide";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import ReceiptView from "@/components/ReceiptView";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/heic": [".heic"],
  "application/pdf": [".pdf"],
};

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("expense");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Cleanup function for resources
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (abortController) {
      abortController.abort();
    }
  }, [previewUrl, abortController]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const resetState = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setExpenses([]);
    setReceipt(null);
    setError(null);
    setIsLoading(false);
    setAbortController(null);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      // Validate file
      if (!file) {
        setError("No file provided");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size too large (max 10MB)");
        return;
      }

      if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
        setError("Invalid file type. Please upload an image or PDF.");
        return;
      }

      // Clean up previous state
      cleanup();
      resetState();

      // Set new file
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Process the file
      await processFile(file, viewMode);
    },
    [viewMode, cleanup, resetState]
  );

  const processFile = async (file: File, mode: ViewMode) => {
    const newController = new AbortController();
    setAbortController(newController);
    setIsLoading(true);
    setError(null);

    try {
      const response = await callGpt4oProvider(
        file,
        mode,
        newController.signal
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      if (mode === "expense") {
        setExpenses(response.data);
        setReceipt(null);
      } else {
        if (
          !response.data ||
          typeof response.data !== "object" ||
          Array.isArray(response.data)
        ) {
          throw new Error(
            "Invalid response format for receipt - expected an object"
          );
        }
        console.log("Receipt data:", response.data);
        setReceipt(response.data);
        setExpenses([]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        const errorMessage = (err as Error).message || "Failed to process file";
        console.error("Process File Error:", err);
        setError(errorMessage);
        setExpenses([]);
        setReceipt(null);
      }
    } finally {
      if (!newController.signal.aborted) {
        setIsLoading(false);
        setAbortController(null);
      }
    }
  };

  const handleRetry = useCallback(() => {
    if (uploadedFile) {
      processFile(uploadedFile, viewMode);
    }
  }, [uploadedFile, viewMode]);

  const handleModeChange = useCallback(
    (newMode: ViewMode) => {
      cleanup();
      resetState();
      setViewMode(newMode);
    },
    [cleanup, resetState]
  );

  const handleDelete = useCallback(() => {
    cleanup();
    resetState();
  }, [cleanup, resetState]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full px-4 sm:px-8 pt-8">
        <div className="mb-4 flex justify-between items-center max-w-[90%] sm:max-w-[60%] mx-auto">
          <Image
            className="dark:invert"
            src="/summa.svg"
            alt="summa logo"
            width={100}
            height={37}
            priority
          />
          <div className="absolute top-8 right-4 sm:right-8">
            <HelpGuide />
          </div>
        </div>
        {!uploadedFile && !expenses.length && !receipt && (
          <div className="mb-8 max-w-[90%] sm:max-w-[60%] mx-auto">
            <h1 className="text-2xl font-semibold">Welcome to Summa</h1>
            <h2 className="text-l text-gray-500">Upload your file below</h2>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="w-full flex justify-center mb-6">
        <ViewModeToggle mode={viewMode} onChange={handleModeChange} />
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8">
        <div className="flex flex-col gap-6 max-w-[90%] sm:max-w-[60%] mx-auto">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
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
              <p className="text-sm w-80 text-center">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop a file here, or click to select"}
              </p>
            </div>
          )}

          {/* File Preview */}
          {uploadedFile && previewUrl && (
            <FilePreview
              file={uploadedFile}
              previewUrl={previewUrl}
              onDelete={handleDelete}
              isPreviewOpen={isPreviewOpen}
              setIsPreviewOpen={setIsPreviewOpen}
            />
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner />}

          {/* Results */}
          {!isLoading && viewMode === "expense" && expenses?.length > 0 && (
            <ExpenseTable expenses={expenses} onRetry={handleRetry} />
          )}

          {!isLoading && viewMode === "receipt" && receipt && (
            <ReceiptView
              receipt={receipt}
              error={error ?? undefined}
              onRetry={handleRetry}
            />
          )}

          {!isLoading &&
            !expenses?.length &&
            !receipt &&
            !uploadedFile &&
            !error && (
              <p className="text-gray-300 text-xs">No data to display yet!</p>
            )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      <p className="text-gray-500 text-sm">Analyzing your file...</p>
    </div>
  );
}

interface FilePreviewProps {
  file: File;
  previewUrl: string;
  onDelete: () => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
}

function FilePreview({
  file,
  previewUrl,
  onDelete,
  isPreviewOpen,
  setIsPreviewOpen,
}: FilePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setIsPreviewOpen(true)}
        className="relative w-[10%] aspect-auto overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
      >
        <Image
          src={previewUrl}
          alt="File preview"
          width={100}
          height={100}
          className="object-contain w-full h-full"
        />
      </button>
      <div className="flex items-center gap-2">
        <p className="text-sm">
          <span className="bg-blue-100 text-blue-600 font-semibold p-2 mr-2 rounded">
            {file.name}
          </span>
        </p>
        <button onClick={onDelete} className="text-red-500">
          <Image src="/trash.svg" alt="Delete" width={16} height={16} />
        </button>
      </div>

      {isPreviewOpen && (
        <PreviewModal
          previewUrl={previewUrl}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}

interface PreviewModalProps {
  previewUrl: string;
  onClose: () => void;
}

function PreviewModal({ previewUrl, onClose }: PreviewModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <span className="text-xl font-semibold">×</span>
          </button>
          <Image
            src={previewUrl}
            alt="File preview"
            width={800}
            height={800}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

// API Helper
async function callGpt4oProvider(
  file: File,
  mode: ViewMode,
  signal: AbortSignal
): Promise<ApiResponse> {
  let base64File = "";

  try {
    base64File = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(reader.result?.toString().split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return { success: false, error: "Failed to read file" };
  }

  try {
    return await analyzeImage(base64File, mode, signal);
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    console.error("Error calling API:", error);
    return { success: false, error: "Failed to process file" };
  }
}
