import { Activity, CalendarDays, CreditCard, Droplet, Gift, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

const floatingItems = [
  { icon: Activity, label: "Đang rửa xe", value: "Hoàn tất 80%" },
  { icon: CalendarDays, label: "Lịch hẹn hôm nay", value: "09:30 - Quận 1" },
  { icon: Gift, label: "Điểm vừa tích lũy", value: "+120 điểm" },
  { icon: CreditCard, label: "Thanh toán", value: "Minh bạch, an toàn" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="absolute -left-24 top-10 size-72 rounded-full bg-accent/45 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            <Sparkles className="size-4" /> Rửa xe thông minh cùng SparkleAI / WashMate
          </span>
          <h1 className="mt-7 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[60px]">
            Rửa xe thông minh, đặt lịch nhanh, <span className="text-primary">chăm sóc xe dễ dàng</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            SparkleAI / WashMate giúp bạn đặt lịch rửa xe, thanh toán, theo dõi tiến độ và tích điểm thành viên trên một nền tảng hiện đại.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/dang-nhap" size="lg">Đặt lịch ngay</LinkButton>
            <LinkButton href="/dich-vu" variant="outline" size="lg">Xem dịch vụ</LinkButton>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary"><Droplet className="size-5" /></span>
            Hơn 12.000 lượt chăm sóc xe được quản lý minh bạch
          </div>
        </div>
        <div className="relative pb-12 sm:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white shadow-[0_40px_80px_-30px_rgba(11,140,255,.5)]">
            <img src="/images/hero-carwash.png" alt="Ô tô đang được rửa bằng bọt và tia nước" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 sm:-left-2 sm:-right-2">
            {floatingItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-white/95 p-3 shadow-xl backdrop-blur">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></span>
                <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-bold text-foreground">{value}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
