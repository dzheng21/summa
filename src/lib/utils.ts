import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Expense = {
  vendor_name: string;
  date: string;
  category?: string;
  description?: string;
  expense_amount: number;
};

export type ReceiptItem = {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tags?: string[];
  split_with?: string[];
};

export type Receipt = {
  vendor_name: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  tip?: number;
  total: number;
};

export const expenseExtractionPrompt = `
Extract key attributes from expense-related screenshots or reports and provide the information in a structured JSON format.

Understand that expenses may be derived from various sources like Venmo transactions, credit card transaction images, or SMS notifications. The task is to identify and extract details of each expense transaction, focusing on these key attributes. The expense amount is mandatory and should always be returned if present.

- **Vendor Name**: Identify the name of the vendor or recipient of the transaction.
- **Expense Amount**: This is a crucial field and should be provided whenever possible.
- **Date**: Extract the date when the transaction occurred.
- **Category**: Determine the category of the expense, if mentioned.
- **Description**: Include any remaining relevant information or notes that do not fit into the other fields.

# Output Format

The extracted information should be returned in the following JSON format:

\`\`\`json
{
  "vendor_name": "[Vendor Name]",
  "expense_amount": "[Expense Amount]",
  "date": "[Date]",
  "category": "[Category]",
  "description": "[Description of any extra or contextual information]"
}
\`\`\`

# Notes

- The "expense_amount" field is particularly important and should be prioritized in extraction. This should be a decimal number representing the amount spent. Do not include the curency symbol, such as $ or €.
- If any details are ambiguous or unavailable, provide as accurate an estimation or closest guess based on the provided context.
- Include any additional information outside the specified fields in the "description" to ensure no data is lost.
`;

export type ViewMode = "expense" | "receipt";

// export const expenseExtractionPrompt = `You are a receipt analyzer. Extract the following information from the receipt image:
// - Vendor name
// - Date
// - Category (if applicable)
// - Description (if applicable)
// - Total expense amount

// Return the data in the following JSON format:
// {
//   "vendor_name": "string",
//   "date": "YYYY-MM-DD",
//   "category": "string",
//   "description": "string",
//   "expense_amount": number
// }`;

export const receiptExtractionPrompt = `You are a detailed receipt analyzer. Extract the following information from the receipt image:
- Vendor name
- Date
- Individual items with:
  - Item name
  - Quantity
  - Unit price
  - Total price for the item
- Subtotal
- Tax (if present)
- Tip (if present)
- Total amount

Return the data in the following JSON format:
{
  "vendor_name": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "item_name": "string",
      "quantity": number,
      "unit_price": number,
      "total_price": number,
      "tags": ["string"],
      "split_with": ["string"]
    }
  ],
  "subtotal": number,
  "tax": number,
  "tip": number,
  "total": number
}`;

export function getPromptForMode(mode: ViewMode): string {
  return mode === "expense" ? expenseExtractionPrompt : receiptExtractionPrompt;
}
