import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useCreateGoalMutation } from "@/features/goals/api/goal-queries";
import type { CreateGoalInput, Goal } from "@/features/goals/types/goal.types";
import { dateToISO, roundToTwo } from "./goals-utils";
import { formatUSD } from "@/lib/formats";
import { ApiError } from "@/services/api/errors";

const WEEK_DAYS = 7;

const goalFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80, "Max 80 characters"),
    startDate: z.string().min(1, "Start date is required"),
    distributionType: z.enum(["same", "custom"]),
    totalWeeklyGoal: z.number().positive("Weekly goal must be greater than 0"),
    walletIds: z.array(z.string()).min(1, "Select at least one wallet"),
  })
  .strip();

type GoalFormData = z.infer<typeof goalFormSchema>;

interface NewGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (goal: Goal) => void;
}

export function NewGoalModal({ open, onClose, onCreated }: NewGoalModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [customGoals, setCustomGoals] = useState<Record<string, string>>({});

  const walletsQuery = useWalletsQuery({ limit: 100 });
  const wallets = useMemo(
    () => (walletsQuery.data?.data ?? []).filter(w => w.status === "active"),
    [walletsQuery.data],
  );

  const mutation = useCreateGoalMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      distributionType: "same",
      totalWeeklyGoal: undefined,
      walletIds: [],
    },
  });

  const watchedStartDate = useWatch({ control, name: "startDate" });
  const watchedType = useWatch({ control, name: "distributionType" });
  const watchedGoal = useWatch({ control, name: "totalWeeklyGoal" });
  const watchedWalletIds = useWatch({ control, name: "walletIds" });

  const selectedWallets = useMemo(
    () => wallets.filter(w => watchedWalletIds.includes(w.id)),
    [wallets, watchedWalletIds],
  );

  const evenShare = selectedWallets.length > 0
    ? roundToTwo((Number(watchedGoal) || 0) / selectedWallets.length)
    : 0;

  const customValue = (walletId: string): string => {
    const stored = customGoals[walletId];
    return stored !== undefined ? stored : evenShare.toString();
  };

  const periodEnd = watchedStartDate
    ? format(addDays(parseISO(watchedStartDate), WEEK_DAYS - 1), "EEE, MMM d, yyyy")
    : "—";

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
        distributionType: "same",
        totalWeeklyGoal: undefined,
        walletIds: [],
      });
      setCustomGoals({});
      setServerError(null);
    }
  }, [open, reset]);

  const toggleWallet = (walletId: string) => {
    const current = watchedWalletIds;
    const next = current.includes(walletId)
      ? current.filter(id => id !== walletId)
      : [...current, walletId];
    setValue("walletIds", next, { shouldValidate: true, shouldDirty: true });
  };

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: GoalFormData) => {
    setServerError(null);

    if (!data.startDate) return;
    const start = parseISO(data.startDate);
    const dates = Array.from({ length: WEEK_DAYS }, (_, i) => addDays(start, i));

    const allocations: { walletId: string; weeklyGoal: number }[] = [];

    if (data.distributionType === "same") {
      const even = data.totalWeeklyGoal / selectedWallets.length;
      allocations.push(
        ...selectedWallets.map((w, i) => ({
          walletId: w.id,
          weeklyGoal:
            i === selectedWallets.length - 1
              ? roundToTwo(data.totalWeeklyGoal - even * (selectedWallets.length - 1))
              : roundToTwo(even),
        })),
      );
    } else {
      for (const w of selectedWallets) {
        const parsed = parseFloat(customValue(w.id).replace(",", "."));
        if (isNaN(parsed) || parsed < 0) {
          setServerError(`Enter a valid weekly goal for "${w.name}".`);
          return;
        }
        allocations.push({ walletId: w.id, weeklyGoal: roundToTwo(parsed) });
      }
      const sum = allocations.reduce((acc, a) => acc + a.weeklyGoal, 0);
      if (Math.abs(sum - data.totalWeeklyGoal) > 0.01) {
        setServerError(
          `Custom goals sum to ${formatUSD(sum)} but the weekly goal is ${formatUSD(data.totalWeeklyGoal)}.`,
        );
        return;
      }
    }

    const payload: CreateGoalInput = {
      name: data.name,
      startDate: dateToISO(dates[0]!),
      endDate: dateToISO(dates[WEEK_DAYS - 1]!),
      distributionType: data.distributionType,
      totalWeeklyGoal: data.totalWeeklyGoal,
      wallets: allocations.map(a => ({
        walletId: a.walletId,
        weeklyGoal: a.weeklyGoal,
        days: dates.map(d => ({
          date: dateToISO(d),
          goal: roundToTwo(a.weeklyGoal / WEEK_DAYS),
        })),
      })),
    };

    try {
      const goal = await mutation.mutateAsync(payload);
      handleClose();
      onCreated?.(goal);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || "Failed to create goal.");
      } else {
        setServerError("Unexpected error. Try again.");
      }
    }
  };

  const dailyPreview = selectedWallets.length > 0
    ? `${selectedWallets.length} ${selectedWallets.length === 1 ? "wallet" : "wallets"} · weekly goal ${formatUSD(Number(watchedGoal) || 0)} · ~${formatUSD(evenShare / WEEK_DAYS)}/day each`
    : "Select at least one wallet";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="New Goal"
      description="Set a weekly savings goal and distribute it across wallets."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal-name" required>
            Goal Name
          </Label>
          <Input id="goal-name" placeholder="e.g. Weekly savings" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal-weekly-goal" required>
            Weekly Goal (USD)
          </Label>
          <Input
            id="goal-weekly-goal"
            inputMode="decimal"
            placeholder="0.00"
            {...register("totalWeeklyGoal", { valueAsNumber: true })}
            aria-invalid={!!errors.totalWeeklyGoal}
          />
          {errors.totalWeeklyGoal && <p className="text-xs text-danger">{errors.totalWeeklyGoal.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-start-date">Start Date</Label>
            <Input id="goal-start-date" type="date" {...register("startDate")} aria-invalid={!!errors.startDate} />
            {errors.startDate && <p className="text-xs text-danger">{errors.startDate.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>End Date</Label>
            <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
              {periodEnd}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Distribution</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["same", "custom"] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("distributionType", type, { shouldValidate: true })}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors ${
                  watchedType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface border-border text-foreground hover:bg-surface-elevated"
                }`}
              >
                <span className="font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-foreground-muted">
            {watchedType === "same"
              ? "Every selected wallet receives the same share."
              : "Distribute the weekly goal with a custom split per wallet."}
          </p>
        </div>

        {watchedType === "custom" && selectedWallets.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-3">
            {selectedWallets.map(w => (
              <div key={w.id} className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-foreground">{w.name}</span>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 w-28 text-xs"
                    inputMode="decimal"
                    value={customValue(w.id)}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9.,]/g, "");
                      const parts = value.replace(",", ".").split(".");
                      if (parts[1] && parts[1].length > 2) return;
                      setCustomGoals(prev => ({ ...prev, [w.id]: value }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Wallets</Label>
          {wallets.length === 0 ? (
            <p className="text-xs text-foreground-muted">Create a wallet first to set goals.</p>
          ) : (
            <div className="grid grid-cols-1 gap-1 rounded-lg border border-border bg-surface-elevated p-2 max-h-44 overflow-auto">
              {wallets.map(w => (
                <label key={w.id} className="flex items-center gap-2 px-1.5 py-1 text-xs cursor-pointer hover:bg-surface rounded">
                  <Checkbox
                    checked={watchedWalletIds.includes(w.id)}
                    onChange={() => toggleWallet(w.id)}
                  />
                  <span className="truncate text-foreground">{w.name}</span>
                  <span className="ml-auto text-[10px] text-foreground-muted capitalize">{w.type}</span>
                </label>
              ))}
            </div>
          )}
          {errors.walletIds && <p className="text-xs text-danger">{errors.walletIds.message}</p>}
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated p-3 text-xs">
          <span className="text-foreground-muted">Preview · </span>
          <span className="text-foreground">{dailyPreview}</span>
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
            Create Goal
          </Button>
        </div>
      </form>
    </Dialog>
  );
}