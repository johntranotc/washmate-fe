import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Check, LogOut, UserRound, Wrench } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { clearSession, destinationForRole, getStoredRoles } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

const roleOptions = {
  CUSTOMER: { icon: UserRound, title: "Khách hàng", description: "Đặt lịch, quản lý xe, thanh toán và sử dụng điểm thưởng." },
  STAFF: { icon: Wrench, title: "Nhân viên", description: "Tiếp nhận xe, điều hành khoang và cập nhật tiến độ dịch vụ." },
  ADMIN: { icon: Building2, title: "Quản trị viên", description: "Quản lý gara, dịch vụ, lịch đặt, thành viên và báo cáo." },
  OWNER: { icon: Building2, title: "Quản trị viên", description: "Quản lý gara, dịch vụ, lịch đặt, thành viên và báo cáo." },
  MANAGER: { icon: Building2, title: "Quản trị viên", description: "Quản lý gara, dịch vụ, lịch đặt, thành viên và báo cáo." },
};

export function WorkspaceSelector() {
  const navigate = useNavigate();
  const roles = useMemo(() => getStoredRoles().filter((role) => roleOptions[role]), []);
  const visibleRoles = useMemo(() => [...new Set(roles.map((role) => ["OWNER", "MANAGER"].includes(role) ? "ADMIN" : role))], [roles]);
  const [selected, setSelected] = useState(visibleRoles[0] || "");

  useEffect(() => {
    if (visibleRoles.length === 1) navigate(destinationForRole(visibleRoles[0]), { replace: true });
  }, [navigate, visibleRoles]);

  function logout() {
    clearSession();
    navigate("/dang-nhap");
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-7 sm:px-8">
        <Logo />
        <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><LogOut className="size-4" /> Đăng xuất</button>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary">Không gian phù hợp với vai trò của bạn</span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Chọn không gian làm việc</h1>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">Bạn chỉ nhìn thấy những không gian đã được cấp quyền cho tài khoản hiện tại.</p>
        </div>
        {visibleRoles.length ? (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {visibleRoles.map((role) => {
                const option = roleOptions[role];
                const Icon = option.icon;
                const active = selected === role;
                return <button key={role} type="button" onClick={() => setSelected(role)} className={cn("relative flex min-h-64 flex-col items-start rounded-3xl border-2 bg-card p-7 text-left transition", active ? "border-primary shadow-cta" : "border-border hover:border-primary/40")}><span className={cn("grid size-14 place-items-center rounded-2xl", active ? "bg-primary text-white" : "bg-secondary text-primary")}><Icon className="size-5" /></span><h2 className="mt-6 text-xl font-bold">{option.title}</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{option.description}</p><span className={cn("grid size-6 place-items-center rounded-full border-2", active ? "border-primary bg-primary text-white" : "border-border text-transparent")}><Check className="size-3.5" /></span></button>;
              })}
            </div>
            <Button type="button" size="xl" onClick={() => navigate(destinationForRole(selected))} className="mx-auto mt-10 w-full max-w-xs shadow-cta">Tiếp tục <ArrowRight className="size-4" /></Button>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Chưa có vai trò phù hợp</h2>
            <p className="mt-2 text-muted-foreground">Tài khoản chưa được cấp quyền truy cập. Vui lòng liên hệ quản trị viên.</p>
          </div>
        )}
      </main>
    </div>
  );
}
