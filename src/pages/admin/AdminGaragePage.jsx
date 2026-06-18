import { Building2, MapPin, Star } from "lucide-react";

const mockGarages = [
  { id: 1, name: "AutoWash Thủ Đức", address: "123 Võ Văn Ngân, Thủ Đức, TP.HCM", owner: "Nguyễn Thành Long", phone: "0281234567", totalBookings: 487, revenue: "98.500.000 đ", rating: 4.8, status: "Đang hoạt động", statusColor: "bg-emerald-100 text-emerald-700", services: ["Basic Wash", "Premium Wash", "Full Detailing"] },
  { id: 2, name: "AutoWash Quận 1", address: "45 Lê Lợi, Quận 1, TP.HCM", owner: "Trần Thị Mai", phone: "0289876543", totalBookings: 412, revenue: "85.200.000 đ", rating: 4.7, status: "Đang hoạt động", statusColor: "bg-emerald-100 text-emerald-700", services: ["Basic Wash", "Standard Wash"] },
  { id: 3, name: "AutoWash Gò Vấp", address: "88 Nguyễn Văn Nghi, Gò Vấp, TP.HCM", owner: "Lê Văn Hùng", phone: "0282345678", totalBookings: 346, revenue: "61.300.000 đ", rating: 4.6, status: "Đang hoạt động", statusColor: "bg-emerald-100 text-emerald-700", services: ["Basic Wash", "Premium Wash"] },
  { id: 4, name: "AutoWash Bình Thạnh", address: "210 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM", owner: "Phạm Thị Lan", phone: "0285678901", totalBookings: 0, revenue: "0 đ", rating: 0, status: "Chờ duyệt", statusColor: "bg-amber-100 text-amber-700", services: [] },
];

const statCards = [
  { label: "Tổng gara", value: mockGarages.length, iconBg: "bg-violet-500/15", iconColor: "text-violet-600" },
  { label: "Đang hoạt động", value: mockGarages.filter(g => g.status === "Đang hoạt động").length, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
  { label: "Chờ duyệt", value: mockGarages.filter(g => g.status === "Chờ duyệt").length, iconBg: "bg-amber-500/15", iconColor: "text-amber-600" },
];

export default function AdminGaragePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Quản lý</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Gara / Chi nhánh</h1>
          <p className="mt-1 text-sm text-slate-400">Quản lý tất cả gara đang hoạt động trong hệ thống.</p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-700">
          {mockGarages.length} gara
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
              <Building2 size={20} className={s.iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs font-medium text-slate-400 leading-tight mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Garage cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockGarages.map((g) => (
          <div key={g.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-violet-200 hover:shadow-md transition-all">
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                  <Building2 size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm">{g.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-400 truncate">{g.address}</p>
                  </div>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${g.statusColor}`}>
                {g.status}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-extrabold text-violet-700">{g.totalBookings}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Booking</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-sm font-extrabold text-emerald-700 leading-tight">{g.revenue}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Doanh thu</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                {g.rating > 0 ? (
                  <p className="text-lg font-extrabold text-amber-500 flex items-center justify-center gap-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />{g.rating}
                  </p>
                ) : (
                  <p className="text-lg font-extrabold text-slate-300">—</p>
                )}
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Đánh giá</p>
              </div>
            </div>

            {/* Services */}
            {g.services.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {g.services.map((s) => (
                  <span key={s} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có dịch vụ đăng ký</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
