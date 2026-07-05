import { useCallback, useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Link } from "react-router-dom";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BrainCircuit, RefreshCw, Settings2, AlertTriangle, TrendingDown, TrendingUp, Clock, UserX,
  CircleDollarSign, ClipboardList, CheckCircle2, XCircle, Users, Droplets, Lightbulb, ChevronRight,
  BarChart3, ShieldAlert, X, Hourglass, ServerCrash, CalendarDays,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { analyticsApi } from "../../api/analyticsApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { formatDate, formatMoney, formatMoneyShort, formatNumber, todayISO } from "../../lib/format";
import { CHART } from "../../lib/chart-colors";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(iso, delta) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toISO(d);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000) + 1;
}
function weekLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `Tuần ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const RANGES = [
  ["today", "Hôm nay"],
  ["week", "7 ngày"],
  ["month", "Tháng này"],
  ["lastMonth", "Tháng trước"],
  ["custom", "Tùy chọn"],
];

const GROUPS = [
  ["day", "Theo ngày"],
  ["week", "Theo tuần"],
  ["month", "Theo tháng"],
];

const CANCEL_STATUSES = ["CANCELLED", "REJECTED", "NO_SHOW"];

// Ngưỡng rule-based dùng để sinh insight — đây là CẤU HÌNH thật của FE, không phải dữ liệu giả.
const RULES = [
  { key: "revenue-drop", label: "Doanh thu giảm", desc: "So sánh doanh thu kỳ hiện tại với kỳ liền trước có cùng độ dài.", threshold: "Giảm ≥ 5% → CRITICAL, giảm < 5% → WARNING" },
  { key: "cancel-rate", label: "Tỷ lệ hủy / no-show", desc: "Tính trên tổng lịch hẹn trong kỳ đã chọn.", threshold: "≥ 20% → CRITICAL, ≥ 10% → WARNING" },
  { key: "peak-hour", label: "Khung giờ quá tải", desc: "Khung giờ chiếm tỷ trọng lịch hẹn cao nhất trong kỳ.", threshold: "≥ 25% tổng lịch và ≥ 3 lịch → WARNING" },
  { key: "vip-inactive", label: "Khách VIP chưa quay lại", desc: "Khách có ≥ 2 lần rửa hoàn thành nhưng không quay lại.", threshold: "> 30 ngày không quay lại → INFO" },
  { key: "service-growth", label: "Dịch vụ tăng trưởng", desc: "Dịch vụ có số đơn tăng mạnh nhất so với kỳ trước.", threshold: "Tăng > 0% → INFO" },
];

const SEVERITY = {
  CRITICAL: { label: "CRITICAL", text: "text-critical", bg: "bg-critical-container", chip: "bg-critical-container text-critical", border: "border-critical/25", iconBg: "bg-critical-container text-critical" },
  WARNING: { label: "WARNING", text: "text-warning", bg: "bg-warning-container", chip: "bg-warning-container text-warning", border: "border-warning/25", iconBg: "bg-warning-container text-warning" },
  INFO: { label: "INFO", text: "text-primary", bg: "bg-primary-container", chip: "bg-primary-container text-primary", border: "border-primary/20", iconBg: "bg-primary-container text-primary" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminInsightPage() {
  const [bookings, setBookings] = useState([]);
  const [segments, setSegments] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzedAt, setAnalyzedAt] = useState(null);

  const [range, setRange] = useState("month");
  const [customFrom, setCustomFrom] = useState(addDays(todayISO(), -13));
  const [customTo, setCustomTo] = useState(todayISO());
  const [group, setGroup] = useState("day");
  const [selectedId, setSelectedId] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      adminApi.getBookings({ size: 1000 }),
      analyticsApi.getCustomerSegments(),
      analyticsApi.getCustomerBehavior(),
    ]).then(([bks, segs, logs]) => {
      if (bks.status === "fulfilled") {
        setBookings(normalizeBookingList(bks.value).map(normalizeStaffBooking));
      } else {
        setError(bks.reason?.message || "Không thể tải dữ liệu phân tích.");
        setBookings([]);
      }
      setSegments(segs.status === "fulfilled" && Array.isArray(segs.value) ? segs.value : []);
      setBehaviorLogs(logs.status === "fulfilled" && Array.isArray(logs.value) ? logs.value : []);
      setAnalyzedAt(new Date());
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Kỳ phân tích & kỳ so sánh ------------------------------------------
  const { start, end, prevStart, prevEnd } = useMemo(() => {
    const today = todayISO();
    let s = today, e = today;
    if (range === "week") { s = addDays(today, -6); e = today; }
    else if (range === "month") { s = `${today.slice(0, 7)}-01`; e = today; }
    else if (range === "lastMonth") {
      const d = new Date(); d.setDate(1); d.setDate(0); // ngày cuối tháng trước
      e = toISO(d);
      s = `${e.slice(0, 7)}-01`;
    } else if (range === "custom") {
      s = customFrom <= customTo ? customFrom : customTo;
      e = customFrom <= customTo ? customTo : customFrom;
    }
    const len = daysBetween(s, e);
    return { start: s, end: e, prevStart: addDays(s, -len), prevEnd: addDays(s, -1) };
  }, [range, customFrom, customTo]);

  const inRange = (b, s, e) => b.bookingDate && b.bookingDate >= s && b.bookingDate <= e;
  const cur = useMemo(() => bookings.filter((b) => inRange(b, start, end)), [bookings, start, end]);
  const prev = useMemo(() => bookings.filter((b) => inRange(b, prevStart, prevEnd)), [bookings, prevStart, prevEnd]);

  const revenueOf = (list) => list.filter((b) => b.bookingStatus === "COMPLETED").reduce((s, b) => s + Number(b.finalAmount || 0), 0);
  const pct = (c, p) => (p > 0 ? ((c - p) / p) * 100 : null);

  // ---- KPI -----------------------------------------------------------------
  const kpi = useMemo(() => {
    const revenue = revenueOf(cur);
    const prevRevenue = revenueOf(prev);
    const orders = cur.length;
    const completed = cur.filter((b) => b.bookingStatus === "COMPLETED").length;
    const cancelled = cur.filter((b) => CANCEL_STATUSES.includes(b.bookingStatus)).length;
    const prevCancelRate = prev.length ? (prev.filter((b) => CANCEL_STATUSES.includes(b.bookingStatus)).length / prev.length) * 100 : null;
    const cancelRate = orders ? (cancelled / orders) * 100 : 0;
    const days = daysBetween(start, end);
    return {
      revenue, orders, completed, cancelled, cancelRate,
      completionRate: orders ? (completed / orders) * 100 : 0,
      avgPerDay: orders / days,
      trendRevenue: pct(revenue, prevRevenue),
      trendOrders: pct(orders, prev.length),
      trendCompleted: pct(completed, prev.filter((b) => b.bookingStatus === "COMPLETED").length),
      trendCancel: prevCancelRate == null ? null : cancelRate - prevCancelRate, // chênh lệch điểm %
    };
  }, [cur, prev, start, end]);

  // ---- Chart: doanh thu + số đơn -------------------------------------------
  const chartData = useMemo(() => {
    const revMap = {}, orderMap = {};
    cur.forEach((b) => {
      if (!b.bookingDate) return;
      orderMap[b.bookingDate] = (orderMap[b.bookingDate] || 0) + 1;
      if (b.bookingStatus === "COMPLETED") revMap[b.bookingDate] = (revMap[b.bookingDate] || 0) + Number(b.finalAmount || 0);
    });
    const len = Math.min(daysBetween(start, end), 92);
    const daily = [];
    for (let i = 0; i < len; i += 1) {
      const d = addDays(start, i);
      daily.push({ dateISO: d, revenue: revMap[d] || 0, orders: orderMap[d] || 0 });
    }
    if (group === "day") {
      return daily.map((x) => ({ label: `${x.dateISO.slice(8, 10)}/${x.dateISO.slice(5, 7)}`, revenue: x.revenue, orders: x.orders }));
    }
    const buckets = new Map();
    daily.forEach((x) => {
      const key = group === "week" ? weekLabel(x.dateISO) : `${x.dateISO.slice(5, 7)}/${x.dateISO.slice(0, 4)}`;
      const cell = buckets.get(key) || { label: key, revenue: 0, orders: 0 };
      cell.revenue += x.revenue;
      cell.orders += x.orders;
      buckets.set(key, cell);
    });
    return Array.from(buckets.values());
  }, [cur, start, end, group]);

  const hasChartData = chartData.some((d) => d.revenue > 0 || d.orders > 0);

  // ---- Dịch vụ phổ biến ------------------------------------------------------
  const topServices = useMemo(() => {
    const m = {};
    cur.forEach((b) => { if (b.serviceName) m[b.serviceName] = (m[b.serviceName] || 0) + 1; });
    const total = cur.length || 1;
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, share: (count / total) * 100 }));
  }, [cur]);

  // ---- Khách hàng ------------------------------------------------------------
  const customerStats = useMemo(() => {
    const firstByCustomer = {};
    bookings.forEach((b) => {
      const k = b.customerId ?? b.customerName;
      if (!k || !b.bookingDate) return;
      if (!firstByCustomer[k] || b.bookingDate < firstByCustomer[k]) firstByCustomer[k] = b.bookingDate;
    });
    const inPeriod = new Set();
    cur.forEach((b) => { const k = b.customerId ?? b.customerName; if (k) inPeriod.add(k); });
    let newCount = 0;
    inPeriod.forEach((k) => { if (firstByCustomer[k] >= start && firstByCustomer[k] <= end) newCount += 1; });
    const returning = inPeriod.size - newCount;
    const completed = cur.filter((b) => b.bookingStatus === "COMPLETED").length;
    return {
      total: inPeriod.size,
      newCount,
      returning,
      returnRate: inPeriod.size ? (returning / inPeriod.size) * 100 : 0,
      avgOrderValue: completed ? revenueOf(cur) / completed : 0,
    };
  }, [bookings, cur, start, end]);

  // ---- Insight rule-based từ dữ liệu thật -------------------------------------
  const insights = useMemo(() => {
    const list = [];
    const prevRevenue = revenueOf(prev);

    if (prevRevenue > 0) {
      const g = ((kpi.revenue - prevRevenue) / prevRevenue) * 100;
      if (g < 0) {
        list.push({
          id: "revenue-drop",
          severity: Math.abs(g) >= 5 ? "CRITICAL" : "WARNING",
          icon: <TrendingDown size={18} />,
          title: "Doanh thu đang có dấu hiệu giảm",
          summary: `Doanh thu kỳ hiện tại giảm ${Math.abs(g).toFixed(1)}% so với kỳ trước.`,
          cause: `Doanh thu kỳ này đạt ${formatMoneyShort(kpi.revenue)} so với ${formatMoneyShort(prevRevenue)} của kỳ liền trước. Nguyên nhân có thể do giảm lượt khách hoặc giá trị đơn trung bình giảm.`,
          actions: [
            "Kiểm tra hiệu quả các chiến dịch marketing trong 14 ngày qua.",
            "Tăng cường chương trình khuyến mãi vào khung giờ thấp điểm.",
            "Gợi ý combo dịch vụ để tăng giá trị đơn trung bình.",
          ],
        });
      } else if (g > 0) {
        list.push({
          id: "revenue-up",
          severity: "INFO",
          icon: <TrendingUp size={18} />,
          title: `Doanh thu tăng ${g.toFixed(1)}% so với kỳ trước`,
          summary: `Đạt ${formatMoneyShort(kpi.revenue)} trong kỳ hiện tại.`,
          cause: `Doanh thu kỳ này (${formatMoneyShort(kpi.revenue)}) cao hơn kỳ liền trước (${formatMoneyShort(prevRevenue)}).`,
          actions: [
            "Duy trì các chương trình đang chạy hiệu quả.",
            "Chuẩn bị thêm nhân sự cho khung giờ cao điểm để giữ chất lượng dịch vụ.",
          ],
        });
      }
    }

    if (cur.length >= 5 && kpi.cancelRate >= 10) {
      list.push({
        id: "cancel-rate",
        severity: kpi.cancelRate >= 20 ? "CRITICAL" : "WARNING",
        icon: <XCircle size={18} />,
        title: "Tỷ lệ hủy đơn / no-show cao",
        summary: `Tỷ lệ hủy / no-show hiện tại là ${kpi.cancelRate.toFixed(1)}%.`,
        cause: `${kpi.cancelled}/${kpi.orders} lịch hẹn trong kỳ bị hủy hoặc khách không đến.`,
        actions: [
          "Bật nhắc lịch tự động trước giờ hẹn cho khách.",
          "Yêu cầu thanh toán trước hoặc đặt cọc với khung giờ cao điểm.",
          "Liên hệ xác nhận lại các lịch PENDING quá lâu.",
        ],
      });
    }

    const slotCount = {};
    cur.forEach((b) => { if (b.slotTime) slotCount[b.slotTime] = (slotCount[b.slotTime] || 0) + 1; });
    const busiest = Object.entries(slotCount).sort((a, b) => b[1] - a[1])[0];
    if (busiest && busiest[1] >= 3 && busiest[1] / (cur.length || 1) >= 0.25) {
      list.push({
        id: "peak-hour",
        severity: "WARNING",
        icon: <Clock size={18} />,
        title: `Khung giờ ${busiest[0]} quá tải`,
        summary: `Khung giờ này chiếm ${Math.round((busiest[1] / cur.length) * 100)}% lịch hẹn trong kỳ.`,
        cause: `${busiest[1]}/${cur.length} lịch hẹn dồn vào khung ${busiest[0]}, dễ gây chờ đợi và giảm trải nghiệm.`,
        actions: [
          "Tăng sức chứa slot hoặc phân bổ thêm nhân sự vào khung giờ này.",
          "Khuyến mãi nhẹ cho các khung giờ thấp điểm để giãn tải.",
        ],
      });
    }

    const byCustomer = {};
    bookings.forEach((b) => {
      if (b.bookingStatus !== "COMPLETED" || !b.bookingDate) return;
      const k = b.customerId ?? b.customerName;
      if (!byCustomer[k]) byCustomer[k] = { count: 0, last: b.bookingDate };
      byCustomer[k].count += 1;
      if (b.bookingDate > byCustomer[k].last) byCustomer[k].last = b.bookingDate;
    });
    const cutoff = addDays(todayISO(), -30);
    const vipInactive = Object.values(byCustomer).filter((c) => c.count >= 2 && c.last < cutoff).length;
    if (vipInactive > 0) {
      list.push({
        id: "vip-inactive",
        severity: "INFO",
        icon: <UserX size={18} />,
        title: "Khách hàng VIP chưa quay lại",
        summary: `${vipInactive} khách thân thiết chưa quay lại trong 30 ngày qua.`,
        cause: `Có ${vipInactive} khách từng rửa xe từ 2 lần trở lên nhưng đã hơn 30 ngày không phát sinh lịch mới.`,
        actions: [
          "Tạo chiến dịch chăm sóc riêng cho nhóm khách VIP lâu chưa quay lại.",
          "Gửi ưu đãi giới hạn thời gian để kích hoạt lại nhóm khách này.",
        ],
      });
    }

    const svcCount = (arr) => arr.reduce((m, b) => { if (b.serviceName) m[b.serviceName] = (m[b.serviceName] || 0) + 1; return m; }, {});
    const cs = svcCount(cur), ps = svcCount(prev);
    let best = null;
    Object.entries(cs).forEach(([name, c]) => {
      const p = ps[name] || 0;
      if (p > 0) { const g = ((c - p) / p) * 100; if (g > 0 && (!best || g > best.g)) best = { name, g, c }; }
    });
    if (best) {
      list.push({
        id: "service-growth",
        severity: "INFO",
        icon: <TrendingUp size={18} />,
        title: `Dịch vụ "${best.name}" tăng ${best.g.toFixed(0)}%`,
        summary: `${best.c} đơn trong kỳ, nhu cầu tăng so với kỳ trước.`,
        cause: `Số đơn của dịch vụ này tăng ${best.g.toFixed(0)}% so với kỳ liền trước.`,
        actions: [
          "Ưu tiên nhân lực và vật tư cho dịch vụ đang tăng trưởng.",
          "Cân nhắc combo kèm dịch vụ này để tăng giá trị đơn.",
        ],
      });
    }

    const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return list.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [bookings, cur, prev, kpi]);

  const selected = insights.find((i) => i.id === selectedId) || insights[0] || null;
  const hasBeAiData = segments.length > 0 || behaviorLogs.length > 0;

  const kpiCards = [
    {
      title: "Tổng doanh thu", icon: <CircleDollarSign size={20} />, iconCls: "bg-primary-container text-primary",
      value: formatMoneyShort(kpi.revenue), sub: formatMoney(kpi.revenue), trend: kpi.trendRevenue, goodWhenUp: true,
    },
    {
      title: "Tổng đơn rửa xe", icon: <ClipboardList size={20} />, iconCls: "bg-accent-indigo/10 text-accent-indigo",
      value: formatNumber(kpi.orders), sub: `Trung bình ${kpi.avgPerDay.toFixed(1)} đơn/ngày`, trend: kpi.trendOrders, goodWhenUp: true,
    },
    {
      title: "Đơn hoàn thành", icon: <CheckCircle2 size={20} />, iconCls: "bg-success-container text-success",
      value: formatNumber(kpi.completed), sub: `Tỷ lệ hoàn thành ${kpi.completionRate.toFixed(1)}%`, trend: kpi.trendCompleted, goodWhenUp: true,
    },
    {
      title: "Tỷ lệ hủy / no-show", icon: <XCircle size={20} />, iconCls: "bg-critical-container text-critical",
      value: `${kpi.cancelRate.toFixed(1)}%`, sub: `${formatNumber(kpi.cancelled)} đơn bị hủy`, trend: kpi.trendCancel, goodWhenUp: false, trendIsPoint: true,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><BrainCircuit size={20} /></span>
            AI Insight
          </span>
        }
        description="Phân tích dữ liệu kinh doanh & gợi ý vận hành bằng AI để tối ưu hiệu quả."
        actions={
          <>
            <Button variant="outline" onClick={() => setShowRules(true)} className="text-ink-soft">
              <Settings2 /> Cấu hình rule
            </Button>
            <Button variant="secondary" onClick={load} className="border border-primary/20 text-primary">
              <RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới phân tích
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-muted-foreground">Khoảng thời gian:</span>
        <div className="flex flex-wrap gap-2">
          {RANGES.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`h-9 rounded-xl px-4 text-sm font-bold transition ${range === key ? "bg-primary text-white shadow-sm" : "border border-border bg-card text-muted-foreground hover:bg-surface"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {range === "custom" ? (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
            <span className="text-sm text-neutral-muted">→</span>
            <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
          </div>
        ) : (
          <span className="ml-auto flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground">
            <CalendarDays size={16} className="text-neutral-muted" /> {formatDate(start)} – {formatDate(end)}
          </span>
        )}
      </section>

      {loading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />
            <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button variant="destructive" size="sm" onClick={load} className="mt-4">Thử lại</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* ===================== CỘT TRÁI ===================== */}
          <div className="min-w-0 space-y-5">
            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {kpiCards.map((c) => {
                const hasTrend = typeof c.trend === "number" && Number.isFinite(c.trend);
                const up = hasTrend && c.trend >= 0;
                const positive = c.goodWhenUp ? up : !up;
                return (
                  <article key={c.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-card">
                    <div className="flex items-start justify-between">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl ${c.iconCls}`}>{c.icon}</span>
                      {hasTrend && (
                        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${positive ? "bg-success-container text-success" : "bg-critical-container text-critical"}`}>
                          {up ? "↗" : "↘"} {up ? "+" : ""}{c.trend.toFixed(1)}{c.trendIsPoint ? " điểm %" : "%"}
                          <span className="hidden font-semibold text-neutral-muted sm:inline">so với kỳ trước</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs font-bold text-muted-foreground">{c.title}</p>
                    <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-foreground" title={c.sub}>{c.value}</p>
                    {c.sub && c.sub !== c.value && <p className="mt-1 text-xs font-semibold text-neutral-muted">{c.sub}</p>}
                  </article>
                );
              })}
            </div>

            {/* Chart chính */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-extrabold text-foreground">
                  <BarChart3 size={18} className="text-primary" /> Xu hướng doanh thu &amp; đơn rửa xe
                </h2>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold text-muted-foreground outline-none focus:border-primary">
                  {GROUPS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="h-[300px] w-full">
                {hasChartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="35%" barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: CHART.axis }} dy={8} interval="preserveStartEnd" minTickGap={22} padding={{ left: 16, right: 16 }} />
                      <YAxis yAxisId="rev" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART.axis }} tickFormatter={(v) => new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(v)} width={48} />
                      <YAxis yAxisId="ord" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART.axis }} allowDecimals={false} width={34} />
                      <RechartsTooltip
                        formatter={(v, name) => (name === "orders" ? [`${v} đơn`, "Số đơn rửa xe"] : [formatMoney(v), "Doanh thu"])}
                        labelStyle={{ fontWeight: 700, color: CHART.ink }}
                        contentStyle={{ borderRadius: 12, border: `1px solid ${CHART.grid}`, fontSize: 12 }}
                      />
                      <Legend
                        verticalAlign="top" height={32}
                        payload={[
                          { value: "Doanh thu (đ)", type: "line", color: CHART.c1, id: "revenue" },
                          { value: "Số đơn rửa xe", type: "line", color: CHART.c2, id: "orders" },
                        ]}
                        formatter={(v) => <span className="text-xs font-semibold text-muted-foreground">{v}</span>}
                      />
                      {/* Đường gấp khúc (linear), 2 màu tách biệt: xanh dương = doanh thu, cam = số đơn */}
                      <Line yAxisId="rev" type="linear" dataKey="revenue" stroke={CHART.c1} strokeWidth={2.5} dot={chartData.length <= 32 ? { r: 4, fill: CHART.c1, stroke: CHART.contrast, strokeWidth: 1.5 } : false} activeDot={{ r: 6 }} />
                      <Line yAxisId="ord" type="linear" dataKey="orders" stroke={CHART.c2} strokeWidth={2.5} dot={chartData.length <= 32 ? { r: 4, fill: CHART.c2, stroke: CHART.contrast, strokeWidth: 1.5 } : false} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <BarChart3 size={36} className="text-border" />
                    <p className="mt-3 text-sm font-bold text-muted-foreground">Chưa có dữ liệu trong kỳ đã chọn</p>
                    <p className="mt-1 text-xs text-neutral-muted">Biểu đồ sẽ hiển thị khi có lịch hẹn phát sinh trong khoảng thời gian này.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Dịch vụ phổ biến + Khách hàng */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-extrabold text-foreground"><Droplets size={18} className="text-primary" /> Dịch vụ phổ biến</h2>
                  <Link to="/quan-tri/services" className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline">Xem chi tiết <ChevronRight size={14} /></Link>
                </div>
                {topServices.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-muted">Chưa có đơn dịch vụ nào trong kỳ.</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {topServices.map((s, i) => (
                        <div key={s.name}>
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-muted text-xs font-black text-muted-foreground">{i + 1}</span>
                              <span className="truncate font-bold text-ink-soft">{s.name}</span>
                            </span>
                            <span className="shrink-0 font-bold text-foreground">{formatNumber(s.count)} đơn <span className="font-semibold text-neutral-muted">({s.share.toFixed(1)}%)</span></span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full" style={{ width: `${s.share}%`, backgroundColor: [CHART.c1, CHART.c3, CHART.c4, CHART.c2, CHART.c5][i] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 border-t border-border pt-3 text-xs font-semibold text-neutral-muted">Tổng {formatNumber(kpi.orders)} đơn</p>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-extrabold text-foreground"><Users size={18} className="text-primary" /> Khách hàng</h2>
                  <Link to="/quan-tri/users" className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline">Xem chi tiết <ChevronRight size={14} /></Link>
                </div>
                {customerStats.total === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-muted">Chưa có khách hàng phát sinh lịch trong kỳ.</p>
                ) : (
                  <dl className="divide-y divide-border">
                    {[
                      ["Khách hàng mới", `${formatNumber(customerStats.newCount)}`, customerStats.total ? `(${((customerStats.newCount / customerStats.total) * 100).toFixed(1)}%)` : "", "text-foreground"],
                      ["Khách hàng quay lại", `${formatNumber(customerStats.returning)}`, customerStats.total ? `(${customerStats.returnRate.toFixed(1)}%)` : "", "text-foreground"],
                      ["Tỷ lệ quay lại", `${customerStats.returnRate.toFixed(1)}%`, "", "text-primary"],
                      ["Giá trị trung bình / đơn", formatMoney(customerStats.avgOrderValue), "", "text-foreground"],
                    ].map(([label, value, extra, cls]) => (
                      <div key={label} className="flex items-center justify-between py-3">
                        <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
                        <dd className={`text-sm font-black ${cls}`}>{value} {extra && <span className="font-semibold text-neutral-muted">{extra}</span>}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            </div>

            {/* Trạng thái dữ liệu AI từ BE */}
            {!hasBeAiData && (
              <section className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-neutral-muted"><ServerCrash size={18} /></span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <b className="text-ink-soft">Phân tích AI chuyên sâu từ Backend đang chờ dữ liệu.</b> Các endpoint
                  <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /api/v1/analytics/admin/customer-segments</span> và
                  <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /api/v1/analytics/admin/behavioral-logs</span>
                  hiện trả về rỗng. Các insight bên phải được tính rule-based từ dữ liệu booking thật của hệ thống.
                </p>
              </section>
            )}
          </div>

          {/* ===================== CỘT PHẢI ===================== */}
          <div className="min-w-0 space-y-5">
            {/* Insight nổi bật */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-extrabold text-foreground"><ShieldAlert size={18} className="text-primary" /> Insight nổi bật</h2>
                {analyzedAt && (
                  <span className="text-xs font-semibold text-neutral-muted">Phân tích lúc {analyzedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                )}
              </div>
              {insights.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-success-container" />
                  <p className="mt-3 text-sm font-bold text-muted-foreground">Không phát hiện vấn đề nổi bật</p>
                  <p className="mt-1 text-xs text-neutral-muted">Chưa đủ dữ liệu trong kỳ hoặc mọi chỉ số đều trong ngưỡng an toàn.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {insights.map((it) => {
                    const sv = SEVERITY[it.severity];
                    const isSelected = selected && selected.id === it.id;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setSelectedId(it.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${isSelected ? `${sv.border} ring-2 ring-primary/60 shadow-sm` : "border-border hover:border-border hover:bg-surface"}`}
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${sv.iconBg}`}>{it.icon}</span>
                        <span className="min-w-0">
                          <span className={`text-xs font-black tracking-widest ${sv.text}`}>{sv.label}</span>
                          <span className="block text-sm font-extrabold leading-snug text-foreground">{it.title}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{it.summary}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Chi tiết insight */}
            {selected && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-extrabold text-foreground">Chi tiết insight</h2>
                  <span className="flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-xs font-bold text-primary"><Lightbulb size={14} /> Gợi ý từ dữ liệu thật</span>
                </div>
                <h3 className={`text-base font-extrabold ${SEVERITY[selected.severity].text}`}>{selected.title}</h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  Mức độ: <span className={`rounded-full px-2 py-0.5 text-xs font-black ${SEVERITY[selected.severity].chip}`}>{selected.severity}</span>
                  {analyzedAt && <span className="text-neutral-muted">· Phát hiện lúc {analyzedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selected.cause}</p>

                <h4 className="mt-4 text-sm font-extrabold text-primary-strong">Đề xuất hành động</h4>
                <ul className="mt-2 space-y-1.5">
                  {selected.actions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" /> {a}
                    </li>
                  ))}
                </ul>

                <Button
                  render={<Link to="/quan-tri/reports" />}
                  variant="secondary"
                  size="sm"
                  className="mt-5 w-full border border-primary/20 text-xs text-primary-strong"
                >
                  <BarChart3 /> Xem báo cáo chi tiết
                </Button>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Modal Cấu hình rule (read-only — chỉnh sửa ngưỡng cần API cấu hình từ BE) */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setShowRules(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-floating" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-foreground"><Settings2 size={18} className="text-primary" /> Cấu hình rule phân tích</h3>
                <p className="mt-1 text-xs text-muted-foreground">Ngưỡng đang được engine rule-based phía FE sử dụng trên dữ liệu thật.</p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Đóng" onClick={() => setShowRules(false)} className="text-neutral-muted hover:text-ink-soft"><X className="size-4.5" /></Button>
            </div>
            <div className="space-y-3">
              {RULES.map((r) => (
                <div key={r.key} className="rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-sm text-foreground">{r.label}</b>
                    <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground ring-1 ring-border">{r.threshold}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-container p-3 text-xs leading-relaxed text-warning">
              <Hourglass size={14} className="mt-0.5 shrink-0" /> Việc chỉnh sửa ngưỡng cần API cấu hình từ Backend — hiện chưa có nên các ngưỡng ở chế độ chỉ xem.
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
