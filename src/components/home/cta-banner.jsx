import { CalendarDays, Gift, LayoutGrid } from "lucide-react";
import { LinkButton } from "@/components/site/link-button";

export function CtaBanner() {
  return (
    <section className="bg-surface-tint pb-14 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy to-primary-strong">
          <div className="grid items-stretch gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="px-6 py-10 md:px-12 md:py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-card/10 px-3.5 py-1.5 text-sm font-semibold text-white">
                <Gift className="size-4" />
                Ưu đãi dành cho khách hàng mới
              </span>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-white md:text-4xl">
                Đặt lịch hôm nay, nhận ngay{" "}
                <span className="text-teal">ưu đãi 20%</span> cho lần đầu trải nghiệm
              </h2>
              <p className="mt-4 max-w-lg text-pretty leading-relaxed text-primary-container/80">
                Trải nghiệm dịch vụ chuyên nghiệp với mức giá tốt nhất.
                Nhanh chóng, tiện lợi, xe sạch như mới!
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <LinkButton href="/register" variant="white" size="lg">
                  <CalendarDays className="size-4" />
                  Đặt lịch ngay
                </LinkButton>
                <LinkButton href="/services" variant="ghostWhite" size="lg">
                  <LayoutGrid className="size-4" />
                  Xem dịch vụ
                </LinkButton>
              </div>
            </div>

            <div className="relative hidden min-h-64 lg:block">
              <img
                src="/images/home/06_cta/cta_banner_background.png"
                alt="Xe sạch bóng sau khi sử dụng dịch vụ WashMate"
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary-strong to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
