import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Zap } from "lucide-react";
import { recentNotifications } from "@/lib/customer-dashboard-data";

const iconMap = {
  0: <AlertCircle size={20} />,
  1: <Zap size={20} />,
  2: <Bell size={20} />,
};

export function RecentNotifications() {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Thông báo gần đây</h2>
        <p className="font-medium text-muted-foreground">
          Cập nhật các hoạt động mới nhất từ lịch đặt, điểm thưởng và ưu đãi của bạn.
        </p>
      </div>

      <div className="space-y-3">
        {recentNotifications.map((notification, idx) => (
          <Card
            key={notification.id}
            className={`rounded-2xl border p-4 transition-all ${
              notification.read ? "border-border bg-white" : "border-primary bg-primary/5"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-3 ${notification.read ? "bg-secondary" : "bg-primary/10"}`}>
                <div className={notification.read ? "text-muted-foreground" : "text-primary"}>
                  {iconMap[idx] || <Bell size={20} />}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-4">
                  <h3
                    className={`font-bold leading-tight ${
                      notification.read ? "text-foreground" : "text-primary"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <Badge className="flex-shrink-0 rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      Mới
                    </Badge>
                  )}
                </div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{notification.message}</p>
                <p className="text-xs font-medium text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
