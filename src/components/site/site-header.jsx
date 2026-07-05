import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/services" },
  { label: "Bảng giá", href: "/pricing" },
  { label: "Hạng thành viên", href: "/tiers" },
  { label: "Quy trình", href: "/#quy-trinh" },
  { label: "Liên hệ", href: "/#lien-he" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-foreground/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo variant="light" />

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("#")[0]) &&
                  item.href !== "/#quy-trinh" &&
                  item.href !== "/#lien-he";
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-card/10 text-white"
                    : "text-neutral-muted hover:bg-card/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-card/10"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-primary-strong"
          >
            Đăng ký ngay
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-card/5 text-white lg:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-foreground lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-white hover:bg-card/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/20 px-4 py-3 text-center text-base font-bold text-white"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-primary px-4 py-3 text-center text-base font-bold text-white"
              >
                Đăng ký ngay
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
