import { Link } from "react-router-dom";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Building2, UserCircle, Star, Megaphone, Bell, ShieldCheck, CreditCard, Hourglass } from "lucide-react";

const shortcuts = [
  { to: "/quan-tri/profile", icon: UserCircle, title: "Thông tin tài khoản", desc: "Cập nhật hồ sơ chủ doanh nghiệp, ảnh đại diện và mật khẩu." },
  { to: "/quan-tri/garages", icon: Building2, title: "Cơ sở / Chi nhánh", desc: "Thêm, sửa thông tin và trạng thái các gara trong chuỗi." },
  { to: "/quan-tri/loyalty", icon: Star, title: "Tích điểm & Thành viên", desc: "Xem hạng thành viên và danh mục ưu đãi đổi điểm." },
  { to: "/quan-tri/campaigns", icon: Megaphone, title: "Chiến dịch", desc: "Theo dõi các chương trình khuyến mãi theo chi nhánh." },
];

// Các nhóm cấu hình cần API riêng — hiển thị trạng thái chờ BE, không giả lập.
const pendingSections = [
  { icon: Bell, title: "Thông báo & nhắc lịch", desc: "Cấu hình nhắc lịch tự động qua email/SMS cho khách đặt lịch." },
  { icon: ShieldCheck, title: "Phân quyền chi tiết", desc: "Giới hạn quyền theo vai trò STAFF / MANAGER trên từng chi nhánh." },
  { icon: CreditCard, title: "Tích hợp thanh toán", desc: "Quản lý cấu hình VNPay và các phương thức thanh toán khác." },
];

export default function AdminSettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Cài đặt" description="Quản lý cấu hình chung của doanh nghiệp." />

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-neutral-muted">Quản lý nhanh</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-container text-primary"><Icon size={20} /></span>
              <div>
                <b className="block text-foreground">{title}</b>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold text-neutral-muted">Cấu hình nâng cao</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pendingSections.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-dashed border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-neutral-muted"><Icon size={20} /></span>
                <span className="flex items-center gap-1 rounded-full bg-warning-container px-2 py-1 text-xs font-bold text-warning"><Hourglass size={14} /> Chờ BE</span>
              </div>
              <b className="mt-3 block text-ink-soft">{title}</b>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-neutral-muted">
          Các thiết lập trên sẽ tự kích hoạt khi Backend cung cấp API cấu hình tương ứng — giao diện không giả lập trạng thái lưu thành công.
        </p>
      </section>
    </PageContainer>
  );
}
