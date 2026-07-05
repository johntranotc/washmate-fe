import { TierBadge } from "@/components/site/tier-badge";

export function LoyaltyHeroCard({ tier, tierName = "Đồng", nextTierName = "Bạc", availablePoints = 0, pointsToNextTier = 0, progressPercent = 0 }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-foreground/60 border border-white/10 p-8 text-white shadow-floating">
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-primary/20 blur-[80px]" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-64 rounded-full bg-accent-violet/20 blur-[80px]" />
      <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_320px] lg:items-center z-10">
        {tier && (
          <div className="flex justify-center lg:justify-start">
            <TierBadge tier={tier} size="lg" />
          </div>
        )}
        <div>
          <span className="inline-flex rounded-full bg-card/10 border border-white/20 px-4 py-1.5 text-xs font-bold tracking-wide">Hạng {tierName}</span>
          <p className="mt-5 text-sm font-medium text-neutral-muted">Điểm khả dụng</p>
          <p className="mt-1 text-5xl font-extrabold leading-tight text-white">{Number(availablePoints || 0).toLocaleString("vi-VN")}</p>
          <p className="mt-3 text-xs text-neutral-muted">Điểm chỉ được backend cập nhật sau các giao dịch hợp lệ.</p>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-border">
            <span>Tiến độ đến hạng {nextTierName || "tiếp theo"}</span>
            <span>{Number(pointsToNextTier || 0).toLocaleString("vi-VN")} điểm nữa</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-card/10 border border-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent-indigo shadow-cta" style={{ width: `${Math.min(progressPercent || 0, 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
