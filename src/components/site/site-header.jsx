import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Bảng giá", href: "/bang-gia" },
  { label: "Hạng thành viên", href: "/hang-thanh-vien" },
  { label: "Quy trình", href: "/#quy-trinh" },
  { label: "Liên hệ", href: "/#lien-he" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const route = item.href.split("#")[0];
            const active = route === "/" ? pathname === "/" && item.href === "/" : pathname === route;
            return (
              <Link key={item.href} to={item.href} className={cn("rounded-xl px-3 py-2 text-sm font-semibold transition-colors", active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/dang-nhap" className="rounded-xl px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary">Đăng nhập</Link>
          <Link to="/dang-ky" className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(11,140,255,.7)] transition hover:-translate-y-0.5 hover:bg-brand-dark">
            Đăng ký ngay <ArrowRight className="size-4" />
          </Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center rounded-2xl border border-border bg-card lg:hidden" aria-label={open ? "Đóng menu" : "Mở menu"}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden">
          {navItems.map((item) => <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-semibold hover:bg-secondary">{item.label}</Link>)}
          <div className="mt-3 grid gap-2 border-t border-border pt-4">
            <Link to="/dang-nhap" onClick={() => setOpen(false)} className="rounded-2xl border border-border px-4 py-3 text-center font-bold">Đăng nhập</Link>
            <Link to="/dang-ky" onClick={() => setOpen(false)} className="rounded-2xl bg-primary px-4 py-3 text-center font-bold text-white">Đăng ký ngay</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
