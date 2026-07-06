import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }) {
  const light = variant === "light";
  return (
    <Link to="/" className={cn("group flex shrink-0 items-center gap-2.5", className)} aria-label="WashMate - Trang chủ">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-cta transition group-hover:-translate-y-0.5">
        <Droplets className="size-5" strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("whitespace-nowrap text-lg font-extrabold tracking-tight", light ? "text-white" : "text-foreground")}>WashMate</span>
        <span className={cn("whitespace-nowrap text-xs font-bold tracking-wide", light ? "text-white/70" : "text-primary")}>Rửa xe thông minh</span>
      </span>
    </Link>
  );
}
