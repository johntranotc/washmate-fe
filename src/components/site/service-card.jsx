import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, showBook = false }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_44px_-26px_rgba(16,32,51,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(11,140,255,0.45)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[13px] font-bold text-primary shadow-sm backdrop-blur">
          {service.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
          {service.description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-foreground">
              {service.price}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              {service.duration}
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-[13px] font-semibold text-accent-foreground">
            {service.category}
          </span>
        </div>
        <div
          className={cn(
            "mt-5 flex gap-2.5",
            showBook ? "flex-col sm:flex-row" : "",
          )}
        >
          <Link
            to="/login"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-[14px] font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Xem chi tiết
            <ArrowRight className="size-4" />
          </Link>
          {showBook && (
            <Link
              to="/login"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-foreground transition-colors hover:bg-brand-dark"
            >
              Đặt lịch
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
