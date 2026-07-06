import { LayoutGrid } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { LinkButton } from "@/components/site/link-button";
import { services } from "@/lib/site-data";

export function FeaturedServices() {
  return (
    <section className="bg-surface-tint py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Dịch vụ nổi bật"
            title={
              <>
                Đa dạng dịch vụ <span className="text-primary">chăm sóc xe</span>
              </>
            }
            description="Từ rửa xe cơ bản đến chăm sóc chuyên sâu, WashMate đáp ứng mọi nhu cầu của bạn."
          />
          <LinkButton href="/services" variant="outline" className="shrink-0">
            <LayoutGrid className="size-4" />
            Xem tất cả dịch vụ
          </LinkButton>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
