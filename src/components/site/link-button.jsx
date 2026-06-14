import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30";

const sizes = {
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-7 py-3.5 text-base",
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] hover:-translate-y-0.5 hover:bg-brand-dark",
  secondary:
    "bg-secondary text-primary hover:bg-accent hover:text-accent-foreground",
  outline:
    "border border-border bg-card text-foreground hover:border-primary hover:text-primary",
  ghostWhite:
    "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  white:
    "bg-white text-primary shadow-lg hover:-translate-y-0.5 hover:bg-white/90",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}) {
  return (
    <Link
      to={href}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </Link>
  );
}
