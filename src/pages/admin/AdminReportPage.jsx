import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Building2, RefreshCw, AlertTriangle, Users, CalendarDays, ReceiptText, CircleDollarSign } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { formatMoney, formatMoneyShort, formatNumber, todayISO } from "../../lib/format";

const STATUS_META = [
  ["PENDING", "Chờ xác nhận", "#F59E0B"],
  ["CONFIRMED", "Đã xác nhận", "#3B82F6"],
  ["CHECKED_IN", "Đã check-in", "#06B6D4"],
  ["WASHING", "Đang rửa", "#8B5CF6"],
  ["COMPLETED", "Đã hoàn thành", "#10B981"],
  ["CANCELLED", "Đã hủy", "#94A3B8"],
  ["REJECTED", "Từ chối", "#EF4444"],
  ["NO_SHOW", "Không đến", "#F97316"],
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
    { icon: Users, label: "Tổng người dùng", value: formatNumber(summary.totalUsers), sub: `${formatNumber(summary.activeUsers)} đang hoạt động`, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: CalendarDays, label: "Tổng booking toàn hệ thống", value: formatNumber(summary.totalBookings), sub: `${formatNumber(summary.completedBookings)} hoàn thành`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: ReceiptText, label: "Hóa đơn", value: formatNumber(summary.totalInvoices), sub: `${formatNumber(summary.paidInvoices)} đã thanh toán`, color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: CircleDollarSign, label: "Doanh thu đã thanh toán", value: formatMoneyShort(summary.paidRevenue), sub: formatMoney(summary.paidRevenue), color: "text-amber-600", bg: "bg-amber-50" },
  ] : [];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Báo cáo</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng hợp hiệu suất vận hành từ dữ liệu thực của hệ thống.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500">
            <option value="all">Tất cả chi nhánh</option>
            {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
          </select>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500">
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">90 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
          <button onClick={load} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="font-semibold text-slate-500">Đang tổng hợp báo cáo...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-500" size={28} />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={load} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
        </div>
      ) : (
        <>
          {/* KPI toàn hệ thống (từ /api/analytics/summary) */}
          {systemKpis.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400">Toàn hệ thống</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {systemKpis.map(({ icon: Icon, label, value, sub, color, bg }) => (
                  <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-500">{label}</p>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg} ${color}`}><Icon size={20} /></span>
                    </div>
                    <p className="mt-1 text-[22px] font-black tracking-tight text-slate-900">{value}</p>
                    {sub && <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{sub}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Phân tích theo kỳ đã chọn */}
          <section>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Trong kỳ đã chọn {garageId !== "all" && "· theo chi nhánh"}
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Phân bố trạng thái */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800">Phân bố trạng thái lịch hẹn</h3>
                  <span className="text-xs font-bold text-slate-400">{formatNumber(scoped.length)} lịch</span>
                </div>
                {scoped.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-400">Chưa có lịch hẹn nào trong kỳ.</p>
                ) : (
                  <div className="space-y-3.5">
                    {STATUS_META.filter(([k]) => statusCounts[k]).map(([k, label, color]) => {
                      const v = statusCounts[k];
                      const pct = Math.round((v / totalScoped) * 100);
                      return (
                        <div key={k}>
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-600">{label}</span>
                            <span className="font-black text-slate-800">{v} <span className="font-semibold text-slate-400">({pct}%)</span></span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doanh thu tổng trong kỳ */}
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800">Doanh thu trong kỳ</h3>
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><BarChart3 size={26} /></span>
                  <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{formatMoneyShort(revenue)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{formatMoney(revenue)} · từ {formatNumber(statusCounts.COMPLETED || 0)} lịch hoàn thành</p>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                  <div>
                    <p className="text-lg font-black text-emerald-600">{formatNumber(statusCounts.COMPLETED || 0)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hoàn thành</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-blue-600">{formatNumber((statusCounts.CONFIRMED || 0) + (statusCounts.CHECKED_IN || 0) + (statusCounts.WASHING || 0) + (statusCounts.PENDING || 0))}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đang xử lý</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-red-500">{formatNumber((statusCounts.CANCELLED || 0) + (statusCounts.REJECTED || 0) + (statusCounts.NO_SHOW || 0))}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hủy / No-show</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hiệu suất theo chi nhánh */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 p-5 pb-3">
              <Building2 size={18} className="text-blue-600" />
              <span className="font-extrabold text-slate-800">Hiệu suất theo chi nhánh</span>
            </div>
            {branchRows.length === 0 ? (
              <p className="py-14 text-center text-sm text-slate-400">Chưa có dữ liệu chi nhánh trong kỳ.</p>
            ) : (
              <div className="overflow-x-auto px-5 pb-4">
                <table className="w-full min-w-[720px] whitespace-nowrap text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="px-2 py-3 font-bold">Chi nhánh</th>
                      <th className="px-2 py-3 font-bold">Tổng lịch</th>
                      <th className="px-2 py-3 font-bold">Hoàn thành</th>
                      <th className="px-2 py-3 font-bold">Tỷ lệ hoàn thành</th>
                      <th className="px-2 py-3 font-bold">Hủy / No-show</th>
                      <th className="px-2 py-3 font-bold">Doanh thu</th>
                      <th className="px-2 py-3 font-bold">Tỷ trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branchRows.map((r) => (
                      <tr key={r.name} className="transition-colors hover:bg-slate-50">
                        <td className="max-w-[220px] truncate px-2 py-3 font-bold text-slate-800">{r.name}</td>
                        <td className="px-2 py-3 text-slate-600">{formatNumber(r.total)}</td>
                        <td className="px-2 py-3 font-semibold text-emerald-600">{formatNumber(r.completed)}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.completionRate}%` }} />
                            </div>
                            <span className="font-bold text-slate-700">{r.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-600">{formatNumber(r.cancelled)}</td>
                        <td className="px-2 py-3 font-black text-slate-900">{formatMoney(r.revenue)}</td>
                        <td className="px-2 py-3 font-bold text-blue-600">{r.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
