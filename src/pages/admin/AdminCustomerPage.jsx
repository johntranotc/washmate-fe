import { Search, Star, UserCheck, Users, UserX } from "lucide-react";

const mockCustomers = [
  { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0900000000", totalBookings: 12, totalSpent: "1.320.000 đ", tier: "Gold", joinDate: "2025-01-15", status: "Hoạt động" },
  { id: 2, name: "Trần Minh B", email: "tranminhb@email.com", phone: "0911111111", totalBookings: 5, totalSpent: "400.000 đ", tier: "Silver", joinDate: "2025-03-20", status: "Hoạt động" },
  { id: 3, name: "Lê Hoàng C", email: "lehoangc@email.com", phone: "0922222222", totalBookings: 28, totalSpent: "7.000.000 đ", tier: "Platinum", joinDate: "2024-11-05", status: "Hoạt động" },
  { id: 4, name: "Phạm Quốc D", email: "phamquocd@email.com", phone: "0933333333", totalBookings: 3, totalSpent: "240.000 đ", tier: "Bronze", joinDate: "2026-02-10", status: "Hoạt động" },
  { id: 5, name: "Võ Thị E", email: "vothie@email.com", phone: "0944444444", totalBookings: 0, totalSpent: "0 đ", tier: "Bronze", joinDate: "2026-05-01", status: "Không hoạt động" },
];

const tierConfig = {
  Platinum: { color: "bg-indigo-100 text-indigo-700", icon: "💎" },
  Gold: { color: "bg-amber-100 text-amber-700", icon: "🥇" },
  Silver: { color: "bg-slate-100 text-slate-600", icon: "🥈" },
  Bronze: { color: "bg-orange-100 text-orange-700", icon: "🥉" },
};

const statCards = [
  { label: "Tổng khách hàng", value: "1,024", icon: Users, iconBg: "bg-violet-500/15", iconColor: "text-violet-600" },
  { label: "Đang hoạt động", value: "987", icon: UserCheck, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
  { label: "Thành viên Platinum", value: "38", icon: Star, iconBg: "bg-indigo-500/15", iconColor: "text-indigo-600" },
  { label: "Thành viên Gold", value: "124", icon: Star, iconBg: "bg-amber-500/15", iconColor: "text-amber-600" },
];

export default function AdminCustomerPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Quản lý</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Khách hàng</h1>
        <p className="mt-1 text-sm text-slate-400">Quản lý tất cả tài khoản khách hàng trong hệ thống.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
              <s.icon size={20} className={s.iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs font-medium text-slate-400 leading-tight mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-violet-300 transition-colors">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input type="text" placeholder="Tìm tên, email hoặc số điện thoại..." className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
      </label>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] divide-x divide-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 px-2">
          <span className="px-4 py-3">Khách hàng</span>
          <span className="px-4 py-3 text-center">Hạng thành viên</span>
          <span className="px-4 py-3 text-center">Tổng booking</span>
          <span className="px-4 py-3 text-center">Tổng chi tiêu</span>
          <span className="px-4 py-3 text-center">Trạng thái</span>
        </div>
        <div className="divide-y divide-slate-50">
          {mockCustomers.map((c) => {
            const tc = tierConfig[c.tier];
            return (
              <div key={c.id} className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-50 hover:bg-slate-50/60 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.phone} · {c.email}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tc.color}`}>
                    {tc.icon} {c.tier}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <p className="text-sm font-bold text-slate-800">{c.totalBookings}</p>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <p className="text-sm font-extrabold text-violet-700">{c.totalSpent}</p>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${c.status === "Hoạt động" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
