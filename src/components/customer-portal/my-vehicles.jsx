import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight, Plus } from "lucide-react";

/**
 * Xe của tôi — dữ liệu thật từ trang (GET /v1/vehicles/my-vehicles).
 * Hiển thị tối đa 2 xe gần nhất dạng gọn; xem tất cả ở trang Xe của tôi.
 */
export function MyVehicles({ vehicles = [] }) {
  const navigate = useNavigate();
  const shown = vehicles.slice(0, 2);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Xe của tôi</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Lưu xe để đặt lịch nhanh hơn.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/khach-hang/xe-cua-toi")}>
          Xem tất cả xe
        </Button>
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Car size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa thêm xe nào</p>
          <p className="mt-1 text-xs text-muted-foreground">Thêm xe để đặt lịch rửa nhanh hơn.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/khach-hang/xe-cua-toi")}>
            <Plus /> Thêm xe
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((vehicle, idx) => (
            <div
              key={vehicle.vehicleId || vehicle.id || idx}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                <Car size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Xe của bạn"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <b className="text-ink-soft">{vehicle.licensePlate || "Chưa cập nhật biển số"}</b>
                  {vehicle.color ? ` · ${vehicle.color}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-success-container px-2.5 py-0.5 text-xs font-bold text-success">
                Đang sử dụng
              </span>
            </div>
          ))}
          {vehicles.length > shown.length && (
            <button
              type="button"
              onClick={() => navigate("/khach-hang/xe-cua-toi")}
              className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold text-primary hover:bg-surface"
            >
              +{vehicles.length - shown.length} xe khác <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
