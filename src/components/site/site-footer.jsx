import { Link } from "react-router-dom";
import { Droplets, Mail, Phone, MapPin } from "lucide-react";

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 12s0-3.2-.41-4.74a2.5 2.5 0 0 0-1.76-1.77C19.3 5.08 12 5.08 12 5.08s-7.3 0-8.83.41a2.5 2.5 0 0 0-1.76 1.77C1 8.8 1 12 1 12s0 3.2.41 4.74a2.5 2.5 0 0 0 1.76 1.77c1.53.41 8.83.41 8.83.41s7.3 0 8.83-.41a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Khám phá",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Dịch vụ", href: "/services" },
      { label: "Bảng giá", href: "/pricing" },
      { label: "Hạng thành viên", href: "/tiers" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Quy trình sử dụng", href: "/#quy-trinh" },
      { label: "Câu hỏi thường gặp", href: "/#lien-he" },
      { label: "Đăng nhập", href: "/login" },
      { label: "Tạo tài khoản", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="lien-he" className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Droplets className="size-5.5" strokeWidth={2.4} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[17px] font-extrabold tracking-tight text-foreground">
                  SparkleAI
                </span>
                <span className="text-[12px] font-bold tracking-wide text-primary">
                  / WashMate
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              Hệ thống quản lý rửa xe thông minh giúp bạn đặt lịch, thanh toán,
              theo dõi tiến độ và tích điểm thành viên trên một nền tảng hiện đại.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {[FacebookIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Mạng xã hội"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[15px] font-bold text-foreground">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[15px] text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[15px] font-bold text-foreground">Liên hệ</h4>
            <ul className="mt-4 flex flex-col gap-3.5 text-[15px] text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4.5 shrink-0 text-primary" />
                <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4.5 shrink-0 text-primary" />
                <span>1900 6868</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4.5 shrink-0 text-primary" />
                <span>hotro@washmate.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>© 2026 SparkleAI / WashMate. Toàn bộ quyền được bảo lưu.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-primary">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-primary">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
