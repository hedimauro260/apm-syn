import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateWebsiteSchema, type UpdateWebsiteFormData } from "@/features/websites/schemas/website.schema";
import type { Website } from "@/features/websites/types/website.types";
import { useUpdateWebsiteMutation } from "@/features/websites/api/website-queries";
import { ApiError } from "@/services/api/errors";

interface EditWebsiteModalProps {
  open: boolean;
  website: Website | null;
  onClose: () => void;
}

export function EditWebsiteModal({ open, website, onClose }: EditWebsiteModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useUpdateWebsiteMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateWebsiteFormData>({
    resolver: zodResolver(updateWebsiteSchema),
    mode: "onChange",
    defaultValues: { name: "", url: "", description: "" },
  });

  useEffect(() => {
    if (website && open) {
      reset({
        name: website.name,
        url: website.url ?? "",
        description: website.description ?? "",
      });
      setServerError(null);
    }
  }, [website, open, reset]);

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: UpdateWebsiteFormData) => {
    if (!website) return;
    setServerError(null);

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined && data.name !== website.name) payload.name = data.name;
    if (data.url !== undefined && (data.url ?? "") !== (website.url ?? "")) payload.url = data.url || undefined;
    if (data.description !== undefined && (data.description ?? "") !== (website.description ?? "")) {
      payload.description = data.description || undefined;
    }
    if (Object.keys(payload).length === 0) {
      handleClose();
      return;
    }

    try {
      await mutation.mutateAsync({ websiteId: website.id, data: payload as never });
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "WEBSITE_NAME_ALREADY_EXISTS") {
          setServerError(`Website "${String((data as { name?: string }).name)}" already exists.`);
          return;
        }
        if (err.code === "WEBSITE_ARCHIVED") {
          setServerError("Archived website cannot be updated.");
          return;
        }
        setServerError(err.message || "Failed to update website.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Edit Website" description={website ? `Editing "${website.name}"` : ""}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-website-name" required>
            Website Name
          </Label>
          <Input id="edit-website-name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-website-url">Site URL</Label>
          <Input id="edit-website-url" placeholder="https://example.com" {...register("url")} aria-invalid={!!errors.url} />
          {errors.url && <p className="text-xs text-danger">{errors.url.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-website-description">Description</Label>
          <Textarea id="edit-website-description" placeholder="Optional description (max 500)" rows={3} {...register("description")} aria-invalid={!!errors.description} />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>

        {serverError && (
          <Alert variant="danger">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}