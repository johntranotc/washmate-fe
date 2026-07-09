import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, CreditCard, Star } from "lucide-react";

// 4 thao tác nhanh — chỉ route thật đang hoạt động trong Customer Portal.
const quickActions = [
  { title: "Đặt lịch rửa xe", description: "Chọn xe, dịch vụ và khung giờ.", icon: Calendar, buttonText: "Đặt lịch mới", href: "/khach-hang/dat-lich-moi" },
  { title: "Thêm xe mới", description: "Lưu xe để đặt lịch nhanh hơn.", icon: Plus, buttonText: "Thêm xe", href: "/khach-hang/xe-cua-toi" },
  { title: "Xem hóa đơn", description: "Theo dõi thanh toán dịch vụ.", icon: CreditCard, buttonText: "Xem hóa đơn", href: "/khach-hang/thanh-toan" },
  { title: "Xem điểm thưởng", description: "Điểm, hạng và ưu đãi của bạn.", icon: Star, buttonText: "Xem điểm", href: "/khach-hang/diem-thanh-vien" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-foreground">Bạn muốn làm gì hôm nay?</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-primary">
                <Icon size={18} />
              </span>
              <h3 className="mt-3 text-sm font-bold leading-tight text-foreground">{action.title}</h3>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{action.description}</p>
              <Button size="sm" onClick={() => navigate(action.href)} className="mt-4 w-full">
                {action.buttonText}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
