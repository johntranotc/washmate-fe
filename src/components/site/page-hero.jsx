import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHero({ eyebrow, title, description, breadcrumb, image }) {
  // Có ảnh nền → phong cách tối full-bleed như trang chủ; không có → nền sáng như cũ.
  if (image) {
    return (
      <section className="relative isolate -mt-19 overflow-hidden bg-[#0b0d12]">
        <div className="mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Cột TRÁI: chữ, nền tối riêng — không bị ảnh che */}
          <div className="relative z-10 flex flex-col justify-center px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:py-32">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/70">
              <Link to="/" className="font-medium transition-colors hover:text-white">
                Trang chủ
              </Link>
              <ChevronRight className="size-4" />
              <span className="font-semibold text-white">{breadcrumb}</span>
            </nav>

            <div className="mt-5 max-w-md">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-primary-bright backdrop-blur">
                  <span className="size-1.5 rounded-full bg-primary-bright" />
                  {eyebrow}
                </span>
              )}
              <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-pretty text-base leading-relaxed text-white/80">{description}</p>
              )}
            </div>
          </div>

          {/* Cột PHẢI: ảnh hiện trọn, không đè lên chữ */}
          <div className="relative min-h-[46vh] lg:min-h-0">
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-contain object-center"
            />
            {/* Mép trái ảnh mờ dần vào nền tối để liền mạch với cột chữ */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(to_right,#0b0d12,transparent)]"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="font-medium transition-colors hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-semibold text-foreground">{breadcrumb}</span>
        </nav>

        <div className="mt-6 max-w-2xl">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm">
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
