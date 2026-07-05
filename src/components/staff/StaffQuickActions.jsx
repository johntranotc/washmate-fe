import { Link } from "react-router-dom";
import { ListChecks, Search, CalendarDays, QrCode } from "lucide-react";

/**
 * Thao tác nhanh (lưới 2x2) — chỉ các hành động có route/logic thật.
 * "Quét mã booking" điều hướng sang trang tra cứu (tìm theo mã booking).
 */
const actions = [
  { to: "/nhan-vien/hang-doi", icon: ListChecks, title: "Mở hàng đợi hôm nay", desc: "Xác nhận & theo dõi xe đang xử lý" },
  { to: "/staff/bookings", icon: Search, title: "Tra cứu booking", desc: "Tìm nhanh theo mã / biển số / SĐT" },
  { to: "/nhan-vien/danh-sach", icon: CalendarDays, title: "Danh sách lịch đặt", desc: "Xem lịch theo trạng thái" },
  { to: "/staff/bookings", icon: QrCode, title: "Quét mã booking", desc: "Check-in nhanh theo mã" },
];

export function StaffQuickActions() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-extrabold text-foreground">Thao tác nhanh</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map(({ to, icon: Icon, title, desc }, i) => (
          <Link
            key={i}
            to={to}
            className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/20 hover:bg-primary-container"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <b className="block text-sm text-foreground">{title}</b>
              <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
