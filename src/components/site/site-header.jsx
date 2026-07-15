import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { LoginTransitionOverlay } from "./login-transition-overlay";

const LOGIN_ROUTE = "/login";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/services" },
  { label: "Bảng giá", href: "/pricing" },
  { label: "Quy trình", href: "/#quy-trinh" },
  { label: "Hạng thành viên", href: "/#hang-thanh-vien" },
  { label: "Liên hệ", href: "/#lien-he" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  // Header chỉ trong suốt khi đứng trên hero TỐI (trang chủ, Dịch vụ, Bảng giá) và chưa cuộn.
  // Các trang nền sáng hoặc khi đã cuộn xuống: hiện nền xanh đặc để chữ luôn đọc rõ.
  const DARK_HERO_ROUTES = ["/", "/services", "/pricing"];
  const overDarkHero = DARK_HERO_ROUTES.includes(pathname);
  const transparent = overDarkHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bấm "Đăng nhập": chạy hiệu ứng xe lướt ngang rồi mới sang trang đăng nhập.
  // Tôn trọng prefers-reduced-motion → điều hướng thẳng, không animation.
  const startLogin = () => {
    if (transitioning) return;
    setOpen(false);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      navigate(LOGIN_ROUTE);
      return;
    }
    setTransitioning(true);
  };

  return (
    <>
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      {/* Đầu trang: trong suốt trên hero tối. Cuộn xuống: nền xanh đặc để chữ luôn rõ. */}
      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden rounded-2xl border transition-colors duration-300",
          transparent
            ? "border-white/15 bg-transparent"
            : "border-white/10 bg-navy shadow-floating",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Logo variant="light" />

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/" && !hash // Trang chủ: chỉ active khi không ở section neo nào
                  : item.href.includes("#")
                    ? pathname === "/" && hash !== "" && item.href.endsWith(hash) // link neo: khớp hash
                    : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "text-white after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary-bright"
                      : "text-primary-container/80 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={startLogin}
              disabled={transitioning}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-card/10 disabled:opacity-60"
            >
              Đăng nhập
            </button>
            <Link
              to="/register"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-primary-strong"
            >
              Đăng ký ngay
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-white/15 bg-card/10 text-white lg:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 lg:hidden">
            <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
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
                <button
                  type="button"
                  onClick={startLogin}
                  disabled={transitioning}
                  className="rounded-xl border border-white/25 px-4 py-3 text-center text-base font-bold text-white disabled:opacity-60"
                >
                  Đăng nhập
                </button>
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
      </div>
    </header>
    <LoginTransitionOverlay active={transitioning} onComplete={() => navigate(LOGIN_ROUTE)} />
    </>
  );
}
