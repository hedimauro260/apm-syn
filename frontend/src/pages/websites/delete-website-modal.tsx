import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Website } from "@/features/websites/types/website.types";
import { useDeleteWebsiteMutation } from "@/features/websites/api/website-queries";
import { ApiError } from "@/services/api/errors";

interface DeleteWebsiteModalProps {
  open: boolean;
  website: Website | null;
  onClose: () => void;
}

export function DeleteWebsiteModal({ open, website, onClose }: DeleteWebsiteModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useDeleteWebsiteMutation();

  const handleDelete = async () => {
    if (!website) return;
    setServerError(null);
    try {
      await mutation.mutateAsync(website.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "WEBSITE_HAS_TRANSACTIONS") {
          setServerError("This website has transactions and cannot be deleted; archive it instead.");
          return;
        }
        setServerError(err.message || "Failed to delete website.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Delete Website" description={website ? `Delete "${website.name}" permanently?` : ""}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground-secondary">This action cannot be undone. All associated data will be removed.</p>
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
          <Button variant="danger" size="sm" loading={mutation.isPending} onClick={handleDelete}>
            Delete Website
          </Button>
        </div>
      </div>
    </Dialog>
  );
}