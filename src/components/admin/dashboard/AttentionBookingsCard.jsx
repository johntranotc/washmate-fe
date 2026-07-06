import { Link } from "react-router-dom";
import { formatTime, friendlyName } from "@/lib/format";

/**
 * "Lịch cần chú ý" — đúng 5 dòng booking thật cần quan tâm (chờ xác nhận,
 * quá giờ, chờ thanh toán, no-show risk, thanh toán thất bại...).
 * bookings: [{ id, code, customerName, slotTime, issue, tone }]
 */
export function AttentionBookingsCard({ bookings = [] }) {
  const rows = bookings.slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Lịch cần chú ý</h2>
        <Link to="/quan-tri/bookings" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="mt-3 divide-y divide-surface">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-muted">
            Không có lịch nào cần chú ý trong kỳ.
          </p>
        ) : (
          rows.map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-2.5">
              <div className="w-11 shrink-0 text-center">
                <p className="text-sm font-bold text-foreground">{formatTime(b.slotTime) || "--:--"}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">
                  <b className="text-primary">{b.code}</b>
                  <span className="ml-1.5 font-semibold text-ink-soft">
                    {friendlyName(b.customerName, "Khách hàng chưa cập nhật")}
                  </span>
                </p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${b.tone}`}>
                  {b.issue}
                </span>
              </div>
              <Link
                to="/quan-tri/bookings"
                className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-surface"
              >
                Xem
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
