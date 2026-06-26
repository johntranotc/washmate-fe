import { TierBadge } from "@/components/site/tier-badge";
import { tiers } from "@/lib/site-data";

export function TierShowcase() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-white via-surface to-accent/30 p-8 shadow-[0_30px_70px_-40px_rgba(11,140,255,.55)] sm:p-12">
      <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {tiers.map((tier) => (
          <div key={tier.name} className="flex flex-col items-center rounded-3xl border border-white/80 bg-white/75 p-5 text-center shadow-sm backdrop-blur">
            <TierBadge tier={tier} size="md" />
            <strong className="mt-4 text-lg" style={{ color: tier.color }}>{tier.name}</strong>
            <span className="mt-1 text-sm text-muted-foreground">{tier.condition}</span>
            <span className="mt-2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: tier.color }}>{tier.discount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
