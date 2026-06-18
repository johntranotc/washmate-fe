import { Gift, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loyaltyApi } from "@/api/loyaltyApi";
import { Button } from "@/components/ui/button";
import DemoDataNotice from "@/components/customer/DemoDataNotice";
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
import {
  loyaltyMockAccount,
  loyaltyTransactionMockData,
} from "@/mocks/loyaltyMockData";

export default function MembershipPointsPage() {
  const [account, setAccount] = useState(loyaltyMockAccount);
  const [transactions, setTransactions] = useState([]);
  const [isMock, setIsMock] = useState(false);
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
      setIsMock(false);
    } catch {
      setAccount(loyaltyMockAccount);
      setTransactions(loyaltyTransactionMockData);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentTierName = account.tierName || tierLabels[account.tier] || account.tier;
  const nextTierName = account.nextTierName || tierLabels[account.nextTier] || account.nextTier;
  const currentBadgeName = tierCodeToBadgeName[account.tier] || currentTierName;
  const currentTier = membershipTiers.find((tier) => tier.name === currentBadgeName);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">WashMate Rewards</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-foreground">Điểm thưởng của tôi</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Theo dõi hạng thành viên và toàn bộ biến động điểm.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
            <Link to="/khach-hang/doi-thuong"><Gift size={15} /> Đổi điểm lấy quà</Link>
          </Button>
          <Button variant="outline" onClick={loadData} className="rounded-xl border-border font-bold text-foreground">
            <RotateCcw size={15} /> Tải lại
          </Button>
        </div>
      </header>

      {isMock && <DemoDataNotice />}

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
