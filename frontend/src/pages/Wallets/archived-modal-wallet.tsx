import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Wallet } from "@/features/wallets/types/wallet.types";
import { useArchiveWalletMutation } from "@/features/wallets/api/wallet-queries";
import { ApiError } from "@/services/api/errors";

interface ArchiveWalletModalProps {
  open: boolean;
  wallet: Wallet | null;
  onClose: () => void;
  onArchived?: () => void;
}

export function ArchiveWalletModal({ open, wallet, onClose, onArchived }: ArchiveWalletModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useArchiveWalletMutation();

  const handleArchive = async () => {
    if (!wallet) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(wallet.id);
      onClose();
      onArchived?.();
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message || "Failed to archive wallet.");
      else setServerError("Unexpected error. Try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Archive Wallet" description={wallet ? `Archive "${wallet.name}"?` : ""}>
      <div className="flex flex-col gap-4">
        <Alert variant="warning">
          <AlertDescription>Archiving is irreversible. Archived wallets cannot be updated, activated or deactivated.</AlertDescription>
        </Alert>
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
          <Button variant="primary" size="sm" loading={mutation.isPending} onClick={handleArchive}>
            Archive Wallet
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
