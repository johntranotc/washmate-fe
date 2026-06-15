import { Calendar, Car, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-gradient-to-br from-primary/10 to-brand-dark/10",
  blue: "bg-gradient-to-br from-primary/10 to-accent/10",
  teal: "bg-gradient-to-br from-accent/20 to-primary/5",
  gold: "bg-gradient-to-br from-gold/20 to-primary/10",
};

export function StatCard({ icon, value, label, description, variant = "default" }) {
  return (
    <div className={cn("rounded-3xl border border-border p-6", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mb-1 text-4xl font-extrabold leading-tight text-foreground">{value}</div>
          <p className="text-sm font-medium text-muted-foreground">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </div>
  );
}

export function DashboardStatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Calendar size={32} />}
        value="2"
        label="Lịch sắp tới"
        description="Đang chờ bạn xác nhận hoặc đến gara"
        variant="blue"
      />
      <StatCard
        icon={<Car size={32} />}
        value="3"
        label="Xe đã lưu"
        description="Phương tiện trong tài khoản của bạn"
        variant="teal"
      />
      <StatCard
        icon={<Star size={32} />}
        value="1.250"
        label="Điểm hiện tại"
        description="Có thể dùng để đổi ưu đãi"
        variant="gold"
      />
      <StatCard
        icon={<Award size={32} />}
        value="Vàng"
        label="Hạng thành viên"
        description="Bạn đang nhận nhiều quyền lợi hơn"
        variant="default"
      />
    </div>
  );
}
