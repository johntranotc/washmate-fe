import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }) {
  const light = variant === "light";
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="SparkleAI / WashMate - Trang chủ">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-white shadow-[0_8px_20px_-6px_rgba(11,140,255,.6)] transition group-hover:-translate-y-0.5">
        <Droplets className="size-5.5" strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-[17px] font-extrabold tracking-tight", light ? "text-white" : "text-foreground")}>SparkleAI</span>
        <span className={cn("text-xs font-bold tracking-wide", light ? "text-white/70" : "text-primary")}>/ WashMate</span>
      </span>
    </Link>
  );
}
