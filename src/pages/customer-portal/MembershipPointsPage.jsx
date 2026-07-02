import { Gift, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loyaltyApi } from "@/api/loyaltyApi";
import { Button } from "@/components/ui/button";

import { LoyaltyHeroCard } from "@/components/customer/loyalty/LoyaltyHeroCard";
import { LoyaltyStatsGrid } from "@/components/customer/loyalty/LoyaltyStatsGrid";
import { TierLevelGrid } from "@/components/customer/loyalty/TierLevelGrid";
import { PointsHistoryList } from "@/components/customer/loyalty/PointsHistoryList";
import { tiers as membershipTiers } from "@/lib/site-data";
import {
  normalizeLoyalty,
  normalizeTransactions,
  tierLabels,
  tierCodeToBadgeName,
} from "@/lib/customer-engagement-data";


export default function MembershipPointsPage() {
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
      setAccount(normalizedAccount || {});
      setTransactions(normalizeTransactions(transactionResponse) || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu điểm:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentTierName = account.tierName || tierLabels[account.tier] || account.tier || "Đồng";
  const nextTierName = account.nextTierName || tierLabels[account.nextTier] || account.nextTier || "Bạc";
  const currentBadgeName = tierCodeToBadgeName[account.tier] || currentTierName;
  const currentTier = membershipTiers.find((tier) => tier.name.toLowerCase() === currentBadgeName?.toLowerCase()) || membershipTiers[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white border border-white/50 p-6 sm:p-8 rounded-2xl shadow-sm mb-6">
        <div>
          <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-3">WashMate Rewards</span>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">Điểm thưởng của tôi</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Theo dõi hạng thành viên và toàn bộ biến động điểm.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-blue-500/50 transition-all duration-300 border-0">
            <Link to="/khach-hang/doi-thuong" className="flex items-center gap-2 px-6">
              <Gift size={18} /> Đổi điểm lấy quà
            </Link>
          </Button>
          <Button variant="outline" onClick={loadData} className="h-11 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-300 flex items-center gap-2 px-5">
            <RotateCcw size={18} /> Tải lại
          </Button>
        </div>
      </header>


      <LoyaltyHeroCard
        tier={currentTier}
        tierName={currentTierName}
        nextTierName={nextTierName}
        availablePoints={account.availablePoints}
        pointsToNextTier={account.pointsToNextTier}
        progressPercent={account.progressPercent}
      />

      <LoyaltyStatsGrid account={account} />

      <TierLevelGrid tiers={membershipTiers} currentTierName={currentBadgeName} />

      <PointsHistoryList transactions={transactions} loading={loading} />
    </div>
  );
}
