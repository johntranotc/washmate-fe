import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatMoney, formatDate, formatNumber, friendlyName } from "@/lib/format";

/**
 * Drawer chi tiết gói dịch vụ — dữ liệu thật từ GET /v1/services + số liệu
 * booking/doanh thu tính từ GET /bookings (30 ngày). BE chưa có lịch sử
 * chỉnh sửa → empty state, không fake log.
 * service: đã enrich { ..., garageName, bookings30d, revenue30d }
 */
export function AdminServiceDrawer({ service, open, onOpenChange }) {
  if (!service) return null;

  const active = service.status === "ACTIVE";
  const rows = [
    ["Mã dịch vụ", service.id ? `DV-${String(service.id).padStart(4, "0")}` : "—"],
    ["Giá", formatMoney(service.price)],
    ["Thời lượng", service.durationMinutes ? `${service.durationMinutes} phút` : "—"],
    ["Gara áp dụng", friendlyName(service.garageName, "Gara chưa cập nhật")],
    ["Booking 30 ngày", formatNumber(service.bookings30d || 0)],
    ...(service.revenue30d > 0 ? [["Doanh thu 30 ngày", formatMoney(service.revenue30d)]] : []),
    ...(service.createdAt ? [["Ngày tạo", formatDate(service.createdAt)]] : []),
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(service.name, "Dịch vụ chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết gói dịch vụ</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            active ? "bg-success-container text-success" : "bg-muted text-muted-foreground"
          }`}
          >
            {active ? "Đang hoạt động" : "Tạm ẩn"}
          </span>
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Mô tả</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {friendlyName(service.description, "Mô tả chưa cập nhật")}
          </p>
        </div>

        {/* BE chưa có API lịch sử chỉnh sửa */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử chỉnh sửa</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch sử chỉnh sửa.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
