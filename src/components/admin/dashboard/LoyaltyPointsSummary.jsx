import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const fmt = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("vi-VN").format(v));

/** Tổng quan tích điểm (rail). totals: { totalIssued, totalUsed, totalRemaining, customersWithPoints } */
export function LoyaltyPointsSummary({ totals = {} }) {
  const items = [
    { value: totals.totalIssued, label: "Tổng điểm đã phát sinh", cls: "text-foreground" },
    { value: totals.totalUsed, label: "Tổng điểm đã sử dụng", cls: "text-success" },
    { value: totals.totalRemaining, label: "Điểm còn lại của khách", cls: "text-foreground" },
    { value: totals.customersWithPoints, label: "Khách hàng có điểm", cls: "text-primary" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-container text-primary"><Star size={14} /></span>
        Tổng quan tích điểm
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((it, i) => (
          <div key={i}>
            <p className={`text-xl font-black ${it.cls}`}>{fmt(it.value)}</p>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{it.label}</p>
          </div>
        ))}
      </div>
      <Link to="/quan-tri/campaigns" className="mt-4 block rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-bold text-white hover:bg-primary-strong">
        Tạo chiến dịch tích điểm
      </Link>
    </div>
  );
}
