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

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <Table>
      <TableCaption>your extracted expenses!</TableCaption>
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
            <TableCell className="font-medium">{expense.vendor_name}</TableCell>
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
                (total, expense) => total + Number(expense.expense_amount ?? 0),
                Number(0)
              )
              .toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
