import { Sparkles, Clock, Activity, Gift, ShieldCheck, Droplet } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

const badges = [
  { icon: Clock, label: "Đặt lịch trong 1 phút" },
  { icon: Activity, label: "Theo dõi trạng thái trực tiếp" },
  { icon: Gift, label: "Tích điểm sau mỗi lần rửa" },
  { icon: ShieldCheck, label: "Thanh toán minh bạch" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-accent/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-24 lg:px-8">
        <div className="flex flex-col gap-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[14px] font-semibold text-primary shadow-sm">
            <Sparkles className="size-4" />
            Rửa xe thông minh cùng SparkleAI / WashMate
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[60px]">
            Rửa xe thông minh, đặt lịch nhanh,{" "}
            <span className="text-primary">chăm sóc xe</span> dễ dàng
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            SparkleAI / WashMate giúp bạn đặt lịch rửa xe, thanh toán, theo dõi
            tiến độ và tích điểm thành viên trên một nền tảng hiện đại.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/register" size="lg">
              Đặt lịch ngay
            </LinkButton>
            <LinkButton href="/services" variant="outline" size="lg">
              Xem dịch vụ
            </LinkButton>
          </div>

          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {badges.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                  <b.icon className="size-4.5" />
                </span>
                <span className="text-[14px] font-semibold text-foreground">
                  {b.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[0_40px_80px_-30px_rgba(11,140,255,0.5)]">
            <img
              src="/images/hero-carwash.png"
              alt="Ô tô đang được rửa với bọt và tia nước tại gara hiện đại"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute -left-4 top-10 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:flex">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Droplet className="size-5" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Đang rửa xe
              </p>
              <p className="text-[15px] font-bold text-foreground">
                Hoàn tất 80%
              </p>
            </div>
          </div>

          <div className="absolute -bottom-5 right-2 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:flex">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold/20 text-[#a87b00]">
              <Gift className="size-5" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Điểm thưởng
              </p>
              <p className="text-[15px] font-bold text-foreground">
                +120 điểm
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
