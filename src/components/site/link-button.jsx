import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const sizes = {
  md: "h-10 px-4",
  lg: "h-11 px-5",
  xl: "h-12 px-6",
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-cta hover:-translate-y-0.5 hover:bg-primary-strong",
  secondary:
    "bg-secondary text-primary hover:bg-accent hover:text-accent-foreground",
  outline:
    "border border-border bg-card text-foreground hover:border-primary hover:text-primary",
  ghostWhite:
    "border border-white/30 bg-card/10 text-white backdrop-blur hover:bg-card/20",
  white:
    "bg-card text-primary shadow-cta hover:-translate-y-0.5 hover:bg-card/90",
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
