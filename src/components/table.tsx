import {
  Table,
  TableBody,
  TableCaption,
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
                expense.vendor_name,
                expense.date
                  ? new Date(expense.date).toLocaleDateString()
                  : "Invalid Date",
                expense.category,
                expense.description,
                expense.expense_amount
                  ? expense.expense_amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                  : "Unknown",
              ].join("\t")
            )
            .join("\n")}
        />
      </div>
      <Table>
        <TableCaption>your extracted expenses!</TableCaption>
        <div className="w-full overflow-x-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Expense Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {expense.vendor_name}
                </TableCell>
                <TableCell>
                  {expense.date
                    ? new Date(expense.date).toLocaleDateString()
                    : "Invalid Date"}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  {expense.expense_amount
                    ? expense.expense_amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })
                    : "Unknown"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-left">
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
              </TableCell>
            </TableRow>
          </TableFooter>
        </div>
      </Table>

      <div className="flex justify-center mt-6">
        <button
          onClick={onRetry}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span>
            doesn&apos;t seem right? AI can be prone to mistakes. Click to run
            again
          </span>
        </button>
      </div>
    </div>
  );
}
