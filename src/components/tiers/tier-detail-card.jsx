import { Check } from "lucide-react";
import { TierBadge } from "@/components/site/tier-badge";

export function TierDetailCard({ tier }) {
  return (
    <article className="flex flex-col items-center rounded-3xl border border-border bg-card p-7 text-center shadow-[0_18px_44px_-30px_rgba(16,32,51,0.4)] transition-all hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(11,140,255,0.4)]">
      <TierBadge tier={tier} size="md" />
      <h3 className="mt-5 text-2xl font-extrabold" style={{ color: tier.color }}>
        {tier.name}
      </h3>
      <p className="mt-1 text-[14px] font-medium text-muted-foreground">{tier.condition}</p>

      <div
        className="mt-4 inline-flex items-center rounded-full px-4 py-1.5 text-[14px] font-bold text-primary-foreground"
        style={{ backgroundColor: tier.color }}
      >
        {tier.discount}
      </div>

      <ul className="mt-6 flex w-full flex-col gap-3 text-left">
        {tier.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </article>
  );
}
