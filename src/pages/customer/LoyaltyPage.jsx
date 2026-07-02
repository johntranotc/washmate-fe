import { Award, Crown, History, RotateCcw, Sparkles, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { loyaltyApi } from "../../api/loyaltyApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import {
  normalizeLoyalty,
  normalizeTransactions,
  tierLabels,
} from "../../lib/customer-engagement-data";
const transactionLabels = {
  EARN: "Tích điểm",
  REDEEM: "Đổi thưởng",
  ADJUSTMENT: "Điều chỉnh",
  ROLLBACK: "Hoàn điểm",
};

export default function LoyaltyPage() {
  const [account, setAccount] = useState({});
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const accountResponse = await loyaltyApi.getMyLoyalty();
      const normalizedAccount = normalizeLoyalty(accountResponse);
      const transactionResponse = normalizedAccount.id
        ? await loyaltyApi.getLoyaltyTransactions(normalizedAccount.id)
        : [];
      setAccount(normalizedAccount);
      setTransactions(normalizeTransactions(transactionResponse));
      
    } catch {
      setAccount({});
      setTransactions([]);
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentTierName = account.tierName || tierLabels[account.tier] || account.tier;
  const nextTierName = account.nextTierName || tierLabels[account.nextTier] || account.nextTier;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">WashMate Rewards</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Điểm thưởng của tôi</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi hạng thành viên và toàn bộ biến động điểm.</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700">
          <RotateCcw size={15} /> Tải lại
        </button>
      </header>

      

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-400 p-7 text-white shadow-lg shadow-blue-200/60">
        <Sparkles className="absolute -right-4 -top-4 opacity-20" size={150} />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">Hạng {currentTierName}</span>
            <p className="mt-5 text-sm text-blue-100">Điểm khả dụng</p>
            <p className="mt-1 text-5xl font-black">{account.availablePoints.toLocaleString("vi-VN")}</p>
            <p className="mt-3 text-xs text-blue-100">Điểm chỉ được backend cập nhật sau các giao dịch hợp lệ.</p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold">
              <span>Tiến độ đến hạng {nextTierName || "tiếp theo"}</span>
              <span>{account.pointsToNextTier.toLocaleString("vi-VN")} điểm nữa</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(account.progressPercent, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [WalletCards, "Điểm khả dụng", account.availablePoints],
          [Sparkles, "Tổng điểm đã tích", account.totalEarnedPoints],
          [Crown, "Điểm đã sử dụng", account.totalRedeemedPoints],
        ].map(([Icon, label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Icon className="text-blue-600" size={20} />
            <p className="mt-4 text-xs text-slate-500">{label}</p>
            <strong className="mt-1 block text-2xl text-slate-950">{Number(value).toLocaleString("vi-VN")}</strong>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-slate-950">Các hạng thành viên</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[].map((tier) => (
            <article key={tier.code} className={`rounded-2xl border bg-white p-5 ${account.tier === tier.code ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <Award className={account.tier === tier.code ? "text-blue-600" : "text-slate-400"} size={22} />
                {account.tier === tier.code && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">Hiện tại</span>}
              </div>
              <h3 className="mt-4 font-extrabold">{tier.name}</h3>
              <p className="mt-1 text-xs font-semibold text-blue-600">Từ {tier.minimumPoints.toLocaleString("vi-VN")} điểm</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{tier.benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><History className="text-blue-600" size={20} /><h2 className="font-extrabold">Lịch sử điểm</h2></div>
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Đang tải lịch sử điểm...</p>
        ) : transactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Chưa có giao dịch điểm nào.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {transactions.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Sparkles size={16} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-sm">{item.description}</b>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">{transactionLabels[item.type] || item.type}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <strong className={item.points >= 0 ? "text-emerald-600" : "text-rose-600"}>{item.points > 0 ? "+" : ""}{item.points.toLocaleString("vi-VN")}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
