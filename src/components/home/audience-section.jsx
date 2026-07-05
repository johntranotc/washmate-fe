import { Building2, UserRound, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const audiences = [
  { icon: UserRound, title: "Khách hàng", text: "Đặt lịch, quản lý xe, thanh toán, xem điểm và đổi thưởng trên một tài khoản." },
  { icon: Wrench, title: "Nhân viên", text: "Check-in, điều hành khoang, cập nhật tiến độ và hoàn tất dịch vụ nhanh chóng." },
  { icon: Building2, title: "Quản trị viên", text: "Quản lý gara, dịch vụ, lịch đặt, hóa đơn, thành viên và báo cáo vận hành." },
];

export function AudienceSection() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Dành cho ai?" title="Một nền tảng, ba không gian chuyên biệt" description="Mỗi vai trò có công cụ phù hợp nhưng vẫn vận hành trên cùng một hệ thống dữ liệu." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {audiences.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-cta">
              <span className="absolute right-5 top-3 text-7xl font-black text-secondary">0{index + 1}</span>
              <span className="relative grid size-14 place-items-center rounded-2xl bg-primary text-white"><Icon className="size-5" /></span>
              <h3 className="relative mt-7 text-2xl font-extrabold">{title}</h3>
              <p className="relative mt-3 leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
