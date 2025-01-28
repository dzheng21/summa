import { ViewMode } from "@/lib/utils";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 p-1 w-fit">
      <button
        onClick={() => onChange("expense")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          mode === "expense"
            ? "bg-blue-500 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Expense
      </button>
      <button
        onClick={() => onChange("receipt")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          mode === "receipt"
            ? "bg-blue-500 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Receipt
      </button>
    </div>
  );
}
