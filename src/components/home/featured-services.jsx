import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { LinkButton } from "@/components/site/link-button";
import { services } from "@/lib/site-data";

export function FeaturedServices() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Dịch vụ nổi bật"
            title="Đa dạng dịch vụ chăm sóc xe"
            description="Từ rửa nhanh đến chăm sóc chuyên sâu, luôn có gói dịch vụ phù hợp với nhu cầu của bạn."
          />
          <LinkButton href="/services" variant="outline" className="shrink-0">
            Xem tất cả dịch vụ
          </LinkButton>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
