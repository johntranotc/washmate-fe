import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, CalendarDays, ReceiptText, CircleDollarSign, Building2, Wrench,
  RefreshCw, AlertTriangle, Download, CalendarRange, ArrowRight, ArrowUpDown,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { BookingStatusDonut } from "../../components/admin/dashboard/BookingStatusDonut";
import { PaymentStatusCard } from "../../components/admin/dashboard/PaymentStatusCard";
import { AdminBranchDrawer } from "../../components/admin/reports/AdminBranchDrawer";
import {
  todayISO, formatDate, formatMoney, formatMoneyShort, formatNumber, friendlyName,
} from "../../lib/format";
import { bookingStatusLabels } from "../../lib/status-tones";
import { STATUS_COLORS, CHART } from "../../lib/chart-colors";

const COMPLETED = "COMPLETED";
const CLOSED_NEGATIVE = ["CANCELLED", "NO_SHOW"];

const DATE_RANGES = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "7 ngày qua" },
  { key: "month", label: "Tháng này" },
  { key: "all", label: "Toàn bộ" },
];

function addDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBetween(from, to) {
  return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);
}

// Phần trăm: số nguyên; dưới 1% giữ 1 chữ số thập phân (vd. 0,6%).
function fmtPct(v) {
  if (!Number.isFinite(v)) return "0%";
  if (v > 0 && v < 1) return `${v.toFixed(1).replace(".", ",")}%`;
  return `${Math.round(v)}%`;
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

/**
 * Trang Báo cáo (Admin).
 * - "Toàn hệ thống": GET /api/analytics/summary (aggregate thật, không theo filter).
 * - "Trong kỳ": tổng hợp từ GET /api/bookings theo chi nhánh + khoảng thời gian.
 * TODO(BE): chưa có field phân biệt dữ liệu seed/test trên garage/service —
 * FE chỉ lọc hiển thị bằng friendlyName (pattern SEED/TEST/_V1), không bịa dữ liệu.
 */
export default function AdminReportPage() {
  const [summary, setSummary] = useState(null);
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [garageId, setGarageId] = useState("all");
  const [rangeKey, setRangeKey] = useState("month");
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(todayISO());
  const [customTo, setCustomTo] = useState(todayISO());

  const [branchSort, setBranchSort] = useState("revenue"); // revenue | total
  const [branchDetail, setBranchDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [sRes, gRes, bRes] = await Promise.allSettled([
      adminApi.getAnalyticsSummary(),
      garageApi.getAll(),
      adminApi.getBookings({ size: 1000 }),
    ]);
    setSummary(sRes.status === "fulfilled" ? sRes.value : null);
    setGarages(gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : []);
    if (bRes.status === "fulfilled") {
      setBookings(normalizeBookingList(bRes.value).map(normalizeStaffBooking));
      setLastUpdated(new Date());
    } else {
      console.error("[AdminReport] load bookings failed:", bRes.reason);
      setError(bRes.reason?.message || "Không thể tải dữ liệu báo cáo. Vui lòng thử lại.");
      setBookings([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Kỳ báo cáo + kỳ liền trước (cùng độ dài) để tính trend.
  const { start, end, prevStart, prevEnd } = useMemo(() => {
    const today = todayISO();
    let s = `${today.slice(0, 8)}01`;
    let e = today;
    if (showCustom) {
      s = customFrom <= customTo ? customFrom : customTo;
      e = customFrom <= customTo ? customTo : customFrom;
    } else if (rangeKey === "today") s = today;
    else if (rangeKey === "week") s = addDays(today, -6);
    else if (rangeKey === "all") {
      const dates = bookings.map((b) => b.bookingDate).filter(Boolean).sort();
      s = dates[0] || today;
    }
    const len = daysBetween(s, e) + 1;
    return { start: s, end: e, prevStart: addDays(s, -len), prevEnd: addDays(s, -1) };
  }, [rangeKey, showCustom, customFrom, customTo, bookings]);

  const matchesGarage = useCallback(
    (b) => garageId === "all" || String(b.garageId) === String(garageId),
    [garageId],
  );
  const periodBookings = useMemo(
    () => bookings.filter((b) => matchesGarage(b) && b.bookingDate >= start && b.bookingDate <= end),
    [bookings, matchesGarage, start, end],
  );
  const prevBookings = useMemo(
    () => bookings.filter((b) => matchesGarage(b) && b.bookingDate >= prevStart && b.bookingDate <= prevEnd),
    [bookings, matchesGarage, prevStart, prevEnd],
  );

  // ===== Chỉ số trong kỳ (chia 0 an toàn) =====
  const metricsOf = (list) => {
    const total = list.length;
    const completedList = list.filter((b) => b.bookingStatus === COMPLETED);
    const completed = completedList.length;
    const cancelledNoShow = list.filter((b) => CLOSED_NEGATIVE.includes(b.bookingStatus)).length;
    const revenue = completedList.reduce((s, b) => s + (b.finalAmount || 0), 0);
    return {
      total,
      completed,
      cancelledNoShow,
      revenue,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancelRate: total > 0 ? (cancelledNoShow / total) * 100 : 0,
      // Làm tròn về đồng — tránh phần lẻ thập phân khiến "503.333,333 đ" đọc nhầm thành 503 triệu
      avgRevenue: completed > 0 ? Math.round(revenue / completed) : 0,
    };
  };
  const period = useMemo(() => metricsOf(periodBookings), [periodBookings]);
  const prev = useMemo(() => (prevBookings.length > 0 ? metricsOf(prevBookings) : null), [prevBookings]);

  const trends = useMemo(() => {
    if (!prev) return {};
    return {
      revenue: prev.revenue > 0 ? ((period.revenue - prev.revenue) / prev.revenue) * 100 : null,
      completionRate: period.completionRate - prev.completionRate,
      cancelRate: period.cancelRate - prev.cancelRate,
    };
  }, [period, prev]);

  // ===== Phân bổ trạng thái (tổng = tổng booking trong kỳ) =====
  const statusData = useMemo(() => {
    const counts = new Map();
    periodBookings.forEach((b) => counts.set(b.bookingStatus, (counts.get(b.bookingStatus) || 0) + 1));
    const total = periodBookings.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({
        name: bookingStatusLabels[k] || k,
        value: v,
        percentage: Math.round((v / total) * 100),
        color: STATUS_COLORS[k] || CHART.compare,
      }));
  }, [periodBookings]);

  const paymentCounts = useMemo(() => ({
    paid: periodBookings.filter((b) => b.paymentStatus === "PAID").length,
    pending: periodBookings.filter((b) => b.paymentStatus === "PENDING").length,
    failed: periodBookings.filter((b) => b.paymentStatus === "FAILED").length,
    refunded: periodBookings.filter((b) => b.paymentStatus === "REFUNDED").length,
  }), [periodBookings]);

  // ===== Hiệu suất theo chi nhánh =====
  const branchRows = useMemo(() => {
    const map = new Map();
    periodBookings.forEach((b) => {
      const name = friendlyName(b.garageName, "Chi nhánh chưa cập nhật");
      if (!map.has(name)) {
        map.set(name, {
          name, total: 0, completed: 0, cancelledNoShow: 0, revenue: 0,
          payments: { paid: 0, pending: 0, failed: 0, refunded: 0 },
          serviceMap: new Map(),
        });
      }
      const row = map.get(name);
      row.total += 1;
      if (b.bookingStatus === COMPLETED) {
        row.completed += 1;
        row.revenue += b.finalAmount || 0;
        const sName = friendlyName(b.serviceName, "Dịch vụ chưa đặt tên");
        const cur = row.serviceMap.get(sName) || { name: sName, count: 0, revenue: 0 };
        cur.count += 1;
        cur.revenue += b.finalAmount || 0;
        row.serviceMap.set(sName, cur);
      }
      if (CLOSED_NEGATIVE.includes(b.bookingStatus)) row.cancelledNoShow += 1;
      if (b.paymentStatus === "PAID") row.payments.paid += 1;
      else if (b.paymentStatus === "PENDING") row.payments.pending += 1;
      else if (b.paymentStatus === "FAILED") row.payments.failed += 1;
      else if (b.paymentStatus === "REFUNDED") row.payments.refunded += 1;
    });
    const rows = [...map.values()].map((r) => ({
      ...r,
      topServices: [...r.serviceMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
      share: period.revenue > 0 ? (r.revenue / period.revenue) * 100 : 0,
    }));
    return rows.sort((a, b) => (branchSort === "total" ? b.total - a.total : b.revenue - a.revenue));
  }, [periodBookings, period.revenue, branchSort]);

  // ===== Top dịch vụ theo doanh thu (trong kỳ) =====
  const topServices = useMemo(() => {
    const map = new Map();
    periodBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.serviceName, "Dịch vụ chưa đặt tên");
      const cur = map.get(name) || { name, count: 0, revenue: 0, missing: !friendlyName(b.serviceName, "") };
      cur.count += 1;
      cur.revenue += b.finalAmount || 0;
      map.set(name, cur);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [periodBookings]);

  const garageLabel = garageId === "all"
    ? "Tất cả chi nhánh"
    : friendlyName(
        garages.find((g) => String(g.id ?? g.garageId) === String(garageId))?.name,
        "Chi nhánh chưa cập nhật",
      );

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  const GLOBAL_KPIS = summary ? [
    { label: "Tổng người dùng", value: formatNumber(summary.totalUsers), sub: `${formatNumber(summary.activeUsers)} đang hoạt động`, Icon: Users, tone: "text-primary bg-primary-container" },
    { label: "Tổng booking toàn hệ thống", value: formatNumber(summary.totalBookings), sub: `${formatNumber(summary.completedBookings)} hoàn thành`, Icon: CalendarDays, tone: "text-accent-indigo bg-accent-indigo/10" },
    { label: "Hóa đơn", value: formatNumber(summary.totalInvoices), sub: `${formatNumber(summary.paidInvoices)} đã thanh toán`, Icon: ReceiptText, tone: "text-warning bg-warning-container" },
    { label: "Doanh thu đã thanh toán", value: formatMoneyShort(summary.paidRevenue), sub: formatMoney(summary.paidRevenue), Icon: CircleDollarSign, tone: "text-success bg-success-container" },
  ] : null;

  const trendBadge = (v, invert = false) => {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    const up = v >= 0;
    const good = invert ? !up : up;
    return (
      <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${good ? "bg-success-container text-success" : "bg-critical-container text-critical"}`}>
        {up ? "+" : ""}{v.toFixed(1).replace(".", ",")}%
      </span>
    );
  };

  const PERIOD_KPIS = [
    {
      label: "Doanh thu trong kỳ",
      value: formatMoneyShort(period.revenue),
      sub: `${formatNumber(period.completed)} lịch hoàn thành`,
      trend: trendBadge(trends.revenue),
      Icon: CircleDollarSign, tone: "text-primary bg-primary-container",
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: fmtPct(period.completionRate),
      sub: `${formatNumber(period.completed)} / ${formatNumber(period.total)} lịch`,
      trend: trendBadge(trends.completionRate),
      Icon: CalendarDays, tone: "text-success bg-success-container",
    },
    {
      label: "Tỷ lệ hủy / no-show",
      value: fmtPct(period.cancelRate),
      sub: `${formatNumber(period.cancelledNoShow)} / ${formatNumber(period.total)} lịch`,
      trend: trendBadge(trends.cancelRate, true),
      Icon: AlertTriangle, tone: "text-no-show bg-no-show-container",
    },
    {
      label: "Doanh thu TB / lịch hoàn thành",
      value: formatMoneyShort(period.avgRevenue),
      sub: "Tính trên lịch hoàn thành",
      trend: null,
      Icon: CircleDollarSign, tone: "text-accent-violet bg-accent-violet/10",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Báo cáo"
        description="Tổng hợp hiệu suất vận hành từ dữ liệu thực của hệ thống."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
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
            {!showCustom && (
              <select
                value={rangeKey}
                onChange={(e) => setRangeKey(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Chọn khoảng thời gian"
              >
                {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            )}
            {showCustom && (
              <>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Từ ngày"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                  aria-label="Đến ngày"
                />
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowCustom((v) => !v)}>
              <CalendarRange /> {showCustom ? "Kỳ nhanh" : "Tùy chọn ngày"}
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {/* BE chưa có API export báo cáo — disabled, không tạo file giả */}
            <Button variant="outline" size="sm" disabled title="Chức năng xuất báo cáo chưa được backend hỗ trợ.">
              <Download /> Xuất báo cáo
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !bookings.length ? (
        <ReportSkeleton />
      ) : error && !bookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Phạm vi báo cáo */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-container px-3 py-1.5 text-xs font-bold text-primary-strong">
              Kỳ báo cáo: {formatDate(start)} – {formatDate(end)}
            </span>
            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground">
              Chi nhánh: {garageLabel}
            </span>
          </div>

          {/* Tổng quan toàn hệ thống */}
          <section>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-foreground">Tổng quan toàn hệ thống</h2>
              <span className="text-xs text-neutral-muted">Không phụ thuộc bộ lọc thời gian</span>
            </div>
            {GLOBAL_KPIS ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {GLOBAL_KPIS.map(({ label, value, sub, Icon, tone }) => (
                  <article key={label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                      <b className="mt-0.5 block text-xl font-semibold text-foreground">{value}</b>
                      <p className="text-xs text-neutral-muted">{sub}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-xs text-neutral-muted">
                Chưa có dữ liệu tổng hợp toàn hệ thống.
              </p>
            )}
          </section>

          {/* Báo cáo trong kỳ đã chọn */}
          <section>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-foreground">Báo cáo trong kỳ đã chọn</h2>
              <span className="text-xs text-neutral-muted">Theo bộ lọc chi nhánh và thời gian</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PERIOD_KPIS.map(({ label, value, sub, trend, Icon, tone }) => (
                <article key={label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-4 text-muted-foreground">{label}</p>
                    <b className="mt-0.5 block text-xl font-semibold text-foreground">
                      {value}
                      {trend}
                    </b>
                    <p className="text-xs text-neutral-muted">{sub}</p>
                  </div>
                </article>
              ))}
            </div>
            {prev && <p className="mt-2 text-xs text-neutral-muted">% so với kỳ liền trước ({formatDate(prevStart)} – {formatDate(prevEnd)}).</p>}
          </section>

          {/* Phân tích */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <BookingStatusDonut data={statusData} />
              <div className="mt-2 text-right">
                <Link to="/quan-tri/bookings" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  Xem lịch hẹn <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div>
              <PaymentStatusCard {...paymentCounts} />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-muted">Trong kỳ đã chọn</span>
                <Link to="/quan-tri/invoices" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
                  Xem hóa đơn <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Hiệu suất theo chi nhánh */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Building2 size={18} className="text-primary" /> Hiệu suất theo chi nhánh
              </h2>
              <span className="text-xs text-neutral-muted">Bấm vào chi nhánh để xem chi tiết</span>
            </div>
            {branchRows.length === 0 ? (
              <p className="px-6 pb-10 pt-2 text-center text-xs text-neutral-muted">
                Chưa có dữ liệu theo chi nhánh trong kỳ này.
              </p>
            ) : (
              <div className="overflow-x-auto px-5 pb-4">
                <table className="w-full min-w-[820px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border font-semibold text-neutral-muted">
                      <th className="py-3 pr-3 font-semibold">Chi nhánh</th>
                      <th className="py-3 pr-3 font-semibold">
                        <button type="button" onClick={() => setBranchSort("total")} className="inline-flex items-center gap-1 hover:text-foreground">
                          Tổng lịch <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 pr-3 font-semibold">Hoàn thành</th>
                      <th className="py-3 pr-3 font-semibold">Tỷ lệ hoàn thành</th>
                      <th className="py-3 pr-3 font-semibold">Hủy / No-show</th>
                      <th className="py-3 pr-3 font-semibold">
                        <button type="button" onClick={() => setBranchSort("revenue")} className="inline-flex items-center gap-1 hover:text-foreground">
                          Doanh thu <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 font-semibold">Tỷ trọng doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface">
                    {branchRows.map((r) => (
                      <tr
                        key={r.name}
                        onClick={() => setBranchDetail(r)}
                        className="cursor-pointer align-middle hover:bg-surface"
                      >
                        <td className="py-3 pr-3 font-bold text-foreground">{r.name}</td>
                        <td className="py-3 pr-3 font-semibold text-ink-soft">{formatNumber(r.total)}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{formatNumber(r.completed)}</td>
                        <td className="py-3 pr-3 font-semibold text-success">
                          {fmtPct(r.total > 0 ? (r.completed / r.total) * 100 : 0)}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{formatNumber(r.cancelledNoShow)}</td>
                        <td className="py-3 pr-3 font-semibold text-foreground">{formatMoney(r.revenue)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(r.share)}%` }} />
                            </div>
                            <span className="font-semibold text-muted-foreground">{fmtPct(r.share)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top dịch vụ theo doanh thu */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Wrench size={18} className="text-primary" /> Top dịch vụ theo doanh thu
              </h2>
              <Link to="/quan-tri/services" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                Xem tất cả dịch vụ <ArrowRight size={14} />
              </Link>
            </div>
            {topServices.length === 0 ? (
              <p className="px-6 pb-10 pt-2 text-center text-xs text-neutral-muted">
                Chưa có dịch vụ hoàn thành trong kỳ này.
              </p>
            ) : (
              <div className="divide-y divide-surface px-5 pb-4">
                {topServices.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 py-3 text-xs">
                    <span className="w-4 shrink-0 font-bold text-neutral-muted">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {s.name}
                        {s.missing && (
                          <span className="ml-1.5 rounded-full bg-warning-container px-2 py-0.5 text-xs font-bold text-warning">
                            Thiếu thông tin
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{formatNumber(s.count)} lịch hoàn thành</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-foreground">{formatMoney(s.revenue)}</p>
                      <p className="mt-0.5 text-neutral-muted">
                        TB {formatMoney(s.count > 0 ? s.revenue / s.count : 0)} / lịch
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <AdminBranchDrawer
        branch={branchDetail}
        open={Boolean(branchDetail)}
        onOpenChange={(open) => { if (!open) setBranchDetail(null); }}
      />
    </PageContainer>
  );
}
