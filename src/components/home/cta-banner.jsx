import { LinkButton } from "@/components/site/link-button";

export function CtaBanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground md:px-14 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-balance text-3xl font-extrabold leading-tight md:text-4xl">
                Đặt lịch hôm nay, nhận ngay ưu đãi 20% cho lần đầu trải nghiệm
              </h2>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-primary-foreground/80">
                Chỉ mất 30 giây để đặt lịch. Đội ngũ SparkleAI sẽ chăm sóc chiếc xe của bạn như chính chiếc xe của
                chúng tôi.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/register" variant="white" size="lg">
                  Đặt lịch ngay
                </LinkButton>
                <LinkButton href="/services" variant="ghostWhite" size="lg">
                  Xem dịch vụ
                </LinkButton>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/20">
              <img
                src="/images/cta-carwash.png"
                alt="Xe sạch bóng sau khi sử dụng dịch vụ SparkleAI"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
