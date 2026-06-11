import { Bell, CheckCheck } from "lucide-react";
import { useAppStore } from "../../state/AppStore";

function NotificationPage() {
  const { state, actions } = useAppStore();
  const notifications = state.notifications.filter(
    (item) => item.userId === state.session?.id,
  );

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Thông báo</h1>
          <p className="mt-2 text-xs text-slate-500">
            Cập nhật về đặt lịch, thanh toán, dịch vụ và điểm thưởng.
          </p>
        </div>
        <button
          onClick={() => actions.markAllNotificationsRead()}
          className="flex items-center gap-2 text-xs font-bold text-blue-600"
        >
          <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
        </button>
      </header>

      <section className="space-y-3">
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => actions.markNotificationRead(item.id)}
            className={`flex w-full gap-4 rounded-xl border bg-white p-5 text-left ${
              item.read ? "border-slate-200" : "border-blue-300 shadow-sm"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
              <Bell size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">{item.title}</h2>
                {!item.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.message}</p>
              <time className="mt-3 block text-[9px] text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </time>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

export default NotificationPage;

