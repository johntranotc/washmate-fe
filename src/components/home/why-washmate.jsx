import {
  Activity,
  BadgePercent,
  CalendarClock,
  CalendarDays,
  MapPin,
  Receipt,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const stats = [
  [Users, "2.500+", "Khách hàng hài lòng", "Đã tin tưởng và trải nghiệm dịch vụ WashMate"],
  [CalendarDays, "128", "Lịch hẹn / ngày", "Tối ưu vận hành, phục vụ nhanh chóng"],
  [UserCheck, "68%", "Khách quay lại", "Tin tưởng chất lượng, tiếp tục đồng hành"],
  [Star, "4.9/5", "Đánh giá trung bình", "Từ hàng nghìn đánh giá trên nền tảng"],
];

const benefits = [
  [CalendarClock, "Đặt lịch nhanh chóng", "Đặt lịch chăm sóc xe mọi lúc chỉ với vài thao tác."],
  [MapPin, "Chọn gara và khung giờ phù hợp", "Tìm địa điểm gần bạn và thời gian thuận tiện nhất."],
  [Activity, "Theo dõi tiến độ theo thời gian thực", "Biết chính xác xe đang ở bước nào trong quy trình."],
  [Receipt, "Thanh toán và hóa đơn minh bạch", "Chi phí rõ ràng, dễ thanh toán và tra cứu."],
  [Star, "Tích điểm tự động", "Điểm thành viên được cộng sau mỗi dịch vụ hoàn tất."],
  [BadgePercent, "Nhận ưu đãi thông minh", "Ưu đãi phù hợp với hạng và thói quen chăm sóc xe."],
];

export function WhyWashMate() {
  return (
    <>
      {/* Trust stats — section 02 */}
      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Tin cậy & hiệu quả"
            title={
              <>
                WashMate tạo khác biệt bằng <span className="text-primary">hiệu quả thực tế</span>
              </>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {stats.map(([Icon, value, label, sub]) => (
              <article
                key={label}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-card"
              >
                <span className="grid size-12 place-items-center rounded-full bg-primary-container text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-primary">{value}</p>
                <p className="mt-1 font-bold text-foreground">{label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{sub}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — section 03 */}
      <section className="bg-surface-tint py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Vì sao chọn WashMate?"
            title={
              <>
                Một trải nghiệm <span className="text-primary">chăm sóc xe</span> liền mạch
              </>
            }
            description="Từ đặt lịch, thực hiện đến thanh toán và nhận ưu đãi — mọi thứ đều nhanh chóng, minh bạch và trong tầm kiểm soát."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(([Icon, title, description]) => (
              <article
                key={title}
                className="flex items-start gap-4 rounded-2xl bg-card p-6 shadow-card transition hover:-translate-y-0.5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-snug">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
