import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHero({ eyebrow, title, description, breadcrumb }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="font-medium transition-colors hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-semibold text-foreground">{breadcrumb}</span>
        </nav>

        <div className="mt-6 max-w-2xl">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-semibold text-primary shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
