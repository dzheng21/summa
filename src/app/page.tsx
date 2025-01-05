"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense } from "../lib/utils";
// import llamaProvider from "@/api/llama-provider";
import gpt4oProvider from "@/api/openai-provider";
import { HelpGuide } from "../components/HelpGuide";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: this function should be called when the response is received from API
  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFile(acceptedFiles[0]);

    // TODO: swap out this dummy data with the actual API results
    updateExpenses([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = () => {
    setUploadedFile(null);
    setExpenses([]); // TODO: Revisit this behavior
  };

  return (
    <div className="min-h-screen">
      {/* Fixed header area */}
      <div className="w-full px-8 pt-8 sm:px-20">
        <div className="mb-4">
          <Image
            className="dark:invert"
            src="/summa.svg"
            alt="summa logo"
            width={100}
            height={37}
            priority
          />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Welcome to Summa</h1>
          {!expenses?.length && (
            <h2 className="text-l text-gray-500">Upload your file below</h2>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="px-8 sm:px-20">
        <div className="flex flex-col gap-6">
          {!expenses?.length && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-6 rounded-lg h-24 flex items-center text-gray-400 justify-center ${
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

          {uploadedFile && (
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
          )}

          {uploadedFile && !isLoading && !expenses.length && (
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const response = await callGpt4oProvider(uploadedFile);
                  setExpenses(response);
                  console.log("FE Response Received", response);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 w-fit"
            >
              Send Request
            </button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 text-sm">Analyzing your receipt...</p>
            </div>
          )}

          {expenses?.length > 0 && <ExpenseTable expenses={expenses} />}

          {!isLoading && !expenses?.length && (
            <p className="text-gray-300 text-xs">No expenses to display yet!</p>
          )}
        </div>
      </div>

      {/* Help Guide positioned absolutely */}
      <div className="absolute top-8 right-8">
        <HelpGuide />
      </div>
    </div>
  );
}

async function callGpt4oProvider(file: File | undefined): Promise<Expense[]> {
  if (!file) {
    return [];
  }

  let base64File = "";

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    base64File = reader.result?.toString().split(",")[1] || "";
  };

  await new Promise((resolve) => (reader.onloadend = resolve));

  console.log("This is the file that is received", base64File);

  try {
    const response = await gpt4oProvider(base64File);

    if (
      !Array.isArray(response) ||
      !response.every((expense) => isExpense(expense))
    ) {
      throw new Error("Invalid response format");
    }

    return response;
  } catch (error) {
    console.error("Error calling gpt4oProvider:", error);
    return [];
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
