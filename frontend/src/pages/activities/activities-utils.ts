import type {
  ParticipantType,
  Transaction,
  TransactionType,
} from "@/features/transactions/types/transaction.types";

export type ActivitiesScope = "all" | "wallets" | "websites";

export const ACTIVITY_SCOPE_LABELS: Record<ActivitiesScope, string> = {
  all: "All Activities",
  wallets: "Wallet Activity",
  websites: "Website Activity",
};

export const ACTIVITY_SCOPE_DESCRIPTIONS: Record<ActivitiesScope, string> = {
  all: "Every financial movement across wallets and websites.",
  wallets: "Deposits, withdrawals, transfers and adjustments on your wallets.",
  websites: "Earnings and withdrawals from your websites.",
};

export const ACTIVITY_TYPE_LABELS: Record<TransactionType, string> = {
  WALLET_DEPOSIT: "Deposit",
  WALLET_WITHDRAWAL: "Withdrawal",
  WALLET_TRANSFER: "Transfer",
  WALLET_ADJUSTMENT: "Adjustment",
  WEBSITE_EARNING: "Earning",
  WEBSITE_WITHDRAWAL: "Site withdrawal",
};

export const ACTIVITY_TYPE_ORDER: TransactionType[] = [
  "WALLET_DEPOSIT",
  "WALLET_WITHDRAWAL",
  "WALLET_TRANSFER",
  "WALLET_ADJUSTMENT",
  "WEBSITE_EARNING",
  "WEBSITE_WITHDRAWAL",
];

export const ACTIVITY_TYPE_COLORS: Record<TransactionType, string> = {
  WALLET_DEPOSIT: "#22c55e",
  WALLET_WITHDRAWAL: "#ef4444",
  WALLET_TRANSFER: "#3b82f6",
  WALLET_ADJUSTMENT: "#f59e0b",
  WEBSITE_EARNING: "#10b981",
  WEBSITE_WITHDRAWAL: "#8b5cf6",
};

const SCOPE_PARTICIPANT: Record<Exclude<ActivitiesScope, "all">, "WALLET" | "WEBSITE"> = {
  wallets: "WALLET",
  websites: "WEBSITE",
};

export function isTxInScope(tx: Transaction, scope: ActivitiesScope): boolean {
  if (scope === "all") return true;
  const participant = SCOPE_PARTICIPANT[scope];
  return tx.source.type === participant || tx.destination.type === participant;
}

export function isTxInbound(tx: Transaction, scope: ActivitiesScope): boolean {
  if (scope === "all") return tx.destination.type !== "EXTERNAL";
  return tx.destination.type === SCOPE_PARTICIPANT[scope];
}

export function isTxOutbound(tx: Transaction, scope: ActivitiesScope): boolean {
  if (scope === "all") return tx.source.type !== "EXTERNAL";
  return tx.source.type === SCOPE_PARTICIPANT[scope];
}

export function participantLabel(
  participant: { type: ParticipantType; id?: string },
  walletNames: Map<string, string>,
  websiteNames: Map<string, string>,
): string {
  if (participant.type === "EXTERNAL") return "External";
  if (participant.type === "WALLET") return walletNames.get(participant.id ?? "") ?? "Wallet";
  return websiteNames.get(participant.id ?? "") ?? "Website";
}

export function formatActivityDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}