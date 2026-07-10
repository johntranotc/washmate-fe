import { useEffect } from "react";
import { Car, Droplets, Pencil, History, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBookingDate } from "@/lib/customer-booking-data";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONES,
  vehicleDisplayName,
  vehicleNeedsUpdate,
  missingCoreFields,
} from "@/lib/customer-vehicle-data";

const EMPTY = "—";

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-bold break-words">{value || EMPTY}</dd>
    </div>
  );
}

/**
 * Drawer chi tiết xe. Thông tin xe + lịch sử chăm sóc lấy từ dữ liệu THẬT (booking khớp biển số).
 * Props: vehicle (null = đóng), stats, onClose, onBook, onEdit.
 */
export function VehicleDetailDrawer({ vehicle, stats, onClose, onBook, onEdit }) {
  const open = Boolean(vehicle);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const status = vehicle.status || "ACTIVE";
  const needsUpdate = vehicleNeedsUpdate(vehicle);
  const missing = missingCoreFields(vehicle);
  const recent = stats?.recentBookings || [];
  const last = stats?.lastService;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Chi tiết xe">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <aside className="wm-drawer-panel absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-card shadow-floating">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Car size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold">{vehicleDisplayName(vehicle)}</h2>
              <span className="mt-1 inline-block rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs font-bold tracking-wider">
                {vehicle.licensePlate || "Chưa có biển số"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${VEHICLE_STATUS_TONES[status]}`}>
              {VEHICLE_STATUS_LABELS[status]}
            </span>
            {needsUpdate && (
              <span className="inline-flex items-center rounded-full bg-warning-container px-2.5 py-1 text-xs font-bold text-warning">
                Cần cập nhật
              </span>
            )}
          </div>

          {needsUpdate && (
            <p className="mt-3 rounded-xl bg-warning-container/60 px-3 py-2 text-xs font-semibold text-warning">
              Còn thiếu: {missing.join(", ")}. Cập nhật để hồ sơ xe đầy đủ hơn.
            </p>
          )}

          {/* Thông tin xe */}
          <h3 className="mt-5 text-sm font-extrabold text-muted-foreground">Thông tin xe</h3>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <Field label="Hãng xe" value={vehicle.brand} />
            <Field label="Dòng xe" value={vehicle.model} />
            <Field label="Màu sơn" value={vehicle.color} />
            <Field label="Biển số" value={vehicle.licensePlate} />
          </dl>

          {/* Lịch sử chăm sóc */}
          <h3 className="mt-6 flex items-center gap-2 text-sm font-extrabold text-muted-foreground">
            <History size={15} /> Lịch sử chăm sóc
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold text-muted-foreground">Chăm sóc gần nhất</p>
              <p className="mt-0.5 font-bold">{last ? formatBookingDate(last.date) : "Chưa có"}</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold text-muted-foreground">Tổng lịch đã đặt</p>
              <p className="mt-0.5 font-bold text-primary">{stats?.totalBookings ?? 0} lần</p>
            </div>
          </div>

          {last && (
            <div className="mt-3 rounded-xl border border-border p-3 text-sm">
              <p className="inline-flex items-center gap-1.5 font-semibold">
                <Droplets size={15} className="text-primary" /> {last.serviceName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={15} /> {last.garageName}
              </p>
            </div>
          )}

          {recent.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground">Lịch gần đây</p>
              <ul className="mt-2 grid gap-2">
                {recent.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{b.serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBookingDate(b.bookingDate)}{b.slotTime ? ` · ${b.slotTime}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={b.bookingStatus} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
              Chưa có lịch đặt nào cho xe này.
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-border p-5">
          <Button size="lg" className="w-full shadow-cta" onClick={() => onBook(vehicle)}>
            <Droplets size={18} /> Đặt lịch rửa xe
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => onEdit(vehicle)}>
            <Pencil size={17} /> Chỉnh sửa thông tin
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default VehicleDetailDrawer;
