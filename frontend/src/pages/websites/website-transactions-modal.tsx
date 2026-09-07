import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { TrendingDown, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { formatUSD } from "@/lib/formats";
import { getWalletAssets } from "@/lib/wallet-utils";
import { AssetCombobox } from "@/features/wallet-operations/components/asset-combobox";
import { WalletAssetGrid } from "@/features/wallet-operations/components/wallet-asset-grid";
import {
  useRecordEarningMutation,
  useWithdrawFromWebsiteMutation,
} from "@/features/website-operations/hooks/use-website-operations";
import type { AssetInput } from "@/features/website-operations/types/website-operation.types";
import { ApiError } from "@/services/api/errors";

type WsTab = "earnings" | "withdrawn";
type WsStatus = "Completed" | "Pending" | "Failed";
type WizardStep = 1 | 2 | 3;

const TAB_CONFIG: Record<WsTab, { label: string; icon: typeof TrendingUp; desc: string }> = {
  earnings: { label: "Earnings", icon: TrendingUp, desc: "Add website earnings" },
  withdrawn: { label: "Withdrawn", icon: TrendingDown, desc: "Withdraw to a wallet" },
};

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Transaction type & wallet",
  2: "Asset & amount",
  3: "Details & confirm",
};

// Earning são registradas em USD; usamos um ativo sintético para o contrato do backend.
const USD_ASSET: AssetInput = { externalId: "usd", symbol: "USD", name: "US Dollar" };

interface WebsiteTransactionsModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: WsTab;
  initialWebsiteId?: string;
}

export function WebsiteTransactionsModal({ open, onClose, initialTab = "earnings", initialWebsiteId }: WebsiteTransactionsModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [activeTab, setActiveTab] = useState<WsTab>(initialTab);
  const [websiteId, setWebsiteId] = useState(initialWebsiteId ?? "");
  const [walletId, setWalletId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<AssetInput | null>(null);
  const [usdStr, setUsdStr] = useState("");
  const [quantityStr, setQuantityStr] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => new Date().toTimeString().slice(0, 5));
  const [description, setDescription] = useState("");
  const [countsTowardGoal, setCountsTowardGoal] = useState(false);
  const [status, setStatus] = useState<WsStatus>("Completed");

  const { toast } = useToast();

  const { wallets, transactions } = useWalletList();
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const websites = websitesQuery.data?.data ?? [];

  const { rows: balanceRows } = useWalletBalances(wallets, transactions);

  const walletBalanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of balanceRows) m.set(r.id, r.balance);
    return m;
  }, [balanceRows]);

  const websiteBalanceMap = useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of websites) balances.set(w.id, 0);
    for (const tx of transactions) {
      if (tx.destination.type === "WEBSITE" && tx.destination.id) {
        balances.set(tx.destination.id, (balances.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
      if (tx.source.type === "WEBSITE" && tx.source.id) {
        balances.set(tx.source.id, (balances.get(tx.source.id) ?? 0) - tx.usdValue);
      }
    }
    return balances;
  }, [websites, transactions]);

  const walletAssets = useMemo(
    () => getWalletAssets(walletId, transactions),
    [walletId, transactions],
  );

  const usdNum = Number(usdStr.replace(",", ".")) || 0;
  const validUsd = !isNaN(usdNum) && usdNum > 0;
  const quantityNum = Number(quantityStr.replace(",", ".")) || 0;
  const validQuantity = !isNaN(quantityNum) && quantityNum > 0;

  useEffect(() => {
    if (open) {
      setStep(1);
      setActiveTab(initialTab);
      setWebsiteId(initialWebsiteId ?? "");
      setWalletId("");
      setSelectedAsset(null);
      setUsdStr("");
      setQuantityStr("");
      setCountsTowardGoal(false);
      setStatus("Completed");
      setDescription("");
      setDateStr(new Date().toISOString().slice(0, 10));
      setTimeStr(new Date().toTimeString().slice(0, 5));
    }
  }, [open, initialTab, initialWebsiteId]);

  const recordMut = useRecordEarningMutation();
  const withdrawMut = useWithdrawFromWebsiteMutation();
  const isPending = recordMut.isPending || withdrawMut.isPending;

  const buildDate = (): string | undefined => {
    if (!dateStr) return undefined;
    const time = timeStr || "00:00";
    return new Date(`${dateStr}T${time}:00`).toISOString();
  };

  const handleSubmit = async () => {
    const dateIso = buildDate();
    const desc = description.trim() || undefined;
    try {
      if (activeTab === "earnings") {
        if (!websiteId) {
          toast.error("Website required", "Select a website.");
          return;
        }
        await recordMut.mutateAsync({
          websiteId,
          asset: USD_ASSET,
          quantity: usdNum,
          usdValue: usdNum,
          date: dateIso,
          description: desc,
        });
        toast.success("Earning added", "Earning added successfully.");
      } else {
        if (!websiteId || !walletId || !selectedAsset) {
          toast.error("Missing fields", "Select the website, wallet and asset.");
          return;
        }
        await withdrawMut.mutateAsync({
          websiteId,
          walletId,
          asset: selectedAsset,
          quantity: quantityNum,
          usdValue: usdNum,
          date: dateIso,
          countsTowardGoal,
          description: desc,
        });
        toast.success("Withdrawal created", "Withdrawal created successfully.");
      }
      setTimeout(() => onClose(), 800);
    } catch (err) {
      if (err instanceof ApiError) toast.error("Operation failed", err.message || "Failed to create transaction.");
      else toast.error("Operation failed", "Unexpected error. Try again.");
    }
  };

  const websiteBalance = (id: string) => Math.max(0, websiteBalanceMap.get(id) ?? 0);
  const walletBalance = (id: string) => walletBalanceMap.get(id) ?? 0;

  const selectedWebsiteName = websites.find(w => w.id === websiteId)?.name ?? "";
  const selectedWalletName = (id: string) => wallets.find(w => w.id === id)?.name ?? "";
  const assetName = selectedAsset ? `${selectedAsset.symbol} · ${selectedAsset.name}` : "";

  const canContinueStep1 = !!websiteId;

  const canContinueStep2 = activeTab === "earnings"
    ? validUsd
    : !!walletId && !!selectedAsset && validUsd && validQuantity;

  const goNext = () => {
    if (step === 1 && !canContinueStep1) return;
    if (step === 2 && !canContinueStep2) return;
    setStep(s => (s < 3 ? ((s + 1) as WizardStep) : s));
  };

  const goBack = () => {
    setStep(s => (s > 1 ? ((s - 1) as WizardStep) : s));
  };

  const usdDisplay = validUsd ? formatUSD(usdNum) : "$0.00";

  return (
    <Dialog open={open} onClose={onClose} title="Add Transaction" description="Record earnings or withdrawals for a website.">
      <div className="flex flex-col gap-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {([1, 2, 3] as WizardStep[]).map(s => (
            <div key={s} className="flex-1 flex flex-col gap-1">
              <div className={`h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
              <span className={`text-[10px] text-center ${s === step ? "text-foreground" : "text-foreground-muted"}`}>
                {STEP_LABELS[s]}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TAB_CONFIG) as WsTab[]).map(tab => {
                const cfg = TAB_CONFIG[tab];
                const Icon = cfg.icon;
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border text-foreground hover:bg-surface-elevated"}`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="font-medium">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label required>Website</Label>
                <Select value={websiteId} onChange={e => setWebsiteId(e.target.value)}>
                  <option value="">Select website</option>
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Current Balance</Label>
                <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
                  {websiteId ? formatUSD(websiteBalance(websiteId)) : "$0.00"}
                </div>
              </div>
            </div>

            {activeTab === "withdrawn" && (
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={countsTowardGoal} onChange={e => setCountsTowardGoal((e.target as HTMLInputElement).checked)} />
                <span>Count towards goals</span>
              </label>
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
            {activeTab === "earnings" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label required>Amount (USD)</Label>
                  <Input
                    placeholder="0.00"
                    value={usdStr}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = v.split(".");
                      if (parts.length > 2) return;
                      if (parts[1] && parts[1].length > 2) return;
                      setUsdStr(v);
                    }}
                    inputMode="decimal"
                  />
                  <p className="text-[10px] text-foreground-muted">Earning added to the website balance</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Current Balance</Label>
                  <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular-nums">
                    {websiteId ? formatUSD(websiteBalance(websiteId)) : "$0.00"}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label required>Wallet</Label>
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
                      {walletId ? formatUSD(walletBalance(walletId)) : "$0.00"}
                    </div>
                  </div>
                </div>

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
                    <Label required>Amount (USD)</Label>
                    <Input
                      placeholder="0.00"
                      value={usdStr}
                      onChange={e => {
                        const v = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = v.split(".");
                        if (parts.length > 2) return;
                        if (parts[1] && parts[1].length > 2) return;
                        setUsdStr(v);
                      }}
                      inputMode="decimal"
                    />
                    <p className="text-[10px] text-foreground-muted">Subtracted from the website balance</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label required>Amount (asset)</Label>
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
                  <p className="text-[10px] text-foreground-muted">Max 8 decimals · sent to the wallet</p>
                </div>
              </>
            )}

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
                <span className="text-foreground-muted">Website</span>
                <span className="font-medium">{selectedWebsiteName || "—"}</span>
              </div>
              {activeTab === "withdrawn" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Wallet</span>
                    <span className="font-medium">{selectedWalletName(walletId) || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Asset</span>
                    <span className="font-medium">{assetName || "—"}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-foreground-muted">Amount (USD)</span>
                <span className="font-medium tabular-nums">{formatUSD(usdNum)}</span>
              </div>
              {activeTab === "withdrawn" && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Quantity</span>
                  <span className="font-medium tabular-nums">
                    {quantityStr || "0"} {selectedAsset?.symbol ? `· ${selectedAsset.symbol}` : ""}
                  </span>
                </div>
              )}
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

            {activeTab === "withdrawn" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  {(["Completed", "Pending", "Failed"] as WsStatus[]).map(s => (
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
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={goBack} disabled={isPending}>
                <ChevronLeft size={14} /> Back
              </Button>
              <Button type="button" variant="primary" size="sm" loading={isPending} onClick={handleSubmit}>
                {activeTab === "earnings" ? "Add Earning" : "Withdraw"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}