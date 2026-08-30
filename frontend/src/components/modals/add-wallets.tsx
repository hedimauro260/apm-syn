import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createWalletSchema, type CreateWalletFormData } from "@/features/wallets/schemas/wallet.schema";
import { WALLET_TYPES, type WalletType } from "@/features/wallets/types/wallet.types";
import { useCreateWalletMutation } from "@/features/wallets/api/wallet-queries";
import { ApiError } from "@/services/api/errors";

const COLOR_OPTIONS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"];

const TYPE_LABELS: Record<WalletType, string> = {
  exchange: "Exchange",
  crypto: "Crypto",
  microwallet: "Microwallet",
  hardware: "Hardware",
  banking: "Banking",
  other: "Other",
};

interface AddWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddWalletModal({ open, onClose }: AddWalletModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useCreateWalletMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
    mode: "onChange",
    defaultValues: { name: "", type: "crypto", color: "", description: "" },
  });

  const watchedType = watch("type");
  const watchedColor = watch("color");
  const watchedName = watch("name");
  const watchedDescription = watch("description");

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: CreateWalletFormData) => {
    setServerError(null);
    const payload = {
      name: data.name,
      type: data.type,
      color: data.color || undefined,
      description: data.description || undefined,
    };
    try {
      await mutation.mutateAsync(payload);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "WALLET_ALREADY_EXISTS") {
          setServerError(`Wallet "${data.name}" already exists.`);
          return;
        }
        setServerError(err.message || "Failed to create wallet.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  const showSummary = Boolean(watchedName || watchedType || watchedColor || watchedDescription);

  return (
    <Dialog open={open} onClose={handleClose} title="New Wallet" description="Create a new wallet to organize your assets.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wallet-name" required>
            Wallet Name
          </Label>
          <Input id="wallet-name" placeholder="e.g. Main Wallet" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label required>Wallet Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {WALLET_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("type", t, { shouldValidate: true, shouldDirty: true })}
                className={`rounded-lg border p-3 text-xs font-medium capitalize transition-colors ${
                  watchedType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface border-border text-foreground hover:bg-surface-elevated"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wallet-description">Description</Label>
          <Textarea id="wallet-description" placeholder="Optional description (max 500)" rows={3} {...register("description")} aria-invalid={!!errors.description} />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Wallet Color</Label>
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
            {watchedColor && !COLOR_OPTIONS.includes(watchedColor) && (
              <span className="h-8 w-8 rounded-full border-2 border-foreground" style={{ background: watchedColor }} />
            )}
          </div>
          {errors.color && <p className="text-xs text-danger">{errors.color.message}</p>}
        </div>

        {showSummary && (
          <div className="rounded-lg border border-border bg-surface-elevated p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Summary</p>
            <div className="flex items-center gap-2 text-xs">
              {watchedColor && <span className="h-3 w-3 rounded-full border border-border" style={{ background: watchedColor }} />}
              <span className="font-medium text-foreground">{watchedName || "-"}</span>
              <span className="text-foreground-muted">·</span>
              <span className="capitalize text-foreground-secondary">{watchedType}</span>
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
            Create Wallet
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
