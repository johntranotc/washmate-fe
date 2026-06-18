import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardCustomer } from "@/lib/customer-dashboard-data";

export function MembershipSummary() {
  const navigate = useNavigate();
  const progressPercent = ((dashboardCustomer.points % 1000) / 1000) * 100;

  return (
    <div className="mb-8">
      <Card className="rounded-3xl border border-border bg-gradient-to-br from-gold/10 via-white to-primary/5 p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4">
              <img
                src="/badges/vang.png"
                alt="Hạng Vàng"
                width={120}
                height={120}
                className="drop-shadow-lg"
              />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">Hạng hiện tại</p>
            <p className="text-2xl font-extrabold leading-tight text-gold">{dashboardCustomer.memberTier}</p>
          </div>

          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="mb-6">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold leading-tight text-foreground">
                  {dashboardCustomer.points.toLocaleString("vi-VN")}
                </span>
                <span className="text-lg font-semibold text-muted-foreground">điểm</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Điểm thành viên hiện tại</p>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">Tiến độ đến hạng Bạch Kim</p>
                <p className="text-sm font-extrabold text-primary">{dashboardCustomer.pointsToNextTier} điểm</p>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white/60 p-4 backdrop-blur sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Quyền lợi</p>
                <p className="text-sm font-semibold leading-tight text-foreground">Giảm 12%, tích điểm nhân đôi</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Ưu đãi</p>
                <p className="text-sm font-semibold leading-tight text-foreground">Độc quyền hằng tháng</p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/khach-hang/diem-thanh-vien")}
              className="mt-6 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-brand-dark"
            >
              Xem điểm thưởng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
