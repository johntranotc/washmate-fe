import { ShieldCheck, UserRound, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const audiences = [
  {
    icon: UserRound,
    title: "Khách hàng",
    text: "Đặt lịch, quản lý xe, thanh toán, xem điểm và đổi thưởng trên một tài khoản.",
    image: "/images/home/05_mockups/mockup_customer_portal.png",
    imageAlt: "Giao diện đặt lịch và điểm thưởng của khách hàng trên WashMate",
  },
  {
    icon: Wrench,
    title: "Nhân viên",
    text: "Check-in, điều hành khoang, cập nhật tiến độ và hoàn tất dịch vụ nhanh chóng.",
    image: "/images/home/05_mockups/mockup_staff_portal.png",
    imageAlt: "Giao diện check-in và theo dõi tiến độ dịch vụ của nhân viên WashMate",
  },
  {
    icon: ShieldCheck,
    title: "Quản trị viên",
    text: "Quản lý gara, dịch vụ, lịch đặt, hóa đơn, thành viên và báo cáo vận hành.",
    image: "/images/home/05_mockups/mockup_admin_dashboard.png",
    imageAlt: "Bảng điều khiển tổng quan doanh thu và lịch đặt của quản trị viên WashMate",
  },
];

export function AudienceSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Dành cho ai?"
          title={
            <>
              Một nền tảng, <span className="text-primary">ba không gian chuyên biệt</span>
            </>
          }
          description="Mỗi vai trò có công cụ phù hợp, nhưng tất cả cùng chạy trên một hệ thống dữ liệu."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {audiences.map(({ icon: Icon, title, text, image, imageAlt }, index) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-white">
                  0{index + 1}
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-primary-container text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-xl font-extrabold">{title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
                <img
                  src={image}
                  alt={imageAlt}
                  loading="lazy"
                  className="w-full object-cover"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
