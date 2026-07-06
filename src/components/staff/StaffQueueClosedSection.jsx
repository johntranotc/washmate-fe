import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatTime, formatDate } from "@/lib/format";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * Section lịch sử phụ (Từ chối / Hủy) — mặc định collapse, chỉ hiện count.
 * Danh sách chỉ render khi người dùng bấm "Mở rộng".
 */
export function StaffQueueClosedSection({ title, bookings = [], onDetail }) {
  const [open, setOpen] = useState(false);

  if (bookings.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">{title}</h2>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1 text-xs font-bold text-muted-foreground">
            {bookings.length}
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-primary">
          {open ? "Thu gọn" : "Mở rộng"}
          <img
            src={STAFF_ASSETS.action.chevronDown}
            alt=""
            width={16}
            height={16}
            className={`rounded transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="divide-y divide-surface border-t border-border px-5">
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <b className="text-sm text-muted-foreground">{b.code}</b>
                  <span className="text-muted-foreground">
                    {formatDate(b.bookingDate)} {formatTime(b.slotTime) && `· ${formatTime(b.slotTime)}`}
                  </span>
                  <span className="font-semibold text-ink-soft">{b.customerName}</span>
                  <span className="text-muted-foreground">{b.plate}</span>
                </div>
                {b.rejectionReason && (
                  <p className="mt-0.5 text-xs text-neutral-muted">Lý do: {b.rejectionReason}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusBadge status={b.bookingStatus} type="booking" size="sm" />
                <Button size="sm" variant="outline" onClick={() => onDetail?.(b)}>Chi tiết</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
