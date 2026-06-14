import { cn } from "@/lib/utils";

export function TierBadge({ tier, size = "md" }) {
  const dimensions = {
    sm: "size-20",
    md: "size-28",
    lg: "size-36",
  };
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-b ring-1 ring-white/10",
        dimensions[size],
        tier.pedestal,
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
      <img
        src={tier.badge || "/placeholder.svg"}
        alt={`Huy hiệu hạng ${tier.name}`}
        className="relative drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
