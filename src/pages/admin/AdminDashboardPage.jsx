import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import {
  normalizeBookingList,
  normalizeStaffBooking,
  isOverdue,
  isPaymentInvalid,
  isUrgent,
} from "../../lib/staff-booking-data";
import { bookingStatusLabels } from "../../lib/status-tones";
import { todayISO, formatTime, friendlyName } from "../../lib/format";
import { STATUS_COLORS, CHART } from "../../lib/chart-colors";
import { DashboardKpiCards } from "../../components/admin/dashboard/DashboardKpiCards";
import { NeedActionTodayCard } from "../../components/admin/dashboard/NeedActionTodayCard";
import { RevenueTrendChart } from "../../components/admin/dashboard/RevenueTrendChart";
import { BookingStatusDonut } from "../../components/admin/dashboard/BookingStatusDonut";
import { OperationalInsightPanel } from "../../components/admin/dashboard/OperationalInsightPanel";
import { PaymentStatusCard } from "../../components/admin/dashboard/PaymentStatusCard";
import { BranchRevenueTable } from "../../components/admin/dashboard/BranchRevenueTable";
import { ServiceRevenueDonut } from "../../components/admin/dashboard/ServiceRevenueDonut";
import { TopCustomersCard } from "../../components/admin/dashboard/TopCustomersCard";
import { AttentionBookingsCard } from "../../components/admin/dashboard/AttentionBookingsCard";
import { RecentActivityCard } from "../../components/admin/dashboard/RecentActivityCard";

const COMPLETED = "COMPLETED";
const SERVING_STATUSES = ["CHECKED_IN", "WASHING"];

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toISO(d);
}
function daysBetween(from, to) {
  return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);
}

// Chuỗi kỹ thuật/seed còn sót trong DB — không đưa lên UI Admin.
const isTechnicalText = (s) => /(SEED|_V\d+|^WM_|TEST_)/i.test(s || "");

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [garages, setGarages] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [beInsights, setBeInsights] = useState(null); // null = chưa tải / lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedGarage, setSelectedGarage] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [customFrom, setCustomFrom] = useState(todayISO());
  const [customTo, setCustomTo] = useState(todayISO());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [gRes, bRes] = await Promise.allSettled([garageApi.getAll(), adminApi.getBookings()]);
    if (gRes.status === "fulfilled" && Array.isArray(gRes.value)) setGarages(gRes.value);
    if (bRes.status === "fulfilled") {
      setAllBookings(normalizeBookingList(bRes.value).map(normalizeStaffBooking));
      setLastUpdated(new Date());
    } else {
      console.error("[AdminDashboard] load bookings failed:", bRes.reason);
      setError(bRes.reason?.message || "Không thể tải dữ liệu tổng quan.");
      setAllBookings([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Khoảng thời gian đang chọn + kỳ liền trước (cùng độ dài) để so sánh.
  const { start, end, prevStart, prevEnd } = useMemo(() => {
    const today = todayISO();
    let s = today;
    let e = today;
    if (dateRange === "week") s = addDays(today, -6);
    else if (dateRange === "month") s = `${today.slice(0, 8)}01`;
    else if (dateRange === "custom") {
      s = customFrom <= customTo ? customFrom : customTo;
      e = customFrom <= customTo ? customTo : customFrom;
    }
    const len = daysBetween(s, e) + 1;
    return { start: s, end: e, prevStart: addDays(s, -len), prevEnd: addDays(s, -1) };
  }, [dateRange, customFrom, customTo]);

  // Insight vận hành thật từ BE theo đúng kỳ đang xem (rule-based aggregate).
  useEffect(() => {
    let mounted = true;
    adminApi
      .getOwnerInsights({ fromDate: start, toDate: end })
      .then((res) => { if (mounted) setBeInsights(res); })
      .catch(() => { if (mounted) setBeInsights(null); });
    return () => { mounted = false; };
  }, [start, end, lastUpdated]);

  const matchesGarage = useCallback(
    (b) => selectedGarage === "all" || String(b.garageId) === String(selectedGarage),
    [selectedGarage],
  );
  const inRange = (b, s, e) => b.bookingDate >= s && b.bookingDate <= e;

  const currentBookings = useMemo(
    () => allBookings.filter((b) => matchesGarage(b) && inRange(b, start, end)),
    [allBookings, matchesGarage, start, end],
  );
  const prevBookings = useMemo(
    () => allBookings.filter((b) => matchesGarage(b) && inRange(b, prevStart, prevEnd)),
    [allBookings, matchesGarage, prevStart, prevEnd],
  );

  // ===== KPI =====
  const metricsOf = useCallback((list, s, e) => {
    const completedList = list.filter((b) => b.bookingStatus === COMPLETED);
    // Khách mới = khách có booking ĐẦU TIÊN (toàn lịch sử, theo chi nhánh) nằm trong kỳ
    const firstByCustomer = new Map();
    allBookings.filter(matchesGarage).forEach((b) => {
      const key = b.customerId ?? b.customerName;
      if (!key || !b.bookingDate) return;
      const cur = firstByCustomer.get(key);
      if (!cur || b.bookingDate < cur) firstByCustomer.set(key, b.bookingDate);
    });
    let newCustomers = 0;
    firstByCustomer.forEach((firstDate) => {
      if (firstDate >= s && firstDate <= e) newCustomers += 1;
    });
    return {
      revenue: completedList.reduce((sum, b) => sum + (b.finalAmount || 0), 0),
      bookings: list.length,
      completed: completedList.length,
      serving: list.filter((b) => SERVING_STATUSES.includes(b.bookingStatus)).length,
      needAction: list.filter((b) => isUrgent(b)).length,
      newCustomers,
    };
  }, [allBookings, matchesGarage]);

  const metrics = useMemo(() => metricsOf(currentBookings, start, end), [metricsOf, currentBookings, start, end]);
  const changes = useMemo(() => {
    if (prevBookings.length === 0) return {};
    const prev = metricsOf(prevBookings, prevStart, prevEnd);
    const pct = (cur, p) => (p > 0 ? ((cur - p) / p) * 100 : null);
    return {
      revenue: pct(metrics.revenue, prev.revenue),
      bookings: pct(metrics.bookings, prev.bookings),
      completed: pct(metrics.completed, prev.completed),
      newCustomers: pct(metrics.newCustomers, prev.newCustomers),
      // serving/needAction là trạng thái tức thời — không so kỳ trước để tránh gây hiểu nhầm
    };
  }, [metricsOf, prevBookings, prevStart, prevEnd, metrics]);

  // ===== Cần xử lý hôm nay (luôn tính theo NGÀY HÔM NAY, theo chi nhánh) =====
  const today = todayISO();
  const todayBookings = useMemo(
    () => allBookings.filter((b) => matchesGarage(b) && b.bookingDate === today),
    [allBookings, matchesGarage, today],
  );
  const needActionToday = useMemo(() => ({
    pending: todayBookings.filter((b) => b.bookingStatus === "PENDING").length,
    overdue: todayBookings.filter((b) => isOverdue(b)).length,
    failedPayments: todayBookings.filter((b) => b.paymentStatus === "FAILED").length,
    refunded: currentBookings.filter((b) => b.paymentStatus === "REFUNDED").length,
  }), [todayBookings, currentBookings]);

  // ===== Doanh thu theo ngày (line chart, tối đa 92 ngày gần nhất trong kỳ) =====
  const { revenueData, hasPrevRevenue } = useMemo(() => {
    const len = Math.min(daysBetween(start, end) + 1, 92);
    const s = addDays(end, -(len - 1));
    const byDay = new Map();
    const prevByDay = new Map();
    currentBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      byDay.set(b.bookingDate, (byDay.get(b.bookingDate) || 0) + (b.finalAmount || 0));
    });
    prevBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      prevByDay.set(b.bookingDate, (prevByDay.get(b.bookingDate) || 0) + (b.finalAmount || 0));
    });
    const data = [];
    let anyPrev = false;
    for (let i = 0; i < len; i += 1) {
      const dateISO = addDays(s, i);
      const prevISO = addDays(prevStart, i);
      const previousRevenue = prevByDay.get(prevISO) || 0;
      if (previousRevenue > 0) anyPrev = true;
      data.push({ dateISO, revenue: byDay.get(dateISO) || 0, previousRevenue });
    }
    return { revenueData: data, hasPrevRevenue: anyPrev };
  }, [currentBookings, prevBookings, start, end, prevStart]);

  // ===== Donut trạng thái (gộp CHECKED_IN + WASHING = "Xe đang phục vụ") =====
  const statusData = useMemo(() => {
    const counts = new Map();
    currentBookings.forEach((b) => {
      const key = SERVING_STATUSES.includes(b.bookingStatus) ? "SERVING" : b.bookingStatus;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const total = currentBookings.length || 1;
    const order = ["COMPLETED", "SERVING", "CONFIRMED", "PENDING", "NO_SHOW", "REJECTED", "CANCELLED"];
    return order
      .filter((k) => counts.get(k) > 0)
      .map((k) => ({
        name: k === "SERVING" ? "Xe đang phục vụ" : bookingStatusLabels[k] || k,
        value: counts.get(k),
        percentage: Math.round((counts.get(k) / total) * 100),
        color: k === "SERVING" ? STATUS_COLORS.WASHING : STATUS_COLORS[k] || CHART.compare,
      }));
  }, [currentBookings]);

  // ===== Doanh thu theo chi nhánh / hiệu suất dịch vụ =====
  const branchRevenue = useMemo(() => {
    const map = new Map();
    currentBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.garageName, "Chi nhánh chưa cập nhật");
      const cur = map.get(name) || { name, revenue: 0, bookings: 0 };
      cur.revenue += b.finalAmount || 0;
      cur.bookings += 1;
      map.set(name, cur);
    });
    const rows = [...map.values()].sort((a, b) => b.revenue - a.revenue);
    const max = rows[0]?.revenue || 1;
    return rows.map((r) => ({ ...r, percentage: Math.round((r.revenue / max) * 100) }));
  }, [currentBookings]);

  const serviceRevenue = useMemo(() => {
    const map = new Map();
    currentBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.serviceName, "Dịch vụ chưa cập nhật");
      map.set(name, (map.get(name) || 0) + (b.finalAmount || 0));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [currentBookings]);

  // ===== Top khách hàng thân thiết (tối đa 5) =====
  const topCustomers = useMemo(() => {
    const map = new Map();
    currentBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.customerName, "Khách hàng chưa cập nhật");
      const cur = map.get(name) || { name, bookings: 0, spend: 0 };
      cur.bookings += 1;
      cur.spend += b.finalAmount || 0;
      map.set(name, cur);
    });
    return [...map.values()].sort((a, b) => b.bookings - a.bookings || b.spend - a.spend).slice(0, 5);
  }, [currentBookings]);

  // ===== Tình trạng thanh toán (từ payment status thật gắn trên booking) =====
  const paymentCounts = useMemo(() => ({
    paid: currentBookings.filter((b) => b.paymentStatus === "PAID").length,
    pending: currentBookings.filter((b) => b.paymentStatus === "PENDING").length,
    failed: currentBookings.filter((b) => b.paymentStatus === "FAILED").length,
    refunded: currentBookings.filter((b) => b.paymentStatus === "REFUNDED").length,
  }), [currentBookings]);

  // ===== Lịch cần chú ý (5 dòng) =====
  const attentionBookings = useMemo(() => {
    const rows = [];
    currentBookings.forEach((b) => {
      if (isOverdue(b)) {
        rows.push({ ...b, priority: 0, issue: "Quá giờ chưa check-in", tone: "bg-no-show-container text-no-show" });
      } else if (isPaymentInvalid(b)) {
        rows.push({ ...b, priority: 1, issue: "Payment cần đối soát", tone: "bg-critical-container text-critical" });
      } else if (b.bookingStatus === "PENDING") {
        rows.push({ ...b, priority: 2, issue: "Chờ xác nhận", tone: "bg-warning-container text-warning" });
      } else if (b.bookingStatus === "CONFIRMED" && b.paymentStatus !== "PAID") {
        rows.push({ ...b, priority: 3, issue: "Chờ thanh toán", tone: "bg-warning-container text-warning" });
      }
    });
    return rows
      .sort((a, b) => a.priority - b.priority || (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99"))
      .slice(0, 5);
  }, [currentBookings]);

  // ===== Insight vận hành: ưu tiên BE (rule-based thật), fallback rule FE từ booking thật =====
  const insights = useMemo(() => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, OPPORTUNITY: 2, POSITIVE: 3 };
    const fromBE = (beInsights?.insights || [])
      .filter((it) => it.status !== "DISMISSED")
      .filter((it) => !isTechnicalText(it.title) && !isTechnicalText(it.summary))
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
      .slice(0, 2)
      .map((it) => ({ title: it.title, description: it.summary, severity: it.severity }));
    if (fromBE.length > 0) return fromBE;

    // Fallback: 2 rule tính từ booking thật trong kỳ
    const list = [];
    const growth = new Map();
    currentBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.serviceName, "");
      if (name) growth.set(name, (growth.get(name) || 0) + 1);
    });
    const prevGrowth = new Map();
    prevBookings.forEach((b) => {
      if (b.bookingStatus !== COMPLETED) return;
      const name = friendlyName(b.serviceName, "");
      if (name) prevGrowth.set(name, (prevGrowth.get(name) || 0) + 1);
    });
    let best = null;
    growth.forEach((cur, name) => {
      const prev = prevGrowth.get(name) || 0;
      if (prev > 0 && cur > prev) {
        const pct = Math.round(((cur - prev) / prev) * 100);
        if (!best || pct > best.pct) best = { name, pct };
      }
    });
    if (best) {
      list.push({
        title: `Dịch vụ ${best.name} tăng ${best.pct}%`,
        description: "So với kỳ liền trước, theo số lượt hoàn tất.",
        severity: "OPPORTUNITY",
      });
    }
    const slotCount = new Map();
    currentBookings.forEach((b) => {
      if (b.slotTime) slotCount.set(b.slotTime, (slotCount.get(b.slotTime) || 0) + 1);
    });
    const busiest = [...slotCount.entries()].sort((a, b) => b[1] - a[1])[0];
    if (busiest && busiest[1] >= 3) {
      list.push({
        title: `Khung giờ ${formatTime(busiest[0])} đang quá tải`,
        description: `${busiest[1]} lịch hẹn trong cùng khung giờ ở kỳ này.`,
        severity: "WARNING",
      });
    }
    return list.slice(0, 2);
  }, [beInsights, currentBookings, prevBookings]);

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Tổng quan doanh nghiệp"
        description="Cập nhật tình hình hoạt động kinh doanh toàn hệ thống."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGarage}
              onChange={(e) => setSelectedGarage(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-ring"
              aria-label="Chọn chi nhánh"
            >
              <option value="all">Tất cả chi nhánh</option>
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                </option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-ring"
              aria-label="Chọn khoảng thời gian"
            >
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chọn</option>
            </select>
            {dateRange === "custom" && (
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
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !allBookings.length ? (
        <DashboardSkeleton />
      ) : error && !allBookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          <DashboardKpiCards {...metrics} changes={changes} />

          <NeedActionTodayCard {...needActionToday} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <RevenueTrendChart data={revenueData} showPrevious={hasPrevRevenue} />
              <BookingStatusDonut data={statusData} />
            </div>
            <div className="min-w-0 space-y-6">
              <OperationalInsightPanel insights={insights} />
              <PaymentStatusCard {...paymentCounts} />
            </div>
          </div>

          {/* Bottom grid — đã bỏ "Tóm tắt tích điểm"; chi tiết loyalty ở trang Tích điểm & Thành viên */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-4">
            {selectedGarage === "all" ? (
              <BranchRevenueTable data={branchRevenue} />
            ) : (
              <ServiceRevenueDonut data={serviceRevenue} />
            )}
            <TopCustomersCard data={topCustomers} />
            <AttentionBookingsCard bookings={attentionBookings} />
            <RecentActivityCard />
          </div>
        </>
      )}
    </PageContainer>
  );
}
