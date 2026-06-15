import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Wrench, Lock, Check, ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const workspaces = [
  {
    id: "khach-hang",
    icon: User,
    title: "Khách hàng",
    description:
      "Đặt lịch rửa xe, quản lý xe, thanh toán, xem hóa đơn, theo dõi điểm thưởng và đổi ưu đãi.",
    badge: "Dành cho người dùng dịch vụ",
    route: "/khach-hang",
  },
  {
    id: "nhan-vien",
    icon: Wrench,
    title: "Nhân viên",
    description:
      "Check-in khách hàng, theo dõi lịch hôm nay, cập nhật tiến độ rửa xe, hoàn tất dịch vụ và ghi nhận sự cố.",
    badge: "Dành cho vận hành gara",
    route: "/nhan-vien",
  },
  {
    id: "quan-tri",
    icon: Lock,
    title: "Quản trị viên",
    description:
      "Quản lý gara, dịch vụ, khung giờ, nhân viên, lịch đặt, thanh toán, hóa đơn, điểm thành viên, khuyến mãi và báo cáo.",
    badge: "Dành cho quản lý hệ thống",
    route: "/quan-tri",
  },
];

export function RoleSelector() {
  const [selected, setSelected] = useState("khach-hang");
  const navigate = useNavigate();

  const handleContinue = () => {
    const workspace = workspaces.find((w) => w.id === selected);
    if (workspace) {
      navigate(workspace.route);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-8 sm:px-8">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          Trang chủ
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-semibold text-primary shadow-sm">
            <span className="size-1.5 rounded-full bg-primary" />
            Bước cuối cùng
          </span>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Chọn không gian làm việc
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Vui lòng chọn vai trò phù hợp với quyền truy cập của bạn.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {workspaces.map((w) => {
            const active = selected === w.id;
            const IconComponent = w.icon;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelected(w.id)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col items-start rounded-2xl border-2 bg-card p-6 text-left transition-all",
                  active
                    ? "border-primary shadow-[0_24px_50px_-26px_rgba(11,140,255,0.6)]"
                    : "border-border hover:border-primary/40 hover:shadow-lg",
                )}
              >
                <span className="absolute right-4 top-4 rounded-lg bg-accent/10 px-3 py-1.5 text-[12px] font-semibold text-accent">
                  {w.badge}
                </span>
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  <IconComponent className="size-7" />
                </span>
                <h2 className="mt-5 text-lg font-bold text-foreground">{w.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{w.description}</p>

                <span
                  className={cn(
                    "mt-5 flex size-6 items-center justify-center rounded-full border-2 transition-all",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            {selected === "khach-hang" && "Vào trang khách hàng"}
            {selected === "nhan-vien" && "Vào trang nhân viên"}
            {selected === "quan-tri" && "Vào trang quản trị"}
            <ArrowRight className="size-4" />
          </button>
          <Link to="/" className="text-[14px] font-semibold text-muted-foreground transition-colors hover:text-primary">
            Bỏ qua, về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
