import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const fmt = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("vi-VN").format(v));

/** Tổng quan tích điểm (rail). totals: { totalIssued, totalUsed, totalRemaining, customersWithPoints } */
export function LoyaltyPointsSummary({ totals = {} }) {
  const items = [
    { value: totals.totalIssued, label: "Tổng điểm đã phát sinh", cls: "text-slate-800" },
    { value: totals.totalUsed, label: "Tổng điểm đã sử dụng", cls: "text-emerald-600" },
    { value: totals.totalRemaining, label: "Điểm còn lại của khách", cls: "text-slate-800" },
    { value: totals.customersWithPoints, label: "Khách hàng có điểm", cls: "text-blue-600" },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-800">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-blue-600"><Star size={12} /></span>
        Tổng quan tích điểm
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((it, i) => (
          <div key={i}>
            <p className={`text-xl font-black ${it.cls}`}>{fmt(it.value)}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{it.label}</p>
          </div>
        ))}
      </div>
      <Link to="/quan-tri/campaigns" className="mt-4 block rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-bold text-white hover:bg-blue-700">
        Tạo chiến dịch tích điểm
      </Link>
    </div>
  );
}
