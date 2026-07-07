import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle, Building, ShieldCheck, Building2, UsersRound, SlidersHorizontal,
  Star, Megaphone, CreditCard, Bell, MessageSquareText, ScrollText, ArrowRight, Hourglass,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "@/components/ui/toast";
import { ChangePasswordDrawer } from "../../components/admin/settings/ChangePasswordDrawer";
import { OperationConfigDrawer } from "../../components/admin/settings/OperationConfigDrawer";

/**
 * Trang Cài đặt (Admin) — trung tâm cấu hình hệ thống.
 * Card điều hướng đi tới route thật; card cấu hình chỉ mở drawer khi có API
 * thật (đổi mật khẩu PUT /auth/password/change, khung giờ & công suất
 * /v1/garages/{id}/slots + /v1/slots/{id}/capacity). Các mục BE chưa có API
 * (doanh nghiệp, thanh toán, thông báo, mẫu tin, nhật ký) → badge "Sắp có"
 * + toast, không fake form/lưu thành công.
 */
export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [operationOpen, setOperationOpen] = useState(false);

  const comingSoon = () => toast.info("Chức năng này chưa được hệ thống hỗ trợ.");

  const GROUPS = [
    {
      title: "Tài khoản & Doanh nghiệp",
      cards: [
        {
          icon: UserCircle, tone: "bg-primary-container text-primary",
          title: "Thông tin tài khoản",
          desc: "Cập nhật hồ sơ quản trị viên, ảnh đại diện và thông tin liên hệ.",
          chip: "Tài khoản cá nhân",
          action: "Chỉnh sửa",
          onClick: () => navigate("/quan-tri/profile"),
        },
        {
          icon: Building, tone: "bg-accent-indigo/10 text-accent-indigo",
          title: "Thông tin doanh nghiệp",
          desc: "Quản lý tên doanh nghiệp, logo, hotline, email hỗ trợ và địa chỉ pháp lý.",
          chip: "Toàn hệ thống",
          pending: true,
        },
        {
          icon: ShieldCheck, tone: "bg-success-container text-success",
          title: "Bảo mật",
          desc: "Đổi mật khẩu, phiên đăng nhập và xác thực 2 lớp khi hệ thống hỗ trợ.",
          chip: "Tài khoản cá nhân",
          action: "Cấu hình",
          onClick: () => setPasswordOpen(true),
        },
      ],
    },
    {
      title: "Vận hành",
      cards: [
        {
          icon: Building2, tone: "bg-primary-container text-primary",
          title: "Cơ sở / Chi nhánh",
          desc: "Thêm, sửa thông tin và trạng thái các gara trong chuỗi.",
          chip: "Theo chi nhánh",
          action: "Đi tới quản lý",
          onClick: () => navigate("/quan-tri/garages"),
        },
        {
          icon: UsersRound, tone: "bg-accent-cyan/10 text-accent-cyan",
          title: "Nhân viên & phân quyền",
          desc: "Quản lý vai trò, gán chi nhánh và giới hạn quyền thao tác.",
          chip: "Toàn hệ thống",
          action: "Đi tới quản lý",
          onClick: () => navigate("/quan-tri/staff"),
        },
        {
          icon: SlidersHorizontal, tone: "bg-accent-violet/10 text-accent-violet",
          title: "Cấu hình vận hành",
          desc: "Thiết lập khung giờ nhận lịch và công suất phục vụ theo chi nhánh.",
          chip: "Theo chi nhánh",
          action: "Cấu hình",
          onClick: () => setOperationOpen(true),
        },
      ],
    },
    {
      title: "Kinh doanh",
      cards: [
        {
          icon: Star, tone: "bg-gold/20 text-gold-ink",
          title: "Tích điểm & Thành viên",
          desc: "Xem hạng thành viên và danh mục ưu đãi đổi điểm.",
          chip: "Toàn hệ thống",
          action: "Đi tới quản lý",
          onClick: () => navigate("/quan-tri/loyalty"),
        },
        {
          icon: Megaphone, tone: "bg-accent-indigo/10 text-accent-indigo",
          title: "Chiến dịch",
          desc: "Theo dõi và cấu hình chương trình khuyến mãi theo chi nhánh.",
          chip: "Theo chi nhánh",
          action: "Đi tới quản lý",
          onClick: () => navigate("/quan-tri/campaigns"),
        },
        {
          icon: CreditCard, tone: "bg-success-container text-success",
          title: "Tích hợp thanh toán",
          desc: "Quản lý cấu hình VNPay và các phương thức thanh toán khác.",
          chip: "Toàn hệ thống",
          pending: true,
        },
      ],
    },
    {
      title: "Tự động hóa & Hệ thống",
      cards: [
        {
          icon: Bell, tone: "bg-warning-container text-warning",
          title: "Thông báo & nhắc lịch",
          desc: "Cấu hình nhắc lịch tự động qua email/SMS/Zalo cho khách đặt lịch.",
          chip: "Toàn hệ thống",
          pending: true,
        },
        {
          icon: MessageSquareText, tone: "bg-accent-cyan/10 text-accent-cyan",
          title: "Mẫu thông báo",
          desc: "Quản lý nội dung tin nhắn xác nhận lịch, hủy lịch và thanh toán.",
          chip: "Toàn hệ thống",
          pending: true,
        },
        {
          icon: ScrollText, tone: "bg-muted text-muted-foreground",
          title: "Nhật ký hệ thống",
          desc: "Theo dõi thay đổi cấu hình, phân quyền và các thao tác quan trọng.",
          chip: "Toàn hệ thống",
          pending: true,
          action: "Xem nhật ký",
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Cài đặt"
        description="Quản lý cấu hình chung của doanh nghiệp và hệ thống vận hành."
      />

      {GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 text-sm font-extrabold text-neutral-muted">{group.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.cards.map((card) => {
              const Icon = card.icon;
              const pending = Boolean(card.pending);
              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={pending ? comingSoon : card.onClick}
                  className={`group flex flex-col rounded-2xl border bg-card p-5 text-left transition ${
                    pending
                      ? "border-dashed border-border"
                      : "border-border shadow-sm hover:border-primary/30 hover:shadow-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${pending ? "bg-muted text-neutral-muted" : card.tone}`}>
                      <Icon size={20} />
                    </span>
                    {pending ? (
                      <span className="flex items-center gap-1 rounded-full bg-warning-container px-2 py-1 text-xs font-bold text-warning">
                        <Hourglass size={13} /> Sắp có
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface px-2 py-1 text-xs font-bold text-muted-foreground">
                        {card.chip}
                      </span>
                    )}
                  </div>

                  <b className={`mt-3 block ${pending ? "text-ink-soft" : "text-foreground"}`}>{card.title}</b>
                  <p className="mt-0.5 min-h-8 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>

                  <span className="mt-3 flex flex-1 items-end">
                    {pending ? (
                      <span className="text-xs font-bold text-neutral-muted">{card.chip}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-1.5">
                        {card.action} <ArrowRight size={13} className="transition-all" />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-xs font-semibold text-neutral-muted">
        Một số thiết lập sẽ được kích hoạt khi hệ thống hỗ trợ cấu hình tương ứng.
      </p>

      <ChangePasswordDrawer open={passwordOpen} onOpenChange={setPasswordOpen} />
      <OperationConfigDrawer open={operationOpen} onOpenChange={setOperationOpen} />
    </PageContainer>
  );
}
