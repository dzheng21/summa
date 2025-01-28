import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add this function before the Home component
export function getPromptForMode(mode: ViewMode) {
  return mode === "expense" ? expenseExtractionPrompt : receiptExtractionPrompt;
}

export type Expense = {
  vendor_name: string;
  expense_amount: number; // TODO: This is usually assumed to be USD, but add support for other currencies
  date: Date;
  category?: string; // TODO: Can be user-designated or configurable in the future
  description?: string;
};

export type ReceiptItem = {
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
};

export type AdditionalCharge = {
  charge_name: string;
  amount: number;
};

export type Receipt = {
  vendor_info: {
    name: string;
    location?: string;
    date: string;
    time?: string;
  };
  line_items: ReceiptItem[];
  additional_charges: AdditionalCharge[];
  totals: {
    subtotal: number;
    tax: number;
    tip?: number;
    tip_percentage?: number;
    total: number;
  };
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

export const receiptExtractionPrompt = `
Extract detailed information from receipt images, including itemized entries and totals, and provide the data in a structured JSON format.

Understand that receipts can vary significantly in format and may come from different types of vendors (restaurants, retail stores, services). The goal is to capture both the overall receipt details and individual line items accurately.

Key Components to Extract:

- **Receipt Header**:
  - Vendor name and location
  - Transaction date and time

- **Line Items**:
  For each item on the receipt:
  - Item name/description
  - Quantity
  - Unit price
  - Item subtotal

- **Additional Charges**:
  Examples: Service charges, Kitchen/processing fees, Delivery fees, Platform fees, Any other miscellaneous charges
  - Charge name
  - Amount

- **Totals Section**:
  - Subtotal (before tax/fees)
  - Tax amount
  - Tip amount (if applicable)
  - Tip percentage (if applicable)
  - Final total

# Output Format

The extracted information should be returned in the following JSON format:

\`\`\`json
{
  "vendor_info": {
    "name": "[Vendor Name]",
    "location": "[Location if available]",
    "date": "[Transaction Date]",
    "time": "[Transaction Time]",
  },
  "line_items": [
    {
      "item_name": "[Item Description]",
      "quantity": "[Quantity]",
      "unit_price": "[Price per Unit]",
      "subtotal": "[Item Subtotal]",
      "notes": "[Any modifiers or special instructions]"
    }
  ],
  "additional_charges": [
    {
      "charge_name": "[Name of Fee/Charge]",
      "amount": "[Amount]"
    }
  ],
  "totals": {
    "subtotal": "[Subtotal before tax/fees]",
    "tax": "[Tax Amount]",
    "tip": "[Tip Amount if applicable]",
    "tip_percentage": "[Tip Percentage if applicable]",
    "total": "[Final Total]"
  }
}
\`\`\`

# Notes

- All monetary values should be returned as decimal numbers without currency symbols
- Quantities should be numeric integer values
- If an item's quantity is not explicitly stated, assume 1
- For missing or unclear values, provide null rather than making assumptions
- Capture any special instructions or modifiers in the line item's "notes" field
- If multiple taxes or fees exist, list each separately in additional_charges
`;
