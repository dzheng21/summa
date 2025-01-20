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
import { Receipt } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface ReceiptViewProps {
  receipt: Receipt | null;
  error?: string;
  onRetry?: () => void;
}

export default function ReceiptView({
  receipt,
  error,
  onRetry,
}: ReceiptViewProps) {
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

  if (
    !receipt ||
    !receipt.line_items ||
    !receipt.vendor_info ||
    !receipt.totals
  ) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-red-500">Invalid receipt data received</p>
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

  const formatCurrency = (amount: number): string => {
    if (amount === null) {
      return "$0.00";
    }
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const generateCopyText = (): string => {
    const items = receipt.line_items
      .map(
        (item) =>
          `${item.item_name}\t${item.quantity}x\t${formatCurrency(
            item.unit_price
          )}\t${formatCurrency(item.subtotal)}`
      )
      .join("\n");

    return `${receipt.vendor_info.name}
${receipt.vendor_info.date}

Items:
${items}

Subtotal: ${formatCurrency(receipt.totals.subtotal)}
Tax: ${formatCurrency(receipt.totals.tax)}
${receipt.totals.tip ? `Tip: ${formatCurrency(receipt.totals.tip)}\n` : ""}
Total: ${formatCurrency(receipt.totals.total)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{receipt.vendor_info.name}</h3>
          <p className="text-sm text-gray-500">{receipt.vendor_info.date}</p>
          {receipt.vendor_info.location && (
            <p className="text-sm text-gray-500">
              {receipt.vendor_info.location}
            </p>
          )}
        </div>
        <CopyButton text={generateCopyText()} />
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableCaption>Receipt Details</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.line_items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.item_name}
                  {item.notes && (
                    <span className="text-sm text-gray-500 block">
                      {item.notes}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unit_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Subtotal</TableCell>
              <TableCell className="text-right">
                {formatCurrency(receipt.totals.subtotal)}
              </TableCell>
            </TableRow>
            {receipt.additional_charges?.map((charge, index) => (
              <TableRow key={`charge-${index}`}>
                <TableCell colSpan={3}>{charge.charge_name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(charge.amount)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>Tax</TableCell>
              <TableCell className="text-right">
                {formatCurrency(receipt.totals.tax)}
              </TableCell>
            </TableRow>
            {receipt.totals.tip !== undefined && (
              <TableRow>
                <TableCell colSpan={3}>
                  Tip
                  {receipt.totals.tip_percentage !== undefined &&
                    ` (${receipt.totals.tip_percentage}%)`}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(receipt.totals.tip)}
                </TableCell>
              </TableRow>
            )}
            <TableRow className="font-bold">
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(receipt.totals.total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

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
