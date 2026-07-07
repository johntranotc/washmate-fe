import { CircleDollarSign, CalendarDays, CheckCircle2, Car, AlertTriangle, UserPlus } from "lucide-react";
import { formatMoney, formatMoneyShort, formatNumber } from "@/lib/format";

/**
 * KPI cards for the owner dashboard.
 *
 * All values are real (derived from booking data by the page).
 * `changes` is an optional map of percent-change vs. the previous period,
 * e.g. { revenue: 12.5, bookings: -3.2 }. When a value is null/undefined the
 * change row is hidden (we never invent a comparison number).
 *
 * The revenue value is NEVER truncated: it renders in adaptive form
 * ("9.980.000 đ" / "125,68 Tr đ") with the exact amount shown underneath.
 */
export function DashboardKpiCards({
  revenue = 0,
  bookings = 0,
  completed = 0,
  serving = 0,
  needAction = 0,
  newCustomers = 0,
  changes = {},
}) {
  const revenueShort = formatMoneyShort(revenue);
  const revenueFull = formatMoney(revenue);
  const kpis = [
    {
      key: "revenue", title: "Tổng doanh thu", value: revenueShort,
      subtitle: revenueShort !== revenueFull ? revenueFull : null,
      icon: <CircleDollarSign size={16} className="text-primary" />, color: "bg-primary-container", ring: "ring-primary/15",
    },
    { key: "bookings", title: "Tổng lịch hẹn", value: formatNumber(bookings), icon: <CalendarDays size={16} className="text-accent-indigo" />, color: "bg-accent-indigo/10", ring: "ring-accent-indigo/15" },
    { key: "completed", title: "Đã hoàn thành", value: formatNumber(completed), icon: <CheckCircle2 size={16} className="text-success" />, color: "bg-success-container", ring: "ring-success/15" },
    { key: "serving", title: "Xe đang phục vụ", value: formatNumber(serving), icon: <Car size={16} className="text-accent-violet" />, color: "bg-accent-violet/10", ring: "ring-accent-violet/15" },
    { key: "needAction", title: "Cần xử lý", value: formatNumber(needAction), icon: <AlertTriangle size={16} className="text-warning" />, color: "bg-warning-container", ring: "ring-warning/15" },
    {
      key: "newCustomers", title: "Khách hàng mới", value: formatNumber(newCustomers),
      // 0 khách mới: subtext trung tính thay vì badge -100% tiêu cực
      subtitle: newCustomers === 0 ? "Chưa có khách mới trong kỳ" : null,
      hideChange: newCustomers === 0,
      icon: <UserPlus size={16} className="text-accent-cyan" />, color: "bg-accent-cyan/10", ring: "ring-accent-cyan/15",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi) => {
        const change = kpi.hideChange ? null : changes?.[kpi.key];
        const hasChange = typeof change === "number" && Number.isFinite(change);
        const up = hasChange && change >= 0;
        // Với "Cần xử lý", tăng là tin xấu — đảo màu.
        const positive = kpi.key === "needAction" ? !up : up;
        return (
          <div key={kpi.key} className="flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:shadow-card">
            {/* Tiêu đề luôn chiếm đủ 2 dòng để con số của mọi thẻ thẳng hàng nhau */}
            <div className="flex items-start justify-between gap-2">
              <p className="min-h-8 text-xs font-bold leading-4 text-muted-foreground">{kpi.title}</p>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-2 ${kpi.color} ${kpi.ring}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-2 min-w-0">
              <h3 className="text-xl font-semibold leading-tight text-foreground" title={kpi.subtitle || undefined}>
                {kpi.value}
              </h3>
              <p className="mt-0.5 min-h-4 text-xs font-semibold leading-4 text-neutral-muted">
                {kpi.subtitle || " "}
              </p>
            </div>
            <div className="mt-3 flex min-h-5 items-center gap-1.5">
              {hasChange && (
                <>
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${positive ? "bg-success-container text-success" : "bg-critical-container text-critical"}`}>
                    {up ? "↗" : "↘"} {up ? "+" : ""}{change.toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold text-neutral-muted">so với kỳ trước</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
