import { Check } from "lucide-react";
import { bookingSteps } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function BookingStepper({ currentStep }) {
  return (
    <ol className="grid grid-cols-3 gap-y-4 rounded-3xl border border-[var(--border-soft)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-6 sm:p-5">
      {bookingSteps.map((label, index) => {
        const step = index + 1;
        const completed = currentStep > step;
        const active = currentStep === step;
        return (
          <li key={label} className="relative flex flex-col items-center text-center">
            {index < bookingSteps.length - 1 && <span className="absolute left-[calc(50%+22px)] top-4 hidden h-0.5 w-[calc(100%-44px)] bg-[var(--border-soft)] sm:block" />}
            <span className={cn("relative z-10 grid size-9 place-items-center rounded-full border-2 text-xs font-extrabold transition", completed && "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white", active && "border-[var(--brand-blue)] bg-white text-[var(--brand-blue)] shadow-[0_0_0_5px_rgba(11,140,255,.12)]", !completed && !active && "border-[var(--border-soft)] bg-[var(--bg-main)] text-[var(--text-muted)]")}>
              {completed ? <Check size={16} strokeWidth={3} /> : step}
            </span>
            <span className={cn("mt-2 text-[11px] font-bold sm:text-xs", active || completed ? "text-[var(--brand-blue)]" : "text-[var(--text-muted)]")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
