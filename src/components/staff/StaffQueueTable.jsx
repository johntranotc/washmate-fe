import StatusBadge from "@/components/shared/StatusBadge";
import { StaffBookingActions } from "@/components/staff/StaffBookingActions";
import { Button } from "@/components/ui/button";
import { displayBookingStatus } from "@/lib/staff-booking-data";
import { formatTime, formatDate } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * Bảng hàng đợi chính — không lặp booking đã nằm ở "Cần xử lý ngay" (page đã
 * loại trước khi truyền vào). Empty state luôn khớp với tab đang lọc; nếu có
 * booking khớp tab nhưng đang được ưu tiên xử lý thì nói rõ và cho xóa bộ lọc.
 */
export function StaffQueueTable({
  title,
  filterLabel,
  bookings = [],
  urgentMatchingCount = 0,
  onClearFilter,
  busyId,
  actions,
  showDate = false,
}) {
  const filtering = Boolean(filterLabel);

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-5 pb-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-container px-1 text-xs font-extrabold text-primary">
          {bookings.length}
        </span>
        {filtering && (
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-muted-foreground">
            Đang lọc: {filterLabel}
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center px-6 pb-10 pt-2 text-center">
          <img src={STAFF_ASSETS.illustration.emptyBookings} alt="" className="h-28 w-auto" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {filtering
              ? `Không có booking nào trong trạng thái ${filterLabel}.`
              : "Chưa có lịch đặt nào trong khoảng thời gian này."}
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
            {urgentMatchingCount > 0
              ? `${urgentMatchingCount} booking đang được ưu tiên xử lý ở mục "Cần xử lý ngay". Hãy thử bộ lọc khác.`
              : "Thử đổi bộ lọc hoặc bấm \"Tải lại\"."}
          </p>
          {filtering && (
            <Button size="sm" variant="outline" className="mt-4" onClick={onClearFilter}>
              Xem tất cả
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto px-5 pb-4">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead>
              <tr className="border-b border-border font-semibold text-neutral-muted">
                <th className="py-3 pr-3 font-semibold">Giờ hẹn</th>
                {showDate && <th className="py-3 pr-3 font-semibold">Ngày</th>}
                <th className="py-3 pr-3 font-semibold">Mã booking</th>
                <th className="py-3 pr-3 font-semibold">Khách hàng</th>
                <th className="py-3 pr-3 font-semibold">Biển số</th>
                <th className="py-3 pr-3 font-semibold">Gói dịch vụ</th>
                <th className="py-3 pr-3 font-semibold">Trạng thái</th>
                <th className="py-3 pr-3 font-semibold">Thanh toán</th>
                <th className="w-[320px] py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {bookings.map((b) => (
                <tr key={b.id} className="align-middle hover:bg-surface">
                  <td className="py-3 pr-3 text-sm font-extrabold text-foreground">
                    {formatTime(b.slotTime) || "--:--"}
                  </td>
                  {showDate && <td className="py-3 pr-3 text-muted-foreground">{formatDate(b.bookingDate)}</td>}
                  <td className="py-3 pr-3 font-bold text-primary">{b.code}</td>
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-ink-soft">{b.customerName}</p>
                    <p className="mt-0.5 text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="py-3 pr-3 font-bold text-foreground">{b.plate}</td>
                  <td className="max-w-[150px] truncate py-3 pr-3 text-muted-foreground">{b.serviceName}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={displayBookingStatus(b)} type="booking" size="sm" />
                  </td>
                  <td className="py-3 pr-3"><StatusBadge status={b.paymentStatus} type="payment" size="sm" /></td>
                  <td className="py-3 pl-3">
                    <StaffBookingActions booking={b} busyId={busyId} {...actions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
