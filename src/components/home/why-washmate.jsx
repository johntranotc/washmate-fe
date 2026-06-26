import { Activity, BadgePercent, CalendarClock, MapPin, Receipt, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const benefits = [
  [CalendarClock, "Đặt lịch nhanh chóng", "Đặt lịch chăm sóc xe mọi lúc chỉ với vài thao tác."],
  [MapPin, "Chọn gara và khung giờ phù hợp", "Tìm địa điểm gần bạn và thời gian thuận tiện nhất."],
  [Activity, "Theo dõi tiến độ theo thời gian thực", "Biết chính xác xe đang ở bước nào trong quy trình."],
  [Receipt, "Thanh toán và hóa đơn minh bạch", "Chi phí rõ ràng, dễ thanh toán và tra cứu."],
  [Sparkles, "Tích điểm tự động", "Điểm thành viên được cộng sau mỗi dịch vụ hoàn tất."],
  [BadgePercent, "Nhận ưu đãi thông minh", "Ưu đãi phù hợp với hạng và thói quen chăm sóc xe."],
];

export function WhyWashMate() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Vì sao chọn WashMate?" title="Một trải nghiệm chăm sóc xe liền mạch" description="Từ đặt lịch đến nhận xe, mọi bước đều nhanh chóng, rõ ràng và dễ kiểm soát." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(([Icon, title, description]) => (
            <article key={title} className="group rounded-3xl border border-border bg-card p-7 shadow-[0_18px_44px_-30px_rgba(16,32,51,.4)] transition hover:-translate-y-1 hover:border-primary/40">
              <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-white"><Icon className="size-7" /></span>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
