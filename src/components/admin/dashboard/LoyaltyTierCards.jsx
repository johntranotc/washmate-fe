import { Info } from "lucide-react";

const fmt = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("vi-VN").format(v));

/**
 * Các hạng thành viên (thẻ medal lớn).
 * tiers: [{ name, points, discount, color, image, customers: number|null }]
 * Số khách là dữ liệu thật (null => "—" khi API chưa có).
 */
export function LoyaltyTierCards({ tiers = [] }) {
  // Đánh dấu "Phổ biến" cho hạng đông khách nhất (chỉ khi có dữ liệu thật).
  let popularIdx = -1;
  let max = -1;
  tiers.forEach((t, i) => {
    if (typeof t.customers === "number" && t.customers > max) { max = t.customers; popularIdx = i; }
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">
        Các hạng thành viên <Info size={15} className="text-blue-500" />
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col items-center rounded-2xl border p-4 text-center transition ${
              idx === popularIdx ? "border-blue-500 shadow-md shadow-blue-500/10" : "border-slate-200"
            }`}
          >
            {idx === popularIdx && (
              <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                Phổ biến
              </span>
            )}
            <div className="mb-2 flex h-16 w-16 items-center justify-center">
              {tier.image ? (
                <img src={tier.image} alt={tier.name} className="h-full w-full object-contain drop-shadow" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              ) : (
                <span className="text-3xl" style={{ color: tier.color }}>🏅</span>
              )}
            </div>
            <h4 className="text-base font-extrabold" style={{ color: tier.color }}>{tier.name}</h4>
            <p className="mb-2 text-[10px] font-semibold text-slate-500">Từ {fmt(tier.points)} điểm</p>
            <span className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: tier.color }}>
              Giảm {tier.discount}%
            </span>
            <p className="text-xs font-semibold text-slate-600">{fmt(tier.customers)} khách hàng</p>
          </div>
        ))}
      </div>
    </div>
  );
}
