import { Activity, Award, Car, CreditCard, Droplets, MapPin, QrCode } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { steps } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const icons = [Car, Droplets, MapPin, CreditCard, QrCode, Activity, Award];

export function ProcessSteps() {
  return (
    <section id="quy-trinh" className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div className="absolute left-1/2 top-24 size-96 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Quy trình sử dụng" title="Chỉ 7 bước đơn giản để xe luôn sạch bóng" description="Một luồng trải nghiệm xuyên suốt từ chọn dịch vụ đến nhận điểm thành viên." />
        <div className="relative mt-16">
          <div className="absolute left-7 top-0 h-full w-1 rounded-full bg-gradient-to-b from-primary via-primary/40 to-accent lg:left-1/2" />
          <ol className="flex flex-col gap-8">
            {steps.map((step, index) => {
              const Icon = icons[index];
              const left = index % 2 === 0;
              return (
                <li key={step.title} className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
                  <span className="absolute left-7 top-7 z-10 grid size-14 -translate-x-1/2 place-items-center rounded-2xl bg-primary text-white shadow-lg lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2"><Icon className="size-6" /></span>
                  <div className={cn("ml-16 lg:ml-0", left ? "lg:col-start-1 lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16")}>
                    <article className="rounded-3xl border border-border bg-card p-6 shadow-[0_18px_44px_-30px_rgba(16,32,51,.4)] transition hover:-translate-y-1 hover:border-primary/40">
                      <span className="text-sm font-bold text-primary">Bước {index + 1}</span>
                      <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.description}</p>
                    </article>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
