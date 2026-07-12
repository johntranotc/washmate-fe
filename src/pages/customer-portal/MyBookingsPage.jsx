import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPin,
  RotateCcw,
  Search,
  Wallet,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { KpiCard } from "@/components/shared/KpiCard";
import Pagination from "@/components/common/Pagination";
import { BookingQuickView } from "@/components/customer-portal/booking-quick-view";
import { BookingKpiIcon } from "@/components/customer-portal/booking-kpi-icon";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import {
  BOOKING_TABS,
  bookingTimeValue,
  canPay,
  deriveBookingActions,
  isCompleted,
  isUpcoming,
  needsAttention,
} from "@/lib/customer-booking-status";

const PAGE_SIZE = 6;

const TIME_RANGES = [
  { key: "all", label: "Tất cả thời gian", match: () => true },
  {
    key: "next7",
    label: "7 ngày tới",
    match: (b) => {
      const t = bookingTimeValue(b);
      if (!t) return false;
      const now = Date.now();
      return t >= now - 86_400_000 && t <= now + 7 * 86_400_000;
    },
  },
  {
    key: "past30",
    label: "30 ngày qua",
    match: (b) => {
      const t = bookingTimeValue(b);
      if (!t) return false;
      const now = Date.now();
      return t >= now - 30 * 86_400_000 && t <= now;
    },
  },
];

const selectClass =
  "h-9 rounded-lg border border-border bg-card px-2.5 text-sm font-semibold text-foreground outline-none focus-visible:border-ring";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const { bookings: list } = await loadCustomerBookingList();
      setBookings(Array.isArray(list) ? list : []);
      setError(false);
    } catch {
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Làm mới nền khi quay lại tab (trạng thái có thể đổi sau khi gara xác nhận / thanh toán).
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && load({ silent: true });
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  // KPI — tính 100% từ dữ liệu thật.
  const kpi = useMemo(() => {
    const upcoming = bookings.filter(isUpcoming);
    const unpaid = bookings.filter(canPay);
    const completed = bookings.filter(isCompleted);
    const unpaidTotal = unpaid.reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);
    return {
      total: bookings.length,
      upcoming: upcoming.length,
      unpaid: unpaid.length,
      unpaidTotal,
      completed: completed.length,
    };
  }, [bookings]);

  // Count từng tab từ dữ liệu thật.
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of BOOKING_TABS) counts[t.key] = bookings.filter(t.match).length;
    return counts;
  }, [bookings]);

  // Khối "Cần xử lý": ưu tiên thanh toán được, rồi tới đang chờ xác nhận; tối đa 3.
  const attentionItems = useMemo(() => {
    return bookings
      .filter(needsAttention)
      .sort((a, b) => {
        const pa = canPay(a) ? 0 : 1;
        const pb = canPay(b) ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return bookingTimeValue(a) - bookingTimeValue(b);
      })
      .slice(0, 3);
  }, [bookings]);

  // Lọc + tìm kiếm + sắp xếp.
  const filtered = useMemo(() => {
    const activeTab = BOOKING_TABS.find((t) => t.key === tab) || BOOKING_TABS[0];
    const activeRange = TIME_RANGES.find((r) => r.key === timeRange) || TIME_RANGES[0];
    const q = search.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (!activeTab.match(b)) return false;
      if (!activeRange.match(b)) return false;
      if (!q) return true;
      return [b.code, b.serviceName, b.plate, b.vehicle, b.garageName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    list.sort((a, b) =>
      sort === "newest" ? bookingTimeValue(b) - bookingTimeValue(a) : bookingTimeValue(a) - bookingTimeValue(b),
    );
    return list;
  }, [bookings, tab, timeRange, search, sort]);

  // Reset trang khi đổi bộ lọc.
  useEffect(() => setPage(1), [tab, timeRange, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilter = tab !== "all" || timeRange !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setTab("all");
    setTimeRange("all");
    setSearch("");
  };

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        title="Lịch đặt rửa xe"
        description="Theo dõi trạng thái các lịch đặt và tiếp tục thanh toán khi gara đã xác nhận."
        actions={
          <Button size="lg" className="shadow-cta" render={<Link to="/khach-hang/dat-lich-moi" />}>
            Đặt lịch mới
          </Button>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Tổng lịch đặt"
          value={loading ? "—" : kpi.total}
          icon={<BookingKpiIcon />}
          tone="bg-transparent"
        />
        <KpiCard
          label="Sắp tới"
          value={loading ? "—" : kpi.upcoming}
          iconSrc="/images/icons/booking-upcoming.png"
          icon={<CalendarClock size={18} />}
          tone="bg-primary-container text-primary"
        />
        <KpiCard
          label="Chờ thanh toán"
          value={loading ? "—" : kpi.unpaid}
          iconSrc="/images/icons/booking-awaiting-pay.png"
          icon={<Wallet size={18} />}
          tone="bg-warning-container text-warning"
          highlight={!loading && kpi.unpaid > 0}
          subtitle={
            !loading && kpi.unpaid > 0 ? (
              <span className="mt-0.5 block text-xs font-bold text-warning">
                {formatMoney(kpi.unpaidTotal)}
              </span>
            ) : null
          }
        />
        <KpiCard
          label="Hoàn thành"
          value={loading ? "—" : kpi.completed}
          iconSrc="/images/icons/booking-completed.png"
          icon={<CheckCircle2 size={18} />}
          tone="bg-success-container text-success"
        />
      </div>

      {/* Cần xử lý */}
      {!loading && !error && attentionItems.length > 0 && (
        <section className="rounded-2xl border border-warning/30 bg-warning-container/40 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            <h2 className="text-sm font-extrabold text-foreground">Cần xử lý</h2>
          </div>
          <div className="mt-3 grid gap-2.5">
            {attentionItems.map((b) => {
              const payable = canPay(b);
              return (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{b.code}</strong>
                      <StatusBadge status={b.bookingStatus} size="sm" />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {b.serviceName} · {formatBookingDate(b.bookingDate)}
                      {b.slotTime ? ` · ${b.slotTime}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDrawer(b)}>
                      Xem chi tiết
                    </Button>
                    {payable ? (
                      <Button size="sm" render={<Link to={`/khach-hang/thanh-toan/${b.id}`} />}>
                        Thanh toán ngay
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-warning">Chờ gara xác nhận</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã lịch, dịch vụ, biển số..."
            className="h-9 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={selectClass} aria-label="Khoảng thời gian">
            {TIME_RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass} aria-label="Sắp xếp">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {BOOKING_TABS.map((t) => {
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
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-muted"}`}>
                {tabCounts[t.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content states */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical">
            <AlertTriangle size={22} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không tải được lịch đặt</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng kiểm tra kết nối và thử lại.</p>
          <Button onClick={() => load()} className="mt-4 bg-critical text-white hover:bg-critical/90">
            Thử lại
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Bạn chưa có lịch đặt nào"
          description="Hãy đặt lịch đầu tiên để chăm sóc xe của bạn."
          action={
            <Button size="lg" render={<Link to="/khach-hang/dat-lich-moi" />}>
              Đặt lịch mới
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy lịch đặt phù hợp"
          description="Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border">
            {pageItems.map((b) => (
              <BookingRow key={b.id} booking={b} onView={() => setDrawer(b)} />
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <Pagination page={safePage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          )}
        </div>
      )}

      <BookingQuickView booking={drawer} onClose={() => setDrawer(null)} />
    </PageContainer>
  );
}

function BookingRow({ booking, onView }) {
  const actions = deriveBookingActions(booking);
  return (
    <div className="flex flex-col gap-3 p-4 transition hover:bg-surface sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-base">{booking.code}</strong>
            <StatusBadge status={booking.bookingStatus} size="sm" />
            {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />}
          </div>
          <p className="mt-1 font-semibold">{booking.serviceName}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={15} /> {formatBookingDate(booking.bookingDate)}
              {booking.slotTime ? ` · ${booking.slotTime}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} /> {booking.garageName}
            </span>
            <span className="truncate">{booking.vehicle} · {booking.plate}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground">Tổng tiền</p>
          <strong className="text-lg text-primary">{formatMoney(booking.finalAmount)}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {actions.awaitingConfirm ? (
          <p className="text-xs font-semibold text-warning">Vui lòng chờ gara xác nhận trước khi thanh toán.</p>
        ) : actions.rejected ? (
          <p className="text-xs font-semibold text-critical">Gara đã từ chối lịch này.</p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            Xem chi tiết
          </Button>
          {actions.pay && (
            <Button size="sm" render={<Link to={`/khach-hang/thanh-toan/${booking.id}`} />}>
              <CreditCard size={15} /> Thanh toán ngay
            </Button>
          )}
          {actions.invoice && (
            <Button variant="outline" size="sm" render={<Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} />}>
              Xem hóa đơn
            </Button>
          )}
          {actions.rebook && !actions.invoice && (
            <Button variant="outline" size="sm" render={<Link to="/khach-hang/dat-lich-moi" />}>
              <RotateCcw size={15} /> Đặt lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
