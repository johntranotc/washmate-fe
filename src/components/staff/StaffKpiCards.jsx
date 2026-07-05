import { CalendarDays, Clock3, Droplets, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

/**
 * KPI vận hành cho staff (không phải dashboard doanh thu).
 * `deltas` (tuỳ chọn) là chênh lệch so với hôm qua (số nguyên) cho từng key;
 * chỉ hiển thị khi có dữ liệu hôm qua thật (không bịa).
 */
export function StaffKpiCards({
  total = 0,
  waitingCheckIn = 0,
  washing = 0,
  completed = 0,
  noShow = 0,
  overdue = 0,
  deltas = null,
}) {
  const cards = [
    { key: "total", label: "Lịch hôm nay", value: total, Icon: CalendarDays, tone: "text-primary bg-primary-container" },
    { key: "waitingCheckIn", label: "Chờ check-in", value: waitingCheckIn, Icon: Clock3, tone: "text-warning bg-warning-container" },
    { key: "washing", label: "Đang rửa", value: washing, Icon: Droplets, tone: "text-accent-violet bg-accent-violet/10" },
    { key: "completed", label: "Hoàn tất hôm nay", value: completed, Icon: CheckCircle2, tone: "text-success bg-success-container" },
    { key: "noShow", label: "Không đến / No-show", value: noShow, Icon: XCircle, tone: "text-critical bg-critical-container" },
    { key: "overdue", label: "Quá giờ / cần xử lý", value: overdue, Icon: AlertTriangle, tone: "text-warning bg-warning-container" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ key, label, value, Icon, tone }) => {
        const d = deltas?.[key];
        const hasD = typeof d === "number" && Number.isFinite(d);
        const up = hasD && d >= 0;
        return (
          <article key={key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className={`inline-grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">{label}</p>
            <b className="mt-1 block text-2xl font-black text-foreground">{value}</b>
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
