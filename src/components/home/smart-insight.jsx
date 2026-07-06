import { ArrowRight, BarChart3, Clock3, Megaphone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/site/section-heading";

const features = [
  [BarChart3, "Phân tích doanh thu", "Theo dõi doanh thu theo thời gian, dịch vụ, nhân viên và kênh bán."],
  [Clock3, "Phát hiện khung giờ cao điểm", "Nhận diện thời điểm đông khách để phân bổ nhân sự và tối ưu lịch hẹn."],
  [UserRound, "Nhận diện khách VIP lâu chưa quay lại", "Tự động nhận diện và phân loại khách hàng giá trị để chăm sóc kịp thời."],
  [Megaphone, "Gợi ý chiến dịch khuyến mãi", "AI đề xuất ưu đãi phù hợp theo hành vi khách hàng và hiệu quả kỳ trước."],
];

export function SmartInsight() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Quản lý thông minh"
          title={
            <>
              Không chỉ đặt lịch — <span className="text-primary">còn quản lý bằng dữ liệu</span>
            </>
          }
          description="WashMate hỗ trợ chủ garage quản lý toàn diện bằng dữ liệu: phân tích doanh thu, hiểu khách hàng và tối ưu vận hành mỗi ngày."
        />

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-floating">
            <img
              src="/images/home/05_mockups/mockup_ai_dashboard.png"
              alt="Bảng điều khiển AI Insight của WashMate với phân tích doanh thu, khung giờ cao điểm và khách VIP"
              loading="lazy"
              className="w-full object-cover"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(([Icon, title, description]) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <span className="grid size-11 place-items-center rounded-full bg-primary-container text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3.5 font-bold leading-snug">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:justify-end">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary-strong"
          >
            Khám phá AI Insight
            <span className="grid size-8 place-items-center rounded-full bg-primary-container text-primary">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
