import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const statsCards = [
  {
    id: "total-bookings",
    label: "Tổng lịch đặt",
    value: "1,245",
    change: "+12% so với tháng trước",
    icon: CalendarDays,
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-600",
    changeColor: "text-blue-600",
    changeBg: "bg-blue-50",
  },
  {
    id: "revenue",
    label: "Doanh thu tháng",
    value: "245 triệu",
    change: "+8.3% so với tháng trước",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    changeColor: "text-emerald-600",
    changeBg: "bg-emerald-50",
  },
  {
    id: "paid-bookings",
    label: "Thanh toán thành công",
    value: "1,180",
    change: "+5.1% so với tháng trước",
    icon: CreditCard,
    gradient: "from-violet-500 to-indigo-400",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
    changeColor: "text-violet-600",
    changeBg: "bg-violet-50",
  },
  {
    id: "loyalty-customers",
    label: "Khách hàng thành viên",
    value: "356",
    change: "+23 khách mới tháng này",
    icon: Users,
    gradient: "from-amber-500 to-orange-400",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
    changeColor: "text-amber-600",
    changeBg: "bg-amber-50",
  },
];

const todayStats = [
  { label: "Lịch đặt hôm nay", value: "48", icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Đang rửa xe", value: "12", icon: Wrench, color: "text-cyan-600", bg: "bg-cyan-50" },
  { label: "Hoàn thành", value: "35", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Đang chờ xử lý", value: "1", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
];

const recentBookings = [
  { id: "BK-0245", customer: "Nguyễn Văn A", garage: "AutoWash Thủ Đức", service: "Premium Wash", amount: "110.000 đ", statusLabel: "Đã thanh toán", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "BK-0244", customer: "Trần Minh B", garage: "AutoWash Quận 1", service: "Basic Wash", amount: "80.000 đ", statusLabel: "Chờ thanh toán", statusColor: "bg-amber-100 text-amber-700" },
  { id: "BK-0243", customer: "Lê Hoàng C", garage: "AutoWash Thủ Đức", service: "Full Detailing", amount: "250.000 đ", statusLabel: "Đang rửa xe", statusColor: "bg-blue-100 text-blue-700" },
  { id: "BK-0242", customer: "Phạm Quốc D", garage: "AutoWash Gò Vấp", service: "Premium Wash", amount: "120.000 đ", statusLabel: "Hoàn tất", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "BK-0241", customer: "Võ Thị E", garage: "AutoWash Quận 1", service: "Basic Wash", amount: "80.000 đ", statusLabel: "Đã hủy", statusColor: "bg-rose-100 text-rose-700" },
];

const garagePerformance = [
  { name: "AutoWash Thủ Đức", bookings: 487, revenue: "98.5M đ", rating: 4.8 },
  { name: "AutoWash Quận 1", bookings: 412, revenue: "85.2M đ", rating: 4.7 },
  { name: "AutoWash Gò Vấp", bookings: 346, revenue: "61.3M đ", rating: 4.6 },
];

/* ─── StatsCard ─────────────────────────────────────────────────────────── */
function StatsCard({ card }) {
  const Icon = card.icon;
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex items-center gap-4">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}>
        <Icon size={26} className={card.iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-slate-900 leading-tight">{card.value}</p>
        <p className={`mt-1 text-[11px] font-bold ${card.changeColor} flex items-center gap-0.5`}>
          <ArrowUpRight size={11} />{card.change}
        </p>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
function AdminDashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">
            Bảng điều khiển
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900">
            Tổng quan hệ thống
          </h1>
          <p className="mt-1 text-sm text-slate-400">{dateStr}</p>
        </div>
        <Link
          to="/quan-tri/dat-lich"
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 transition-all"
        >
          <CalendarCheck size={15} />
          Xem tất cả đặt lịch
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatsCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── Today snapshot ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900">Hoạt động hôm nay</h2>
          <span className="text-[11px] font-semibold text-slate-400">Cập nhật mỗi phút</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {todayStats.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl py-4 px-2 text-center"
              style={{ background: "transparent" }}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent bookings */}
        <div className="xl:col-span-3 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-extrabold text-slate-900">Lịch đặt gần đây</h2>
            <Link
              to="/quan-tri/dat-lich"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Xem tất cả <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-extrabold text-violet-600">{b.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.statusColor}`}>
                      {b.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">{b.customer}</p>
                  <p className="text-xs text-slate-400 truncate">{b.garage} · {b.service}</p>
                </div>
                <p className="text-sm font-extrabold text-slate-900 shrink-0">{b.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Garage performance */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-extrabold text-slate-900">Hiệu suất gara</h2>
              <BarChart3 size={17} className="text-slate-300" />
            </div>
            <div className="divide-y divide-slate-50">
              {garagePerformance.map((g, i) => (
                <div
                  key={g.name}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-extrabold text-white">
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.bookings} booking · {g.revenue}</p>
                  </div>
                  <p className="text-sm font-extrabold text-amber-500 shrink-0">★ {g.rating}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue today */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-5 text-white shadow-md shadow-violet-500/20">
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Doanh thu hôm nay</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">12.500.000 đ</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                <ArrowUpRight size={10} /> +6.2%
              </span>
              <span className="text-xs opacity-60">so với hôm qua</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
