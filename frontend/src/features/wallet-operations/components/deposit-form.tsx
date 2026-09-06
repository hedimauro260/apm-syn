import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatUSD } from "@/lib/formats";
import type { useWalletList } from "@/hooks/use-wallet-list";

type Wallet = ReturnType<typeof useWalletList>["wallets"][number];

interface DepositFormProps {
  wallets: Wallet[];
  walletId: string;
  setWalletId: (walletId: string) => void;
  currentBalance: (walletId: string) => number;
  countsTowardGoal: boolean;
  setCountsTowardGoal: (countsTowardGoal: boolean) => void;
}

export function DepositForm({
  wallets,
  walletId,
  setWalletId,
  currentBalance,
  countsTowardGoal,
  setCountsTowardGoal,
}: DepositFormProps) {
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

      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <Checkbox checked={countsTowardGoal} onChange={e => setCountsTowardGoal((e.target as HTMLInputElement).checked)} />
        <span>Count towards goals</span>
      </label>
    </>
  );
}
