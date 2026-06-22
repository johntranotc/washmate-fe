import { TierBadge } from "@/components/site/tier-badge";

export function LoyaltyHeroCard({ tier, tierName, nextTierName, availablePoints, pointsToNextTier, progressPercent }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 text-white shadow-2xl">
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-blue-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 size-64 rounded-full bg-purple-500/20 blur-[80px]" />
      <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_320px] lg:items-center z-10">
        {tier && (
          <div className="flex justify-center lg:justify-start">
            <TierBadge tier={tier} size="lg" />
          </div>
        )}
        <div>
          <span className="inline-flex rounded-full bg-white/10 border border-white/20 shadow-inner px-4 py-1.5 text-[12px] font-bold tracking-wide">Hạng {tierName}</span>
          <p className="mt-5 text-sm font-medium text-slate-300">Điểm khả dụng</p>
          <p className="mt-1 text-5xl font-extrabold leading-tight text-white">{availablePoints.toLocaleString("vi-VN")}</p>
          <p className="mt-3 text-xs text-slate-400">Điểm chỉ được backend cập nhật sau các giao dịch hợp lệ.</p>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-200">
            <span>Tiến độ đến hạng {nextTierName || "tiếp theo"}</span>
            <span>{pointsToNextTier.toLocaleString("vi-VN")} điểm nữa</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10 border border-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
