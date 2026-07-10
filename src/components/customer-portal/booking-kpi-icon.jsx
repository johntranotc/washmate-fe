import { useState } from "react";
import { STAFF_ASSETS } from "@/lib/staff-assets";

// Icon KPI "Lịch đặt" dùng CHUNG cho trang Tổng quan và trang Lịch đặt.
// Ưu tiên ảnh của bạn: public/images/customer/icons/booking.png; chưa có → fallback icon lịch mặc định.
const BOOKING_ICON = "/images/customer/icons/booking.png";

export function BookingKpiIcon() {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? STAFF_ASSETS.kpi.calendar : BOOKING_ICON}
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-xl object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default BookingKpiIcon;
