import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Zap } from "lucide-react";
import { notificationApi } from "@/api/notificationApi";

const iconMap = {
  0: <AlertCircle size={20} />,
  1: <Zap size={20} />,
  2: <Bell size={20} />,
};

export function RecentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await notificationApi.getNotifications();
        if (Array.isArray(res)) {
          setNotifications(res.slice(0, 3));
        } else if (res && Array.isArray(res.data)) {
          setNotifications(res.data.slice(0, 3));
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Thông báo gần đây</h2>
        <p className="font-medium text-muted-foreground">
          Cập nhật các hoạt động mới nhất từ lịch đặt, điểm thưởng và ưu đãi của bạn.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Đang tải thông báo...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Bell size={36} className="mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-foreground">Bạn chưa có thông báo mới nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, idx) => {
            if (!notification || typeof notification !== "object") return null;
            const isRead = Boolean(notification.read || notification.isRead);
            return (
              <Card
                key={notification.notificationId || notification.id || idx}
                className={`rounded-2xl border p-4 transition-all ${
                  isRead ? "border-border bg-card" : "border-primary bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${isRead ? "bg-secondary" : "bg-primary/10"}`}>
                    <div className={isRead ? "text-muted-foreground" : "text-primary"}>
                      {iconMap[idx % 3] || <Bell size={20} />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-4">
                      <h3
                        className={`font-bold leading-tight ${
                          isRead ? "text-foreground" : "text-primary"
                        }`}
                      >
                        {notification.title || "Thông báo hệ thống"}
                      </h3>
                      {!isRead && (
                        <Badge className="flex-shrink-0 rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          Mới
                        </Badge>
                      )}
                    </div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">{notification.message || notification.content || ""}</p>
                    <p className="text-xs font-medium text-muted-foreground">{notification.createdAt || notification.time || "Vừa xong"}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
