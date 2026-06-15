import { TierBadge } from "@/components/site/tier-badge";

export function LoyaltyHeroCard({ tier, tierName, nextTierName, availablePoints, pointsToNextTier, progressPercent }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-brand-dark p-8 text-primary-foreground shadow-lg shadow-primary/20">
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_320px] lg:items-center">
        {tier && (
          <div className="flex justify-center lg:justify-start">
            <TierBadge tier={tier} size="lg" />
          </div>
        )}
        <div>
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">Hạng {tierName}</span>
          <p className="mt-5 text-sm font-medium text-primary-foreground/80">Điểm khả dụng</p>
          <p className="mt-1 text-5xl font-extrabold leading-tight">{availablePoints.toLocaleString("vi-VN")}</p>
          <p className="mt-3 text-xs text-primary-foreground/80">Điểm chỉ được backend cập nhật sau các giao dịch hợp lệ.</p>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span>Tiến độ đến hạng {nextTierName || "tiếp theo"}</span>
            <span>{pointsToNextTier.toLocaleString("vi-VN")} điểm nữa</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
