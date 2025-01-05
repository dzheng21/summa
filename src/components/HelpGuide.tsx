"use client";

export function HelpGuide() {
  return (
    <div className="absolute top-4 right-4">
      <div className="group relative inline-block">
        <button
          className="w-6 h-6 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-gray-600 hover:text-gray-600 transition-colors"
          aria-label="Help"
        >
          ?
        </button>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-4 rounded-lg shadow-lg max-w-xs absolute right-0 mt-2 z-10">
          <h3 className="font-medium mb-2">How to use Summa</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li>
              1. Upload your receipt by dragging and dropping or clicking to
              select
            </li>
            <li>2. Click "Send Request" to process the receipt</li>
            <li>3. View your extracted expenses in the table below</li>
            <li>4. Use the copy button to copy expense data</li>
          </ol>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 right-0 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          How do I use Summa?
        </div>
      </div>
    </div>
  );
}
