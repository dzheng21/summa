"use client";

import Image from "next/image";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Image
          src="/check.svg"
          alt="Copied"
          width={16}
          height={16}
          className="text-green-500"
        />
      ) : (
        <Image src="/copy.svg" alt="Copy" width={16} height={16} />
      )}
    </button>
  );
}
