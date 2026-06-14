import { Gift, TrendingUp, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { TierShowcase } from "@/components/tiers/tier-showcase";
import { TierDetailCard } from "@/components/tiers/tier-detail-card";
import { CtaBanner } from "@/components/home/cta-banner";
import { tiers } from "@/lib/site-data";

const howItWorks = [
  {
    icon: Sparkles,
    title: "Sử dụng dịch vụ",
    description: "Mỗi lần rửa xe hoặc chăm sóc xe đều được cộng điểm thành viên tự động.",
  },
  {
    icon: TrendingUp,
    title: "Tích lũy & nâng hạng",
    description: "Điểm tích lũy giúp bạn thăng hạng và mở khóa quyền lợi cao hơn.",
  },
  {
    icon: Gift,
    title: "Nhận đặc quyền",
    description: "Hưởng ưu đãi giảm giá, quà tặng và dịch vụ ưu tiên theo từng hạng.",
  },
];

export default function TiersPage() {
  return (
    <>
      <PageHero
        breadcrumb="Hạng thành viên"
        eyebrow="Chương trình thành viên"
        title="Tích điểm, thăng hạng, nhận đặc quyền"
        description="Năm hạng thành viên với hệ thống huy hiệu đồng bộ và quyền lợi tăng dần. Càng gắn bó, bạn càng được chăm sóc đặc biệt hơn."
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TierShowcase />
        </div>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cách thức hoạt động"
            title="Chỉ 3 bước để nhận đặc quyền"
            description="Hệ thống thành viên hoạt động hoàn toàn tự động, bạn chỉ cần tận hưởng dịch vụ."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {howItWorks.map((item, i) => (
              <article
                key={item.title}
                className="relative rounded-3xl border border-border bg-card p-7 shadow-[0_18px_44px_-30px_rgba(16,32,51,0.4)]"
              >
                <span className="absolute right-6 top-6 text-5xl font-extrabold text-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <item.icon className="size-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Chi tiết các hạng"
            title="Quyền lợi từng hạng thành viên"
            description="Mỗi hạng kế thừa toàn bộ quyền lợi của hạng thấp hơn và bổ sung thêm nhiều đặc quyền mới."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiers.map((tier) => (
              <TierDetailCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
