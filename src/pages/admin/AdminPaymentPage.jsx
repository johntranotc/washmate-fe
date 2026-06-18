import { CreditCard, Receipt, TrendingDown, TrendingUp } from "lucide-react";

const mockPayments = [
  { id: "PAY-0245", bookingId: "BK-0245", customer: "Nguyễn Văn A", amount: "110.000 đ", method: "VNPay", date: "2026-06-18 09:05", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "PAY-0243", bookingId: "BK-0243", customer: "Lê Hoàng C", amount: "250.000 đ", method: "MoMo", date: "2026-06-18 13:45", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "PAY-0242", bookingId: "BK-0242", customer: "Phạm Quốc D", amount: "120.000 đ", method: "ZaloPay", date: "2026-06-17 14:50", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "PAY-0240", bookingId: "BK-0240", customer: "Hoàng Văn F", amount: "90.000 đ", method: "VNPay", date: "2026-06-17 11:10", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "REF-0241", bookingId: "BK-0241", customer: "Võ Thị E", amount: "80.000 đ", method: "Hoàn tiền", date: "2026-06-17 16:30", status: "Đã hoàn tiền", statusColor: "bg-rose-100 text-rose-700" },
  { id: "PAY-0244", bookingId: "BK-0244", customer: "Trần Minh B", amount: "80.000 đ", method: "—", date: "—", status: "Chờ thanh toán", statusColor: "bg-amber-100 text-amber-700" },
];

const statCards = [
  { label: "Tổng giao dịch", value: "1,180", icon: CreditCard, iconBg: "bg-violet-500/15", iconColor: "text-violet-600" },
  { label: "Doanh thu tháng", value: "245M đ", icon: TrendingUp, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
  { label: "Đã hoàn tiền", value: "12", icon: TrendingDown, iconBg: "bg-rose-500/15", iconColor: "text-rose-600" },
  { label: "Chờ thanh toán", value: "65", icon: Receipt, iconBg: "bg-amber-500/15", iconColor: "text-amber-600" },
];

export default function AdminPaymentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Quản lý</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Thanh toán</h1>
        <p className="mt-1 text-sm text-slate-400">Theo dõi tất cả giao dịch thanh toán trong hệ thống.</p>
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.4fr_0.9fr_1.2fr_1fr_1fr_1fr] divide-x divide-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 px-2">
          <span className="px-4 py-3">Mã giao dịch</span>
          <span className="px-4 py-3 text-center">Booking</span>
          <span className="px-4 py-3 text-center">Khách hàng</span>
          <span className="px-4 py-3 text-center">Số tiền</span>
          <span className="px-4 py-3 text-center">Phương thức</span>
          <span className="px-4 py-3 text-center">Trạng thái</span>
        </div>
        <div className="divide-y divide-slate-50">
          {mockPayments.map((p) => (
            <div key={p.id} className="grid sm:grid-cols-[1.4fr_0.9fr_1.2fr_1fr_1fr_1fr] items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-50 hover:bg-slate-50/60 transition-colors">
              <div className="p-4 flex flex-col justify-center">
                <p className="text-xs font-extrabold text-violet-600">{p.id}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.date}</p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{p.bookingId}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                <p className="text-sm font-semibold text-slate-800 text-center truncate">{p.customer}</p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <p className="text-sm font-extrabold text-slate-900">{p.amount}</p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{p.method}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${p.statusColor}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
