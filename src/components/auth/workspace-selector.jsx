import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Building2, Wrench, Check, ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const workspaces = [
  {
    id: "ca-nhan",
    icon: User,
    title: "Cá nhân",
    description: "Đặt lịch rửa xe, theo dõi tiến độ và tích điểm cho xe của bạn.",
    tag: "Phổ biến",
  },
  {
    id: "doanh-nghiep",
    icon: Building2,
    title: "Doanh nghiệp",
    description: "Quản lý đội xe, ngân sách và hóa đơn rửa xe cho cả công ty.",
  },
  {
    id: "doi-tac",
    icon: Wrench,
    title: "Đối tác gara",
    description: "Vận hành gara, nhận đơn đặt lịch và quản lý dịch vụ của bạn.",
  },
];

export function WorkspaceSelector() {
  const [selected, setSelected] = useState("ca-nhan");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-8 sm:px-8">
        <Logo />
        <Link to="/login" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          Đăng xuất
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-semibold text-primary shadow-sm">
            <span className="size-1.5 rounded-full bg-primary" />
            Bước cuối cùng
          </span>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Chọn không gian làm việc
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Lựa chọn không gian phù hợp với nhu cầu của bạn. Bạn có thể thay đổi bất cứ lúc nào trong phần cài đặt.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {workspaces.map((w) => {
            const active = selected === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelected(w.id)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col items-start rounded-3xl border-2 bg-card p-6 text-left transition-all",
                  active
                    ? "border-primary shadow-[0_24px_50px_-26px_rgba(11,140,255,0.6)]"
                    : "border-border hover:border-primary/40 hover:shadow-lg",
                )}
              >
                {w.tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-gold px-2.5 py-1 text-[12px] font-bold text-[#5a4500]">
                    {w.tag}
                  </span>
                )}
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  <w.icon className="size-7" />
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

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            to="/"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            Tiếp tục
            <ArrowRight className="size-4" />
          </Link>
          <Link to="/" className="text-[14px] font-semibold text-muted-foreground transition-colors hover:text-primary">
            Bỏ qua, để sau
          </Link>
        </div>
      </main>
    </div>
  );
}
