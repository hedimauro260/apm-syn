import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateWalletSchema, type UpdateWalletFormData } from "@/features/wallets/schemas/wallet.schema";
import { WALLET_TYPES, type Wallet, type WalletType } from "@/features/wallets/types/wallet.types";
import { useUpdateWalletMutation } from "@/features/wallets/api/wallet-queries";
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

interface EditWalletModalProps {
  open: boolean;
  wallet: Wallet | null;
  onClose: () => void;
}

export function EditWalletModal({ open, wallet, onClose }: EditWalletModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const mutation = useUpdateWalletMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateWalletFormData>({
    resolver: zodResolver(updateWalletSchema),
    mode: "onChange",
    defaultValues: { name: "", type: undefined, color: "", description: "" },
  });

  useEffect(() => {
    if (wallet && open) {
      reset({
        name: wallet.name,
        type: wallet.type,
        color: wallet.color ?? "",
        description: wallet.description ?? "",
      });
      setServerError(null);
    }
  }, [wallet, open, reset]);

  const watchedType = watch("type");
  const watchedColor = watch("color");
  const watchedName = watch("name");
  const watchedDescription = watch("description");

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: UpdateWalletFormData) => {
    if (!wallet) return;
    setServerError(null);
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined && data.name !== wallet.name) payload.name = data.name;
    if (data.type !== undefined && data.type !== wallet.type) payload.type = data.type;
    if (data.color !== undefined && data.color !== (wallet.color ?? "")) payload.color = data.color || undefined;
    if (data.description !== undefined && data.description !== (wallet.description ?? "")) payload.description = data.description || undefined;
    if (Object.keys(payload).length === 0) {
      handleClose();
      return;
    }
    try {
      await mutation.mutateAsync({ walletId: wallet.id, data: payload as never });
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "WALLET_ALREADY_EXISTS") {
          setServerError(`Wallet "${String((data as { name?: string }).name)}" already exists.`);
          return;
        }
        if (err.code === "WALLET_ARCHIVED") {
          setServerError("Archived wallet cannot be updated.");
          return;
        }
        setServerError(err.message || "Failed to update wallet.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  const showSummary = Boolean(watchedName || watchedType || watchedColor || watchedDescription);

  return (
    <Dialog open={open} onClose={handleClose} title="Edit Wallet" description={wallet ? `Editing "${wallet.name}"` : ""}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-wallet-name">Wallet Name</Label>
          <Input id="edit-wallet-name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Wallet Type</Label>
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
          <Label htmlFor="edit-wallet-description">Description</Label>
          <Textarea id="edit-wallet-description" rows={3} {...register("description")} aria-invalid={!!errors.description} />
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
          </div>
          {errors.color && <p className="text-xs text-danger">{errors.color.message}</p>}
        </div>

        {showSummary && (
          <div className="rounded-lg border border-border bg-surface-elevated p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Summary</p>
            <div className="flex items-center gap-2 text-xs">
              {watchedColor && <span className="h-3 w-3 rounded-full border border-border" style={{ background: watchedColor }} />}
              <span className="font-medium text-foreground">{watchedName || wallet?.name || "-"}</span>
              <span className="text-foreground-muted">·</span>
              <span className="capitalize text-foreground-secondary">{watchedType || wallet?.type}</span>
            </div>
            {(watchedDescription || wallet?.description) && (
              <p className="text-xs text-foreground-secondary line-clamp-2">{watchedDescription || wallet?.description}</p>
            )}
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
          <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
