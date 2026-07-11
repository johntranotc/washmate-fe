import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Receipt,
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
import { InvoiceDetailDrawer } from "@/components/customer-portal/invoice-detail-drawer";
import { PaymentConfirmDialog } from "@/components/customer-portal/payment-confirm-dialog";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import {
  buildPaymentKpi,
  buildPaymentTabs,
  canPay,
  invoiceCodeOf,
  isAwaitingConfirmRecord,
  isCancelledRecord,
  isPaidRecord,
  recordDateRaw,
  recordTimeMs,
} from "@/lib/customer-payment-data";

const PAGE_SIZE = 6;

const TIME_RANGES = [
  { key: "all", label: "Tất cả thời gian", match: () => true },
  { key: "7d", label: "7 ngày qua", match: (t, now) => t >= now - 7 * 86_400_000 && t <= now },
  { key: "30d", label: "30 ngày qua", match: (t, now) => t >= now - 30 * 86_400_000 && t <= now },
  {
    key: "month",
    label: "Tháng này",
    match: (t) => {
      if (!t) return false;
      const d = new Date(t);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    },
  },
];

const selectClass =
  "h-9 rounded-lg border border-border bg-card px-2.5 text-sm font-semibold text-foreground outline-none focus-visible:border-ring";

export default function PaymentInvoicePage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [invoiceView, setInvoiceView] = useState(null);
  const [confirmPay, setConfirmPay] = useState(null);

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

  const kpi = useMemo(() => buildPaymentKpi(bookings), [bookings]);
  const tabs = useMemo(() => buildPaymentTabs(bookings), [bookings]);
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of tabs) counts[t.key] = bookings.filter(t.match).length;
    return counts;
  }, [bookings, tabs]);

  const awaitingConfirm = useMemo(() => bookings.filter(isAwaitingConfirmRecord), [bookings]);
  const payableTop = useMemo(
    () => bookings.filter(canPay).sort((a, b) => recordTimeMs(a) - recordTimeMs(b)).slice(0, 3),
    [bookings],
  );

  const filtered = useMemo(() => {
    const activeTab = tabs.find((t) => t.key === tab) || tabs[0];
    const range = TIME_RANGES.find((r) => r.key === timeRange) || TIME_RANGES[0];
    const now = Date.now();
    const q = search.trim().toLowerCase();
    const list = bookings.filter((b) => {
      if (!activeTab.match(b)) return false;
      if (!range.match(recordTimeMs(b), now)) return false;
      if (!q) return true;
      return [b.code, invoiceCodeOf(b), b.serviceName, b.plate, b.vehicle]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    list.sort((a, b) => {
      if (sort === "oldest") return recordTimeMs(a) - recordTimeMs(b);
      if (sort === "amountHigh") return Number(b.finalAmount || 0) - Number(a.finalAmount || 0);
      if (sort === "amountLow") return Number(a.finalAmount || 0) - Number(b.finalAmount || 0);
      return recordTimeMs(b) - recordTimeMs(a);
    });
    return list;
  }, [bookings, tabs, tab, timeRange, search, sort]);

  useEffect(() => setPage(1), [tab, timeRange, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goPay = useCallback((booking) => {
    setConfirmPay(null);
    navigate(`/khach-hang/thanh-toan/${booking.id}`);
  }, [navigate]);

  const clearFilters = () => {
    setTab("all");
    setTimeRange("all");
    setSearch("");
  };

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        eyebrow="Tài chính của tôi"
        title="Thanh toán & Hóa đơn"
        description="Theo dõi các khoản cần thanh toán, hóa đơn đã phát hành và lịch sử giao dịch của bạn."
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Cần thanh toán"
          value={loading ? "—" : kpi.payableCount}
          icon={<Wallet size={18} />}
          tone="bg-warning-container text-warning"
          highlight={!loading && kpi.payableCount > 0}
          subtitle={
            !loading && kpi.payableCount > 0 ? (
              <span className="mt-0.5 block text-xs font-bold text-warning">{formatMoney(kpi.payableTotal)}</span>
            ) : null
          }
        />
        <KpiCard
          label="Đã thanh toán"
          value={loading ? "—" : kpi.paidCount}
          icon={<CheckCircle2 size={18} />}
          tone="bg-success-container text-success"
        />
        <KpiCard
          label="Tổng chi tiêu"
          value={loading ? "—" : formatMoney(kpi.totalSpent)}
          icon={<CreditCard size={18} />}
          tone="bg-primary-container text-primary"
        />
        <KpiCard
          label="Hóa đơn gần đây"
          value={loading ? "—" : kpi.latestPaidMs ? formatBookingDate(new Date(kpi.latestPaidMs).toISOString()) : "Chưa có"}
          icon={<Receipt size={18} />}
        />
      </div>

      {/* Banner chờ gara xác nhận */}
      {!loading && !error && awaitingConfirm.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning-container/50 px-4 py-3.5 sm:px-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-warning">
            <Clock size={17} />
            {awaitingConfirm.length} lịch đặt đang chờ gara xác nhận trước khi thanh toán.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-warning/40 text-warning hover:bg-warning-container"
            render={<Link to="/khach-hang/lich-dat" />}
          >
            Xem lịch chờ xác nhận
          </Button>
        </div>
      )}

      {/* Cần thanh toán (ưu tiên) */}
      {!loading && !error && payableTop.length > 0 && (
        <section className="rounded-2xl border border-primary/20 bg-primary-container/30 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h2 className="text-sm font-extrabold text-foreground">Cần thanh toán</h2>
          </div>
          <div className="mt-3 grid gap-2.5">
            {payableTop.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{b.serviceName}</strong>
                    <StatusBadge status={b.paymentStatus} type="payment" size="sm" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {b.code} · {formatBookingDate(b.bookingDate)}{b.slotTime ? ` · ${b.slotTime}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-primary">{formatMoney(b.finalAmount)}</strong>
                  <Button size="sm" onClick={() => setConfirmPay(b)}>
                    {b.paymentStatus === "FAILED" ? "Thanh toán lại" : "Thanh toán ngay"}
                  </Button>
                </div>
              </div>
            ))}
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
            placeholder="Tìm theo mã lịch, mã hóa đơn hoặc dịch vụ..."
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
            <option value="amountHigh">Số tiền cao nhất</option>
            <option value="amountLow">Số tiền thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => {
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

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical">
            <AlertTriangle size={22} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không thể tải dữ liệu thanh toán</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng thử lại sau.</p>
          <Button onClick={() => load()} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Bạn chưa có hóa đơn nào"
          description="Hóa đơn sẽ xuất hiện sau khi bạn hoàn tất lịch rửa xe."
          action={
            <Button size="lg" render={<Link to="/khach-hang/dat-lich-moi" />}>Đặt lịch rửa xe</Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={tab === "payable" ? "Không có khoản cần thanh toán" : "Không tìm thấy hóa đơn phù hợp"}
          description={
            tab === "payable"
              ? "Tất cả lịch đặt của bạn hiện đã được xử lý."
              : "Thử kiểm tra lại mã lịch, mã hóa đơn hoặc bộ lọc."
          }
          action={<Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border">
            {pageItems.map((b) => (
              <PaymentRow
                key={b.id}
                booking={b}
                onPay={() => setConfirmPay(b)}
                onInvoice={() => setInvoiceView(b)}
              />
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <Pagination page={safePage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          )}
        </div>
      )}

      <InvoiceDetailDrawer booking={invoiceView} onClose={() => setInvoiceView(null)} />
      <PaymentConfirmDialog booking={confirmPay} onClose={() => setConfirmPay(null)} onContinue={goPay} />
    </PageContainer>
  );
}

function PaymentRow({ booking, onPay, onInvoice }) {
  const payable = canPay(booking);
  const paid = isPaidRecord(booking);
  const cancelled = isCancelledRecord(booking);
  const invoiceCode = invoiceCodeOf(booking);
  const dateRaw = recordDateRaw(booking);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 p-4 transition hover:bg-surface sm:p-5">
      {/* Thông tin — cột trái */}
      <div className="min-w-0 flex-1">
        <strong className="block text-base">{booking.serviceName}</strong>
        {/* Nhãn trạng thái xuống dòng riêng → luôn bắt đầu từ mép trái, thẳng hàng giữa các dòng */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.bookingStatus} size="sm" />
          {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>Mã lịch: <b className="text-foreground">{booking.code}</b></span>
          <span>Hóa đơn: <b className="text-foreground">{invoiceCode || "Chưa có"}</b></span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={15} /> {formatBookingDate(dateRaw)}{booking.slotTime ? ` · ${booking.slotTime}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} /> {booking.garageName}
          </span>
          <span className="truncate">{booking.vehicle} · {booking.plate}</span>
        </div>
      </div>

      {/* Số tiền + hành động — gom chung cột phải để mọi dòng thẳng hàng */}
      <div className="flex shrink-0 flex-col items-end gap-2.5">
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground">Số tiền</p>
          <strong className="text-lg text-primary">{formatMoney(booking.finalAmount)}</strong>
        </div>
        <div className="flex items-center gap-2">
          {paid || invoiceCode ? (
            <Button variant="outline" size="sm" onClick={onInvoice}>
              <Receipt size={15} /> Xem hóa đơn
            </Button>
          ) : (
            <Button variant="outline" size="sm" render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}>
              Xem chi tiết
            </Button>
          )}
          {payable && (
            <Button size="sm" onClick={onPay}>
              <CreditCard size={15} /> {booking.paymentStatus === "FAILED" ? "Thanh toán lại" : "Thanh toán ngay"}
            </Button>
          )}
          {cancelled && !paid && !payable && !invoiceCode && (
            <span className="text-xs font-semibold text-muted-foreground">Đã đóng</span>
          )}
        </div>
      </div>
    </div>
  );
}
