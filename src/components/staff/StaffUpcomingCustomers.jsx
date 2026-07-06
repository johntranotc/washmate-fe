import { minutesUntilSlot } from "@/lib/staff-booking-data";
import { formatTime } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * "Khách sắp đến" — booking thật sắp tới trong ngày (PENDING/CONFIRMED, giờ hẹn
 * còn ở phía trước), hiển thị giờ, tên khách, biển số, thời gian còn lại và nút gọi.
 */
export function StaffUpcomingCustomers({ bookings = [] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Khách sắp đến</h2>
      <div className="mt-4 space-y-2.5">
        {bookings.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-muted">Không còn khách nào sắp đến hôm nay.</p>
        ) : (
          bookings.map((b) => {
            const remain = minutesUntilSlot(b);
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="w-12 shrink-0 text-center">
                  <p className="text-sm font-extrabold text-foreground">{formatTime(b.slotTime) || "--:--"}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{b.customerName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.plate}
                    {typeof remain === "number" && remain >= 0 && (
                      <> · còn {remain >= 60 ? `${Math.floor(remain / 60)}g${remain % 60 ? ` ${remain % 60}p` : ""}` : `${remain} phút`}</>
                    )}
                  </p>
                </div>
                {b.phone && b.phone !== "Chưa cập nhật" && (
                  <a
                    href={`tel:${b.phone}`}
                    aria-label={`Gọi ${b.customerName}`}
                    title={`Gọi ${b.phone}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-primary-container"
                  >
                    <img src={STAFF_ASSETS.action.phone} alt="" width={18} height={18} className="rounded" />
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
