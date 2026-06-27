import { Crown, Sparkles, WalletCards } from "lucide-react";
import { StatCard } from "@/components/customer-portal/stats-grid";

export function LoyaltyStatsGrid({ account = {} }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={<WalletCards size={32} />}
        value={Number(account?.availablePoints || 0).toLocaleString("vi-VN")}
        label="Điểm khả dụng"
        description="Có thể dùng để đổi quà ngay"
        variant="blue"
      />
      <StatCard
        icon={<Sparkles size={32} />}
        value={Number(account?.totalEarnedPoints || 0).toLocaleString("vi-VN")}
        label="Tổng điểm đã tích"
        description="Tích lũy từ trước đến nay"
        variant="teal"
      />
      <StatCard
        icon={<Crown size={32} />}
        value={Number(account?.totalRedeemedPoints || 0).toLocaleString("vi-VN")}
        label="Điểm đã sử dụng"
        description="Đã đổi thành ưu đãi, quà tặng"
        variant="gold"
      />
    </section>
  );
}
