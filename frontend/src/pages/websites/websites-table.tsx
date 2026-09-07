import { useMemo, useState } from "react";
import {
  Globe,
  Search,
  ExternalLink,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Archive,
  Trash2,
} from "lucide-react";
import { startOfDay, subDays, parseISO } from "date-fns";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { EditWebsiteModal } from "./edit-website-modal";
import { ArchiveWebsiteModal } from "./archive-website-modal";
import { DeleteWebsiteModal } from "./delete-website-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD } from "@/lib/formats";
import type { Website } from "@/features/websites/types/website.types";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

type StatusFilter = "all" | "active" | "inactive";

const GRID_COLS_CLASS =
  "grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.75fr)_minmax(0,1.7fr)]";

interface WebsiteRow {
  id: string;
  name: string;
  url?: string;
  status: string;
  balance: number;
  today: number;
  yesterday: number;
  withdrawn: number;
}

interface WebsitesTableProps {
  onTransaction?: (tab: "earnings" | "withdrawn", websiteId: string) => void;
}

function WebsiteStatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "active" ? "success" : "default"} size="sm">{status}</Badge>;
}

export function WebsitesTable({ onTransaction }: WebsitesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editWebsite, setEditWebsite] = useState<Website | null>(null);
  const [archiveWebsite, setArchiveWebsite] = useState<Website | null>(null);
  const [deleteWebsite, setDeleteWebsite] = useState<Website | null>(null);

  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const websites = useMemo(() => websitesQuery.data?.data ?? [], [websitesQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const now = useMemo(() => new Date(), []);
  const todayStart = useMemo(() => startOfDay(now), [now]);
  const yesterdayStart = useMemo(() => startOfDay(subDays(now, 1)), [now]);

  const rows = useMemo<WebsiteRow[]>(() => {
    const balances = new Map<string, number>();
    const todayMap = new Map<string, number>();
    const yesterdayMap = new Map<string, number>();
    const withdrawnMap = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === "WEBSITE_EARNING" && tx.destination.type === "WEBSITE" && tx.destination.id) {
        const d = parseISO(tx.date);
        if (d >= todayStart) todayMap.set(tx.destination.id, (todayMap.get(tx.destination.id) ?? 0) + tx.usdValue);
        if (d >= yesterdayStart && d < todayStart) {
          yesterdayMap.set(tx.destination.id, (yesterdayMap.get(tx.destination.id) ?? 0) + tx.usdValue);
        }
      }
      if (tx.type === "WEBSITE_WITHDRAWAL" && tx.source.type === "WEBSITE" && tx.source.id) {
        withdrawnMap.set(tx.source.id, (withdrawnMap.get(tx.source.id) ?? 0) + tx.usdValue);
      }
      if (tx.destination.type === "WEBSITE" && tx.destination.id) {
        balances.set(tx.destination.id, (balances.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
      if (tx.source.type === "WEBSITE" && tx.source.id) {
        balances.set(tx.source.id, (balances.get(tx.source.id) ?? 0) - tx.usdValue);
      }
    }

    return websites.map(w => ({
      id: w.id,
      name: w.name,
      url: w.url,
      status: w.status,
      balance: Math.max(0, balances.get(w.id) ?? 0),
      today: todayMap.get(w.id) ?? 0,
      yesterday: yesterdayMap.get(w.id) ?? 0,
      withdrawn: withdrawnMap.get(w.id) ?? 0,
    }));
  }, [websites, transactions, todayStart, yesterdayStart]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(row => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? row.status === "active" : row.status === "archived");
      const matchesSearch =
        q === "" ||
        row.name.toLowerCase().includes(q) ||
        (row.url ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const findWebsite = (id: string): Website | null => websites.find(w => w.id === id) ?? null;

  const isLoading = websitesQuery.isLoading || transactionsQuery.isLoading;
  const isError = websitesQuery.isError || transactionsQuery.isError;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading websites...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = () => {
      if (websitesQuery.isError) websitesQuery.refetch();
      if (transactionsQuery.isError) transactionsQuery.refetch();
    };
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load websites"
          description="Something went wrong while loading websites."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">All Websites</h2>
        </div>
        <EmptyState title="No websites yet" description="Create your first website to get started." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
          <Input
            placeholder="Search by name or URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-8 text-xs"
            aria-label="Search websites"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="w-full sm:w-44 h-10 text-xs"
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState title="No websites match filter" description="Try changing the search or status filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div
            className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-2 bg-surface-elevated border-b border-border text-[10px] font-medium text-foreground-muted uppercase tracking-wide items-center min-w-max`}
          >
            <span>Site</span>
            <span className="text-right">Current Balance</span>
            <span className="text-right">Today</span>
            <span className="text-right">Yesterday</span>
            <span className="text-right">Withdrawn</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle">
            {filteredRows.map(row => (
              <li key={row.id}>
                <div
                  className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-3 min-w-max items-center hover:bg-surface-elevated/50 transition-colors`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                      <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-medium text-foreground" title={row.name}>
                        {row.name}
                      </span>
                      {row.url ? (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1 min-w-0 max-w-56"
                        >
                          <span className="truncate text-[10px] text-foreground-muted group-hover:text-foreground transition-colors">
                            {row.url}
                          </span>
                          <ExternalLink
                            size={10}
                            className="text-foreground-muted shrink-0 group-hover:text-foreground transition-colors"
                          />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <span className="text-xs font-semibold tabular-nums text-foreground lg:text-right">
                    {formatUSD(row.balance)}
                  </span>

                  <div className="flex items-center gap-1.5 lg:justify-end">
                    <ArrowDownToLine size={12} className="text-success shrink-0" />
                    <span className="text-xs tabular-nums text-foreground">{formatUSD(row.today)}</span>
                  </div>

                  <span className="text-xs tabular-nums text-foreground-secondary lg:text-right">
                    {formatUSD(row.yesterday)}
                  </span>

                  <div className="flex items-center gap-1.5 lg:justify-end">
                    <ArrowUpFromLine size={12} className="text-danger shrink-0" />
                    <span className="text-xs tabular-nums text-foreground">{formatUSD(row.withdrawn)}</span>
                  </div>

                  <div className="flex lg:justify-center">
                    <WebsiteStatusBadge status={row.status} />
                  </div>

                  <div className="flex items-center justify-start lg:justify-end gap-1">
                    <SimpleTooltip label="Add Earning" side="top">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        aria-label="Add Earning"
                        onClick={() => onTransaction?.("earnings", row.id)}
                      >
                        <ArrowDownRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      </IconButton>
                    </SimpleTooltip>
                    <SimpleTooltip label="Withdraw" side="top">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        aria-label="Withdraw"
                        onClick={() => onTransaction?.("withdrawn", row.id)}
                      >
                        <ArrowUpRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      </IconButton>
                    </SimpleTooltip>
                    <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
                    <SimpleTooltip label="Edit" side="top">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        aria-label="Edit"
                        onClick={() => setEditWebsite(findWebsite(row.id))}
                      >
                        <Pencil size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      </IconButton>
                    </SimpleTooltip>
                    <SimpleTooltip label="Archive" side="top">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        aria-label="Archive"
                        onClick={() => setArchiveWebsite(findWebsite(row.id))}
                      >
                        <Archive size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      </IconButton>
                    </SimpleTooltip>
                    <SimpleTooltip label="Delete" side="top">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        aria-label="Delete"
                        onClick={() => setDeleteWebsite(findWebsite(row.id))}
                      >
                        <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                      </IconButton>
                    </SimpleTooltip>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <EditWebsiteModal open={!!editWebsite} website={editWebsite} onClose={() => setEditWebsite(null)} />
      <ArchiveWebsiteModal open={!!archiveWebsite} website={archiveWebsite} onClose={() => setArchiveWebsite(null)} />
      <DeleteWebsiteModal open={!!deleteWebsite} website={deleteWebsite} onClose={() => setDeleteWebsite(null)} />
    </div>
  );
}