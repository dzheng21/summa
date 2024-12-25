import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Expense = {
  vendor_name?: string;
  expense_amount?: number; // TODO: This is usually assumed to be USD, but add support for other currencies
  date?: Date;
  category?: string; // TODO: Can be user-designated or configurable in the future
  description?: string;
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
