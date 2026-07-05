import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Droplets, Home, Calendar } from "lucide-react";
import { careTips } from "@/lib/customer-dashboard-data";

const iconMap = {
  droplet: <Droplets size={32} />,
  sofa: <Home size={32} />,
  calendar: <Calendar size={32} />,
};

export function CareTips() {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Gợi ý chăm sóc xe</h2>
        <p className="font-medium text-muted-foreground">
          WashMate gợi ý thời điểm chăm sóc phù hợp dựa trên thói quen sử dụng dịch vụ của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {careTips.map((tip) => (
          <Card key={tip.id} className="rounded-2xl border border-border p-6 transition-all hover:shadow-card">
            <div className="mb-4 inline-block rounded-xl bg-primary/10 p-3">
              <div className="text-primary">{iconMap[tip.icon] || <Droplets size={32} />}</div>
            </div>
            <h3 className="mb-2 font-bold leading-tight text-foreground">{tip.title}</h3>
            <p className="mb-4 text-sm font-medium text-muted-foreground">{tip.description}</p>
            <Button
              size="sm"
              onClick={() => navigate("/khach-hang/dat-lich-moi")}
              className="w-full"
            >
              Đặt lịch ngay
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
