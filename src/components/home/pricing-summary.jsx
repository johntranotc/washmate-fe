import { SectionHeading } from "@/components/site/section-heading";
import { PlanCard } from "@/components/site/plan-card";
import { LinkButton } from "@/components/site/link-button";
import { plans } from "@/lib/site-data";

export function PricingSummary() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Bảng giá tóm tắt"
          title="Chọn gói dịch vụ phù hợp với bạn"
          description="Mức giá minh bạch, rõ ràng cho từng nhu cầu chăm sóc xe của bạn."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-center">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <LinkButton href="/pricing" variant="secondary">
            Xem bảng giá chi tiết
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
