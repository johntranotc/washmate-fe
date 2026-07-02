import { useEffect, useState, useMemo, useCallback } from "react";
import { RefreshCcw, AlertTriangle, Clock, Info, TrendingUp, UserX } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { todayISO } from "../../lib/format";

import { DashboardKpiCards } from "../../components/admin/dashboard/DashboardKpiCards";
import { RevenueTrendChart } from "../../components/admin/dashboard/RevenueTrendChart";
import { ServiceRevenueDonut } from "../../components/admin/dashboard/ServiceRevenueDonut";
import { BookingStatusDonut } from "../../components/admin/dashboard/BookingStatusDonut";
import { BranchRevenueTable } from "../../components/admin/dashboard/BranchRevenueTable";
import { TopCustomersCard } from "../../components/admin/dashboard/TopCustomersCard";
import { LoyaltyTierCards } from "../../components/admin/dashboard/LoyaltyTierCards";
import { LoyaltyPointsSummary } from "../../components/admin/dashboard/LoyaltyPointsSummary";
import { AiInsightPanel } from "../../components/admin/dashboard/AiInsightPanel";
import { AlertsPanel } from "../../components/admin/dashboard/AlertsPanel";
import { RecentBookingsTable } from "../../components/admin/dashboard/RecentBookingsTable";

// Business config (from product spec) — thresholds & discounts are real config, not data.
const LOYALTY_TIERS = [
  { name: "Đồng", points: 0, discount: 5, color: "#CD7F32", image: "/badges/dong.png" },
  { name: "Bạc", points: 500, discount: 8, color: "#94A3B8", image: "/badges/bac.png" },
  { name: "Vàng", points: 1500, discount: 12, color: "#F59E0B", image: "/badges/vang.png" },
  { name: "Bạch Kim", points: 3500, discount: 15, color: "#3B82F6", image: "/badges/bach-kim.png" },
  { name: "Kim Cương", points: 8000, discount: 20, color: "#8B5CF6", image: "/badges/kim-cuong.png" },
];

const COMPLETED = "COMPLETED";
const PROCESSING_STATUSES = ["CONFIRMED", "CHECKED_IN", "WASHING"];
const CANCELLED_STATUSES = ["CANCELLED", "REJECTED", "NO_SHOW"];

const bookingStatusColors = {
  PENDING: "#F59E0B", CONFIRMED: "#3B82F6", CHECKED_IN: "#06B6D4", WASHING: "#8B5CF6",
  COMPLETED: "#10B981", CANCELLED: "#94A3B8", REJECTED: "#EF4444", NO_SHOW: "#F97316",
};
const bookingStatusLabels = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CHECKED_IN: "Đã check-in", WASHING: "Đang rửa",
  COMPLETED: "Đã hoàn thành", CANCELLED: "Đã hủy", REJECTED: "Từ chối", NO_SHOW: "Không đến",
};

// --- date helpers -----------------------------------------------------------
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(iso, delta) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toISO(d);
}
function daysBetween(fromISO, toISOStr) {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISOStr + "T00:00:00");
  return Math.round((b - a) / 86400000) + 1;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [garages, setGarages] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedGarage, setSelectedGarage] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [customFrom, setCustomFrom] = useState(todayISO());
  const [customTo, setCustomTo] = useState(todayISO());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [gRes, bRes, uRes] = await Promise.allSettled([
        garageApi.getAll(),
        adminApi.getBookings(),
        adminApi.getAllUsers(),
      ]);
      if (gRes.status === "fulfilled") setGarages(Array.isArray(gRes.value) ? gRes.value : []);
      if (bRes.status === "fulfilled") {
        const list = normalizeBookingList(bRes.value).map(normalizeStaffBooking);
        list.sort((a, b) => Number(b.id) - Number(a.id));
        setAllBookings(list);
      }
      if (uRes.status === "fulfilled") {
        const u = uRes.value;
        setUsers(Array.isArray(u?.content) ? u.content : Array.isArray(u?.data?.content) ? u.data.content : Array.isArray(u) ? u : []);
      }
      if (bRes.status === "rejected") setError(bRes.reason?.message || "Không thể tải dữ liệu lịch hẹn.");
    } catch (e) {
      console.error("Dashboard data load error:", e);
      setError(e?.message || "Không thể tải dữ liệu bảng điều khiển.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { start, end, prevStart, prevEnd } = useMemo(() => {
    const today = todayISO();
    let s = today, e = today;
    if (dateRange === "today") { s = today; e = today; }
    else if (dateRange === "week") { s = addDays(today, -6); e = today; }
    else if (dateRange === "month") {
      const d = new Date();
      s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      e = today;
    } else if (dateRange === "custom") {
      s = customFrom <= customTo ? customFrom : customTo;
      e = customFrom <= customTo ? customTo : customFrom;
    }
    const len = daysBetween(s, e);
    return { start: s, end: e, prevStart: addDays(s, -len), prevEnd: addDays(s, -1) };
  }, [dateRange, customFrom, customTo]);

  const matchesGarage = useCallback(
    (b) => selectedGarage === "all" || String(b.garageId) === String(selectedGarage),
    [selectedGarage],
  );
  const inRange = (b, s, e) => b.bookingDate && b.bookingDate >= s && b.bookingDate <= e;

  const currentBookings = useMemo(
    () => allBookings.filter((b) => matchesGarage(b) && inRange(b, start, end)),
    [allBookings, matchesGarage, start, end],
  );
  const prevBookings = useMemo(
    () => allBookings.filter((b) => matchesGarage(b) && inRange(b, prevStart, prevEnd)),
    [allBookings, matchesGarage, prevStart, prevEnd],
  );

  const sumRevenue = (list) => list.filter((b) => b.bookingStatus === COMPLETED).reduce((s, b) => s + Number(b.finalAmount || 0), 0);
  const cnt = (list, statuses) => list.filter((b) => statuses.includes(b.bookingStatus)).length;

  const metrics = useMemo(() => ({
    revenue: sumRevenue(currentBookings),
    bookings: currentBookings.length,
    completed: cnt(currentBookings, [COMPLETED]),
    processing: cnt(currentBookings, PROCESSING_STATUSES) + cnt(currentBookings, ["PENDING"]),
    cancelled: cnt(currentBookings, CANCELLED_STATUSES),
    newCustomers: new Set(currentBookings.map((b) => b.customerId ?? b.customerName)).size,
  }), [currentBookings]);

  const changes = useMemo(() => {
    const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
    const prev = {
      revenue: sumRevenue(prevBookings),
      bookings: prevBookings.length,
      completed: cnt(prevBookings, [COMPLETED]),
      processing: cnt(prevBookings, PROCESSING_STATUSES) + cnt(prevBookings, ["PENDING"]),
      cancelled: cnt(prevBookings, CANCELLED_STATUSES),
      newCustomers: new Set(prevBookings.map((b) => b.customerId ?? b.customerName)).size,
    };
    return {
      revenue: pct(metrics.revenue, prev.revenue),
      bookings: pct(metrics.bookings, prev.bookings),
      completed: pct(metrics.completed, prev.completed),
      processing: pct(metrics.processing, prev.processing),
      cancelled: pct(metrics.cancelled, prev.cancelled),
      newCustomers: pct(metrics.newCustomers, prev.newCustomers),
    };
  }, [metrics, prevBookings]);

  const revenueData = useMemo(() => {
    const len = daysBetween(start, end);
    const byDay = (list) => {
      const m = {};
      list.forEach((b) => { if (b.bookingStatus === COMPLETED && b.bookingDate) m[b.bookingDate] = (m[b.bookingDate] || 0) + Number(b.finalAmount || 0); });
      return m;
    };
    const curMap = byDay(currentBookings);
    const prevMap = byDay(prevBookings);
    const out = [];
    for (let i = 0; i < len; i += 1) {
      const dCur = addDays(start, i);
      const dPrev = addDays(prevStart, i);
      out.push({ date: dCur.slice(5).split("-").reverse().join("/"), revenue: curMap[dCur] || 0, previousRevenue: prevMap[dPrev] || 0 });
    }
    return out.length > 45 ? out.slice(-45) : out;
  }, [currentBookings, prevBookings, start, end, prevStart]);

  const hasPrevRevenue = revenueData.some((d) => d.previousRevenue > 0);

  const serviceRevenue = useMemo(() => {
    const m = {};
    currentBookings.forEach((b) => { if (b.bookingStatus === COMPLETED && b.serviceName) m[b.serviceName] = (m[b.serviceName] || 0) + Number(b.finalAmount || 0); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [currentBookings]);

  const branchRevenue = useMemo(() => {
    const m = {};
    currentBookings.forEach((b) => {
      if (b.bookingStatus === COMPLETED) {
        const key = b.garageName || "Chưa rõ chi nhánh";
        if (!m[key]) m[key] = { revenue: 0, bookings: 0 };
        m[key].revenue += Number(b.finalAmount || 0);
        m[key].bookings += 1;
      }
    });
    const total = Object.values(m).reduce((s, i) => s + i.revenue, 0) || 1;
    return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue).map(([name, st]) => ({
      name, revenue: st.revenue, bookings: st.bookings, percentage: Math.round((st.revenue / total) * 100),
    }));
  }, [currentBookings]);

  const statusData = useMemo(() => {
    const m = {};
    currentBookings.forEach((b) => { const st = b.bookingStatus || "PENDING"; m[st] = (m[st] || 0) + 1; });
    const total = currentBookings.length || 1;
    return Object.entries(m).map(([k, v]) => ({
      name: bookingStatusLabels[k] || k, value: v, percentage: Math.round((v / total) * 100), color: bookingStatusColors[k] || "#94A3B8",
    })).sort((a, b) => b.value - a.value);
  }, [currentBookings]);

  const topCustomers = useMemo(() => {
    const m = {};
    currentBookings.forEach((b) => {
      if (b.bookingStatus === COMPLETED && b.customerName) {
        if (!m[b.customerName]) m[b.customerName] = { bookings: 0, spend: 0 };
        m[b.customerName].bookings += 1;
        m[b.customerName].spend += Number(b.finalAmount || 0);
      }
    });
    return Object.entries(m).sort((a, b) => b[1].bookings - a[1].bookings).slice(0, 5).map(([name, st]) => ({ name, bookings: st.bookings, spend: st.spend }));
  }, [currentBookings]);

  const tiersWithCounts = useMemo(() => {
    const pf = (u) => u?.lifetimePoints ?? u?.loyaltyPoints ?? u?.points;
    const hasPoints = users.some((u) => pf(u) != null);
    return LOYALTY_TIERS.map((t, idx) => {
      let customers = null;
      if (hasPoints) {
        const nextMin = LOYALTY_TIERS[idx + 1]?.points ?? Infinity;
        customers = users.filter((u) => { const p = Number(pf(u) || 0); return p >= t.points && p < nextMin; }).length;
      }
      return { ...t, customers };
    });
  }, [users]);

  const loyaltyTotals = useMemo(() => {
    const pf = (u) => u?.lifetimePoints ?? u?.loyaltyPoints ?? u?.points;
    const af = (u) => u?.availablePoints ?? u?.points;
    const hasPoints = users.some((u) => pf(u) != null);
    if (!hasPoints) return { totalIssued: null, totalUsed: null, totalRemaining: null, customersWithPoints: null };
    const totalIssued = users.reduce((s, u) => s + Number(pf(u) || 0), 0);
    const totalRemaining = users.reduce((s, u) => s + Number(af(u) || 0), 0);
    return { totalIssued, totalUsed: Math.max(0, totalIssued - totalRemaining), totalRemaining, customersWithPoints: users.filter((u) => Number(pf(u) || 0) > 0).length };
  }, [users]);

  const insights = useMemo(() => {
    const list = [];
    const byCustomer = {};
    allBookings.filter(matchesGarage).forEach((b) => {
      if (b.bookingStatus === COMPLETED && b.bookingDate) {
        const k = b.customerId ?? b.customerName;
        if (!byCustomer[k]) byCustomer[k] = { count: 0, last: b.bookingDate };
        byCustomer[k].count += 1;
        if (b.bookingDate > byCustomer[k].last) byCustomer[k].last = b.bookingDate;
      }
    });
    const cutoff = addDays(todayISO(), -30);
    const vipInactive = Object.values(byCustomer).filter((c) => c.count >= 2 && c.last < cutoff).length;
    if (vipInactive > 0) list.push({ title: `${vipInactive} khách thân thiết hơn 30 ngày chưa quay lại`, description: "Cân nhắc gửi ưu đãi giữ chân nhóm khách này.", colorBg: "bg-orange-100", colorText: "text-orange-600", icon: <UserX size={16} /> });

    const svc = (arr) => arr.reduce((m, b) => { if (b.serviceName) m[b.serviceName] = (m[b.serviceName] || 0) + 1; return m; }, {});
    const cur = svc(currentBookings), prv = svc(prevBookings);
    let best = null;
    Object.entries(cur).forEach(([name, c]) => { const p = prv[name] || 0; if (p > 0) { const g = ((c - p) / p) * 100; if (!best || g > best.growth) best = { name, growth: g }; } });
    if (best && best.growth > 0) list.push({ title: `Dịch vụ "${best.name}" tăng ${best.growth.toFixed(0)}%`, description: "Nhu cầu tăng so với kỳ trước — có thể ưu tiên nhân lực.", colorBg: "bg-emerald-100", colorText: "text-emerald-600", icon: <TrendingUp size={16} /> });

    const slot = {};
    currentBookings.forEach((b) => { if (b.slotTime) slot[b.slotTime] = (slot[b.slotTime] || 0) + 1; });
    const busiest = Object.entries(slot).sort((a, b) => b[1] - a[1])[0];
    if (busiest && busiest[1] >= 3) list.push({ title: `Khung giờ ${busiest[0]} đang quá tải (${busiest[1]} lịch)`, description: "Cân nhắc mở thêm slot hoặc phân bổ lại nhân sự.", colorBg: "bg-purple-100", colorText: "text-purple-600", icon: <Clock size={16} /> });
    return list;
  }, [allBookings, currentBookings, prevBookings, matchesGarage]);

  const alerts = useMemo(() => {
    const list = [];
    const scope = allBookings.filter(matchesGarage);
    const pending = scope.filter((b) => b.bookingStatus === "PENDING").length;
    if (pending > 0) list.push({ title: `${pending} lịch hẹn đang chờ xác nhận`, description: "Vui lòng kiểm tra và xác nhận sớm.", colorText: "text-red-500 bg-red-50 p-1.5 rounded-full", icon: <AlertTriangle size={14} /> });
    const today = todayISO();
    const nowHM = new Date().toTimeString().slice(0, 5);
    const overdue = scope.filter((b) => b.bookingStatus === "CONFIRMED" && b.bookingDate === today && b.slotTime && b.slotTime < nowHM).length;
    if (overdue > 0) list.push({ title: `${overdue} lịch đã qua giờ nhưng chưa check-in`, description: "Kiểm tra để tránh khách chờ lâu.", colorText: "text-orange-500 bg-orange-50 p-1.5 rounded-full", icon: <Clock size={14} /> });
    const noShow = scope.filter((b) => b.bookingStatus === "NO_SHOW" && b.bookingDate === today).length;
    if (noShow > 0) list.push({ title: `${noShow} khách không đến hôm nay`, description: "Theo dõi tỷ lệ no-show để có phương án.", colorText: "text-blue-500 bg-blue-50 p-1.5 rounded-full", icon: <Info size={14} /> });
    return list;
  }, [allBookings, matchesGarage]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      {/* Header */}
      <header className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tổng quan doanh nghiệp</h1>
          <p className="mt-1 text-sm text-slate-500">Cập nhật tình hình hoạt động kinh doanh toàn hệ thống.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500" value={selectedGarage} onChange={(e) => setSelectedGarage(e.target.value)}>
            <option value="all">Tất cả chi nhánh</option>
            {garages.map((g) => (<option key={g.id || g.garageId} value={g.id || g.garageId}>{g.name || g.garageName}</option>))}
          </select>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="custom">Tùy chọn</option>
          </select>
          {dateRange === "custom" && (
            <>
              <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500" />
              <span className="text-sm text-slate-400">→</span>
              <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500" />
            </>
          )}
          <button onClick={loadData} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCcw size={16} /> Tải lại
          </button>
        </div>
      </header>

      {loading && !allBookings.length ? (
        <div className="py-20 text-center">
          <RefreshCcw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="font-semibold text-slate-500">Đang tổng hợp dữ liệu doanh nghiệp...</p>
        </div>
      ) : error && !allBookings.length ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-500" size={28} />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={loadData} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
        </div>
      ) : (
        <>
          <DashboardKpiCards {...metrics} changes={changes} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main content */}
            <div className="min-w-0 space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                <RevenueTrendChart data={revenueData} showPrevious={hasPrevRevenue} range={dateRange} onRangeChange={setDateRange} />
                <ServiceRevenueDonut data={serviceRevenue} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <BookingStatusDonut data={statusData} />
                <BranchRevenueTable data={branchRevenue} />
                <TopCustomersCard data={topCustomers} />
              </div>
            </div>

            {/* Right rail */}
            <div className="min-w-0 space-y-6">
              <AiInsightPanel insights={insights} />
              <AlertsPanel alerts={alerts} />
              <LoyaltyPointsSummary totals={loyaltyTotals} />
            </div>
          </div>

          {/* Full-width sections */}
          <LoyaltyTierCards tiers={tiersWithCounts} />
          <RecentBookingsTable bookings={currentBookings} />
        </>
      )}
    </div>
  );
}
