import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ComposedChart, BarChart, Bar, Cell, LabelList, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  RefreshCw, Settings2, AlertTriangle, Sparkles, Lightbulb, ArrowRight,
  CircleDollarSign, CalendarDays, CheckCircle2, XCircle, Wrench, Users, Clock3,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import {
  todayISO, formatDate, formatMoney, formatMoneyShort, formatMoneyCompact, formatNumber, friendlyName,
} from "../../lib/format";
import { CHART } from "../../lib/chart-colors";
import { cn } from "@/lib/utils";
import { InsightRuleDrawer } from "../../components/admin/insights/InsightRuleDrawer";
import { AiChatWidget } from "../../components/admin/insights/AiChatWidget";

const COMPLETED = "COMPLETED";
const CLOSED_NEGATIVE = ["CANCELLED", "NO_SHOW"];

const TIME_CHIPS = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "7 ngày" },
  { key: "month", label: "Tháng này" },
  { key: "lastMonth", label: "Tháng trước" },
  { key: "custom", label: "Tùy chọn" },
];

const SEVERITY_META = {
  CRITICAL: { label: "Nghiêm trọng", tone: "bg-critical-container text-critical", dot: "bg-critical" },
  WARNING: { label: "Cảnh báo", tone: "bg-warning-container text-warning", dot: "bg-warning" },
  OPPORTUNITY: { label: "Cơ hội", tone: "bg-primary-container text-primary-strong", dot: "bg-primary" },
  POSITIVE: { label: "Tích cực", tone: "bg-success-container text-success", dot: "bg-success" },
};

const INSIGHT_FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ALERT", label: "Cảnh báo" },
  { key: "REVENUE", label: "Doanh thu" },
  { key: "ORDER", label: "Lịch hẹn" },
  { key: "SERVICE", label: "Dịch vụ" },
  { key: "CUSTOMER", label: "Khách hàng" },
];

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
function fmtPct(v) {
  if (!Number.isFinite(v)) return "0%";
  const rounded = Math.round(v * 10) / 10;
  return `${String(rounded).replace(".", ",")}%`;
}
// Chuỗi kỹ thuật/seed — không đưa lên UI.
const isTechnicalText = (s) => /(SEED|_V\d+|^WM_|TEST_|AI Seed|AI Demo)/i.test(s || "");

/** Nút "Gợi ý từ AI" kiểu Gemini — sparkle + gradient xanh→tím (token hệ thống). */
function AiSuggestButton({ onClick, loading, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-primary via-accent-indigo to-accent-violet px-4 text-xs font-bold text-white shadow-cta transition hover:opacity-90 disabled:opacity-60",
        className,
      )}
    >
      <Sparkles size={14} className={loading ? "animate-pulse" : ""} />
      {loading ? "Đang tạo gợi ý..." : "Gợi ý từ AI"}
    </button>
  );
}

function InsightSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Trang Insight vận hành (Admin).
 * - Insight rule-based + gợi ý AI: API thật của BE (owner/insights, ai-enrich — Gemini).
 * - KPI/chart/dịch vụ/khách/khung giờ: tổng hợp từ GET /bookings theo bộ lọc.
 * Lưu ý: danh sách insight của BE tính trên TOÀN HỆ THỐNG theo kỳ (không theo
 * chi nhánh) — phần "Nguồn dữ liệu" trong chi tiết insight ghi rõ điều này.
 */
export default function AdminInsightPage() {
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [insightsRes, setInsightsRes] = useState(null); // AutoWashInsightsResponse | null
  const [insightsError, setInsightsError] = useState(false);
  const [rules, setRules] = useState([]);
  const [aiHealth, setAiHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [garageId, setGarageId] = useState("all");
  const [rangeKey, setRangeKey] = useState("month");
  const [customFrom, setCustomFrom] = useState(todayISO());
  const [customTo, setCustomTo] = useState(todayISO());
  const [insightFilter, setInsightFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState({}); // insightId -> enrichment

  // Kỳ phân tích: "Tháng này/Tháng trước" là TRỌN THÁNG theo spec.
  const { start, end } = useMemo(() => {
    const today = todayISO();
    const d = new Date(`${today}T00:00:00`);
    if (rangeKey === "today") return { start: today, end: today };
    if (rangeKey === "week") return { start: addDays(today, -6), end: today };
    if (rangeKey === "month") {
      const first = `${today.slice(0, 8)}01`;
      const last = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      return { start: first, end: last };
    }
    if (rangeKey === "lastMonth") {
      const first = toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1));
      const last = toISO(new Date(d.getFullYear(), d.getMonth(), 0));
      return { start: first, end: last };
    }
    const s = customFrom <= customTo ? customFrom : customTo;
    const e = customFrom <= customTo ? customTo : customFrom;
    return { start: s, end: e };
  }, [rangeKey, customFrom, customTo]);
  const prevStart = useMemo(() => addDays(start, -(daysBetween(start, end) + 1)), [start, end]);
  const prevEnd = useMemo(() => addDays(start, -1), [start]);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [gRes, bRes, hRes, rRes] = await Promise.allSettled([
      garageApi.getAll(),
      adminApi.getBookings({ size: 1000 }),
      adminApi.getAiHealth(),
      adminApi.getInsightRules(),
    ]);
    setGarages(gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : []);
    setAiHealth(hRes.status === "fulfilled" ? hRes.value : null);
    setRules(rRes.status === "fulfilled" && Array.isArray(rRes.value) ? rRes.value : []);
    if (bRes.status === "fulfilled") {
      setBookings(normalizeBookingList(bRes.value).map(normalizeStaffBooking));
      setLastUpdated(new Date());
    } else {
      console.error("[AdminInsight] load bookings failed:", bRes.reason);
      setError(bRes.reason?.message || "Không thể tải insight vận hành. Vui lòng thử lại.");
      setBookings([]);
    }
    setLoading(false);
  }, []);

  const loadInsights = useCallback(() => {
    setInsightsError(false);
    adminApi.getOwnerInsights({ fromDate: start, toDate: end })
      .then((res) => setInsightsRes(res))
      .catch(() => { setInsightsRes(null); setInsightsError(true); });
  }, [start, end]);

  useEffect(() => { loadBase(); }, [loadBase]);
  useEffect(() => { loadInsights(); }, [loadInsights]);

  // "Làm mới phân tích" — chạy lại rule engine phía BE rồi tải lại toàn bộ.
  async function handleRefreshAnalysis() {
    setAnalyzing(true);
    try {
      await adminApi.generateInsights({ fromDate: start, toDate: end });
      toast.success("Đã làm mới phân tích", { description: `Kỳ ${formatDate(start)} – ${formatDate(end)}` });
    } catch (e) {
      toast.error("Không thể làm mới phân tích", { description: e?.message || "Lỗi không xác định" });
    } finally {
      await loadBase();
      loadInsights();
      setAnalyzing(false);
    }
  }

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

  // ===== KPI trong kỳ (chia 0 an toàn) =====
  const metricsOf = (list) => {
    const total = list.length;
    const completedList = list.filter((b) => b.bookingStatus === COMPLETED);
    const cancelledNoShow = list.filter((b) => CLOSED_NEGATIVE.includes(b.bookingStatus)).length;
    return {
      total,
      completed: completedList.length,
      cancelledNoShow,
      revenue: completedList.reduce((s, b) => s + (b.finalAmount || 0), 0),
      cancelRate: total > 0 ? (cancelledNoShow / total) * 100 : 0,
    };
  };
  const period = useMemo(() => metricsOf(periodBookings), [periodBookings]);
  const prev = useMemo(() => (prevBookings.length > 0 ? metricsOf(prevBookings) : null), [prevBookings]);

  const trendBadge = (v, invert = false, unit = "%") => {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    const up = v >= 0;
    const good = invert ? !up : up;
    return (
      <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${good ? "bg-success-container text-success" : "bg-critical-container text-critical"}`}>
        {up ? "+" : ""}{String(Math.round(v * 10) / 10).replace(".", ",")}{unit}
      </span>
    );
  };
  const pctChange = (cur, p) => (p > 0 ? ((cur - p) / p) * 100 : null);

  const KPI_CARDS = [
    {
      label: "Tổng doanh thu", Icon: CircleDollarSign, tone: "text-primary bg-primary-container",
      value: formatMoneyShort(period.revenue),
      trend: prev ? trendBadge(pctChange(period.revenue, prev.revenue)) : null,
      sub: "Lịch hẹn hoàn thành trong kỳ",
    },
    {
      label: "Tổng lịch hẹn", Icon: CalendarDays, tone: "text-accent-indigo bg-accent-indigo/10",
      value: formatNumber(period.total),
      trend: prev ? trendBadge(pctChange(period.total, prev.total)) : null,
      sub: `${formatNumber(period.completed)} hoàn thành · ${formatNumber(period.cancelledNoShow)} hủy/không đến`,
    },
    {
      label: "Lịch hẹn hoàn thành", Icon: CheckCircle2, tone: "text-success bg-success-container",
      value: formatNumber(period.completed),
      trend: prev ? trendBadge(pctChange(period.completed, prev.completed)) : null,
      sub: `${fmtPct(period.total > 0 ? (period.completed / period.total) * 100 : 0)} tổng lịch hẹn`,
    },
    {
      label: "Tỷ lệ hủy / không đến", Icon: XCircle, tone: "text-no-show bg-no-show-container",
      value: fmtPct(period.cancelRate),
      trend: prev ? trendBadge(period.cancelRate - prev.cancelRate, true, " điểm %") : null,
      sub: `${formatNumber(period.cancelledNoShow)} / ${formatNumber(period.total)} lịch hẹn`,
    },
  ];

  // ===== Chart xu hướng (theo ngày): cột = lịch hẹn, đường = doanh thu =====
  const trendData = useMemo(() => {
    const len = Math.min(daysBetween(start, end) + 1, 62);
    const from = addDays(end, -(len - 1));
    const countByDay = new Map();
    const revenueByDay = new Map();
    periodBookings.forEach((b) => {
      countByDay.set(b.bookingDate, (countByDay.get(b.bookingDate) || 0) + 1);
      if (b.bookingStatus === COMPLETED) {
        revenueByDay.set(b.bookingDate, (revenueByDay.get(b.bookingDate) || 0) + (b.finalAmount || 0));
      }
    });
    const data = [];
    for (let i = 0; i < len; i += 1) {
      const iso = addDays(from, i);
      data.push({
        label: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
        "Lịch hẹn": countByDay.get(iso) || 0,
        "Doanh thu": revenueByDay.get(iso) || 0,
      });
    }
    return data;
  }, [periodBookings, start, end]);
  const hasTrendData = trendData.some((d) => d["Lịch hẹn"] > 0 || d["Doanh thu"] > 0);

  // ===== Insight nổi bật (BE, toàn hệ thống theo kỳ) =====
  const insightList = useMemo(() => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, OPPORTUNITY: 2, POSITIVE: 3 };
    return (insightsRes?.insights || [])
      .filter((it) => it.status !== "DISMISSED")
      .filter((it) => !isTechnicalText(it.title) && !isTechnicalText(it.summary))
      .filter((it) => {
        if (insightFilter === "ALL") return true;
        if (insightFilter === "ALERT") return ["CRITICAL", "WARNING"].includes(it.severity);
        return it.type === insightFilter;
      })
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  }, [insightsRes, insightFilter]);

  const selectedInsight = useMemo(
    () => insightList.find((it) => it.id === selectedId) || insightList[0] || null,
    [insightList, selectedId],
  );
  const selectedRule = useMemo(
    () => rules.find((r) => r.ruleCode === selectedInsight?.ruleCode) || null,
    [rules, selectedInsight],
  );
  const selectedAi = selectedInsight
    ? aiResults[selectedInsight.id] || selectedInsight.aiEnrichment || null
    : null;

  // "Gợi ý từ AI" — API AI THẬT của BE (Gemini). Không cấu hình → toast, không fake.
  async function handleAiSuggest() {
    if (!selectedInsight) {
      toast.info("Chưa có insight để tạo gợi ý", { description: "Hãy chọn một insight trong danh sách." });
      return;
    }
    if (aiHealth && aiHealth.configured === false) {
      toast.info("Chức năng gợi ý AI chưa được backend hỗ trợ.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await adminApi.aiEnrichInsight(selectedInsight.id);
      setAiResults((m) => ({ ...m, [selectedInsight.id]: res }));
      toast.success("Đã tạo gợi ý từ AI");
    } catch (e) {
      toast.error("Không thể tạo gợi ý AI", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setAiLoading(false);
    }
  }

  // ===== Dịch vụ phổ biến (theo số lịch hẹn trong kỳ) =====
  const popularServices = useMemo(() => {
    const map = new Map();
    periodBookings.forEach((b) => {
      const name = friendlyName(b.serviceName, "Dịch vụ chưa đặt tên");
      map.set(name, (map.get(name) || 0) + 1);
    });
    const total = periodBookings.length || 1;
    return [...map.entries()]
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [periodBookings]);

  // ===== Khách hàng (suy từ booking thật, theo bộ lọc) =====
  const customerStats = useMemo(() => {
    const inPeriod = new Set();
    periodBookings.forEach((b) => {
      const key = b.customerId ?? b.customerName;
      if (key) inPeriod.add(String(key));
    });
    const firstByCustomer = new Map();
    bookings.filter(matchesGarage).forEach((b) => {
      const key = String(b.customerId ?? b.customerName);
      if (!key || !b.bookingDate) return;
      const cur = firstByCustomer.get(key);
      if (!cur || b.bookingDate < cur) firstByCustomer.set(key, b.bookingDate);
    });
    let newCustomers = 0;
    inPeriod.forEach((key) => {
      const first = firstByCustomer.get(key);
      if (first && first >= start && first <= end) newCustomers += 1;
    });
    const total = inPeriod.size;
    const returning = total - newCustomers;
    return {
      total,
      newCustomers,
      returning,
      repeatRate: total > 0 ? (returning / total) * 100 : 0,
      avgPerBooking: period.completed > 0 ? Math.round(period.revenue / period.completed) : 0,
    };
  }, [periodBookings, bookings, matchesGarage, start, end, period]);

  // ===== Mật độ lịch theo khung giờ =====
  const hourly = useMemo(() => {
    const map = new Map();
    periodBookings.forEach((b) => {
      const h = (b.slotTime || "").slice(0, 2);
      if (!h) return;
      map.set(h, (map.get(h) || 0) + 1);
    });
    const rows = [...map.entries()]
      .map(([h, count]) => ({ hour: `${h}:00`, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
    const peak = rows.find((r) => r.count === max) || null;
    return { rows, max, peak };
  }, [periodBookings]);

  const garageLabel = garageId === "all"
    ? "Tất cả chi nhánh"
    : friendlyName(garages.find((g) => String(g.id ?? g.garageId) === String(garageId))?.name, "Chi nhánh chưa cập nhật");
  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Insight vận hành"
        description="Phân tích xu hướng, cảnh báo rủi ro và gợi ý hành động từ dữ liệu thực."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRuleDrawerOpen(true)}>
              <Settings2 /> Cấu hình rule
            </Button>
            <Button size="sm" onClick={handleRefreshAnalysis} disabled={analyzing || loading}>
              <RefreshCw className={analyzing ? "animate-spin" : ""} />
              {analyzing ? "Đang phân tích..." : "Làm mới phân tích"}
            </Button>
          </div>
        }
      />

      {loading && !bookings.length ? (
        <InsightSkeleton />
      ) : error && !bookings.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={loadBase} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Filter phạm vi phân tích */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={garageId}
                onChange={(e) => setGarageId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                aria-label="Chọn chi nhánh"
              >
                <option value="all">Tất cả chi nhánh</option>
                {garages.map((g) => (
                  <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                    {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
                {TIME_CHIPS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setRangeKey(c.key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                      rangeKey === c.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {rangeKey === "custom" && (
                <>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-9 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                    aria-label="Từ ngày"
                  />
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-9 rounded-xl border border-input px-2.5 text-xs font-bold text-muted-foreground outline-none"
                    aria-label="Đến ngày"
                  />
                </>
              )}
              <span className="rounded-full bg-primary-container px-3 py-1.5 text-xs font-bold text-primary-strong">
                {formatDate(start)} – {formatDate(end)}
              </span>
              {updatedLabel && (
                <span className="ml-auto text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
              )}
            </div>
            {/* Phạm vi phân tích — số liệu khớp KPI bên dưới */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Kỳ phân tích: <b className="text-foreground">{formatDate(start)} – {formatDate(end)}</b></span>
              <span>Chi nhánh: <b className="text-foreground">{garageLabel}</b></span>
              <span>
                Dữ liệu: <b className="text-foreground">{formatNumber(period.total)} lịch hẹn</b>
                {" · "}{formatNumber(period.completed)} hoàn thành
                {" · "}{formatNumber(period.cancelledNoShow)} hủy/không đến
              </span>
            </div>
          </section>

          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_CARDS.map(({ label, value, sub, trend, Icon, tone }) => (
              <article key={label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">{value}{trend}</b>
                  <p className="text-xs leading-4 text-neutral-muted">{sub}</p>
                </div>
              </article>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Cột trái */}
            <div className="min-w-0 space-y-6">
              {/* Xu hướng doanh thu & lịch hẹn */}
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-foreground">Xu hướng doanh thu & lịch hẹn</h2>
                  <span className="text-xs font-semibold text-neutral-muted">Theo ngày</span>
                </div>
                {hasTrendData ? (
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="count" tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis yAxisId="money" orientation="right" tick={{ fontSize: 11, fill: CHART.axis }} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoneyCompact(v)} />
                        <RechartsTooltip formatter={(v, name) => (name === "Doanh thu" ? formatMoney(v) : formatNumber(v))} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar yAxisId="count" dataKey="Lịch hẹn" fill={CHART.c1} radius={[4, 4, 0, 0]} barSize={14} />
                        <Line yAxisId="money" type="monotone" dataKey="Doanh thu" stroke={CHART.c3} strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-16 text-center text-xs text-neutral-muted">Chưa có dữ liệu xu hướng trong kỳ này.</p>
                )}
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Dịch vụ phổ biến */}
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Wrench size={18} className="text-primary" /> Dịch vụ phổ biến
                  </h2>
                  {popularServices.length === 0 ? (
                    <p className="py-10 text-center text-xs text-neutral-muted">Chưa có lịch hẹn trong kỳ này.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {popularServices.map((s) => (
                        <div key={s.name} className="text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-semibold text-ink-soft">{s.name}</span>
                            <span className="shrink-0 text-muted-foreground">
                              <b className="text-foreground">{formatNumber(s.count)} lịch</b> · {s.pct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/quan-tri/services" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Xem tất cả dịch vụ <ArrowRight size={14} />
                  </Link>
                </section>

                {/* Khách hàng */}
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Users size={18} className="text-primary" /> Khách hàng
                  </h2>
                  {customerStats.total === 0 ? (
                    <p className="py-10 text-center text-xs text-neutral-muted">Chưa có khách hàng trong kỳ này.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {[
                        ["Khách hàng mới", formatNumber(customerStats.newCustomers), "text-accent-cyan"],
                        ["Khách quay lại", formatNumber(customerStats.returning), "text-success"],
                        ["Tỷ lệ quay lại", fmtPct(customerStats.repeatRate), "text-primary-strong"],
                        ["Giá trị TB / lịch hoàn thành", formatMoneyShort(customerStats.avgPerBooking), "text-foreground"],
                        ["Tổng khách trong kỳ", formatNumber(customerStats.total), "text-foreground"],
                      ].map(([label, value, cls]) => (
                        <div key={label}>
                          <p className={`text-lg font-semibold ${cls}`}>{value}</p>
                          <p className="mt-0.5 text-xs font-semibold leading-4 text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Mật độ lịch theo khung giờ */}
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Clock3 size={18} className="text-primary" /> Mật độ lịch theo khung giờ
                  </h2>
                  <Link to="/quan-tri/bookings" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Xem chi tiết <ArrowRight size={14} />
                  </Link>
                </div>
                {hourly.rows.length === 0 ? (
                  <p className="py-10 text-center text-xs text-neutral-muted">
                    Chưa đủ dữ liệu để phân tích khung giờ cao điểm.
                  </p>
                ) : (
                  <>
                    {/* Biểu đồ cột chuẩn: trục tung + lưới nét đứt + số trên đầu cột (dữ liệu thật) */}
                    <div className="mt-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourly.rows} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
                          <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" />
                          <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11, fill: CHART.axis }}
                            tickLine={false}
                            axisLine={{ stroke: CHART.grid }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: CHART.axis }}
                            tickLine={false}
                            axisLine={{ stroke: CHART.grid }}
                            allowDecimals={false}
                          />
                          <RechartsTooltip
                            formatter={(v) => [`${formatNumber(v)} lịch hẹn`, "Số lịch"]}
                            labelFormatter={(l) => `Khung giờ ${l}`}
                          />
                          <Bar dataKey="count" barSize={38} radius={[4, 4, 0, 0]}>
                            <LabelList
                              dataKey="count"
                              position="top"
                              style={{ fontSize: 12, fontWeight: 700, fill: CHART.ink }}
                            />
                            {hourly.rows.map((r) => (
                              <Cell
                                key={r.hour}
                                fill={hourly.peak && r.hour === hourly.peak.hour ? CHART.orange : CHART.c1}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {hourly.peak && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Khung giờ cao điểm: <b className="text-no-show">{hourly.peak.hour}</b> với {formatNumber(hourly.peak.count)} lịch hẹn trong kỳ.
                      </p>
                    )}
                  </>
                )}
              </section>
            </div>

            {/* Cột phải: Insight nổi bật + Chi tiết */}
            <div className="min-w-0 space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Lightbulb size={18} className="text-primary" /> Insight nổi bật
                </h2>
                <div className="no-scrollbar mt-3 flex gap-1 overflow-x-auto">
                  {INSIGHT_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setInsightFilter(f.key)}
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition",
                        insightFilter === f.key ? "bg-primary text-white" : "bg-surface text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {insightsError ? (
                    <div className="py-6 text-center">
                      <p className="text-xs font-bold text-critical">Không thể tải insight vận hành. Vui lòng thử lại.</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={loadInsights}>Thử lại</Button>
                    </div>
                  ) : insightsRes === null ? (
                    <p className="py-6 text-center text-xs text-neutral-muted">Đang tải insight...</p>
                  ) : insightList.length === 0 ? (
                    <p className="py-6 text-center text-xs leading-5 text-neutral-muted">
                      Chưa đủ dữ liệu để tạo insight trong kỳ này. Hãy chọn khoảng thời gian dài hơn hoặc chi nhánh khác.
                    </p>
                  ) : (
                    insightList.map((it) => {
                      const meta = SEVERITY_META[it.severity] || SEVERITY_META.OPPORTUNITY;
                      const selected = selectedInsight?.id === it.id;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => setSelectedId(it.id)}
                          className={cn(
                            "block w-full rounded-xl border p-3 text-left transition",
                            selected
                              ? "border-primary bg-primary-container/50"
                              : "border-border bg-surface hover:border-primary/30",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
                            {selected && (
                              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">Đang xem</span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm font-bold leading-5 text-foreground">{it.title}</p>
                          {it.summary && (
                            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">{it.summary}</p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Chi tiết insight */}
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-foreground">Chi tiết insight</h2>
                {!selectedInsight ? (
                  <p className="py-8 text-center text-xs text-neutral-muted">Chọn một insight để xem chi tiết.</p>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${(SEVERITY_META[selectedInsight.severity] || SEVERITY_META.OPPORTUNITY).tone}`}>
                        {(SEVERITY_META[selectedInsight.severity] || SEVERITY_META.OPPORTUNITY).label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-5 text-foreground">{selectedInsight.title}</p>

                    <dl className="mt-3 space-y-1.5 rounded-xl border border-border bg-surface p-3.5 text-xs leading-5">
                      <div>
                        <dt className="inline font-bold text-foreground">Nguồn dữ liệu: </dt>
                        <dd className="inline text-muted-foreground">
                          {formatNumber(insightsRes?.summary?.totalOrders ?? 0)} lịch hẹn trong kỳ · Tất cả chi nhánh (insight tính trên toàn hệ thống)
                        </dd>
                      </div>
                      {selectedInsight.evidence && !isTechnicalText(selectedInsight.evidence) && (
                        <div>
                          <dt className="inline font-bold text-foreground">Cơ sở tính toán: </dt>
                          <dd className="inline text-muted-foreground">{selectedInsight.evidence}</dd>
                        </div>
                      )}
                      {selectedRule?.thresholdValue != null && (
                        <div>
                          <dt className="inline font-bold text-foreground">Ngưỡng cảnh báo: </dt>
                          <dd className="inline text-muted-foreground">
                            {selectedRule.comparisonOperator || ""} {String(selectedRule.thresholdValue)}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {(selectedInsight.meaning || selectedInsight.summary) && (
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {selectedInsight.meaning || selectedInsight.summary}
                      </p>
                    )}
                    {selectedInsight.recommendation && (
                      <div className="mt-3 rounded-xl border border-border p-3.5">
                        <p className="text-xs font-bold text-foreground">Khuyến nghị từ hệ thống</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{selectedInsight.recommendation}</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <AiSuggestButton onClick={handleAiSuggest} loading={aiLoading} className="w-full justify-center" />
                    </div>

                    {selectedAi && (
                      <div className="mt-3 rounded-xl border border-accent-violet/25 bg-accent-violet/5 p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-accent-violet">
                          <Sparkles size={14} /> Tóm tắt AI
                        </p>
                        {selectedAi.aiSummary && (
                          <p className="mt-1 text-xs leading-5 text-foreground">{selectedAi.aiSummary}</p>
                        )}
                        {selectedAi.aiExplanation && (
                          <>
                            <p className="mt-3 text-xs font-bold text-foreground">Giải thích chi tiết</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{selectedAi.aiExplanation}</p>
                          </>
                        )}
                        {Array.isArray(selectedAi.aiRecommendation) && selectedAi.aiRecommendation.length > 0 && (
                          <>
                            <p className="mt-3 text-xs font-bold text-foreground">Đề xuất hành động</p>
                            <ul className="mt-1 space-y-1">
                              {selectedAi.aiRecommendation.map((r, i) => (
                                <li key={i} className="text-xs leading-5 text-muted-foreground">• {r}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        <p className="mt-3 border-t border-accent-violet/15 pt-2 text-xs text-neutral-muted">
                          Gợi ý được tạo từ dữ liệu lịch hẹn thực tế trong kỳ hiện tại.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      <InsightRuleDrawer
        open={ruleDrawerOpen}
        onOpenChange={setRuleDrawerOpen}
        onChanged={loadInsights}
      />

      {/* Nút tròn trò chuyện AI — chat thật qua POST /owner/insights/ai-chat */}
      <AiChatWidget
        fromDate={start}
        toDate={end}
        insightId={selectedInsight?.id ?? null}
        aiConfigured={aiHealth ? Boolean(aiHealth.configured) : null}
      />
    </PageContainer>
  );
}
