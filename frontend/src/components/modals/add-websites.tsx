import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createWebsiteSchema, type CreateWebsiteFormData } from "@/features/websites/schemas/website.schema";
import { useCreateWebsiteMutation } from "@/features/websites/api/website-queries";
import { ApiError } from "@/services/api/errors";

const COLOR_OPTIONS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"];

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
}

type AddWebsiteFormData = CreateWebsiteFormData & {
  color?: string;
  initialBalance?: string;
  date?: string;
  time?: string;
};

export function AddWebsiteModal({ open, onClose }: AddWebsiteModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useCreateWebsiteMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<AddWebsiteFormData>({
    resolver: zodResolver(
      createWebsiteSchema.extend({
        color: z.string().optional(),
        initialBalance: z.string().optional(),
      })
    ),
    mode: "onChange",
    defaultValues: { name: "", url: "", description: "", color: "", initialBalance: "" },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedUrl = useWatch({ control, name: "url" });
  const watchedColor = useWatch({ control, name: "color" });
  const watchedDescription = useWatch({ control, name: "description" });
  const watchedInitialBalance = useWatch({ control, name: "initialBalance" });

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: AddWebsiteFormData) => {
    setServerError(null);
    const initialBalance = parseFloat(data.initialBalance?.replace(",", ".") ?? "");
    const payload = {
      name: data.name,
      url: data.url || undefined,
      description: data.description || undefined,
      initialBalance: !isNaN(initialBalance) && initialBalance > 0 ? initialBalance : undefined,
    };
    try {
      await mutation.mutateAsync(payload);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "WEBSITE_ALREADY_EXISTS") {
          setServerError(`Website "${data.name}" already exists.`);
          return;
        }
        setServerError(err.message || "Failed to create website.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  const showSummary = Boolean(watchedName || watchedUrl || watchedColor || watchedDescription || watchedInitialBalance);

  const formatBalance = (value?: string) => {
    if (!value) return null;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return null;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  const formattedBalance = formatBalance(watchedInitialBalance);

  return (
    <Dialog open={open} onClose={handleClose} title="New Website" description="Add a website to track your earnings and withdrawals.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website-name" required>
            Website Name
          </Label>
          <Input id="website-name" placeholder="e.g. AdSense, AdMob" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website-url">Site URL</Label>
          <Input id="website-url" placeholder="https://example.com" {...register("url")} aria-invalid={!!errors.url} />
          {errors.url && <p className="text-xs text-danger">{errors.url.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website-balance">Initial Balance</Label>
          <Input
            id="website-balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("initialBalance")}
            aria-invalid={!!errors.initialBalance}
          />
          {errors.initialBalance && <p className="text-xs text-danger">{errors.initialBalance.message}</p>}
          <p className="text-[10px] text-foreground-muted">Balance existing before the first entry.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website-description">Description</Label>
          <Textarea id="website-description" placeholder="Optional description (max 500)" rows={3} {...register("description")} aria-invalid={!!errors.description} />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Website Color</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                aria-label={`Select color ${c}`}
                onClick={() => setValue("color", c, { shouldValidate: true, shouldDirty: true })}
                className={`h-8 w-8 rounded-full border-2 transition-all ${watchedColor === c ? "border-foreground scale-110" : "border-border"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {showSummary && (
          <div className="rounded-lg border border-border bg-surface-elevated p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Summary</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {watchedColor && <span className="h-3 w-3 rounded-full border border-border shrink-0" style={{ background: watchedColor }} />}
              <span className="font-medium text-foreground">{watchedName || "-"}</span>
              {watchedUrl && (
                <>
                  <span className="text-foreground-muted">·</span>
                  <span className="text-foreground-secondary truncate max-w-50">{watchedUrl}</span>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              {formattedBalance && (
                <div className="flex items-center gap-2">
                  <span className="text-foreground-muted">Balance:</span>
                  <span className="font-medium text-foreground tabular-nums">{formattedBalance}</span>
                </div>
              )}
            </div>
            {watchedDescription && <p className="text-xs text-foreground-secondary line-clamp-2">{watchedDescription}</p>}
          </div>
        )}

        {serverError && (
          <Alert variant="danger">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={mutation.isPending} disabled={!isValid}>
            Create Website
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
