import { Link } from "react-router-dom";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * Thao tác nhanh (lưới 2x2) — chỉ các hành động có route thật.
 * Icon từ bộ asset gốc icons/actions & icons/navigation.
 */
const actions = [
  { to: "/staff/bookings", icon: STAFF_ASSETS.nav.search, title: "Tra cứu booking", desc: "Tìm nhanh theo mã / biển số / SĐT" },
  { to: "/nhan-vien/hang-doi", icon: STAFF_ASSETS.nav.queue, title: "Mở hàng đợi", desc: "Xác nhận & theo dõi xe đang xử lý" },
  { to: "/nhan-vien/hang-doi", icon: STAFF_ASSETS.action.checkIn, title: "Check-in khách", desc: "Tiếp nhận xe đã thanh toán" },
  { to: "/nhan-vien/danh-sach", icon: STAFF_ASSETS.action.progress, title: "Cập nhật tiến độ", desc: "Xe đang rửa trong danh sách hôm nay" },
];

export function StaffQuickActions() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Thao tác nhanh</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map(({ to, icon, title, desc }) => (
          <Link
            key={title}
            to={to}
            className="group flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/20 hover:bg-primary-container"
          >
            <img src={icon} alt="" width={40} height={40} className="shrink-0 rounded-xl" />
            <span className="min-w-0">
              <b className="block text-sm text-foreground">{title}</b>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
