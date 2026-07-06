import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-sm font-semibold text-primary",
            align === "center" && "mx-auto",
          )}
        >
          <Sparkles className="size-4" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
