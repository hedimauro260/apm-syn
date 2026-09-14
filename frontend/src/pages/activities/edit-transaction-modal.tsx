import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateTransactionMutation } from "@/features/transactions/api/transaction-queries";
import { ACTIVITY_TYPE_LABELS, transactionPartnerLabels } from "./activities-utils";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { ApiError } from "@/services/api/errors";
import type { Transaction } from "@/features/transactions/types/transaction.types";

interface EditTransactionModalProps {
  open: boolean;
  tx: Transaction | null;
  walletNames: Map<string, string>;
  websiteNames: Map<string, string>;
  onClose: () => void;
}

function toDateInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function EditTransactionModal({
  open,
  tx,
  walletNames,
  websiteNames,
  onClose,
}: EditTransactionModalProps) {
  const [quantityStr, setQuantityStr] = useState("");
  const [usdStr, setUsdStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [description, setDescription] = useState("");
  const [countsTowardGoal, setCountsTowardGoal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { toast } = useToast();
  const mutation = useUpdateTransactionMutation();

  useEffect(() => {
    if (open && tx) {
      setQuantityStr(String(tx.quantity));
      setUsdStr(String(tx.usdValue));
      setDateStr(toDateInput(tx.date));
      setTimeStr(toTimeInput(tx.date));
      setDescription(tx.description ?? "");
      setCountsTowardGoal(tx.countsTowardGoal);
      setServerError(null);
    }
  }, [open, tx]);

  const handleSubmit = async () => {
    if (!tx) return;
    setServerError(null);

    const qtyNum = Number(quantityStr.replace(",", "."));
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Invalid amount", "Quantity must be greater than zero.");
      return;
    }
    const qtyParts = quantityStr.replace(",", ".").split(".");
    if (qtyParts[1] && qtyParts[1].length > 8) {
      toast.error("Invalid amount", "Max 8 decimal places.");
      return;
    }

    const usdNum = Number(usdStr.replace(",", "."));
    if (isNaN(usdNum) || usdNum < 0) {
      toast.error("Invalid USD value", "USD value must be greater than or equal to zero.");
      return;
    }

    try {
      await mutation.mutateAsync({
        transactionId: tx.id,
        data: {
          quantity: qtyNum,
          usdValue: usdNum,
          date: new Date(`${dateStr}T${timeStr || "00:00"}:00`).toISOString(),
          description: description.trim() || undefined,
          countsTowardGoal,
        },
      });
      toast.success("Transaction updated", "Transaction updated successfully.");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message || "Failed to update transaction.");
      else setServerError("Unexpected error. Try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit Transaction"
      description={tx ? `Editing ${ACTIVITY_TYPE_LABELS[tx.type]?.toLowerCase() ?? "transaction"} · ${tx.id}` : ""}
    >
      {tx && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface-elevated p-3">
            <span className="text-xs font-medium text-foreground">{ACTIVITY_TYPE_LABELS[tx.type]}</span>
            <span className="text-xs text-foreground-muted">
              {" · "}
              {transactionPartnerLabels(tx, walletNames, websiteNames).join(" → ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={getCoinLogoUrl(tx.asset.externalId, "thumb")}
              alt={tx.asset.symbol}
              className="h-5 w-5 rounded-full"
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-xs font-medium text-foreground">
              {tx.asset.symbol} · {tx.asset.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label required>Quantity</Label>
              <Input
                placeholder="0.00000000"
                value={quantityStr}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  const parts = v.replace(",", ".").split(".");
                  if (parts[1] && parts[1].length > 8) return;
                  setQuantityStr(v);
                }}
                inputMode="decimal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label required>USD value</Label>
              <Input
                placeholder="0.00"
                value={usdStr}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  const parts = v.replace(",", ".").split(".");
                  if (parts[1] && parts[1].length > 8) return;
                  setUsdStr(v);
                }}
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Time</Label>
              <Input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Optional" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox
              checked={countsTowardGoal}
              onChange={e => setCountsTowardGoal((e.target as HTMLInputElement).checked)}
            />
            <span>Count towards goals</span>
          </label>

          {serverError && (
            <Alert variant="danger">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={mutation.isPending} onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}