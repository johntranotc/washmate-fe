import { Card } from "@/components/ui/card";
import { TierBadge } from "@/components/site/tier-badge";

export function TierLevelGrid({ tiers, currentTierName }) {
  return (
    <section>
      <h2 className="text-lg font-extrabold text-foreground">Các hạng thành viên</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiers.map((tier) => {
          const isCurrent = tier.name === currentTierName;
          return (
            <Card
              key={tier.name}
              className={`flex flex-col items-center rounded-2xl border p-5 text-center ${isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <TierBadge tier={tier} size="sm" />
              {isCurrent && (
                <span className="mt-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">
                  Hạng hiện tại
                </span>
              )}
              <h3 className="mt-3 text-lg font-extrabold" style={{ color: tier.color }}>{tier.name}</h3>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{tier.condition}</p>
              <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold text-primary-foreground" style={{ backgroundColor: tier.color }}>
                {tier.discount}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
