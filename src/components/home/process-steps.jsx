import { Activity, CalendarClock, Car, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { steps } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const icons = [Car, CalendarClock, QrCode, Activity, Wallet];

export function ProcessSteps() {
  return (
    <section id="quy-trinh" className="scroll-mt-24 bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Quy trình sử dụng"
          title={
            <>
              Chỉ 5 bước đơn giản để xe luôn <span className="text-primary">sạch bóng</span>
            </>
          }
          description="Một luồng trải nghiệm xuyên suốt từ chọn dịch vụ đến nhận điểm thành viên."
        />
        <div className="relative mt-12">
          <div className="absolute left-6 top-2 h-[calc(100%-1rem)] w-px bg-border lg:left-1/2" />
          <ol className="flex flex-col gap-6">
            {steps.map((step, index) => {
              const Icon = icons[index];
              const left = index % 2 === 0;
              return (
                <li key={step.title} className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
                  <span className="absolute left-6 top-6 z-10 grid size-12 -translate-x-1/2 place-items-center rounded-full border-4 border-background bg-primary text-white lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2">
                    <Icon className="size-5" />
                  </span>
                  <div className={cn("ml-14 lg:ml-0", left ? "lg:col-start-1 lg:pr-14" : "lg:col-start-2 lg:pl-14")}>
                    <article className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-bold text-primary">Bước {index + 1}</span>
                        <span className="text-2xl font-extrabold text-primary-container">0{index + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </article>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1.5 text-center">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="size-4.5 text-primary" />
            An toàn — Nhanh chóng — Minh bạch
          </p>
          <p className="text-sm text-muted-foreground">
            WashMate đồng hành cùng bạn trong từng hành trình chăm sóc xe.
          </p>
        </div>
      </div>
    </section>
  );
}
