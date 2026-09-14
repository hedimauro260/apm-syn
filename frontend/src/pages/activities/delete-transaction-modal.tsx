import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeleteTransactionMutation } from "@/features/transactions/api/transaction-queries";
import { ACTIVITY_TYPE_LABELS, transactionPartnerLabels } from "./activities-utils";
import { formatUSD } from "@/lib/formats";
import { ApiError } from "@/services/api/errors";
import type { Transaction } from "@/features/transactions/types/transaction.types";

interface DeleteTransactionModalProps {
  open: boolean;
  tx: Transaction | null;
  walletNames: Map<string, string>;
  websiteNames: Map<string, string>;
  onClose: () => void;
}

export function DeleteTransactionModal({
  open,
  tx,
  walletNames,
  websiteNames,
  onClose,
}: DeleteTransactionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useDeleteTransactionMutation();

  const handleDelete = async () => {
    if (!tx) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(tx.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message || "Failed to delete transaction.");
      else setServerError("Unexpected error. Try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Transaction"
      description={tx ? `Delete this ${ACTIVITY_TYPE_LABELS[tx.type]?.toLowerCase() ?? "transaction"} permanently?` : ""}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground-secondary">This action cannot be undone. Associated data will be removed.</p>
        {tx && (
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface-elevated p-3 text-xs">
            <span className="font-medium text-foreground">
              {ACTIVITY_TYPE_LABELS[tx.type]} · {transactionPartnerLabels(tx, walletNames, websiteNames).join(" → ")}
            </span>
            <span className="text-foreground-muted tabular-nums">
              {tx.quantity.toLocaleString()} {tx.asset.symbol} · {formatUSD(tx.usdValue)}
            </span>
          </div>
        )}
        {serverError && (
          <Alert variant="danger">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={mutation.isPending} onClick={handleDelete}>
            Delete Transaction
          </Button>
        </div>
      </div>
    </Dialog>
  );
}