import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { formatUSD } from "@/lib/formats";
import { getWalletAssets } from "@/lib/wallet-utils";
import { useConvertQuery } from "@/features/market-data/api/market-data-queries";
import { AdjustForm } from "@/features/wallet-operations/components/adjust-form";
import { AssetCombobox } from "@/features/wallet-operations/components/asset-combobox";
import { DepositForm } from "@/features/wallet-operations/components/deposit-form";
import { TransferForm } from "@/features/wallet-operations/components/transfer-form";
import { WalletAssetGrid } from "@/features/wallet-operations/components/wallet-asset-grid";
import { WithdrawForm } from "@/features/wallet-operations/components/withdraw-form";
import {
  useDepositMutation,
  useWithdrawMutation,
  useTransferMutation,
  useAdjustMutation,
} from "@/features/wallet-operations/hooks/use-wallet-operations";
import type { AssetInput } from "@/features/wallet-operations/types/wallet-operation.types";
import { ApiError } from "@/services/api/errors";

type TxTab = "deposit" | "withdraw" | "transfer" | "adjust";
type TxStatus = "Completed" | "Pending" | "Failed";
type WizardStep = 1 | 2 | 3;

const TAB_CONFIG: Record<TxTab, { label: string; icon: typeof ArrowDownRight; desc: string }> = {
  deposit: { label: "Deposit", icon: ArrowDownRight, desc: "Add funds" },
  withdraw: { label: "Withdraw", icon: ArrowUpRight, desc: "Remove funds" },
  transfer: { label: "Transfer", icon: ArrowLeftRight, desc: "Move between wallets" },
  adjust: { label: "Adjust", icon: SlidersHorizontal, desc: "Update balance" },
};

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Transaction type & wallet",
  2: "Asset & amount",
  3: "Details & confirm",
};

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: TxTab;
  initialWalletId?: string;
}

export function AddTransactionModal({ open, onClose, initialTab = "deposit", initialWalletId }: AddTransactionModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [activeTab, setActiveTab] = useState<TxTab>(initialTab);
  const [walletId, setWalletId] = useState<string>(initialWalletId ?? "");
  const [fromWalletId, setFromWalletId] = useState<string>(initialWalletId ?? "");
  const [toWalletId, setToWalletId] = useState<string>("");
  const [adjustDirection, setAdjustDirection] = useState<"increase" | "decrease">("increase");
  const [selectedAsset, setSelectedAsset] = useState<AssetInput | null>(null);
  const [quantityStr, setQuantityStr] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => new Date().toTimeString().slice(0, 5));
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [countsTowardGoal, setCountsTowardGoal] = useState(false);
  const [status, setStatus] = useState<TxStatus>("Completed");

  const { toast } = useToast();

  const { wallets, transactions } = useWalletList();
  const { rows: balanceRows } = useWalletBalances(wallets, transactions);

  const balanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of balanceRows) m.set(r.id, r.balance);
    return m;
  }, [balanceRows]);

  const walletAssets = useMemo(
    () => getWalletAssets(walletId, transactions),
    [walletId, transactions],
  );

  const quantityNum = Number(quantityStr.replace(",", "."));
  const validQuantity = !isNaN(quantityNum) && quantityNum > 0;
  const convertQuery = useConvertQuery(selectedAsset?.externalId ?? "", validQuantity ? quantityNum : 0, !!selectedAsset && validQuantity);

  // usdValue derived from convert (market-data) else 0 until loaded
  const usdValue = convertQuery.data?.data?.usdValue ?? 0;

  // Keep derived usdValue display
  const usdDisplay = convertQuery.isFetching ? "Calculating..." : validQuantity && selectedAsset ? formatUSD(usdValue || 0) : "$0.00";

  useEffect(() => {
    if (open) {
      setStep(1);
      setActiveTab(initialTab);
      setWalletId(initialWalletId ?? "");
      setFromWalletId(initialWalletId ?? "");
      setToWalletId("");
      setAdjustDirection("increase");
      setSelectedAsset(null);
      setQuantityStr("");
      setWebsite("");
      setDescription("");
      setCountsTowardGoal(false);
      setStatus("Completed");
      setDateStr(new Date().toISOString().slice(0, 10));
      setTimeStr(new Date().toTimeString().slice(0, 5));
    }
  }, [open, initialTab, initialWalletId]);

  const depositMut = useDepositMutation();
  const withdrawMut = useWithdrawMutation();
  const transferMut = useTransferMutation();
  const adjustMut = useAdjustMutation();

  const isPending = depositMut.isPending || withdrawMut.isPending || transferMut.isPending || adjustMut.isPending;

  const validateQuantity = (v: string) => {
    if (!v) return "Amount is required";
    const n = Number(v.replace(",", "."));
    if (isNaN(n) || n <= 0) return "Must be greater than zero";
    const parts = v.replace(",", ".").split(".");
    if (parts[1] && parts[1].length > 8) return "Max 8 decimal places";
    return null;
  };

  const buildDate = (): string | undefined => {
    if (!dateStr) return undefined;
    const time = timeStr || "00:00";
    const iso = new Date(`${dateStr}T${time}:00`).toISOString();
    return iso;
  };

  const handleSubmit = async () => {
    const qtyErr = validateQuantity(quantityStr);
    if (qtyErr) {
      toast.error("Invalid amount", qtyErr);
      return;
    }
    if (!selectedAsset) {
      toast.error("Asset required", "Select an asset.");
      return;
    }
    const qty = Number(quantityStr.replace(",", "."));
    const usd = convertQuery.data?.data?.usdValue;
    if (usd === undefined || usd === null) {
      toast.error("USD value unavailable", "USD value not available. Try again.");
      return;
    }
    const dateIso = buildDate();
    const desc = description.trim() || undefined;
    // website and status are UI-only awaiting backend (ignored)
    try {
      if (activeTab === "deposit") {
        if (!walletId) {
          toast.error("Wallet required", "Select a wallet.");
          return;
        }
        await depositMut.mutateAsync({
          walletId,
          asset: selectedAsset,
          quantity: qty,
          usdValue: usd,
          date: dateIso,
          countsTowardGoal,
          description: desc,
        });
        toast.success("Deposit created", "Deposit created successfully.");
      } else if (activeTab === "withdraw") {
        if (!walletId) {
          toast.error("Wallet required", "Select a wallet.");
          return;
        }
        await withdrawMut.mutateAsync({
          walletId,
          asset: selectedAsset,
          quantity: qty,
          usdValue: usd,
          date: dateIso,
          description: desc,
        });
        toast.success("Withdrawal created", "Withdrawal created successfully.");
      } else if (activeTab === "transfer") {
        if (!fromWalletId || !toWalletId) {
          toast.error("Wallets required", "Select both wallets.");
          return;
        }
        if (fromWalletId === toWalletId) {
          toast.error("Invalid transfer", "Source and destination must be different.");
          return;
        }
        await transferMut.mutateAsync({
          sourceWalletId: fromWalletId,
          destinationWalletId: toWalletId,
          asset: selectedAsset,
          quantity: qty,
          usdValue: usd,
          date: dateIso,
          description: desc,
        });
        toast.success("Transfer created", "Transfer created successfully.");
      } else if (activeTab === "adjust") {
        if (!walletId) {
          toast.error("Wallet required", "Select a wallet.");
          return;
        }
        await adjustMut.mutateAsync({
          walletId,
          asset: selectedAsset,
          quantity: qty,
          usdValue: usd,
          direction: adjustDirection,
          date: dateIso,
          countsTowardGoal: adjustDirection === "increase" ? countsTowardGoal : false,
          description: desc,
        });
        toast.success("Adjustment created", "Adjustment created successfully.");
      }
      setTimeout(() => onClose(), 800);
    } catch (err) {
      if (err instanceof ApiError) toast.error("Transaction failed", err.message || "Failed to create transaction.");
      else toast.error("Transaction failed", "Unexpected error. Try again.");
    }
  };

  const currentBalance = (id: string) => balanceMap.get(id) ?? 0;

  const selectedWalletName = (id: string | undefined) =>
    wallets.find(w => w.id === id)?.name ?? "";

  const canContinueStep1 = activeTab === "transfer"
    ? !!fromWalletId && !!toWalletId && fromWalletId !== toWalletId
    : !!walletId;

  const canContinueStep2 = !!selectedAsset && validQuantity;

  const goNext = () => {
    if (step === 1 && !canContinueStep1) return;
    if (step === 2 && !canContinueStep2) return;
    setStep(s => (s < 3 ? ((s + 1) as WizardStep) : s));
  };

  const goBack = () => {
    setStep(s => (s > 1 ? ((s - 1) as WizardStep) : s));
  };

  const handleStep1SelectTab = (tab: TxTab) => {
    setActiveTab(tab);
  };

  const assetName =
    selectedAsset && selectedAsset.symbol
      ? `${selectedAsset.symbol} · ${selectedAsset.name}`
      : "";

  return (
    <Dialog open={open} onClose={onClose} title="Add Transaction" description="Create a new transaction.">
      <div className="flex flex-col gap-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {([1, 2, 3] as WizardStep[]).map(s => (
            <div key={s} className="flex-1 flex flex-col gap-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
              <span className={`text-[10px] text-center ${s === step ? "text-foreground" : "text-foreground-muted"}`}>
                {STEP_LABELS[s]}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TAB_CONFIG) as TxTab[]).map(tab => {
                const cfg = TAB_CONFIG[tab];
                const Icon = cfg.icon;
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleStep1SelectTab(tab)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border text-foreground hover:bg-surface-elevated"}`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="font-medium">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === "deposit" && (
              <DepositForm
                wallets={wallets}
                walletId={walletId}
                setWalletId={setWalletId}
                currentBalance={currentBalance}
                countsTowardGoal={countsTowardGoal}
                setCountsTowardGoal={setCountsTowardGoal}
              />
            )}

            {activeTab === "withdraw" && (
              <WithdrawForm
                wallets={wallets}
                walletId={walletId}
                setWalletId={setWalletId}
                currentBalance={currentBalance}
              />
            )}

            {activeTab === "transfer" && (
              <TransferForm
                wallets={wallets}
                fromWalletId={fromWalletId}
                setFromWalletId={setFromWalletId}
                toWalletId={toWalletId}
                setToWalletId={setToWalletId}
                currentBalance={currentBalance}
              />
            )}

            {activeTab === "adjust" && (
              <AdjustForm
                wallets={wallets}
                walletId={walletId}
                setWalletId={setWalletId}
                currentBalance={currentBalance}
                adjustDirection={adjustDirection}
                setAdjustDirection={setAdjustDirection}
                countsTowardGoal={countsTowardGoal}
                setCountsTowardGoal={setCountsTowardGoal}
              />
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" size="sm" onClick={goNext} disabled={!canContinueStep1}>
                Continue <ChevronRight size={14} />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {walletId && walletAssets.length > 0 && (
              <WalletAssetGrid
                assets={walletAssets}
                selectedAsset={selectedAsset}
                onSelect={a => setSelectedAsset(a)}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <AssetCombobox selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} usdDisplay={usdDisplay} />
              <div className="flex flex-col gap-1.5">
                <Label required>Amount</Label>
                <Input
                  placeholder="0.00000000"
                  value={quantityStr}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9.,]/g, "");
                    const parts = v.replace(",", ".").split(".");
                    if (parts[1] && parts[1].length > 8) return;
                    setQuantityStr(v);
                  }}
                  inputMode="decimal"
                />
                <p className="text-[10px] text-foreground-muted">Max 8 decimals · USD {usdDisplay}</p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={goBack}>
                <ChevronLeft size={14} /> Back
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={goNext} disabled={!canContinueStep2}>
                Continue <ChevronRight size={14} />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Review summary */}
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Type</span>
                <span className="font-medium capitalize">{activeTab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Wallet</span>
                <span className="font-medium">
                  {activeTab === "transfer"
                    ? `${selectedWalletName(fromWalletId)} → ${selectedWalletName(toWalletId)}`
                    : selectedWalletName(walletId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Asset</span>
                <span className="font-medium">{assetName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Amount</span>
                <span className="font-medium tabular-nums">
                  {quantityStr || "0"} · {usdDisplay}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Date</Label>
                <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Time</Label>
                <Input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Optional" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Website</Label>
              <Input placeholder="https://example.com (optional)" value={website} onChange={e => setWebsite(e.target.value)} />
              <p className="text-[10px] text-foreground-muted">Awaiting backend — not sent yet.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                {(["Completed", "Pending", "Failed"] as TxStatus[]).map(s => (
                  <Button
                    key={s}
                    type="button"
                    variant={status === s ? "secondary" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-foreground-muted">Status is UI-only awaiting backend.</p>
            </div>

            {(activeTab === "deposit" || (activeTab === "adjust" && adjustDirection === "increase")) && (
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={countsTowardGoal} onChange={e => setCountsTowardGoal((e.target as HTMLInputElement).checked)} />
                <span>Count towards goals</span>
              </label>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={goBack} disabled={isPending}>
                <ChevronLeft size={14} /> Back
              </Button>
              <Button type="button" variant="primary" size="sm" loading={isPending} onClick={handleSubmit}>
                {activeTab === "deposit" ? "Deposit" : activeTab === "withdraw" ? "Withdraw" : activeTab === "transfer" ? "Transfer" : "Adjust"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
