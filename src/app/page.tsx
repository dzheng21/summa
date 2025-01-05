"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense } from "../lib/utils";
// import llamaProvider from "@/api/llama-provider";
import gpt4oProvider from "@/api/openai-provider";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
    <>
      <div className="absolute top-2 left-2 w-full">
        <Image
          className="dark:invert"
          src="/summa.svg"
          alt="summa logo"
          width={100}
          height={37}
          priority
        />
      </div>
      <div className="grid grid-rows-[10px_1fr_10px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div>
            <h1 className="text-2xl font-semibold">Welcome to Summa</h1>
            {expenses && expenses.length > 0 ? (
              <></>
            ) : (
              <h2 className="text-l text-gray-500">Upload your file below</h2>
            )}
          </div>
          {expenses && expenses.length > 0 ? (
            <></>
          ) : (
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
            <div className="flex items-center gap-2 mt-4">
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

          {/* TODO: REMOVE THIS WHEN TESTING IS DONE */}
          {uploadedFile && !expenses ? (
            <></>
          ) : (
            <button
              onClick={async () => {
                const response = await callGpt4oProvider(
                  uploadedFile ?? undefined
                );
                setExpenses(response);
                console.log("FE Response Received", response);
              }}
              className="text-blue-500"
            >
              Send Request
            </button>
          )}

          {expenses && expenses.length > 0 ? (
            <ExpenseTable expenses={expenses} />
          ) : (
            <p className="text-gray-300 text-xs">No expenses to display yet!</p>
          )}
        </main>
      </div>
    </>
  );
}

async function callGpt4oProvider(
  file: File | undefined
): Promise<Expense[] | string> {
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

function isExpense(expense: any): expense is Expense {
  return (
    expense && expense.vendor_name && expense.expense_amount && expense.date
  );
}
