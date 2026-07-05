import { Check } from "lucide-react";
import { bookingSteps } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function BookingStepper({ currentStep }) {
  return (
    <ol className="grid grid-cols-3 gap-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-6 sm:p-5">
      {bookingSteps.map((label, index) => {
        const step = index + 1;
        const completed = currentStep > step;
        const active = currentStep === step;
        return (
          <li key={label} className="relative flex flex-col items-center text-center">
            {index < bookingSteps.length - 1 && <span className="absolute left-[calc(50%+22px)] top-4 hidden h-0.5 w-[calc(100%-44px)] bg-border sm:block" />}
            <span className={cn("relative z-10 grid size-9 place-items-center rounded-full border-2 text-xs font-extrabold transition", completed && "border-primary bg-primary text-primary-foreground", active && "border-primary bg-card text-primary ring-4 ring-primary/10", !completed && !active && "border-border bg-muted text-muted-foreground")}>
              {completed ? <Check size={16} strokeWidth={3} /> : step}
            </span>
            <span className={cn("mt-2 text-xs font-bold sm:text-xs", active || completed ? "text-primary" : "text-muted-foreground")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
