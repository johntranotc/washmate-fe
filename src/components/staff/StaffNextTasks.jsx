import { Link } from "react-router-dom";
import { ArrowRight, Car } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { getNextStaffAction } from "@/lib/staff-booking-data";
import { formatTime } from "@/lib/format";

/**
 * "Việc cần làm tiếp theo" — booking cần thao tác, kèm cột giờ và nút hành động
 * hợp lệ theo workflow. Không bịa dữ liệu — mọi thứ đến từ booking thật.
 */
export function StaffNextTasks({ tasks = [], onAction, busyId = null }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-foreground">Việc cần làm tiếp theo</h2>
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

      <div className="mt-4 space-y-2.5">
        {tasks.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Không còn việc cần xử lý ngay.</p>
        ) : (
          tasks.map((item) => {
            const action = getNextStaffAction(item);
            const busy = String(busyId) === String(item.id);
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center"
              >
                <div className="w-16 shrink-0 text-center">
                  <p className="text-sm font-black text-foreground">{formatTime(item.slotTime) || "--:--"}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card text-primary">
                  <Car size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <b className="text-sm text-foreground">{item.plate}</b>
                    <span className="text-xs text-muted-foreground">{item.vehicle}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.customerName} · {item.serviceName}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge status={item.bookingStatus} type="booking" size="sm" />
                  {action && (
                    <div className="flex flex-col items-end">
                      <Button
                        size="sm"
                        disabled={!action.enabled || busy}
                        onClick={() => onAction?.(item, action)}
                      >
                        {busy ? "..." : action.label}
                      </Button>
                      {!action.enabled && action.disabledHint && (
                        <span className="mt-0.5 text-xs font-semibold text-warning">{action.disabledHint}</span>
                      )}
                    </div>
                  )}
                  <Link
                    to={`/nhan-vien/danh-sach/${item.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-surface"
                  >
                    Chi tiết <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
