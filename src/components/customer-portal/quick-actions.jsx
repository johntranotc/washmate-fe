import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus, CreditCard, Star } from "lucide-react";

const quickActions = [
  {
    title: "Đặt lịch rửa xe",
    description: "Chọn xe, dịch vụ, gara và khung giờ phù hợp.",
    icon: Calendar,
    buttonText: "Đặt lịch mới",
    href: "/khach-hang/dat-lich-moi",
  },
  {
    title: "Thêm xe mới",
    description: "Lưu thông tin xe để đặt lịch nhanh hơn.",
    icon: Plus,
    buttonText: "Thêm xe",
    href: "/khach-hang/xe-cua-toi",
  },
  {
    title: "Xem hóa đơn",
    description: "Theo dõi thanh toán và hóa đơn dịch vụ.",
    icon: CreditCard,
    buttonText: "Xem hóa đơn",
    href: "/khach-hang/thanh-toan",
  },
  {
    title: "Xem điểm thưởng",
    description: "Kiểm tra điểm, hạng thành viên và ưu đãi.",
    icon: Star,
    buttonText: "Xem điểm",
    href: "/khach-hang/diem-thanh-vien",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">Bạn muốn làm gì hôm nay?</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="group flex h-full flex-col cursor-pointer rounded-2xl border border-border p-6 transition-all hover:shadow-lg"
            >
              <div className="mb-4 w-fit rounded-xl bg-primary/10 p-3">
                <Icon size={24} className="text-primary" />
              </div>
              <h3 className="mb-1 font-bold leading-tight text-foreground">{action.title}</h3>
              <p className="mb-4 flex-1 text-sm font-medium text-muted-foreground">{action.description}</p>
              <Button
                size="sm"
                onClick={() => navigate(action.href)}
                className="mt-auto w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-brand-dark"
              >
                {action.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
