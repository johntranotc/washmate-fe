import { Gift, RotateCcw } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
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
    <PageContainer variant="customer">
      <PageHeader
        eyebrow="WashMate Rewards"
        title="Điểm thưởng của tôi"
        description="Theo dõi hạng thành viên và toàn bộ biến động điểm."
        actions={
          <>
            <Button size="lg" className="shadow-cta" render={<Link to="/khach-hang/doi-thuong" />}>
              <Gift /> Đổi điểm lấy quà
            </Button>
            <Button variant="outline" size="lg" onClick={loadData} className="text-ink-soft hover:text-foreground">
              <RotateCcw /> Tải lại
            </Button>
          </>
        }
      />


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
    </PageContainer>
  );
}
