import { Check, Clock, Star } from "lucide-react";
import { LinkButton } from "./link-button";
import { cn } from "@/lib/utils";

export function PlanCard({ plan }) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-3xl border p-7 transition-all",
        plan.featured
          ? "border-primary bg-primary text-primary-foreground shadow-[0_30px_60px_-24px_rgba(11,140,255,0.6)] lg:-translate-y-4"
          : "border-border bg-card text-foreground shadow-[0_18px_44px_-26px_rgba(16,32,51,0.3)]",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[13px] font-bold text-[#5a4500] shadow-md">
          <Star className="size-3.5 fill-current" />
          {plan.badge}
        </span>
      )}
      <h3
        className={cn(
          "text-xl font-bold",
          plan.featured ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {plan.name}
      </h3>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight">
          {plan.price}
        </span>
        <span
          className={cn(
            "mb-1.5 text-sm font-medium",
            plan.featured ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          / lần
        </span>
      </div>
      <p
        className={cn(
          "mt-2 flex items-center gap-1.5 text-[14px] font-medium",
          plan.featured ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        <Clock className="size-4" />
        Thời gian dự kiến {plan.duration}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px]">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                plan.featured
                  ? "bg-white/20 text-primary-foreground"
                  : "bg-secondary text-primary",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span
              className={
                plan.featured
                  ? "text-primary-foreground/95"
                  : "text-foreground/90"
              }
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      <LinkButton
        href="/register"
        variant={plan.featured ? "white" : "primary"}
        size="lg"
        className="mt-7 w-full"
      >
        Chọn gói này
      </LinkButton>
    </article>
  );
}
