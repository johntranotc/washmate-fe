import { tiers } from "@/lib/site-data";

export function TierShowcase() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {tiers.map((tier) => (
          <div key={tier.name} className="flex flex-col items-center rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
            <img
              src={tier.medal}
              alt={`Huy hiệu hạng ${tier.name}`}
              className="size-24 object-contain"
            />
            <strong className="mt-4 text-lg" style={{ color: tier.color }}>{tier.name}</strong>
            <span className="mt-1 text-sm text-muted-foreground">{tier.condition}</span>
            <span className="mt-2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: tier.color }}>{tier.discount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
