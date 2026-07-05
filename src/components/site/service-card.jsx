import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, showBook = false }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-cta">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-sm font-bold text-primary shadow-sm backdrop-blur">
          {service.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
        <p className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
          {service.description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-foreground">
              {service.price}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              {service.duration}
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
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
            to={`/dich-vu#${service.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Xem chi tiết
            <ArrowRight className="size-4" />
          </Link>
          {showBook && (
            <Link
              to="/dang-nhap"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong"
            >
              Đặt lịch
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
