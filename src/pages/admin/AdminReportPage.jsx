import { useCallback, useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { BarChart3, Building2, RefreshCw, AlertTriangle, Users, CalendarDays, ReceiptText, CircleDollarSign } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { formatMoney, formatMoneyShort, formatNumber, todayISO } from "../../lib/format";
import { STATUS_COLORS } from "../../lib/chart-colors";
import { Button } from "@/components/ui/button";

const STATUS_META = [
  ["PENDING", "Chờ xác nhận", STATUS_COLORS.PENDING],
  ["CONFIRMED", "Đã xác nhận", STATUS_COLORS.CONFIRMED],
  ["CHECKED_IN", "Đã check-in", STATUS_COLORS.CHECKED_IN],
  ["WASHING", "Đang rửa", STATUS_COLORS.WASHING],
  ["COMPLETED", "Đã hoàn thành", STATUS_COLORS.COMPLETED],
  ["CANCELLED", "Đã hủy", STATUS_COLORS.CANCELLED],
  ["REJECTED", "Từ chối", STATUS_COLORS.REJECTED],
  ["NO_SHOW", "Không đến", STATUS_COLORS.NO_SHOW],
];

function addDays(iso, delta) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Trang Báo cáo (Admin).
 * - KPI toàn hệ thống từ GET /api/analytics/summary (endpoint thật, ADMIN/OWNER).
 * - Phân tích theo kỳ/chi nhánh tổng hợp từ dữ liệu booking thật.
 */
export default function AdminReportPage() {
  const [summary, setSummary] = useState(null);
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [garageId, setGarageId] = useState("all");
  const [range, setRange] = useState("month");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      adminApi.getAnalyticsSummary(),
      garageApi.getAll(),
      adminApi.getBookings({ size: 1000 }),
    ]).then(([sRes, gRes, bRes]) => {
      if (sRes.status === "fulfilled") setSummary(sRes.value || null);
      if (gRes.status === "fulfilled") setGarages(Array.isArray(gRes.value) ? gRes.value : gRes.value?.data || []);
      if (bRes.status === "fulfilled") setBookings(normalizeBookingList(bRes.value).map(normalizeStaffBooking));
      if (bRes.status === "rejected" && sRes.status === "rejected") {
        setError(bRes.reason?.message || "Không thể tải dữ liệu báo cáo.");
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { fromDate, toDate } = useMemo(() => {
    const today = todayISO();
    if (range === "week") return { fromDate: addDays(today, -6), toDate: today };
    if (range === "month") return { fromDate: `${today.slice(0, 7)}-01`, toDate: today };
    if (range === "quarter") return { fromDate: addDays(today, -89), toDate: today };
    return { fromDate: "", toDate: "" };
  }, [range]);

  const scoped = useMemo(() => bookings.filter((b) => {
    if (garageId !== "all" && String(b.garageId) !== String(garageId)) return false;
    if (fromDate && (!b.bookingDate || b.bookingDate < fromDate)) return false;
    if (toDate && (!b.bookingDate || b.bookingDate > toDate)) return false;
    return true;
  }), [bookings, garageId, fromDate, toDate]);

  const statusCounts = useMemo(() => {
    const m = {};
    scoped.forEach((b) => { m[b.bookingStatus] = (m[b.bookingStatus] || 0) + 1; });
    return m;
  }, [scoped]);

  const revenue = useMemo(
    () => scoped.filter((b) => b.bookingStatus === "COMPLETED").reduce((s, b) => s + Number(b.finalAmount || 0), 0),
    [scoped],
  );

  const branchRows = useMemo(() => {
    const m = {};
    scoped.forEach((b) => {
      const key = String(b.garageId ?? "?");
      if (!m[key]) m[key] = { name: b.garageName || `Gara #${key}`, total: 0, completed: 0, cancelled: 0, revenue: 0 };
      m[key].total += 1;
      if (b.bookingStatus === "COMPLETED") { m[key].completed += 1; m[key].revenue += Number(b.finalAmount || 0); }
      if (["CANCELLED", "REJECTED", "NO_SHOW"].includes(b.bookingStatus)) m[key].cancelled += 1;
    });
    const totalRevenue = Object.values(m).reduce((s, r) => s + r.revenue, 0) || 1;
    return Object.values(m)
      .map((r) => ({ ...r, share: Math.round((r.revenue / totalRevenue) * 100), completionRate: r.total ? Math.round((r.completed / r.total) * 100) : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [scoped]);

  const totalScoped = scoped.length || 1;

  const systemKpis = summary ? [
    { icon: Users, label: "Tổng người dùng", value: formatNumber(summary.totalUsers), sub: `${formatNumber(summary.activeUsers)} đang hoạt động`, color: "text-primary", bg: "bg-primary-container" },
    { icon: CalendarDays, label: "Tổng booking toàn hệ thống", value: formatNumber(summary.totalBookings), sub: `${formatNumber(summary.completedBookings)} hoàn thành`, color: "text-success", bg: "bg-success-container" },
    { icon: ReceiptText, label: "Hóa đơn", value: formatNumber(summary.totalInvoices), sub: `${formatNumber(summary.paidInvoices)} đã thanh toán`, color: "text-accent-indigo", bg: "bg-accent-indigo/10" },
    { icon: CircleDollarSign, label: "Doanh thu đã thanh toán", value: formatMoneyShort(summary.paidRevenue), sub: formatMoney(summary.paidRevenue), color: "text-warning", bg: "bg-warning-container" },
  ] : [];

  return (
    <PageContainer>
      <PageHeader
        title="Báo cáo"
        description="Tổng hợp hiệu suất vận hành từ dữ liệu thực của hệ thống."
        actions={
          <>
        <div className="flex flex-wrap items-center gap-3">
          <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            <option value="all">Tất cả chi nhánh</option>
            {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
          </select>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">90 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
          <Button variant="outline" onClick={load} className="text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        </div>
          </>
        }
      />

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="font-semibold text-muted-foreground">Đang tổng hợp báo cáo...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button variant="destructive" size="sm" onClick={load} className="mt-4">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI toàn hệ thống (từ /api/analytics/summary) */}
          {systemKpis.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-extrabold text-neutral-muted">Toàn hệ thống</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {systemKpis.map(({ icon: Icon, label, value, sub, color, bg }) => (
                  <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-muted-foreground">{label}</p>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg} ${color}`}><Icon size={20} /></span>
                    </div>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
                    {sub && <p className="mt-0.5 text-xs font-semibold text-neutral-muted">{sub}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Phân tích theo kỳ đã chọn */}
          <section>
            <h2 className="mb-3 text-sm font-extrabold text-neutral-muted">
              Trong kỳ đã chọn {garageId !== "all" && "· theo chi nhánh"}
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Phân bố trạng thái */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-extrabold text-foreground">Phân bố trạng thái lịch hẹn</h3>
                  <span className="text-xs font-bold text-neutral-muted">{formatNumber(scoped.length)} lịch</span>
                </div>
                {scoped.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-muted">Chưa có lịch hẹn nào trong kỳ.</p>
                ) : (
                  <div className="space-y-3.5">
                    {STATUS_META.filter(([k]) => statusCounts[k]).map(([k, label, color]) => {
                      const v = statusCounts[k];
                      const pct = Math.round((v / totalScoped) * 100);
                      return (
                        <div key={k}>
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-muted-foreground">{label}</span>
                            <span className="font-black text-foreground">{v} <span className="font-semibold text-neutral-muted">({pct}%)</span></span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doanh thu tổng trong kỳ */}
              <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-extrabold text-foreground">Doanh thu trong kỳ</h3>
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container text-primary"><BarChart3 size={26} /></span>
                  <p className="mt-4 text-3xl font-black tracking-tight text-foreground">{formatMoneyShort(revenue)}</p>
                  <p className="mt-1 text-xs font-semibold text-neutral-muted">{formatMoney(revenue)} · từ {formatNumber(statusCounts.COMPLETED || 0)} lịch hoàn thành</p>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <div>
                    <p className="text-lg font-black text-success">{formatNumber(statusCounts.COMPLETED || 0)}</p>
                    <p className="text-xs font-semibold text-neutral-muted">Hoàn thành</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-primary">{formatNumber((statusCounts.CONFIRMED || 0) + (statusCounts.CHECKED_IN || 0) + (statusCounts.WASHING || 0) + (statusCounts.PENDING || 0))}</p>
                    <p className="text-xs font-semibold text-neutral-muted">Đang xử lý</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-critical">{formatNumber((statusCounts.CANCELLED || 0) + (statusCounts.REJECTED || 0) + (statusCounts.NO_SHOW || 0))}</p>
                    <p className="text-xs font-semibold text-neutral-muted">Hủy / No-show</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hiệu suất theo chi nhánh */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 p-5 pb-3">
              <Building2 size={18} className="text-primary" />
              <span className="font-extrabold text-foreground">Hiệu suất theo chi nhánh</span>
            </div>
            {branchRows.length === 0 ? (
              <p className="py-14 text-center text-sm text-neutral-muted">Chưa có dữ liệu chi nhánh trong kỳ.</p>
            ) : (
              <div className="overflow-x-auto px-5 pb-4">
                <table className="w-full min-w-[720px] whitespace-nowrap text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-xs text-neutral-muted">
                      <th className="px-2 py-3 font-semibold">Chi nhánh</th>
                      <th className="px-2 py-3 font-semibold">Tổng lịch</th>
                      <th className="px-2 py-3 font-semibold">Hoàn thành</th>
                      <th className="px-2 py-3 font-semibold">Tỷ lệ hoàn thành</th>
                      <th className="px-2 py-3 font-semibold">Hủy / No-show</th>
                      <th className="px-2 py-3 font-semibold">Doanh thu</th>
                      <th className="px-2 py-3 font-semibold">Tỷ trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {branchRows.map((r) => (
                      <tr key={r.name} className="transition-colors hover:bg-surface">
                        <td className="max-w-[220px] truncate px-2 py-3 font-bold text-foreground">{r.name}</td>
                        <td className="px-2 py-3 text-muted-foreground">{formatNumber(r.total)}</td>
                        <td className="px-2 py-3 font-semibold text-success">{formatNumber(r.completed)}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-success" style={{ width: `${r.completionRate}%` }} />
                            </div>
                            <span className="font-bold text-ink-soft">{r.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-muted-foreground">{formatNumber(r.cancelled)}</td>
                        <td className="px-2 py-3 font-black text-foreground">{formatMoney(r.revenue)}</td>
                        <td className="px-2 py-3 font-bold text-primary">{r.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
