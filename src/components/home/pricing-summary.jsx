import { SectionHeading } from "@/components/site/section-heading";
import { PlanCard } from "@/components/site/plan-card";
import { LinkButton } from "@/components/site/link-button";
import { plans } from "@/lib/site-data";

export function PricingSummary() {
  return (
    <section className="bg-surface-tint py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Bảng giá tóm tắt"
          title="Chọn gói dịch vụ phù hợp với bạn"
          description="Giá minh bạch, không phát sinh chi phí. Chất lượng dịch vụ luôn được đảm bảo."
        />

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <LinkButton href="/pricing" variant="secondary">
            Xem bảng giá chi tiết
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
