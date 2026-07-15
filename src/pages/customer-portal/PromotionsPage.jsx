import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BadgePercent,
  CalendarClock,
  Check,
  Copy,
  Gift,
  Search,
  ShieldCheck,
  Store,
  Ticket,
  Wallet,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toast";
import { PromotionDetailDrawer } from "@/components/customer-portal/promotion-detail-drawer";
import { promotionApi } from "@/api/promotionApi";
import { garageApi } from "@/api/garageApi";
import { formatBookingDate } from "@/lib/customer-booking-data";
import {
  PROMO_TABS,
  daysLeft,
  discountLabel,
  isExpiringSoon,
  normalizePromotion,
  promotionState,
  promotionSubtitle,
  promotionTitle,
} from "@/lib/customer-promotion-data";

const PAGE_STEP = 6;

function asList(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.content ?? [];
}

export default function PromotionsPage() {
  const navigate = useNavigate();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_STEP);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const garages = asList(await garageApi.getAll());
      if (!garages.length) {
        setPromotions([]);
        return;
      }
      // Gộp ưu đãi khả dụng của mọi chi nhánh (BE lọc theo khách + hạn + lượt).
      const results = await Promise.allSettled(
        garages.map((g) =>
          promotionApi
            .getPromotions({ garageId: g.garageId ?? g.id })
            .then((res) => asList(res).map((p) => normalizePromotion(p, g.name || g.garageName || ""))),
        ),
      );
      const merged = [];
      const seen = new Set();
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const p of r.value) {
          if (!p || seen.has(p.id)) continue;
          seen.add(p.id);
          merged.push(p);
        }
      }
      setPromotions(merged);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpi = useMemo(() => {
    const expiring = promotions.filter(isExpiringSoon).length;
    const percent = promotions.filter((p) => p.discountType === "PERCENTAGE").length;
    const fixed = promotions.filter((p) => p.discountType === "FIXED_AMOUNT").length;
    return { total: promotions.length, expiring, percent, fixed };
  }, [promotions]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of PROMO_TABS) counts[t.key] = promotions.filter(t.match).length;
    return counts;
  }, [promotions]);

  const filtered = useMemo(() => {
    const activeTab = PROMO_TABS.find((t) => t.key === tab) || PROMO_TABS[0];
    const q = search.trim().toLowerCase();
    return promotions
      .filter((p) => activeTab.match(p))
      .filter((p) => {
        if (!q) return true;
        return [p.code, promotionTitle(p), promotionSubtitle(p)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => daysLeft(a) - daysLeft(b));
  }, [promotions, tab, search]);

  useEffect(() => setLimit(PAGE_STEP), [tab, search]);

  const expiringCount = kpi.expiring;

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        title="Khám phá ưu đãi phù hợp"
        description="Xem các chương trình ưu đãi hiện có và những ưu đãi bạn đủ điều kiện sử dụng."
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Ưu đãi khả dụng" value={loading ? "—" : kpi.total} iconSrc="/images/icons/promo-available.png" icon={<Gift size={18} />} />
        <KpiCard
          label="Sắp hết hạn"
          value={loading ? "—" : kpi.expiring}
          iconSrc="/images/icons/promo-expiring.png"
          icon={<CalendarClock size={18} />}
          tone="bg-warning-container text-warning"
          highlight={!loading && kpi.expiring > 0}
        />
        <KpiCard label="Giảm theo %" value={loading ? "—" : kpi.percent} iconSrc="/images/icons/promo-percent.png" icon={<BadgePercent size={18} />} tone="bg-primary-container text-primary" />
        <KpiCard label="Giảm trực tiếp" value={loading ? "—" : kpi.fixed} iconSrc="/images/icons/promo-fixed.png" icon={<Wallet size={18} />} tone="bg-success-container text-success" />
      </div>

      {/* Banner sắp hết hạn */}
      {!loading && !error && expiringCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning-container/50 px-4 py-3.5 sm:px-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-warning">
            <CalendarClock size={17} />
            {expiringCount} ưu đãi của bạn sắp hết hạn trong {7} ngày tới.
          </p>
          <Button variant="outline" size="sm" className="border-warning/40 text-warning hover:bg-warning-container" onClick={() => setTab("expiring")}>
            Xem ngay
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="relative w-full lg:max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã ưu đãi..." className="h-9 pl-9" />
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PROMO_TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-muted-foreground hover:bg-surface"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-muted"}`}>{tabCounts[t.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-none" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical"><AlertTriangle size={22} /></span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không thể tải danh sách ưu đãi</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng thử lại sau.</p>
          <Button onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Chưa có ưu đãi khả dụng"
          description="Các chương trình ưu đãi mới sẽ được hiển thị tại đây khi khả dụng."
          action={<Button size="lg" render={<Link to="/khach-hang/dat-lich-moi" />}>Đặt lịch rửa xe</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy ưu đãi phù hợp"
          description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          action={<Button variant="outline" onClick={() => { setTab("all"); setSearch(""); }}>Xóa bộ lọc</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {filtered.slice(0, limit).map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onDetail={() => setDetail(promo)}
                onUse={() =>
                  // Chuyển sang đặt lịch, kèm gara của ưu đãi để tự chọn sẵn (nếu ưu đãi gắn gara).
                  navigate("/khach-hang/dat-lich-moi", {
                    state: promo.garageId != null ? { garageId: promo.garageId } : undefined,
                  })
                }
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Hiển thị {Math.min(limit, filtered.length)}–{filtered.length} trên {filtered.length} ưu đãi
          </p>
          {filtered.length > limit && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setLimit((n) => n + PAGE_STEP)}>Xem thêm</Button>
            </div>
          )}
        </>
      )}

      {/* Lưu ý sử dụng ưu đãi */}
      {!loading && !error && promotions.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <NoteCard icon={ShieldCheck} title="Áp dụng đúng điều kiện" text="Mỗi ưu đãi chỉ áp dụng cho dịch vụ và đơn hàng đủ điều kiện." />
          <NoteCard icon={Ticket} title="Không cộng dồn" text="Một số ưu đãi không thể dùng cùng lúc với ưu đãi khác." />
          <NoteCard icon={Store} title="Hiển thị khi thanh toán" text="Ưu đãi sẽ hiển thị ở bước thanh toán khi đơn của bạn đủ điều kiện." />
        </section>
      )}

      <PromotionDetailDrawer promo={detail} onClose={() => setDetail(null)} />
    </PageContainer>
  );
}

function PromotionCard({ promo, onDetail, onUse }) {
  const state = promotionState(promo);
  const [copied, setCopied] = useState(false);
  const copyCode = (e) => {
    e.stopPropagation();
    if (!promo.code) return;
    navigator.clipboard?.writeText(promo.code).catch(() => {});
    setCopied(true);
    toast.success("Đã sao chép mã ưu đãi.");
    window.setTimeout(() => setCopied(false), 2000);
  };
  const d = daysLeft(promo);

  return (
    <article className="flex flex-col overflow-hidden rounded-none border border-border bg-card shadow-card transition hover:border-primary/40">
      <div className="flex items-center justify-between bg-[linear-gradient(120deg,var(--primary),var(--primary-strong))] px-4 py-2.5 text-primary-foreground">
        <BadgePercent size={18} />
        <span className="text-lg font-black">{discountLabel(promo)}</span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold leading-snug line-clamp-2 min-h-10">{promotionTitle(promo)}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${state.key === "expiring" ? "bg-warning-container text-warning" : "bg-success-container text-success"}`}>
            {state.label}
          </span>
        </div>
        {/* Cố định 2 dòng để mã + hạn dùng của mọi thẻ luôn thẳng hàng dù mô tả dài ngắn khác nhau. */}
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-9">{promotionSubtitle(promo)}</p>

        <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
          {/* Luôn chừa chỗ hàng mã (kể cả thẻ không có mã) để hạn dùng thẳng hàng. */}
          <div className="min-h-6">
            {promo.code && (
              <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary-container/30 px-2 py-0.5 font-mono font-bold text-primary transition hover:bg-primary-container/60">
                {copied ? <Check size={12} /> : <Copy size={12} />} {promo.code}
              </button>
            )}
          </div>
          <p className="flex items-center gap-1.5">
            <CalendarClock size={12} /> Hạn dùng: {promo.endDate ? formatBookingDate(promo.endDate) : "Theo chương trình"}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Button size="sm" className="h-9 w-full text-xs" onClick={onUse}>Dùng ngay</Button>
          <Button variant="outline" size="sm" className="h-9 w-full text-xs" onClick={onDetail}>Chi tiết</Button>
        </div>
      </div>
    </article>
  );
}

function NoteCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span>
      <p className="mt-3 font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
