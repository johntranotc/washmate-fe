import { Menu } from "@base-ui/react/menu";
import {
  Car,
  Droplets,
  Ellipsis,
  Pencil,
  EyeOff,
  Eye,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBookingDate } from "@/lib/customer-booking-data";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONES,
  vehicleDisplayName,
  vehicleNeedsUpdate,
  isActiveVehicle,
} from "@/lib/customer-vehicle-data";

function VehicleStatusBadge({ status }) {
  const s = status || "ACTIVE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
        VEHICLE_STATUS_TONES[s] || VEHICLE_STATUS_TONES.INACTIVE
      }`}
    >
      {VEHICLE_STATUS_LABELS[s] || s}
    </span>
  );
}

function InfoCell({ label, value, accent = false }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

/**
 * Card xe — gọn, hiện đại. Dữ liệu 100% thật; thiếu field hiển thị "Chưa cập nhật"/"Chưa có".
 * BE không có ảnh xe → dùng placeholder glyph tối giản (không gán ảnh theo hãng).
 */
export function VehicleCard({ vehicle, stats, onBook, onDetail, onEdit, onToggleStatus, onDelete, onSetDefault }) {
  const needsUpdate = vehicleNeedsUpdate(vehicle);
  const active = isActiveVehicle(vehicle);
  const last = stats?.lastService;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:border-primary/40">
      {/* Visual placeholder */}
      <div className="relative flex h-20 items-center gap-3 bg-[linear-gradient(120deg,var(--primary-container),var(--card))] px-5">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <Car size={26} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold leading-tight">{vehicleDisplayName(vehicle)}</h3>
          <span className="mt-1 inline-block rounded-md border border-border bg-card/70 px-2 py-0.5 font-mono text-xs font-bold tracking-wider">
            {vehicle.licensePlate || "Chưa có biển số"}
          </span>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
          <VehicleStatusBadge status={vehicle.status} />
          {needsUpdate && (
            <span className="inline-flex items-center rounded-full bg-warning-container px-2 py-0.5 text-[11px] font-bold text-warning">
              Cần cập nhật
            </span>
          )}
        </div>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 gap-3 border-b border-border px-5 py-4 sm:grid-cols-4">
        <InfoCell label="Dòng xe" value={vehicle.model || "Chưa cập nhật"} />
        <InfoCell label="Màu sơn" value={vehicle.color || "Chưa cập nhật"} />
        <InfoCell label="Chăm sóc gần nhất" value={last ? formatBookingDate(last.date) : "Chưa có"} />
        <InfoCell label="Tổng đặt lịch" value={`${stats?.totalBookings ?? 0} lần`} accent />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-4">
        <Button size="sm" className="flex-1" onClick={() => onBook(vehicle)}>
          Đặt lịch rửa xe
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDetail(vehicle)}>
          Chi tiết
        </Button>

        <Menu.Root>
          <Menu.Trigger
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface data-[popup-open]:bg-surface"
            aria-label="Thao tác khác"
          >
            <Ellipsis size={18} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="end" className="z-[70]">
              <Menu.Popup className="min-w-52 rounded-xl border border-border bg-popover p-1.5 shadow-floating outline-none">
                <MenuItem icon={Pencil} onClick={() => onEdit(vehicle)}>Chỉnh sửa</MenuItem>
                <MenuItem icon={Star} onClick={() => onSetDefault(vehicle)}>
                  Đặt làm xe mặc định
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">Sắp có</span>
                </MenuItem>
                <MenuItem icon={active ? EyeOff : Eye} onClick={() => onToggleStatus(vehicle)}>
                  {active ? "Tạm ẩn xe" : "Kích hoạt lại"}
                </MenuItem>
                <div className="my-1 h-px bg-border" />
                <MenuItem icon={Trash2} danger onClick={() => onDelete(vehicle)}>Xóa xe</MenuItem>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </article>
  );
}

function MenuItem({ icon: Icon, children, onClick, danger = false }) {
  return (
    <Menu.Item
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold outline-none transition data-[highlighted]:bg-surface ${
        danger ? "text-critical data-[highlighted]:bg-critical-container" : "text-foreground"
      }`}
    >
      <Icon size={16} /> {children}
    </Menu.Item>
  );
}

export default VehicleCard;
