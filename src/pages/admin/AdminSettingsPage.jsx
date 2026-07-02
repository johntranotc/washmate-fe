import { Link } from "react-router-dom";
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
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý cấu hình chung của doanh nghiệp.</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400">Quản lý nhanh</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={20} /></span>
              <div>
                <b className="block text-slate-800">{title}</b>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-400">Cấu hình nâng cao</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pendingSections.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400"><Icon size={20} /></span>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600"><Hourglass size={10} /> Chờ BE</span>
              </div>
              <b className="mt-3 block text-slate-700">{title}</b>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-400">
          Các thiết lập trên sẽ tự kích hoạt khi Backend cung cấp API cấu hình tương ứng — giao diện không giả lập trạng thái lưu thành công.
        </p>
      </section>
    </div>
  );
}
