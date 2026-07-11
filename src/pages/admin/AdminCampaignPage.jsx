import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Megaphone, PlayCircle, CalendarClock, PauseCircle, Flag, Ticket, Search,
  RefreshCw, AlertTriangle, Plus, ChevronDown,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { garageApi } from "../../api/garageApi";
import { promotionApi } from "../../api/promotionApi";
import { formatDate, formatMoney, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { RewardFormModal } from "../../components/admin/loyalty/RewardFormModal";

const PAGE_SIZE = 9;

// Trạng thái VẬN HÀNH suy từ dữ liệu thật (status + startDate/endDate của BE).
const STATUS_META = {
  RUNNING: { label: "Đang chạy", tone: "bg-success-container text-success" },
  UPCOMING: { label: "Sắp bắt đầu", tone: "bg-primary-container text-primary-strong" },
  PAUSED: { label: "Tạm dừng", tone: "bg-warning-container text-warning" },
  ENDED: { label: "Đã kết thúc", tone: "bg-muted text-muted-foreground" },
};

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "RUNNING", label: "Đang chạy" },
  { key: "UPCOMING", label: "Sắp bắt đầu" },
  { key: "PAUSED", label: "Tạm dừng" },
  { key: "ENDED", label: "Đã kết thúc" },
  { key: "ATTENTION", label: "Cần chú ý" },
];

// Suy trạng thái + cảnh báo từ field thật: status, startDate, endDate, usedCount, usageLimit.
function deriveCampaign(promo) {
  const now = new Date();
  const start = promo.startDate ? new Date(promo.startDate) : null;
  const end = promo.endDate ? new Date(promo.endDate) : null;
  const raw = String(promo.status || "").toUpperCase();

  let key = "RUNNING";
  if (["INACTIVE", "PAUSED", "SUSPENDED", "DISABLED"].includes(raw)) key = "PAUSED";
  else if (["EXPIRED", "ENDED"].includes(raw) || (end && end < now)) key = "ENDED";
  else if (start && start > now) key = "UPCOMING";

  const attention = [];
  if (key !== "ENDED" && end) {
    const daysLeft = Math.ceil((end - now) / 86400000);
    if (daysLeft >= 0 && daysLeft <= 3) attention.push(`Sắp hết hạn (còn ${daysLeft} ngày)`);
  }
  if (key === "RUNNING" && (promo.usedCount || 0) === 0) attention.push("Chưa có lượt sử dụng");
  if (promo.usageLimit > 0 && (promo.usedCount || 0) / promo.usageLimit >= 0.9) {
    attention.push(`Sắp hết lượt (${formatNumber(promo.usedCount || 0)}/${formatNumber(promo.usageLimit)})`);
  }

  return { key, ...STATUS_META[key], attention };
}

function CampaignsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
      </div>
    </div>
  );
}

/**
 * Trang Chiến dịch (Admin) — dữ liệu thật từ GET /v1/promotion/manage/all
 * (tải song song mọi gara). BE hiện CHƯA có API tạo/sửa/tạm dừng/kết thúc
 * chiến dịch và không có trạng thái Nháp → các action đó disabled/toast,
 * không fake; trạng thái vận hành suy từ status + ngày hiệu lực thật.
 */
export default function AdminCampaignPage() {
  const [garages, setGarages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [garageFilter, setGarageFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let garageList = [];
    try {
      const g = await garageApi.getAll();
      garageList = Array.isArray(g) ? g : [];
      setGarages(garageList);
    } catch (e) {
      setError(e?.message || "Không thể tải danh sách chiến dịch. Vui lòng thử lại.");
      setGarages([]);
      setCampaigns([]);
      setLoading(false);
      return;
    }
    // Promotion của TẤT CẢ gara — endpoint thật theo từng gara, tải song song
    const results = await Promise.allSettled(
      garageList.map((g) => promotionApi.getAllPromotionsByGarage(g.id ?? g.garageId)),
    );
    const all = [];
    results.forEach((r, i) => {
      if (r.status !== "fulfilled" || !Array.isArray(r.value)) return;
      const garage = garageList[i];
      r.value.forEach((p) => all.push({
        ...p,
        garageId: p.garageId ?? garage.id ?? garage.garageId,
        garageName: garage.name ?? garage.garageName,
      }));
    });
    setCampaigns(all);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [garageFilter, keyword, statusFilter, typeFilter, fromDate, toDate, tab, campaigns]);

  const enriched = useMemo(
    () => campaigns.map((c) => ({ ...c, derived: deriveCampaign(c), attention: deriveCampaign(c).attention })),
    [campaigns],
  );

  // Scope theo chi nhánh + search + loại + khoảng ngày (giao với thời gian hiệu lực).
  const scoped = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return enriched.filter((c) => {
      if (garageFilter !== "all" && String(c.garageId) !== String(garageFilter)) return false;
      if (typeFilter !== "ALL" && c.discountType !== typeFilter) return false;
      if (kw && !`${c.title || ""} ${c.code || ""}`.toLowerCase().includes(kw)) return false;
      if (fromDate && c.endDate && String(c.endDate).slice(0, 10) < fromDate) return false;
      if (toDate && c.startDate && String(c.startDate).slice(0, 10) > toDate) return false;
      if (statusFilter !== "ALL" && c.derived.key !== statusFilter) return false;
      return true;
    });
  }, [enriched, garageFilter, keyword, typeFilter, fromDate, toDate, statusFilter]);

  const tabMatch = (c, key) => {
    if (key === "ALL") return true;
    if (key === "ATTENTION") return c.attention.length > 0;
    return c.derived.key === key;
  };
  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, scoped.filter((c) => tabMatch(c, t.key)).length])),
    [scoped],
  );
  const filtered = useMemo(
    () => scoped
      .filter((c) => tabMatch(c, tab))
      .sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || ""))),
    [scoped, tab],
  );
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  // KPI — theo chi nhánh đang chọn (trước tab/search).
  const kpis = useMemo(() => {
    const base = enriched.filter((c) => garageFilter === "all" || String(c.garageId) === String(garageFilter));
    const by = (k) => base.filter((c) => c.derived.key === k).length;
    return {
      total: base.length,
      running: by("RUNNING"),
      upcoming: by("UPCOMING"),
      paused: by("PAUSED"),
      ended: by("ENDED"),
      usage: base.reduce((s, c) => s + (c.usedCount || 0), 0),
    };
  }, [enriched, garageFilter]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng chiến dịch", Icon: Megaphone, tone: "text-primary bg-primary-container" },
    { key: "running", label: "Đang chạy", Icon: PlayCircle, tone: "text-success bg-success-container" },
    { key: "upcoming", label: "Sắp bắt đầu", Icon: CalendarClock, tone: "text-primary-strong bg-primary-container" },
    { key: "paused", label: "Tạm dừng", Icon: PauseCircle, tone: "text-warning bg-warning-container" },
    { key: "ended", label: "Đã kết thúc", Icon: Flag, tone: "text-muted-foreground bg-muted" },
    { key: "usage", label: "Lượt sử dụng", Icon: Ticket, tone: "text-accent-violet bg-accent-violet/10" },
  ];

  const attentionItems = useMemo(
    () => scoped.filter((c) => c.attention.length > 0).slice(0, 6),
    [scoped],
  );

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL" || typeFilter !== "ALL" || fromDate || toDate || tab !== "ALL";
  const clearFilters = () => {
    setKeyword(""); setStatusFilter("ALL"); setTypeFilter("ALL");
    setFromDate(""); setToDate(""); setTab("ALL");
  };

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Chiến dịch"
        description="Quản lý chương trình khuyến mãi, mã ưu đãi và điều kiện áp dụng theo chi nhánh."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={garageFilter}
              onChange={(e) => setGarageFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Chọn chi nhánh"
            >
              <option value="all">Tất cả chi nhánh</option>
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus /> Tạo chiến dịch
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !campaigns.length ? (
        <CampaignsSkeleton />
      ) : error && !campaigns.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI — số thật theo chi nhánh đang chọn */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {KPI_CARDS.map(({ key, label, Icon, tone }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">{formatNumber(kpis[key])}</b>
                </div>
              </article>
            ))}
          </section>

          {/* Filter + tabs */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                <Search size={16} className="text-neutral-muted" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên chiến dịch, mã ưu đãi..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setTab("ALL"); }}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc trạng thái"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Lọc loại ưu đãi"
              >
                <option value="ALL">Tất cả loại ưu đãi</option>
                <option value="PERCENTAGE">Giảm theo %</option>
                <option value="FIXED_AMOUNT">Giảm số tiền</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Từ ngày"
                />
                <span className="text-xs text-neutral-muted">→</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Đến ngày"
                />
              </div>
              {hasFilter && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-bold text-muted-foreground">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
            <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto border-t border-border pt-3">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                    tab === t.key ? "bg-primary text-white" : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "grid h-4 min-w-4 place-items-center rounded-full px-1 text-xs font-bold",
                      tab === t.key ? "bg-card/25 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCounts[t.key]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Danh sách chiến dịch */}
            <div className="min-w-0">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
                  <Megaphone size={40} className="mx-auto text-border" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {hasFilter ? "Không có chiến dịch phù hợp bộ lọc." : "Chưa có chiến dịch nào"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hasFilter
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Chi nhánh này chưa có chương trình ưu đãi trong kỳ hiện tại."}
                  </p>
                  {hasFilter ? (
                    <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
                      Xóa bộ lọc
                    </Button>
                  ) : (
                    <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
                      <Plus /> Tạo chiến dịch
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Danh sách gọn: mỗi dòng nêu MÃ (id) + mức giảm + trạng thái. Bấm để bung nội dung chi tiết. */}
                  <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                    {paged.map((c) => {
                      const isPercent = c.discountType === "PERCENTAGE";
                      const pct = c.usageLimit > 0
                        ? Math.min(100, Math.round(((c.usedCount || 0) / c.usageLimit) * 100))
                        : null;
                      const expanded = String(expandedId) === String(c.id);
                      return (
                        <div key={c.id}>
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : c.id)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface"
                            aria-expanded={expanded}
                          >
                            <span className="shrink-0 rounded-lg border border-dashed border-primary/40 bg-primary-container px-2 py-1 font-mono text-xs font-bold tracking-wide text-primary-strong">
                              {c.code || `#${c.id}`}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-foreground">{c.title}</span>
                              <span className="text-xs font-semibold text-primary">
                                {isPercent ? `Giảm ${c.discountValue}%` : `Giảm ${formatMoney(c.discountValue)}`}
                              </span>
                            </span>
                            {c.attention.length > 0 && (
                              <AlertTriangle size={14} className="shrink-0 text-warning" aria-label="Cần chú ý" />
                            )}
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.derived.tone}`}>
                              {c.derived.label}
                            </span>
                            <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition ${expanded ? "rotate-180" : ""}`} />
                          </button>

                          {expanded && (
                            <div className="border-t border-border bg-surface/40 px-4 py-3">
                              <div className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                                <InfoRow label="Mức giảm" value={
                                  isPercent
                                    ? `Giảm ${c.discountValue}%${c.maxDiscount > 0 ? ` (tối đa ${formatMoney(c.maxDiscount)})` : ""}`
                                    : `Giảm ${formatMoney(c.discountValue)}`
                                } />
                                <InfoRow label="Đơn tối thiểu" value={c.minOrderValue > 0 ? formatMoney(c.minOrderValue) : "Không yêu cầu"} />
                                <InfoRow label="Thời gian" value={`${formatDate(c.startDate)} – ${formatDate(c.endDate)}`} />
                                <InfoRow label="Chi nhánh" value={friendlyName(c.garageName, "Chưa cập nhật")} />
                              </div>

                              <div className="mt-3 text-xs">
                                {c.usageLimit > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span>Lượt sử dụng</span>
                                      <b className="text-foreground">
                                        {formatNumber(c.usedCount || 0)} / {formatNumber(c.usageLimit)}
                                      </b>
                                    </div>
                                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className={`h-full rounded-full ${pct >= 90 ? "bg-warning" : "bg-primary"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-muted-foreground">
                                    Đã dùng <b className="text-foreground">{formatNumber(c.usedCount || 0)}</b> lượt · Không giới hạn
                                  </p>
                                )}
                              </div>

                              {c.attention.length > 0 && (
                                <p className="mt-2 text-xs font-bold text-warning">{c.attention[0]}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={filtered.length}
                    onPageChange={setPage}
                    className="mt-2 border-t-0"
                  />
                </>
              )}
            </div>

            {/* Cần chú ý */}
            <section className="h-fit rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <AlertTriangle size={18} className="text-warning" /> Cần chú ý
              </h2>
              {attentionItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-muted">Không có chiến dịch cần chú ý.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {attentionItems.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setTab("ATTENTION"); setPage(1); setExpandedId(c.id); }}
                      className="block w-full rounded-xl border border-border bg-surface p-3 text-left transition hover:border-warning/40"
                    >
                      <p className="truncate text-xs font-bold text-foreground">{c.title}</p>
                      <p className="mt-0.5 text-xs text-warning">{c.attention.join(" · ")}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      <RewardFormModal
        reward={null}
        garages={garages}
        open={showCreate}
        onOpenChange={setShowCreate}
        onDone={load}
      />
    </PageContainer>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
