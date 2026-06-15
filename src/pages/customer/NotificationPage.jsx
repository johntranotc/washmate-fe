import { Bell, CheckCheck, CircleDollarSign, Gift, Info, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notificationApi } from "../../api/notificationApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { normalizeNotifications } from "../../lib/customer-engagement-data";
import { notificationMockData } from "../../mocks/notificationMockData";

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

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    notificationApi.getNotifications()
      .then((response) => {
        setNotifications(normalizeNotifications(response));
        setIsMock(false);
      })
      .catch(() => {
        setNotifications(notificationMockData);
        setIsMock(true);
      });
  }, []);

  const markRead = async (id) => {
    const updateLocal = () => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    if (isMock) return updateLocal();
    try {
      await notificationApi.markNotificationAsRead(id);
      updateLocal();
    } catch {
      updateLocal();
      setIsMock(true);
    }
  };

  const markAllRead = async () => {
    if (!isMock) {
      try {
        await notificationApi.markAllRead();
      } catch {
        setIsMock(true);
      }
    }
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const visibleItems = useMemo(() => notifications.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !item.read;
    return item.type === filter;
  }), [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Trung tâm cập nhật</p>
          <h1 className="mt-2 text-3xl font-extrabold">Thông báo</h1>
          <p className="mt-2 text-sm text-slate-500">Bạn có {unreadCount} thông báo chưa đọc.</p>
        </div>
        <button onClick={markAllRead} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-600">
          <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
        </button>
      </header>
      {isMock && <DemoDataNotice />}
      <div className="flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</button>
        ))}
      </div>
      <section className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Không có thông báo trong nhóm này.</div>
        ) : visibleItems.map((item) => {
          const Icon = iconByType[item.type] || Bell;
          const content = (
            <>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h2 className="text-sm font-extrabold">{item.title}</h2>{!item.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.message}</p>
                <time className="mt-3 block text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</time>
              </div>
            </>
          );
          const className = `flex w-full gap-4 rounded-2xl border p-5 text-left transition ${item.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/30 shadow-sm"}`;
          return item.link ? (
            <Link key={item.id} to={item.link} onClick={() => markRead(item.id)} className={className}>{content}</Link>
          ) : (
            <button key={item.id} onClick={() => markRead(item.id)} className={className}>{content}</button>
          );
        })}
      </section>
    </div>
  );
}
