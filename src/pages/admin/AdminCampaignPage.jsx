import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { RefreshCw, AlertTriangle, Megaphone } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { promotionApi } from "../../api/promotionApi";
import Pagination from "../../components/common/Pagination";
import { formatDate, formatNumber } from "../../lib/format";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const statusTone = {
  ACTIVE: "bg-success-container text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  EXPIRED: "bg-critical-container text-critical",
};

export default function AdminCampaignPage() {
  const [garages, setGarages] = useState([]);
  const [garageId, setGarageId] = useState("");
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.data || [];
        setGarages(list);
        setGarageId(list.length ? String(list[0].id ?? list[0].garageId) : "1");
      })
      .catch(() => { setGarages([]); setGarageId("1"); });
  }, []);

  const load = (gid) => {
    setLoading(true); setError(null);
    promotionApi.getAllPromotionsByGarage(gid)
      .then((list) => setPromos(Array.isArray(list) ? list : []))
      .catch((e) => { setError(e?.message || "Không thể tải chiến dịch."); setPromos([]); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (garageId) load(garageId); }, [garageId]);
  useEffect(() => { setPage(1); }, [promos]);

  const paged = useMemo(() => promos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [promos, page]);

  const discountText = (p) => p.discountType === "PERCENTAGE" ? `Giảm ${p.discountValue}%` : `Giảm ${formatNumber(p.discountValue)}đ`;

  return (
    <PageContainer>
      <PageHeader
        title="Chiến dịch"
        description="Quản lý các chương trình khuyến mãi và ưu đãi theo cơ sở."
        actions={
          <>
        <div className="flex items-center gap-3">
          {garages.length > 0 && (
            <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-sm outline-none focus:border-primary">
              {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
            </select>
          )}
          <Button variant="outline" onClick={() => garageId && load(garageId)} className="text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        </div>
          </>
        }
      />

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 p-5 pb-3 text-foreground">
          <Megaphone size={18} className="text-primary" />
          <span className="font-extrabold">Tổng {promos.length} chiến dịch</span>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Đang tải...</p>
        ) : error ? (
          <div className="p-10 text-center"><AlertTriangle className="mx-auto mb-2 text-critical" size={24} /><p className="text-sm font-bold text-critical">{error}</p></div>
        ) : promos.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-muted">Chưa có chiến dịch nào cho cơ sở này.</p>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[880px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-xs text-neutral-muted">
                    <th className="py-3 pr-3 font-semibold">Mã</th>
                    <th className="py-3 pr-3 font-semibold">Tên chương trình</th>
                    <th className="py-3 pr-3 font-semibold">Ưu đãi</th>
                    <th className="py-3 pr-3 font-semibold">Đơn tối thiểu</th>
                    <th className="py-3 pr-3 font-semibold">Thời gian</th>
                    <th className="py-3 pr-3 font-semibold">Lượt dùng</th>
                    <th className="py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface">
                  {paged.map((p) => (
                    <tr key={p.id} className="hover:bg-surface">
                      <td className="py-3 pr-3 font-mono font-bold text-primary">{p.code || "–"}</td>
                      <td className="py-3 pr-3 font-semibold text-ink-soft">{p.title}</td>
                      <td className="py-3 pr-3 text-ink-soft">{discountText(p)}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{p.minOrderValue ? `${formatNumber(p.minOrderValue)}đ` : "—"}</td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {p.startDate || p.endDate ? `${formatDate(p.startDate)} → ${formatDate(p.endDate)}` : "—"}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-ink-soft">
                        {p.usedCount ?? 0}{p.usageLimit ? ` / ${formatNumber(p.usageLimit)}` : ""}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${statusTone[String(p.status).toUpperCase()] || "bg-muted text-muted-foreground"}`}>
                          {p.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={promos.length} onPageChange={setPage} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
