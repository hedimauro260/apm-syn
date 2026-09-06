import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatUSD } from "@/lib/formats";
import { Minus, Plus } from "lucide-react";
import type { useWalletList } from "@/hooks/use-wallet-list";

type Wallet = ReturnType<typeof useWalletList>["wallets"][number];
type AdjustDirection = "increase" | "decrease";

interface AdjustFormProps {
  wallets: Wallet[];
  walletId: string;
  setWalletId: (walletId: string) => void;
  currentBalance: (walletId: string) => number;
  adjustDirection: AdjustDirection;
  setAdjustDirection: (direction: AdjustDirection) => void;
  countsTowardGoal: boolean;
  setCountsTowardGoal: (countsTowardGoal: boolean) => void;
}

export function AdjustForm({
  wallets,
  walletId,
  setWalletId,
  currentBalance,
  adjustDirection,
  setAdjustDirection,
  countsTowardGoal,
  setCountsTowardGoal,
}: AdjustFormProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Wallet</Label>
          <Select value={walletId} onChange={e => setWalletId(e.target.value)}>
            <option value="">Select wallet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.type})
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Current Balance</Label>
          <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
            {walletId ? formatUSD(currentBalance(walletId)) : "$0.00"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Adjustment Direction</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={adjustDirection === "increase" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAdjustDirection("increase")}
            className="gap-1"
          >
            <Plus size={14} /> Add
          </Button>
          <Button
            type="button"
            variant={adjustDirection === "decrease" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAdjustDirection("decrease")}
            className="gap-1"
          >
            <Minus size={14} /> Remove
          </Button>
        </div>
      </div>

      {adjustDirection === "increase" && (
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox checked={countsTowardGoal} onChange={e => setCountsTowardGoal((e.target as HTMLInputElement).checked)} />
          <span>Count towards goals</span>
        </label>
      )}
    </>
  );
}
