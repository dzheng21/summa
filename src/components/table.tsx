"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Expense } from "../lib/utils";
import { CopyButton } from "./CopyButton";

interface ExpenseTableProps {
  expenses: Expense[];
  error?: string;
  onRetry?: () => void;
}

export default function ExpenseTable({
  expenses,
  error,
  onRetry,
}: ExpenseTableProps) {
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-red-500">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyButton
          text={expenses
            .map((expense) =>
              [
                expense.date
                  ? new Date(expense.date).toLocaleDateString()
                  : "Invalid Date",
                expense.vendor_name,
                expense.category,
                expense.expense_amount
                  ? expense.expense_amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  : "Unknown",
                expense.description,
              ].join("\t")
            )
            .join("\n")}
        />
      </div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expense Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>
                  {expense.date
                    ? new Date(expense.date).toLocaleDateString()
                    : "Invalid Date"}
                </TableCell>
                <TableCell className="font-medium">
                  {expense.vendor_name}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-right">
                  {expense.expense_amount
                    ? `$${expense.expense_amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}`
                    : "Unknown"}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                <strong>
                  {expenses
                    .reduce(
                      (total, expense) =>
                        total + Number(expense.expense_amount ?? 0),
                      Number(0)
                    )
                    .toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                </strong>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-2">
        <p className="text-gray-500 text-sm">
          Doesn&apos;t seem right? AI can be prone to mistakes.{" "}
        </p>
        <button
          onClick={onRetry}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span>Click here to run again</span>
        </button>
      </div>
    </div>
  );
}
