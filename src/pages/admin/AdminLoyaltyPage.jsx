import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, Gift, AlertTriangle } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { rewardApi } from "../../api/rewardApi";
import { LoyaltyTierCards } from "../../components/admin/dashboard/LoyaltyTierCards";
import { LoyaltyPointsSummary } from "../../components/admin/dashboard/LoyaltyPointsSummary";
import { formatNumber } from "../../lib/format";

const LOYALTY_TIERS = [
  { name: "Đồng", points: 0, discount: 5, color: "var(--tier-bronze)", image: "/badges/dong.png", customers: null },
  { name: "Bạc", points: 500, discount: 8, color: "var(--tier-silver)", image: "/badges/bac.png", customers: null },
  { name: "Vàng", points: 1500, discount: 12, color: "var(--tier-gold)", image: "/badges/vang.png", customers: null },
  { name: "Bạch Kim", points: 3500, discount: 15, color: "var(--tier-platinum)", image: "/badges/bach-kim.png", customers: null },
  { name: "Kim Cương", points: 8000, discount: 20, color: "var(--tier-diamond)", image: "/badges/kim-cuong.png", customers: null },
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
    <PageContainer>
      <PageHeader
        title="Tích điểm & Thành viên"
        description="Cấu hình hạng thành viên và danh mục ưu đãi đổi điểm."
        actions={
          <>
        {garages.length > 0 && (
          <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
          </select>
        )}
          </>
        }
      />

      <LoyaltyTierCards tiers={tiers} />
      <p className="-mt-3 text-xs font-semibold text-neutral-muted">
        Mốc điểm và mức giảm giá là cấu hình nghiệp vụ của hệ thống. Số khách theo từng hạng đang chờ BE bổ sung dữ liệu
        (<span className="font-mono">GET /api/v1/admin/loyalty-tiers</span> hiện trả về rỗng).
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-extrabold text-foreground"><Gift size={18} className="text-primary" /> Ưu đãi đổi điểm</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Đang tải ưu đãi...</p>
          ) : error ? (
            <div className="py-10 text-center"><AlertTriangle className="mx-auto mb-2 text-critical" size={20} /><p className="text-sm font-bold text-critical">{error}</p></div>
          ) : rewards.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-muted">Chưa có ưu đãi nào cho cơ sở này.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rewards.map((r) => (
                <article key={r.id ?? r.rewardId} className="rounded-xl border border-border bg-surface p-4">
                  <b className="text-sm text-foreground">{r.name ?? r.title ?? r.rewardName ?? "Ưu đãi"}</b>
                  {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                  <p className="mt-2 text-sm font-black text-primary">{formatNumber(r.pointsCost ?? r.points ?? r.requiredPoints ?? 0)} điểm</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <LoyaltyPointsSummary totals={{ totalIssued: null, totalUsed: null, totalRemaining: null, customersWithPoints: null }} />
      </div>
    </PageContainer>
  );
}
