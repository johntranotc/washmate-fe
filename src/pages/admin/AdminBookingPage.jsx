import { Search, SlidersHorizontal } from "lucide-react";

const mockBookings = [
  { id: "BK-0245", customer: "Nguyễn Văn A", phone: "0900000000", garage: "AutoWash Thủ Đức", service: "Premium Wash", date: "2026-06-18", slot: "09:00 - 09:30", amount: "110.000 đ", payLabel: "Đã thanh toán", payColor: "bg-emerald-100 text-emerald-700", bookLabel: "Đã xác nhận", bookColor: "bg-blue-100 text-blue-700" },
  { id: "BK-0244", customer: "Trần Minh B", phone: "0911111111", garage: "AutoWash Quận 1", service: "Basic Wash", date: "2026-06-18", slot: "10:00 - 10:30", amount: "80.000 đ", payLabel: "Chờ thanh toán", payColor: "bg-amber-100 text-amber-700", bookLabel: "Chờ xác nhận", bookColor: "bg-amber-100 text-amber-700" },
  { id: "BK-0243", customer: "Lê Hoàng C", phone: "0922222222", garage: "AutoWash Thủ Đức", service: "Full Detailing", date: "2026-06-18", slot: "14:00 - 15:30", amount: "250.000 đ", payLabel: "Đã thanh toán", payColor: "bg-emerald-100 text-emerald-700", bookLabel: "Đang rửa xe", bookColor: "bg-cyan-100 text-cyan-700" },
  { id: "BK-0242", customer: "Phạm Quốc D", phone: "0933333333", garage: "AutoWash Gò Vấp", service: "Premium Wash", date: "2026-06-17", slot: "15:00 - 15:45", amount: "120.000 đ", payLabel: "Đã thanh toán", payColor: "bg-emerald-100 text-emerald-700", bookLabel: "Hoàn tất", bookColor: "bg-emerald-100 text-emerald-700" },
  { id: "BK-0241", customer: "Võ Thị E", phone: "0944444444", garage: "AutoWash Quận 1", service: "Basic Wash", date: "2026-06-17", slot: "08:00 - 08:30", amount: "80.000 đ", payLabel: "Đã hoàn tiền", payColor: "bg-slate-100 text-slate-600", bookLabel: "Đã hủy", bookColor: "bg-rose-100 text-rose-700" },
  { id: "BK-0240", customer: "Hoàng Văn F", phone: "0955555555", garage: "AutoWash Thủ Đức", service: "Standard Wash", date: "2026-06-17", slot: "11:00 - 11:30", amount: "90.000 đ", payLabel: "Đã thanh toán", payColor: "bg-emerald-100 text-emerald-700", bookLabel: "Hoàn tất", bookColor: "bg-emerald-100 text-emerald-700" },
];

export default function AdminBookingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Quản lý</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Đặt lịch</h1>
          <p className="mt-1 text-sm text-slate-400">Quản lý toàn bộ lịch đặt trong hệ thống.</p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-700">
          {mockBookings.length} lịch đặt
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-violet-300 transition-colors">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Tìm mã booking, khách hàng, biển số..." className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        </label>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
          <SlidersHorizontal size={15} />
          Bộ lọc
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.8fr_1fr_1.2fr_1.2fr_1.3fr] divide-x divide-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 px-2">
          <span className="px-4 py-3">Booking / Khách hàng</span>
          <span className="px-4 py-3 text-center">Lịch hẹn</span>
          <span className="px-4 py-3 text-center">Thanh toán</span>
          <span className="px-4 py-3 text-center">Trạng thái</span>
          <span className="px-4 py-3 text-center">Gara</span>
        </div>
        <div className="divide-y divide-slate-50">
          {mockBookings.map((b) => (
            <div key={b.id} className="grid sm:grid-cols-[1.8fr_1fr_1.2fr_1.2fr_1.3fr] items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-50 hover:bg-slate-50/60 transition-colors">
              <div className="p-4 flex flex-col justify-center">
                <span className="text-xs font-extrabold text-violet-600">{b.id}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{b.customer}</p>
                <p className="text-xs text-slate-400">{b.phone} · {b.service}</p>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-bold text-slate-800">{b.date}</p>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{b.slot}</p>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${b.payColor}`}>{b.payLabel}</span>
                <p className="text-sm font-extrabold text-slate-900">{b.amount}</p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${b.bookColor}`}>{b.bookLabel}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                <p className="text-xs font-semibold text-slate-700 text-center">{b.garage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
