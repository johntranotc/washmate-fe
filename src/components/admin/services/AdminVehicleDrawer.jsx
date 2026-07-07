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
import { formatDate, formatTime, formatNumber, friendlyName } from "@/lib/format";

const VEHICLE_STATUS_LABELS = { ACTIVE: "Đang sử dụng", INACTIVE: "Ngưng sử dụng" };

/**
 * Drawer chi tiết xe khách hàng — dữ liệu thật đã gộp ở trang:
 * xe (GET /v1/vehicles) + chủ xe (GET /admin/users) + lịch sử booking theo
 * biển số (GET /bookings). BE chưa có ghi chú/audit → empty state.
 * vehicle: { ..., owner, bookings, totals: { count, lastDate, topGarage } }
 */
export function AdminVehicleDrawer({ vehicle, open, onOpenChange }) {
  if (!vehicle) return null;

  const { owner, bookings = [], totals = {} } = vehicle;
  const recent = bookings.slice(0, 5);
  const rows = [
    ["Chủ xe", friendlyName(owner?.fullName, "Khách hàng chưa cập nhật")],
    ["SĐT khách hàng", friendlyName(owner?.phone, "SĐT chưa cập nhật")],
    ["Email", friendlyName(owner?.email, "Email chưa cập nhật")],
    ["Hãng / dòng xe", [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Xe chưa cập nhật"],
    ...(vehicle.color ? [["Màu xe", vehicle.color]] : []),
    ["Gara thường dùng", friendlyName(totals.topGarage, "Chưa có booking")],
    ["Số lần booking", formatNumber(totals.count || 0)],
    ["Lần ghé gần nhất", totals.lastDate ? formatDate(totals.lastDate) : "Chưa có booking"],
    ["Trạng thái", VEHICLE_STATUS_LABELS[vehicle.status] || vehicle.status || "—"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{vehicle.licensePlate || "Xe chưa cập nhật"}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết xe khách hàng</AlertDialogDescription>
        </AlertDialogHeader>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử dịch vụ gần đây</p>
          {recent.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có booking.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {recent.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <b className="text-foreground">{friendlyName(b.serviceName, "Dịch vụ chưa cập nhật")}</b>
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

        {/* BE chưa có API ghi chú/audit cho xe */}
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
