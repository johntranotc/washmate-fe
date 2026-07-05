import { Sparkles } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-carwash-full.png"
          alt="Nhân viên đang chăm sóc xe tại gara WashMate"
          className="h-full w-full object-cover object-center"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
          <Sparkles className="size-4 text-primary" />
          Rửa xe thông minh cùng WashMate
        </span>

        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Rửa xe thông minh, đặt lịch nhanh,{" "}
          <span className="text-primary">chăm sóc xe</span> dễ dàng
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-muted">
          WashMate giúp bạn đặt lịch rửa xe, thanh toán, theo dõi
          tiến độ và tích điểm thành viên trên một nền tảng hiện đại.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col justify-center gap-4 sm:max-w-none sm:flex-row">
          <LinkButton href="/register" size="lg" className="border-none bg-primary text-white hover:bg-primary-strong">
            Đặt lịch ngay
          </LinkButton>
          <LinkButton href="/services" variant="outline" size="lg" className="border-white/30 bg-black/30 text-white backdrop-blur-sm hover:bg-card/20 hover:text-white">
            Xem dịch vụ
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
