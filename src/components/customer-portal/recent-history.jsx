import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History, ReceiptText } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";

/**
 * Lịch sử gần đây — 3 lịch HOÀN TẤT gần nhất từ booking thật của khách.
 * Chưa có lịch hoàn tất → empty state nhỏ, không lấp dữ liệu giả.
 */
export function RecentHistory({ bookings = [] }) {
  const navigate = useNavigate();

  const recent = useMemo(
    () => bookings
      .filter((b) => (b.bookingStatus || b.status) === "COMPLETED")
      .sort((a, z) => String(z.bookingDate || "").localeCompare(String(a.bookingDate || "")))
      .slice(0, 3),
    [bookings],
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lịch sử gần đây</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Các lần rửa xe đã hoàn tất gần nhất.</p>
        </div>
        <Link to="/khach-hang/lich-dat" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <History size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Chưa có lịch nào hoàn tất</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Lịch sử sẽ hiển thị sau khi bạn hoàn tất lần rửa xe đầu tiên.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {recent.map((b, idx) => (
            <div
              key={b.id || b.bookingId || idx}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{b.serviceName}</p>
                  <StatusBadge status={b.bookingStatus || b.status} type="booking" size="sm" />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatDate(b.bookingDate)} · {b.garageName}
                  {b.finalAmount != null ? ` · ${formatMoney(b.finalAmount)}` : ""}
                </p>
              </div>
              {b.paymentStatus === "PAID" && (
                <button
                  type="button"
                  onClick={() => navigate(`/khach-hang/thanh-toan/${b.id || b.bookingId}/hoa-don`)}
                  title="Xem hóa đơn"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-primary hover:bg-primary-container"
                >
                  <ReceiptText size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
