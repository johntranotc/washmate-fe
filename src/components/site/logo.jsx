import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { STAFF_ASSETS } from "@/lib/staff-assets";

export function Logo({ className, variant = "default" }) {
  const light = variant === "light";
  return (
    <Link to="/" className={cn("group flex shrink-0 items-center gap-2.5", className)} aria-label="WashMate - Trang chủ">
      <img src={STAFF_ASSETS.logo.mark} alt="" className="size-10 shrink-0 transition group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span className={cn("whitespace-nowrap text-lg font-extrabold tracking-tight", light ? "text-white" : "text-foreground")}>WashMate</span>
        <span className={cn("whitespace-nowrap text-xs font-bold tracking-wide", light ? "text-white/70" : "text-primary")}>Rửa xe thông minh</span>
      </span>
    </Link>
  );
}
