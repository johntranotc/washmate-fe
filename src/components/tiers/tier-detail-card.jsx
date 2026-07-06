import { Check } from "lucide-react";

export function TierDetailCard({ tier }) {
  return (
    <article className="flex flex-col items-center rounded-3xl border border-border bg-card p-7 text-center shadow-card transition-all hover:-translate-y-1.5 hover:shadow-cta">
      <img
        src={tier.medal}
        alt={`Huy hiệu hạng ${tier.name}`}
        className="size-28 object-contain"
      />
      <h3 className="mt-5 text-2xl font-extrabold" style={{ color: tier.color }}>
        {tier.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{tier.condition}</p>

      <div
        className="mt-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold text-primary-foreground"
        style={{ backgroundColor: tier.color }}
      >
        {tier.discount}
      </div>

      <ul className="mt-6 flex w-full flex-col gap-3 text-left">
        {tier.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
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
