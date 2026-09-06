import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatUSD } from "@/lib/formats";
import type { useWalletList } from "@/hooks/use-wallet-list";

type Wallet = ReturnType<typeof useWalletList>["wallets"][number];

interface TransferFormProps {
  wallets: Wallet[];
  fromWalletId: string;
  setFromWalletId: (walletId: string) => void;
  toWalletId: string;
  setToWalletId: (walletId: string) => void;
  currentBalance: (walletId: string) => number;
}

export function TransferForm({
  wallets,
  fromWalletId,
  setFromWalletId,
  toWalletId,
  setToWalletId,
  currentBalance,
}: TransferFormProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>From Wallet</Label>
          <Select value={fromWalletId} onChange={e => setFromWalletId(e.target.value)}>
            <option value="">Select wallet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.type})
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>To Wallet</Label>
          <Select value={toWalletId} onChange={e => setToWalletId(e.target.value)}>
            <option value="">Select wallet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.type})
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
          {fromWalletId ? formatUSD(currentBalance(fromWalletId)) : "$0.00"}
        </div>
        <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
          {toWalletId ? formatUSD(currentBalance(toWalletId)) : "$0.00"}
        </div>
      </div>
    </>
  );
}
