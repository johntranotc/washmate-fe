import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatTime, formatMoney, formatNumber, friendlyName } from "@/lib/format";

export const GARAGE_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", tone: "bg-success-container text-success" },
  INACTIVE: { label: "Tạm ngừng", tone: "bg-warning-container text-warning" },
};

/**
 * Drawer chi tiết chi nhánh — toàn bộ từ dữ liệu thật đã gộp ở trang:
 * garage (GET /v1/garages), dịch vụ (GET /v1/services/garage/{id}),
 * nhân viên (GET /admin/users theo garageIds), hiệu suất kỳ (GET /bookings).
 * BE không có email/giờ mở cửa/công suất slot cấu hình → hiển thị trung thực.
 * branch: { ...garage, services: [], staff: [], stats: { total, completed,
 *   cancelledNoShow, revenue, payments }, recentBookings: [] }
 */
export function AdminGarageDrawer({ branch, open, onOpenChange, periodLabel }) {
  if (!branch) return null;

  const st = GARAGE_STATUS_META[branch.status] || { label: branch.status || "—", tone: "bg-muted text-muted-foreground" };
  const { stats = {}, services = [], staff = [], recentBookings = [] } = branch;

  const infoRows = [
    ["Địa chỉ", branch.address || "Chưa cập nhật địa chỉ"],
    ["Số điện thoại", branch.phone || "Chưa cập nhật số điện thoại"],
    ["Giờ mở cửa", "Chưa cập nhật giờ mở cửa"],
    ...(branch.updatedAt ? [["Cập nhật gần nhất", formatDate(branch.updatedAt)]] : []),
  ];

  const perfRows = [
    ["Tổng lịch hẹn", formatNumber(stats.total || 0)],
    ["Hoàn thành", formatNumber(stats.completed || 0)],
    ["Hủy / không đến", formatNumber(stats.cancelledNoShow || 0)],
    ["Doanh thu trong kỳ", formatMoney(stats.revenue || 0)],
    ["Đã thanh toán", formatNumber(stats.payments?.paid || 0)],
    ["Chờ thanh toán", formatNumber(stats.payments?.pending || 0)],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(branch.name, "Chi nhánh chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết chi nhánh</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>{st.label}</span>
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {infoRows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">
            Hiệu suất trong kỳ{periodLabel ? ` (${periodLabel})` : ""}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {perfRows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <b className="text-foreground">{value}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Dịch vụ đang áp dụng ({services.length})</p>
          {services.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có dịch vụ nào.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {services.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-ink-soft">
                    {friendlyName(s.name, "Dịch vụ chưa đặt tên")}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{formatMoney(s.price)}</span>
                </div>
              ))}
              {services.length > 6 && (
                <p className="text-xs text-neutral-muted">+{services.length - 6} dịch vụ khác</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Nhân viên thuộc chi nhánh ({staff.length})</p>
          {staff.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có nhân viên nào được phân công.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {staff.slice(0, 6).map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-ink-soft">
                    {friendlyName(u.fullName, "Nhân viên chưa cập nhật")}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{u.role || "STAFF"}</span>
                </div>
              ))}
              {staff.length > 6 && (
                <p className="text-xs text-neutral-muted">+{staff.length - 6} nhân viên khác</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch hẹn gần đây</p>
          {recentBookings.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch hẹn trong kỳ.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {recentBookings.slice(0, 5).map((b) => (
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

        {/* BE chưa có API cấu hình slot/công suất theo chi nhánh */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Cấu hình công suất / slot</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
