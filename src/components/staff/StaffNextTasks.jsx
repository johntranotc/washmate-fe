import { Link } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  getNextStaffAction,
  canMarkNoShow,
  minutesUntilSlot,
} from "@/lib/staff-booking-data";
import { formatTime } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

const ACTION_ICONS = {
  checkInBooking: STAFF_ASSETS.action.checkIn,
  startWashing: STAFF_ASSETS.action.startWash,
  completeBooking: STAFF_ASSETS.action.completeService,
  confirmBooking: STAFF_ASSETS.action.checkIn,
};

/**
 * "Việc cần làm tiếp theo" — bảng booking thật cần thao tác trong ngày, đã được
 * parent sắp theo ưu tiên (quá giờ → chưa thanh toán → chờ check-in → đang rửa).
 * Mọi nút chỉ render theo status/payment thật; callbacks gọi API thật ở parent.
 */
export function StaffNextTasks({ tasks = [], onCheckIn, onAction, onConfirmPayment, onNoShow, busyId = null }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Việc cần làm tiếp theo</h2>
          {tasks.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1 text-xs font-extrabold text-white">
              {tasks.length}
            </span>
          )}
        </div>
        <Link to="/nhan-vien/danh-sach" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Không còn việc cần xử lý ngay.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-border font-semibold text-neutral-muted">
                <th className="py-2.5 pr-3 font-semibold">Giờ hẹn</th>
                <th className="py-2.5 pr-3 font-semibold">Mã booking</th>
                <th className="py-2.5 pr-3 font-semibold">Khách hàng</th>
                <th className="py-2.5 pr-3 font-semibold">Biển số</th>
                <th className="py-2.5 pr-3 font-semibold">Gói dịch vụ</th>
                <th className="py-2.5 pr-3 font-semibold">Ghi chú</th>
                <th className="py-2.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {tasks.map((item) => {
                const action = getNextStaffAction(item);
                const busy = String(busyId) === String(item.id);
                const late = minutesUntilSlot(item);
                const isLate = typeof late === "number" && late < 0;
                const unpaid = item.paymentStatus !== "PAID" && item.paymentId;
                return (
                  <tr key={item.id} className="align-middle hover:bg-surface">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-extrabold text-foreground">{formatTime(item.slotTime) || "--:--"}</p>
                      {isLate && (
                        <p className="mt-0.5 font-bold text-no-show">Quá {Math.abs(late)} phút</p>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold text-primary">{item.code}</td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-ink-soft">{item.customerName}</p>
                      <p className="mt-0.5 text-muted-foreground">{item.phone}</p>
                    </td>
                    <td className="py-3 pr-3 font-bold text-foreground">{item.plate}</td>
                    <td className="max-w-[150px] truncate py-3 pr-3 text-muted-foreground">{item.serviceName}</td>
                    <td className="max-w-[130px] truncate py-3 pr-3 text-muted-foreground">{item.note || "—"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <StatusBadge status={item.bookingStatus} type="booking" size="sm" />
                        {item.phone && item.phone !== "Chưa cập nhật" && (
                          <a
                            href={`tel:${item.phone}`}
                            aria-label={`Gọi ${item.customerName}`}
                            title="Gọi khách"
                            className="inline-grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-primary-container"
                          >
                            <img src={STAFF_ASSETS.action.phone} alt="" width={18} height={18} className="rounded" />
                          </a>
                        )}
                        {unpaid && ["PENDING", "CONFIRMED"].includes(item.bookingStatus) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => onConfirmPayment?.(item)}
                            title="Xác nhận khách đã thanh toán (tiền mặt)"
                          >
                            <img src={STAFF_ASSETS.action.paymentReminder} alt="" width={16} height={16} className="rounded" />
                            Xác nhận thanh toán
                          </Button>
                        )}
                        {action && (
                          <Button
                            size="sm"
                            disabled={!action.enabled || busy}
                            title={(!action.enabled && action.disabledHint) || undefined}
                            onClick={() =>
                              action.api === "checkInBooking"
                                ? onCheckIn?.(item)
                                : onAction?.(item, action)
                            }
                          >
                            {ACTION_ICONS[action.api] && (
                              <img src={ACTION_ICONS[action.api]} alt="" width={16} height={16} className="rounded" />
                            )}
                            {busy ? "..." : action.label}
                          </Button>
                        )}
                        {canMarkNoShow(item) && (
                          <Button size="sm" variant="destructive" disabled={busy} onClick={() => onNoShow?.(item)}>
                            No-show
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
