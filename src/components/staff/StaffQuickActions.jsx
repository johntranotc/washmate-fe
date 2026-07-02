import { Link } from "react-router-dom";
import { ListChecks, Search, CalendarDays, QrCode } from "lucide-react";

/**
 * Thao tác nhanh (lưới 2x2) — chỉ các hành động có route/logic thật.
 * "Quét mã booking" điều hướng sang trang tra cứu (tìm theo mã booking).
 */
const actions = [
  { to: "/nhan-vien/hang-doi", icon: ListChecks, title: "Mở hàng đợi hôm nay", desc: "Xác nhận & theo dõi xe đang xử lý", tone: "from-blue-600 to-cyan-500" },
  { to: "/staff/bookings", icon: Search, title: "Tra cứu booking", desc: "Tìm nhanh theo mã / biển số / SĐT", tone: "from-emerald-600 to-teal-500" },
  { to: "/nhan-vien/danh-sach", icon: CalendarDays, title: "Danh sách lịch đặt", desc: "Xem lịch theo trạng thái", tone: "from-violet-600 to-fuchsia-500" },
  { to: "/staff/bookings", icon: QrCode, title: "Quét mã booking", desc: "Check-in nhanh theo mã", tone: "from-amber-500 to-orange-500" },
];

export function StaffQuickActions() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-extrabold text-slate-800">Thao tác nhanh</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map(({ to, icon: Icon, title, desc, tone }, i) => (
          <Link
            key={i}
            to={to}
            className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow`}>
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <b className="block text-sm text-slate-800">{title}</b>
              <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
