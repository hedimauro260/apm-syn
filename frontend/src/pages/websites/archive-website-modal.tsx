import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Website } from "@/features/websites/types/website.types";
import { useArchiveWebsiteMutation } from "@/features/websites/api/website-queries";
import { ApiError } from "@/services/api/errors";

interface ArchiveWebsiteModalProps {
  open: boolean;
  website: Website | null;
  onClose: () => void;
  onArchived?: () => void;
}

export function ArchiveWebsiteModal({ open, website, onClose, onArchived }: ArchiveWebsiteModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useArchiveWebsiteMutation();

  const handleArchive = async () => {
    if (!website) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(website.id);
      onClose();
      onArchived?.();
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message || "Failed to archive website.");
      else setServerError("Unexpected error. Try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Archive Website" description={website ? `Archive "${website.name}"?` : ""}>
      <div className="flex flex-col gap-4">
        <Alert variant="warning">
          <AlertDescription>Archiving is irreversible. Archived websites cannot update or record earnings and withdrawals.</AlertDescription>
        </Alert>
        {website && (
          <div className="rounded-lg border border-border bg-surface-elevated p-3 text-xs">
            <span className="font-medium text-foreground">{website.name}</span>
            {website.url && <span className="text-foreground-muted"> · {website.url}</span>}
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
            Archive Website
          </Button>
        </div>
      </div>
    </Dialog>
  );
}