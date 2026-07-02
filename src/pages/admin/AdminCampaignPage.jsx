import { useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertTriangle, Megaphone } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { promotionApi } from "../../api/promotionApi";
import Pagination from "../../components/common/Pagination";
import { formatDate, formatNumber } from "../../lib/format";

const PAGE_SIZE = 10;

const statusTone = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-red-100 text-red-700",
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
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Chiến dịch</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý các chương trình khuyến mãi và ưu đãi theo cơ sở.</p>
        </div>
        <div className="flex items-center gap-3">
          {garages.length > 0 && (
            <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500">
              {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
            </select>
          )}
          <button onClick={() => garageId && load(garageId)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 p-5 pb-3 text-slate-800">
          <Megaphone size={18} className="text-blue-600" />
          <span className="font-extrabold">Tổng {promos.length} chiến dịch</span>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={22} />Đang tải...</p>
        ) : error ? (
          <div className="p-10 text-center"><AlertTriangle className="mx-auto mb-2 text-red-500" size={24} /><p className="text-sm font-bold text-red-700">{error}</p></div>
        ) : promos.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Chưa có chiến dịch nào cho cơ sở này.</p>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[880px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 pr-3 font-bold">Mã</th>
                    <th className="py-3 pr-3 font-bold">Tên chương trình</th>
                    <th className="py-3 pr-3 font-bold">Ưu đãi</th>
                    <th className="py-3 pr-3 font-bold">Đơn tối thiểu</th>
                    <th className="py-3 pr-3 font-bold">Thời gian</th>
                    <th className="py-3 pr-3 font-bold">Lượt dùng</th>
                    <th className="py-3 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-mono font-bold text-blue-600">{p.code || "–"}</td>
                      <td className="py-3 pr-3 font-semibold text-slate-700">{p.title}</td>
                      <td className="py-3 pr-3 text-slate-700">{discountText(p)}</td>
                      <td className="py-3 pr-3 text-slate-600">{p.minOrderValue ? `${formatNumber(p.minOrderValue)}đ` : "—"}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        {p.startDate || p.endDate ? `${formatDate(p.startDate)} → ${formatDate(p.endDate)}` : "—"}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-slate-700">
                        {p.usedCount ?? 0}{p.usageLimit ? ` / ${formatNumber(p.usageLimit)}` : ""}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusTone[String(p.status).toUpperCase()] || "bg-slate-100 text-slate-600"}`}>
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
    </div>
  );
}
