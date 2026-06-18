import { BarChart3, CalendarDays, TrendingUp } from "lucide-react";

const monthlyRevenue = [
  { month: "T1", bookings: 98, revenue: 18500000 },
  { month: "T2", bookings: 112, revenue: 21200000 },
  { month: "T3", bookings: 134, revenue: 26800000 },
  { month: "T4", bookings: 156, revenue: 31200000 },
  { month: "T5", bookings: 189, revenue: 37800000 },
  { month: "T6", bookings: 48, revenue: 12500000 },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

function formatMoney(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M đ`;
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function formatMoneyFull(n) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function AdminRevenuePage() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyRevenue.reduce((s, m) => s + m.bookings, 0);
  const avgRevenue = Math.round(totalRevenue / totalBookings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Báo cáo</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Doanh thu</h1>
        <p className="mt-1 text-sm text-slate-400">Tổng hợp doanh thu theo tháng trong hệ thống.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-5 text-white shadow-md shadow-violet-500/25">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="opacity-80" />
            <span className="text-xs font-bold opacity-70 uppercase tracking-wider">Tổng doanh thu 2026</span>
          </div>
          <p className="text-3xl font-extrabold">{formatMoneyFull(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={18} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng lịch đặt 2026</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{totalBookings}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trung bình / booking</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{formatMoneyFull(avgRevenue)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 mb-6">Doanh thu theo tháng</h2>
        <div className="flex items-end gap-4" style={{ height: 200 }}>
          {monthlyRevenue.map((m) => {
            const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
            const barH = Math.max(pct, 6); // min 6%
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full flex flex-col items-center justify-end">
                  <span className="text-[10px] font-bold text-violet-700 mb-1">{formatMoney(m.revenue)}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-indigo-400"
                    style={{ height: `${barH}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 px-2">
          <span className="px-5 py-3">Tháng</span>
          <span className="px-5 py-3 text-center">Lịch đặt</span>
          <span className="px-5 py-3 text-center">Doanh thu</span>
        </div>
        <div className="divide-y divide-slate-50">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="grid grid-cols-3 divide-x divide-slate-50 hover:bg-slate-50/60 transition-colors">
              <div className="px-5 py-4">
                <p className="text-sm font-bold text-slate-800">{m.month}/2026</p>
              </div>
              <div className="px-5 py-4 flex items-center justify-center">
                <p className="text-sm font-bold text-blue-600">{m.bookings}</p>
              </div>
              <div className="px-5 py-4 flex items-center justify-center">
                <p className="text-sm font-extrabold text-emerald-700">{formatMoneyFull(m.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
