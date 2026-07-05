import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * KPI vận hành trong ngày cho staff — 6 thẻ, số đếm từ booking thật (không hardcode).
 * Icon lấy từ bộ asset gốc icons/kpi (washmate_staff_assets_package).
 * `deltas` (tuỳ chọn) là chênh lệch so với hôm qua; chỉ hiển thị khi có dữ liệu hôm qua thật.
 */
export function StaffKpiCards({
  total = 0,
  waitingCheckIn = 0,
  checkedIn = 0,
  washing = 0,
  completed = 0,
  needAction = 0,
  deltas = null,
}) {
  const cards = [
    { key: "total", label: "Lịch hôm nay", value: total, icon: STAFF_ASSETS.kpi.calendar },
    { key: "waitingCheckIn", label: "Chờ check-in", value: waitingCheckIn, icon: STAFF_ASSETS.kpi.hourglass },
    { key: "checkedIn", label: "Đã check-in", value: checkedIn, icon: STAFF_ASSETS.kpi.userCheck },
    { key: "washing", label: "Đang rửa", value: washing, icon: STAFF_ASSETS.kpi.droplet },
    { key: "completed", label: "Hoàn tất hôm nay", value: completed, icon: STAFF_ASSETS.kpi.complete },
    { key: "needAction", label: "Cần xử lý", value: needAction, icon: STAFF_ASSETS.kpi.warning, alert: true },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ key, label, value, icon, alert }) => {
        const d = deltas?.[key];
        const hasD = typeof d === "number" && Number.isFinite(d);
        const up = hasD && d >= 0;
        return (
          <article
            key={key}
            className={`rounded-2xl border bg-card p-5 ${alert && value > 0 ? "border-warning/40" : "border-border"}`}
          >
            <img src={icon} alt="" width={44} height={44} className="rounded-xl" />
            <p className="mt-4 text-xs font-semibold text-muted-foreground">{label}</p>
            <b className="mt-1 block text-2xl font-extrabold text-foreground">{value}</b>
            {hasD && (
              <p className={`mt-1 text-xs font-bold ${up ? "text-success" : "text-critical"}`}>
                {up ? "↗" : "↘"} {up ? "+" : ""}{d} so với hôm qua
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}
