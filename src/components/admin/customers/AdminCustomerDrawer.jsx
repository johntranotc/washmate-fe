import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatTime, formatMoney, formatNumber, friendlyName } from "@/lib/format";

const USER_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  BLOCKED: "Bị khóa",
  PENDING_VERIFY: "Chờ xác minh",
  DELETED: "Đã xóa",
};

/**
 * Drawer chi tiết khách hàng — toàn bộ dữ liệu thật đã fetch ở trang:
 * hồ sơ (GET /admin/users), xe (GET /v1/vehicles), lịch sử booking
 * (GET /bookings). Loyalty per-khách chưa có API admin → empty state,
 * không bịa điểm/hạng.
 */
export function AdminCustomerDrawer({ customer, open, onOpenChange }) {
  if (!customer) return null;

  const { vehicles = [], bookings = [], totals = {}, attentionReasons = [] } = customer;
  const recentBookings = bookings.slice(0, 5);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-lg font-bold text-white">
                {(customer.fullName || "K").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <AlertDialogTitle>{friendlyName(customer.fullName, "Khách hàng chưa cập nhật")}</AlertDialogTitle>
              <AlertDialogDescription>{customer.accountCode || `#${customer.id}`}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            customer.status === "ACTIVE"
              ? "bg-success-container text-success"
              : customer.status === "BLOCKED"
                ? "bg-critical-container text-critical"
                : "bg-muted text-muted-foreground"
          }`}
          >
            {USER_STATUS_LABELS[customer.status] || customer.status || "—"}
          </span>
          {attentionReasons.length > 0 && (
            <span className="rounded-full bg-warning-container px-2.5 py-0.5 text-xs font-bold text-warning">
              Cần chú ý
            </span>
          )}
        </div>

        {/* Liên hệ */}
        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {[
            ["Email", friendlyName(customer.email, "Email chưa cập nhật")],
            ["Số điện thoại", friendlyName(customer.phone, "SĐT chưa cập nhật")],
            ...(customer.address ? [["Địa chỉ", customer.address]] : []),
            ["Tổng lượt sử dụng", formatNumber(totals.bookings || 0)],
            ...(totals.spend > 0 ? [["Tổng chi tiêu", formatMoney(totals.spend)]] : []),
            ...(totals.lastDate ? [["Lần gần nhất", formatDate(totals.lastDate)]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Lý do cần chú ý — chỉ từ dữ liệu thật */}
        {attentionReasons.length > 0 && (
          <div className="mt-3 rounded-xl border border-warning/40 bg-warning-container p-4">
            <p className="text-xs font-bold text-warning">Lý do cần chú ý</p>
            <ul className="mt-1 space-y-0.5">
              {attentionReasons.map((r) => (
                <li key={r} className="text-xs leading-5 text-warning">• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Xe của khách */}
        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Xe của khách ({vehicles.length})</p>
          {vehicles.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Xe chưa cập nhật.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {vehicles.map((v) => (
                <div key={v.vehicleId ?? v.licensePlate} className="flex items-center justify-between gap-3 text-xs">
                  <b className="text-foreground">{v.licensePlate}</b>
                  <span className="truncate text-muted-foreground">
                    {[v.brand, v.model, v.color].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lịch sử booking gần đây */}
        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Booking gần đây</p>
          {recentBookings.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có booking.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <b className="text-primary">{b.code}</b>
                    <span className="ml-1.5 text-muted-foreground">
                      {formatDate(b.bookingDate)} {formatTime(b.slotTime) && `· ${formatTime(b.slotTime)}`}
                    </span>
                  </div>
                  <StatusBadge status={b.bookingStatus} type="booking" size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty — BE chưa có API admin xem loyalty theo khách */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Loyalty & điểm thành viên</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có loyalty. Dữ liệu điểm/hạng sẽ hiển thị khi hệ thống được cập nhật.</p>
        </div>

        {/* Lịch sử thao tác — BE chưa có audit API */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử thao tác</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch sử thao tác.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
