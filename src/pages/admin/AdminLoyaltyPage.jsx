import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Gift, AlertTriangle } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { rewardApi } from "../../api/rewardApi";
import { LoyaltyTierCards } from "../../components/admin/dashboard/LoyaltyTierCards";
import { LoyaltyPointsSummary } from "../../components/admin/dashboard/LoyaltyPointsSummary";
import { formatNumber } from "../../lib/format";

const LOYALTY_TIERS = [
  { name: "Đồng", points: 0, discount: 5, color: "#CD7F32", image: "/badges/dong.png", customers: null },
  { name: "Bạc", points: 500, discount: 8, color: "#94A3B8", image: "/badges/bac.png", customers: null },
  { name: "Vàng", points: 1500, discount: 12, color: "#F59E0B", image: "/badges/vang.png", customers: null },
  { name: "Bạch Kim", points: 3500, discount: 15, color: "#3B82F6", image: "/badges/bach-kim.png", customers: null },
  { name: "Kim Cương", points: 8000, discount: 20, color: "#8B5CF6", image: "/badges/kim-cuong.png", customers: null },
];

export default function AdminLoyaltyPage() {
  const [garages, setGarages] = useState([]);
  const [garageId, setGarageId] = useState("");
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.data || [];
        setGarages(list);
        if (list.length) setGarageId(String(list[0].id ?? list[0].garageId));
      })
      .catch(() => setGarages([]));
  }, []);

  useEffect(() => {
    if (!garageId) { setLoading(false); return; }
    setLoading(true); setError(null);
    rewardApi.getRewardsByGarage(garageId)
      .then((d) => setRewards(Array.isArray(d) ? d : d?.data || d?.content || []))
      .catch((e) => { setError(e?.message || "Không thể tải ưu đãi."); setRewards([]); })
      .finally(() => setLoading(false));
  }, [garageId]);

  const tiers = useMemo(() => LOYALTY_TIERS, []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tích điểm & Thành viên</h1>
          <p className="mt-1 text-sm text-slate-500">Cấu hình hạng thành viên và danh mục ưu đãi đổi điểm.</p>
        </div>
        {garages.length > 0 && (
          <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500">
            {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
          </select>
        )}
      </header>

      <LoyaltyTierCards tiers={tiers} />
      <p className="-mt-3 text-[11px] font-semibold text-slate-400">
        Mốc điểm và mức giảm giá là cấu hình nghiệp vụ của hệ thống. Số khách theo từng hạng đang chờ BE bổ sung dữ liệu
        (<span className="font-mono">GET /api/v1/admin/loyalty-tiers</span> hiện trả về rỗng).
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Gift size={18} className="text-blue-600" /> Ưu đãi đổi điểm</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={22} />Đang tải ưu đãi...</p>
          ) : error ? (
            <div className="py-10 text-center"><AlertTriangle className="mx-auto mb-2 text-red-500" size={22} /><p className="text-sm font-bold text-red-700">{error}</p></div>
          ) : rewards.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Chưa có ưu đãi nào cho cơ sở này.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rewards.map((r) => (
                <article key={r.id ?? r.rewardId} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <b className="text-sm text-slate-800">{r.name ?? r.title ?? r.rewardName ?? "Ưu đãi"}</b>
                  {r.description && <p className="mt-1 text-xs text-slate-500">{r.description}</p>}
                  <p className="mt-2 text-sm font-black text-blue-600">{formatNumber(r.pointsCost ?? r.points ?? r.requiredPoints ?? 0)} điểm</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <LoyaltyPointsSummary totals={{ totalIssued: null, totalUsed: null, totalRemaining: null, customersWithPoints: null }} />
      </div>
    </div>
  );
}
