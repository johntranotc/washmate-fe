import { Sparkles } from "lucide-react";

export function LogoMark() {
  return (
    <div className="logo-mark">
      <Sparkles size={28} />
    </div>
  );
}

export function StatCard({ title, value, note, icon: Icon, tone = "blue" }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        {note && <span>{note}</span>}
      </div>
      {Icon && <Icon size={22} />}
    </div>
  );
}

export function Pill({ children, tone = "green" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function PageFooter() {
  return (
    <footer className="page-footer">
      <div>
        <strong>SparkleAI</strong>
        <p>© 2024 Công ty Công nghệ SparkleAI. Đã đăng ký bản quyền.</p>
      </div>
      <nav>
        <a>Chính sách bảo mật</a>
        <a>Điều khoản dịch vụ</a>
        <a>Tài liệu API</a>
        <a>Liên hệ</a>
      </nav>
    </footer>
  );
}
