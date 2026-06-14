import { PageHero } from "@/components/site/page-hero";
import { PlanCard } from "@/components/site/plan-card";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { CtaBanner } from "@/components/home/cta-banner";
import { plans } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <>
      <PageHero
        breadcrumb="Bảng giá"
        eyebrow="Bảng giá minh bạch"
        title="Chọn gói dịch vụ phù hợp với bạn"
        description="Mức giá rõ ràng, không phát sinh. Càng sử dụng nhiều, bạn càng tích lũy điểm và mở khóa nhiều ưu đãi hấp dẫn."
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              So sánh chi tiết các gói
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
              Xem rõ từng quyền lợi đi kèm để chọn gói phù hợp nhất với chiếc xe của bạn.
            </p>
          </div>
          <ComparisonTable />
        </div>
      </section>

      <PricingFaq />
      <CtaBanner />
    </>
  );
}
