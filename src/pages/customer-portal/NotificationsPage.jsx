import { Bell, CheckCheck, CircleDollarSign, Gift, Info, Tag } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { notificationApi } from "@/api/notificationApi";
import { normalizeNotifications } from "@/lib/customer-engagement-data";

const filters = [
  ["ALL", "Tất cả"],
  ["UNREAD", "Chưa đọc"],
  ["BOOKING", "Đặt lịch"],
  ["PAYMENT", "Thanh toán"],
  ["PROMOTION", "Ưu đãi"],
  ["SYSTEM", "Hệ thống"],
];

const iconByType = {
  BOOKING: Bell,
  PAYMENT: CircleDollarSign,
  PROMOTION: Tag,
  LOYALTY: Gift,
  SYSTEM: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");


  useEffect(() => {
    notificationApi
      .getNotifications()
      .then((response) => {
        setNotifications(normalizeNotifications(response));
      })
      .catch((error) => {
        console.error("Failed to load notifications:", error);
      });
  }, []);

  const markRead = async (id) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    try {
      await notificationApi.markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    try {
      await notificationApi.markAllRead();
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const visibleItems = useMemo(() => notifications.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !item.read;
    return item.type === filter;
  }), [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <PageContainer variant="customer">
      <PageHeader
        eyebrow="Trung tâm cập nhật"
        title="Thông báo"
        description={`Bạn có ${unreadCount} thông báo chưa đọc.`}
        actions={
          <Button variant="outline" onClick={markAllRead} className="text-primary">
            <CheckCheck /> Đánh dấu tất cả đã đọc
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground"}`}>{label}</button>
        ))}
      </div>
      <section className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">Không có thông báo trong nhóm này.</div>
        ) : visibleItems.map((item) => {
          const Icon = iconByType[item.type] || Bell;
          const content = (
            <>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary"><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h2 className="text-sm font-extrabold">{item.title}</h2>{!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}</div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.message}</p>
                <time className="mt-3 block text-xs text-neutral-muted">{new Date(item.createdAt).toLocaleString("vi-VN")}</time>
              </div>
            </>
          );
          const className = `flex w-full gap-4 rounded-2xl border p-5 text-left transition ${item.read ? "border-border bg-card" : "border-primary/20 bg-primary-container/30 shadow-sm"}`;
          return item.link ? (
            <Link key={item.id} to={item.link} onClick={() => markRead(item.id)} className={className}>{content}</Link>
          ) : (
            <button key={item.id} onClick={() => markRead(item.id)} className={className}>{content}</button>
          );
        })}
      </section>
    </PageContainer>
  );
}
