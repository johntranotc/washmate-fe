import { PageHero } from "@/components/site/page-hero";
import { ServiceGrid } from "@/components/services/service-grid";
import { CtaBanner } from "@/components/home/cta-banner";

export default function ServicesPage() {
  return (
    <>
      <PageHero
        breadcrumb="Dịch vụ"
        eyebrow="Dịch vụ chăm sóc xe"
        title="Dịch vụ rửa và chăm sóc xe chuyên nghiệp"
        description="Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn, từ rửa nhanh hằng ngày đến chăm sóc chuyên sâu định kỳ."
      />
      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServiceGrid />
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
