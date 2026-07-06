import { Link } from "react-router-dom";
import { CalendarDays, Car, Clock, Armchair, Gem, ShieldCheck, Cog, Zap, Flame, Star, Crown } from "lucide-react";

const serviceIcons = {
  "rua-ngoai-that": Car,
  "ve-sinh-noi-that": Armchair,
  "cham-soc-toan-dien": Gem,
  "phu-bong-bao-duong": ShieldCheck,
  "ve-sinh-khoang-may": Cog,
  "rua-nhanh-express": Zap,
};

const badgeIcons = {
  "rua-ngoai-that": Flame,
  "ve-sinh-noi-that": Star,
  "cham-soc-toan-dien": Crown,
  "phu-bong-bao-duong": ShieldCheck,
  "ve-sinh-khoang-may": Cog,
  "rua-nhanh-express": Zap,
};

export function ServiceCard({ service }) {
  const Icon = serviceIcons[service.slug] || Car;
  const BadgeIcon = badgeIcons[service.slug];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-primary/40">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-sm font-bold shadow-card backdrop-blur ${service.badgeTone || "text-primary"}`}
        >
          {BadgeIcon && <BadgeIcon className="size-3.5" />}
          {service.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="text-lg font-bold leading-snug text-foreground">{service.name}</h3>
        </div>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
          <p className="font-extrabold text-primary">{service.price}</p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Clock className="size-3.5" />
            {service.duration}
          </p>
        </div>
        <div className="mt-4 flex gap-2.5">
          <Link
            to={`/services#${service.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Xem chi tiết
          </Link>
          <Link
            to="/login"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong"
          >
            <CalendarDays className="size-4" />
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}
