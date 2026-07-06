import { BadgePercent, CalendarDays, Clock3, LayoutGrid, RefreshCw, Sparkles, Star } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

const trustItems = [
  [Clock3, "30 giây đặt lịch", "Nhanh chóng, tiện lợi"],
  [RefreshCw, "Theo dõi thời gian thực", "Cập nhật tiến độ tức thì"],
  [Star, "Tích điểm tự động", "Càng dùng càng nhiều ưu đãi"],
  [BadgePercent, "Ưu đãi thành viên", "Nhiều quyền lợi hấp dẫn"],
];

export function Hero() {
  return (
    // -mt-19 = chiều cao header (pt-3 + h-16) để ảnh hero tràn lên sau navbar
    <section className="relative isolate -mt-19 overflow-hidden bg-navy-deep">
      {/* Ảnh nền full-bleed */}
      <picture>
        <source media="(max-width: 640px)" srcSet="/images/home/02_hero/home_hero_mobile.png" />
        <img
          src="/images/home/02_hero/home_hero_desktop.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
      </picture>

      {/* Overlay navy để chữ trắng nổi rõ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-deep/85 via-navy/55 to-navy-deep/90"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-14 pt-32 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-navy/60 px-4 py-2 text-sm font-bold text-primary-bright backdrop-blur">
          <Sparkles className="size-4" />
          Rửa xe thông minh cùng WashMate
        </span>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Rửa xe thông minh, đặt lịch nhanh,{" "}
          <span className="text-primary-bright">chăm sóc xe</span> dễ dàng
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">
          WashMate giúp bạn đặt lịch rửa xe, thanh toán, theo dõi tiến độ và
          tích điểm thành viên trên một nền tảng hiện đại.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3.5 sm:w-auto sm:max-w-none sm:flex-row">
          <LinkButton href="/register" size="xl">
            <CalendarDays className="size-4.5" />
            Đặt lịch ngay
          </LinkButton>
          <LinkButton href="/services" variant="ghostWhite" size="xl">
            <LayoutGrid className="size-4.5" />
            Xem dịch vụ
          </LinkButton>
        </div>

        {/* Trust bar trắng nổi trên đáy hero */}
        <div className="mt-14 grid w-full grid-cols-1 gap-y-5 rounded-2xl bg-card px-6 py-6 text-left shadow-floating sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:divide-x lg:divide-border lg:gap-y-0">
          {trustItems.map(([Icon, title, sub]) => (
            <div key={title} className="flex items-center gap-4 lg:justify-center lg:px-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
