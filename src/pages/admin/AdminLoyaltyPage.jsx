import { Gift, Star, Trophy, Users } from "lucide-react";

const mockMembers = [
  { id: 1, name: "Nguyễn Văn A", phone: "0900000000", points: 2400, tier: "Gold", redeemed: 600, bookings: 12 },
  { id: 2, name: "Lê Hoàng C", phone: "0922222222", points: 5800, tier: "Platinum", redeemed: 2000, bookings: 28 },
  { id: 3, name: "Trần Minh B", phone: "0911111111", points: 750, tier: "Silver", redeemed: 0, bookings: 5 },
  { id: 4, name: "Phạm Quốc D", phone: "0933333333", points: 300, tier: "Bronze", redeemed: 0, bookings: 3 },
  { id: 5, name: "Hoàng Văn F", phone: "0955555555", points: 1100, tier: "Silver", redeemed: 200, bookings: 7 },
];

const tierConfig = {
  Platinum: { badge: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500", icon: "💎", max: Infinity, label: "≥ 6.000 điểm", cardBg: "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200" },
  Gold:     { badge: "bg-amber-100 text-amber-700",   bar: "bg-amber-400",  icon: "🥇", max: 5999,    label: "3.000 – 5.999 điểm", cardBg: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" },
  Silver:   { badge: "bg-slate-100 text-slate-600",   bar: "bg-slate-400",  icon: "🥈", max: 2999,    label: "1.000 – 2.999 điểm", cardBg: "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200" },
  Bronze:   { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-400", icon: "🥉", max: 999,     label: "0 – 999 điểm", cardBg: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200" },
};

const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"];

const statCards = [
  { label: "Tổng điểm đã cấp",    value: "48.250", icon: Star,   iconBg: "bg-amber-500/15",  iconColor: "text-amber-600" },
  { label: "Điểm đã đổi thưởng",  value: "12.800", icon: Gift,   iconBg: "bg-violet-500/15", iconColor: "text-violet-600" },
  { label: "Thành viên Platinum",  value: "38",     icon: Trophy, iconBg: "bg-indigo-500/15", iconColor: "text-indigo-600" },
  { label: "Thành viên Gold",      value: "124",    icon: Star,   iconBg: "bg-amber-500/15",  iconColor: "text-amber-500" },
];

export default function AdminLoyaltyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Báo cáo</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Điểm thành viên</h1>
        <p className="mt-1 text-sm text-slate-400">Quản lý điểm tích lũy và hạng thành viên của khách hàng.</p>
      </div>

      {/* Stats — consistent with other pages */}
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

      {/* Tier rules */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">Quy tắc hạng thành viên</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tierOrder.map((tierName) => {
            const t = tierConfig[tierName];
            return (
              <div key={tierName} className={`rounded-xl border p-4 text-center ${t.cardBg}`}>
                <span className="text-2xl">{t.icon}</span>
                <p className="mt-2 font-extrabold text-slate-900">{tierName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] divide-x divide-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 px-2">
          <span className="px-4 py-3">Khách hàng</span>
          <span className="px-4 py-3 text-center">Hạng</span>
          <span className="px-4 py-3 text-center">Điểm hiện tại</span>
          <span className="px-4 py-3 text-center">Điểm đã đổi</span>
          <span className="px-4 py-3 text-center">Số booking</span>
        </div>
        <div className="divide-y divide-slate-50">
          {mockMembers.map((m) => {
            const tc = tierConfig[m.tier];
            return (
              <div key={m.id} className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-50 hover:bg-slate-50/60 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
                    {m.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.phone}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tc.badge}`}>
                    {tc.icon} {m.tier}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <p className="text-sm font-extrabold text-amber-600">{m.points.toLocaleString("vi-VN")}</p>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <p className="text-sm font-bold text-violet-600">{m.redeemed.toLocaleString("vi-VN")}</p>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <p className="text-sm font-bold text-slate-800">{m.bookings}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
