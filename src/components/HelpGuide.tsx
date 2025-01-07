"use client";

import { useState } from "react";

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-6 h-6 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-gray-600 hover:text-gray-600 transition-colors"
        aria-label="Help"
      >
        ?
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-4 right-4 z-50 bg-white p-6 rounded-lg shadow-lg min-w-[320px] max-w-[400px]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-l font-semibold">How to use Summa</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <ol className="text-sm text-gray-600 space-y-3">
              <li>
                1. Upload your receipt by dragging and dropping or clicking to
                select
              </li>
              <li>
                2. Click &ldquo;Send Request&rdquo; to process the receipt
              </li>
              <li>3. View your extracted expenses in the table below</li>
              <li>4. Use the copy button to copy expense data</li>
            </ol>
          </div>
        </>
      )}
    </>
  );
}
