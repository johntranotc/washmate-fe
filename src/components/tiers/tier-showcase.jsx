import { TierBadge } from "@/components/site/tier-badge";
import { tiers } from "@/lib/site-data";

export function TierShowcase() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-[#0c1b2e] to-[#060d16] p-8 shadow-[0_30px_70px_-30px_rgba(11,140,255,0.6)] sm:p-12">
      <div className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-center gap-x-8 gap-y-10 sm:gap-x-12">
        {tiers.map((tier, i) => (
          <div key={tier.name} className="flex flex-col items-center gap-3">
            <TierBadge tier={tier} size={i === tiers.length - 1 ? "lg" : "md"} />
            <span className="text-lg font-extrabold tracking-wide" style={{ color: tier.color }}>
              {tier.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
