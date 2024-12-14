"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ExpenseTable from "../components/table";
import { Expense } from "../lib/utils";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      vendor_name: "Vendor 1",
      expense_amount: 100,
      date: new Date(),
      category: "Food",
      description: "Lunch",
    },
    {
      vendor_name: "Vendor 2",
      expense_amount: 200,
      date: new Date(),
      category: "Travel",
      description: "Taxi fare",
    },
  ]);

  const onDrop = useCallback((acceptedFiles: any) => {
    setUploadedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = () => {
    setUploadedFile(null);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/summa.svg"
          alt="summa logo"
          width={200}
          height={74}
          priority
        />
        <h1 className="text-xl">Welcome to Summa</h1>
        <h2 className="text-l">Upload your file below</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg ${
            isDragActive ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag & drop some files here, or click to select files</p>
          )}
        </div>
        {uploadedFile && (
          <div className="flex items-center gap-2 mt-4">
            <p>{uploadedFile.name} uploaded</p>
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
        <ExpenseTable expenses={expenses} />
      </main>
    </div>
  );
}
