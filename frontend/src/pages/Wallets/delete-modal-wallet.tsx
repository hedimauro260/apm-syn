import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Wallet } from "@/features/wallets/types/wallet.types";
import { useDeleteWalletMutation } from "@/features/wallets/api/wallet-queries";
import { ApiError } from "@/services/api/errors";

interface DeleteWalletModalProps {
  open: boolean;
  wallet: Wallet | null;
  onClose: () => void;
}

export function DeleteWalletModal({ open, wallet, onClose }: DeleteWalletModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useDeleteWalletMutation();

  const handleDelete = async () => {
    if (!wallet) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(wallet.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message || "Failed to delete wallet.");
      else setServerError("Unexpected error. Try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Delete Wallet" description={wallet ? `Delete "${wallet.name}" permanently?` : ""}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground-secondary">This action cannot be undone. All associated data will be removed.</p>
        {wallet && (
          <div className="rounded-lg border border-border bg-surface-elevated p-3 text-xs">
            <span className="font-medium text-foreground">{wallet.name}</span>
            <span className="text-foreground-muted"> · {wallet.type}</span>
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
            Delete Wallet
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
