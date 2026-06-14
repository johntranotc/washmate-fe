import {
  CalendarClock,
  MapPin,
  Activity,
  Receipt,
  Sparkles,
  BadgePercent,
} from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const benefits = [
  {
    icon: CalendarClock,
    title: "Đặt lịch nhanh chóng",
    description: "Chỉ vài thao tác để đặt lịch rửa xe mọi lúc, mọi nơi.",
  },
  {
    icon: MapPin,
    title: "Chọn gara và khung giờ phù hợp",
    description: "Tìm gara gần bạn và chọn khung giờ thuận tiện nhất.",
  },
  {
    icon: Activity,
    title: "Theo dõi tiến độ theo thời gian thực",
    description: "Biết chính xác xe của bạn đang ở bước nào.",
  },
  {
    icon: Receipt,
    title: "Thanh toán và hóa đơn minh bạch",
    description: "Mọi khoản chi phí đều rõ ràng và dễ tra cứu.",
  },
  {
    icon: Sparkles,
    title: "Tích điểm tự động",
    description: "Mỗi lần rửa xe đều được cộng điểm thành viên.",
  },
  {
    icon: BadgePercent,
    title: "Nhận ưu đãi thông minh",
    description: "Ưu đãi cá nhân hóa theo hạng và thói quen của bạn.",
  },
];

export function WhyWashMate() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Vì sao chọn WashMate?"
          title="Trải nghiệm rửa xe thông minh và liền mạch"
          description="Tất cả những gì bạn cần để chăm sóc xe được gói gọn trong một nền tảng hiện đại, minh bạch và dễ sử dụng."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group rounded-3xl border border-border bg-card p-7 shadow-[0_18px_44px_-30px_rgba(16,32,51,0.4)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_28px_56px_-30px_rgba(11,140,255,0.45)]"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <b.icon className="size-7" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-foreground">
                {b.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                {b.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
