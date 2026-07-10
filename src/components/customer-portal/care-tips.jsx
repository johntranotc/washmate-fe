import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplets, Car } from "lucide-react";
import { formatDate } from "@/lib/format";

/**
 * Gợi ý chăm sóc định kỳ — tính từ dữ liệu THẬT: lần rửa hoàn tất gần nhất
 * của từng xe (booking COMPLETED khớp biển số). Không đủ dữ liệu → ẩn block.
 * Không gọi là AI, không hardcode số ngày.
 */
export function CareTips({ bookings = [], vehicles = [] }) {
  const navigate = useNavigate();

  const tips = useMemo(() => {
    if (!vehicles.length) return [];
    const now = new Date();
    return vehicles.slice(0, 3).map((v) => {
      const plate = v.licensePlate;
      const lastWash = bookings
        .filter((b) => (b.bookingStatus || b.status) === "COMPLETED" && plate && b.plate === plate)
        .map((b) => b.bookingDate)
        .filter(Boolean)
        .sort()
        .pop();
      let days = null;
      if (lastWash) {
        const d = new Date(`${String(lastWash).slice(0, 10)}T00:00:00`);
        if (!Number.isNaN(d.getTime())) days = Math.max(0, Math.floor((now - d) / 86400000));
      }
      return {
        key: v.vehicleId || v.id || plate,
        name: [v.brand, v.model].filter(Boolean).join(" ") || "Xe của bạn",
        plate: plate || "Chưa cập nhật",
        lastWash,
        days,
      };
    });
  }, [bookings, vehicles]);

  if (!tips.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Gợi ý chăm sóc định kỳ</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Dựa trên lịch sử rửa xe thực tế của bạn tại WashMate.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tips.map((tip) => (
          <div key={tip.key} className="flex flex-col rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                {tip.days != null ? <Droplets size={16} /> : <Car size={16} />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{tip.name}</p>
                <p className="truncate text-xs text-muted-foreground">{tip.plate}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-xs text-muted-foreground">
              {tip.days == null
                ? "Xe chưa có lịch sử rửa tại WashMate."
                : tip.days === 0
                  ? `Vừa rửa hôm nay (${formatDate(tip.lastWash)}).`
                  : `Đã ${tip.days} ngày chưa rửa (lần gần nhất ${formatDate(tip.lastWash)}).`}
              {" "}Đặt lịch để giữ xe sạch và bảo vệ lớp sơn.
            </p>
            <Button size="sm" className="mt-3 w-full" onClick={() => navigate("/khach-hang/dat-lich-moi")}>
              Đặt lịch ngay
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
