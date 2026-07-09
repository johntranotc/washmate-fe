import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationApi } from "@/api/notificationApi";
import { formatDate, formatTime } from "@/lib/format";

function notiTime(value) {
  if (!value) return "";
  const time = formatTime(String(value).slice(11, 16));
  const date = formatDate(value);
  return [time, date].filter(Boolean).join(", ");
}

/**
 * Thông báo gần đây — 3 thông báo mới nhất từ GET /v1/notifications (API thật).
 * Rỗng → empty state, không hardcode thông báo.
 */
export function RecentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await notificationApi.getNotifications();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setNotifications(list.slice(0, 3));
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thông báo gần đây</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Cập nhật từ lịch đặt, điểm thưởng và ưu đãi.</p>
        </div>
        <Link to="/khach-hang/thong-bao" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <Bell size={36} className="text-border" />
          <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa có thông báo mới nào</p>
          <p className="mt-1 text-xs text-muted-foreground">Thông báo về lịch đặt và điểm thưởng sẽ hiển thị ở đây.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {notifications.map((n, idx) => {
            const isRead = Boolean(n.read || n.isRead || n.readAt);
            return (
              <div
                key={n.notificationId || n.id || idx}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  isRead ? "border-border bg-surface" : "border-primary/25 bg-primary-container/40"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    isRead ? "bg-muted text-muted-foreground" : "bg-primary-container text-primary"
                  }`}
                >
                  <Bell size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{n.title || "Thông báo hệ thống"}</p>
                    {!isRead && (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                        Mới
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {n.message || n.content || ""}
                  </p>
                  {(n.createdAt || n.sentAt) && (
                    <p className="mt-1 text-xs text-neutral-muted">{notiTime(n.createdAt || n.sentAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
