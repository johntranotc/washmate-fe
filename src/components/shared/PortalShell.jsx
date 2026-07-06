import { useEffect, useState } from "react";
import { Car, Menu, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

/**
 * Khung chung cho các portal nội bộ (Admin + Staff): dark sidebar (drawer trên
 * mobile, cố định từ lg) + header trắng + vùng content cuộn.
 *
 * Props:
 *   navLinks       — [{ icon, label, to, end }] (icon: component lucide hoặc component nhận { size })
 *   brand          — { title, subtitle, logoSrc? } (logoSrc: ảnh logo thay ô Car mặc định)
 *   documentTitle  — tiêu đề tab trình duyệt
 *   headerRight    — slot bên phải header (chuông, avatar, dropdown...)
 *   sidebarTop     — slot đầu nav, trước navLinks (vd. CTA đặt lịch Customer)
 *   sidebarExtra   — slot cuối nav (vd. promo card Admin)
 *   sidebarFooter  — slot đáy sidebar (user card, logout)
 *   sidebarBackground — url ảnh nền sidebar (vd. gradient asset Staff); fallback bg-foreground
 *   contentClassName — class thêm cho vùng content (vd. padding Staff)
 */
export default function PortalShell({
  navLinks,
  brand,
  documentTitle,
  headerRight,
  sidebarTop,
  sidebarExtra,
  sidebarFooter,
  sidebarBackground,
  contentClassName = "",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (documentTitle) document.title = documentTitle;
  }, [documentTitle]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans text-foreground">
      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dark sidebar — drawer trên mobile, cố định từ lg */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-foreground text-neutral-muted transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={
          sidebarBackground
            ? { backgroundImage: `url(${sidebarBackground})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-xl text-neutral-muted hover:bg-ink-soft hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>

        <div className="flex h-16 shrink-0 items-center gap-3 px-6">
          {brand.logoSrc ? (
            <img src={brand.logoSrc} alt={`Logo ${brand.title}`} className="h-9 w-9 shrink-0" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Car size={18} className="text-white" />
            </div>
          )}
          <div>
            <p className="text-sm font-extrabold leading-none text-white">{brand.title}</p>
            <p className="mt-1 text-xs leading-none text-primary-container">{brand.subtitle}</p>
          </div>
        </div>

        <nav
          className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4"
          onClick={(e) => {
            // Đóng drawer mobile khi bấm bất kỳ link nào trong nav (kể cả slot).
            if (e.target.closest("a")) setSidebarOpen(false);
          }}
        >
          {sidebarTop}
          {navLinks.map(({ icon: Icon, label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-muted hover:bg-ink-soft hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
          {sidebarExtra}
        </nav>

        {sidebarFooter && <div className="shrink-0 border-t border-ink-soft p-4">{sidebarFooter}</div>}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setSidebarOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:bg-surface lg:invisible"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3">{headerRight}</div>
        </header>

        <div className={`flex-1 overflow-y-auto ${contentClassName}`.trim()}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
