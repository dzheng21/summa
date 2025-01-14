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
  receipt: Receipt;
  error?: string;
  onRetry?: () => void;
}

export default function ReceiptView({
  receipt,
  error,
  onRetry,
}: ReceiptViewProps) {
  console.log("ReceiptView Render:", { receipt, error });

  if (!receipt || !receipt.items) {
    console.error("Invalid receipt data:", receipt);
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{receipt.vendor_name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(receipt.date).toLocaleDateString()}
          </p>
        </div>
        <CopyButton
          text={`${receipt.vendor_name}\n${new Date(
            receipt.date
          ).toLocaleDateString()}\n\nItems:\n${receipt.items
            .map(
              (item) =>
                `${item.item_name}\t${
                  item.quantity
                }x\t${item.unit_price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}\t${item.total_price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}`
            )
            .join("\n")}\n\nSubtotal: ${receipt.subtotal.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
            }
          )}\nTax: ${(receipt.tax || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}\nTip: ${(receipt.tip || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}\nTotal: ${receipt.total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}`}
        />
      </div>

      <Table>
        <TableCaption>Receipt Details</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Split With</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipt.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.item_name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {item.unit_price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
              <TableCell className="text-right">
                {item.total_price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
              <TableCell>{item.tags?.join(", ") || "-"}</TableCell>
              <TableCell>{item.split_with?.join(", ") || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Subtotal</TableCell>
            <TableCell className="text-right">
              {receipt.subtotal.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
          {receipt.tax && (
            <TableRow>
              <TableCell colSpan={3}>Tax</TableCell>
              <TableCell className="text-right">
                {receipt.tax.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          )}
          {receipt.tip && (
            <TableRow>
              <TableCell colSpan={3}>Tip</TableCell>
              <TableCell className="text-right">
                {receipt.tip.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          )}
          <TableRow className="font-bold">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {receipt.total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
