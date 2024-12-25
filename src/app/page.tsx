"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense } from "../lib/utils";
import llamaProvider from "@/api/llama-provider";
import gpt4oProvider from "@/api/openai-provider";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // TODO: REMOVE THIS WHEN TESTING IS DONE
  const [llmResponse, setLlmResponse] = useState<any>(null);
  // TODO: REMOVE THIS WHEN TESTING IS DONE

  // TODO: this function should be called when the response is received from API
  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    setUploadedFile(acceptedFiles[0]);

    // TODO: swap out this dummy data with the actual API results
    updateExpenses([
      {
        vendor_name: "Amazon",
        expense_amount: 100,
        date: new Date(),
        category: "Shopping",
        description: "Bought a new keyboard",
      },
      {
        vendor_name: "Spotify",
        expense_amount: 10,
        date: new Date(),
        category: "Entertainment",
        description: "Monthly subscription",
      },
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = () => {
    setUploadedFile(null);
    setExpenses([]); // TODO: Revisit this behavior
  };

  return (
    <>
      {/* <div className="absolute top-2 left-2 w-full">
        <Image
          className="dark:invert"
          src="/summa.svg"
          alt="summa logo"
          width={100}
          height={37}
          priority
        />
      </div> */}
      <div className="grid grid-rows-[10px_1fr_10px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div>
            <h1 className="text-2xl font-semibold">Welcome to summa</h1>
            {expenses.length > 0 ? (
              <></>
            ) : (
              <h2 className="text-l text-gray-500">Upload your file below</h2>
            )}
          </div>
          {expenses.length > 0 ? (
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
          <button
            onClick={async () => {
              const response = await gpt4oProvider(uploadedFile ?? undefined);
              setLlmResponse(response);
              console.log("FE Response Received", response);
            }}
            className="text-blue-500"
          >
            Send Request
          </button>
          {/* TODO: REMOVE THIS WHEN TESTING IS DONE */}

          {llmResponse ? (
            <p> Response: {llmResponse.choices[0].message.content} </p>
          ) : (
            <></>
          )}

          {expenses.length > 0 ? (
            <ExpenseTable expenses={expenses} />
          ) : (
            <p className="text-gray-300 text-xs">No expenses to display yet!</p>
          )}
        </main>
      </div>
    </>
  );
}
