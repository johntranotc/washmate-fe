import { Check, Clock, Crown, Send, Star } from "lucide-react";
import { LinkButton } from "./link-button";
import { cn } from "@/lib/utils";

const planIcons = {
  "Gói Cơ Bản": Send,
  "Gói Tiêu Chuẩn": Star,
  "Gói Cao Cấp": Crown,
};

export function PlanCard({ plan }) {
  const Icon = planIcons[plan.name] || Star;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl bg-card p-7",
        plan.featured
          ? "border-2 border-primary shadow-cta"
          : "border border-border shadow-card",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
          <Star className="size-3.5 fill-current" />
          {plan.badge}
        </span>
      )}

      <div className="flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
          {plan.tagline && (
            <p className="mt-0.5 text-sm text-muted-foreground">{plan.tagline}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight text-primary">{plan.price}</span>
        <span className="mb-1.5 text-sm font-medium text-muted-foreground">/ lần</span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Clock className="size-4" />
        {plan.duration}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-border pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <LinkButton
        href="/login"
        variant={plan.featured ? "primary" : "outlinePrimary"}
        size="lg"
        className="mt-7 w-full"
      >
        Chọn gói này
      </LinkButton>
    </article>
  );
}
