import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BadgePercent,
  Bell,
  BellRing,
  CalendarClock,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toast";
import { notificationApi } from "@/api/notificationApi";
import { friendlyError } from "@/lib/api-error";
import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  NOTIFICATION_TABS,
  isToday,
  needsAction,
  normalizeNotificationList,
  notificationCta,
  relativeTime,
} from "@/lib/customer-notification-data";

const CATEGORY_ICONS = {
  booking: CalendarClock,
  payment: CreditCard,
  loyalty: Trophy,
  promotion: BadgePercent,
  system: Info,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [marking, setMarking] = useState(false);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const list = normalizeNotificationList(await notificationApi.getNotifications());
      setItems(list);
      setError(false);
    } catch {
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const todayCount = useMemo(() => items.filter((n) => isToday(n.createdAt)).length, [items]);
  const actionCount = useMemo(() => items.filter((n) => needsAction(n) && !n.read).length, [items]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of NOTIFICATION_TABS) counts[t.key] = items.filter(t.match).length;
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const activeTab = NOTIFICATION_TABS.find((t) => t.key === tab) || NOTIFICATION_TABS[0];
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (!activeTab.match(n)) return false;
      if (!q) return true;
      return `${n.title} ${n.message}`.toLowerCase().includes(q);
    });
  }, [items, tab, search]);

  // Nhóm ưu tiên: Cần xử lý → Hôm nay → Trước đó (trên tập đã lọc).
  const groups = useMemo(() => {
    const action = [];
    const today = [];
    const earlier = [];
    for (const n of filtered) {
      if (needsAction(n) && !n.read) action.push(n);
      else if (isToday(n.createdAt)) today.push(n);
      else earlier.push(n);
    }
    return [
      { key: "action", title: "Cần xử lý", items: action },
      { key: "today", title: "Hôm nay", items: today },
      { key: "earlier", title: "Trước đó", items: earlier },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationApi.markNotificationAsRead(id);
      window.dispatchEvent(new Event("washmate-notifications-updated"));
    } catch {
      // Thất bại → khôi phục trạng thái thật, không giữ "đã đọc" giả.
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      toast.error("Chưa cập nhật được trạng thái đã đọc.");
    }
  }, []);

  const openNotification = useCallback(
    (n) => {
      if (!n.read) markRead(n.id);
      const cta = notificationCta(n);
      if (cta) navigate(cta.to);
    },
    [markRead, navigate],
  );

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarking(true);
    try {
      await notificationApi.markAllRead();
      window.dispatchEvent(new Event("washmate-notifications-updated"));
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      await load({ silent: true });
    } catch (err) {
      toast.error("Chưa đánh dấu được.", { description: friendlyError(err, "Vui lòng thử lại sau.") });
    } finally {
      setMarking(false);
    }
  }, [unreadCount, load]);

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        eyebrow="Trung tâm cập nhật"
        title="Thông báo"
        description="Theo dõi các cập nhật về lịch đặt, thanh toán, điểm thưởng và ưu đãi của bạn."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => load()} aria-label="Tải lại" title="Tải lại">
              <RotateCcw size={18} />
            </Button>
            <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0 || marking}>
              <CheckCheck size={18} /> Đánh dấu tất cả đã đọc
            </Button>
          </div>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Chưa đọc" value={loading ? "—" : unreadCount} icon={<BellRing size={18} />} tone="bg-primary-container text-primary" highlight={!loading && unreadCount > 0} />
        <KpiCard label="Hôm nay" value={loading ? "—" : todayCount} icon={<Sparkles size={18} />} tone="bg-success-container text-success" />
        <KpiCard label="Cần xử lý" value={loading ? "—" : actionCount} icon={<AlertTriangle size={18} />} tone="bg-warning-container text-warning" highlight={!loading && actionCount > 0} />
      </div>

      {/* Toolbar */}
      <div className="relative w-full lg:max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tiêu đề hoặc nội dung..." className="h-9 pl-9" />
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {NOTIFICATION_TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-muted-foreground hover:bg-surface"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-muted"}`}>{tabCounts[t.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical"><AlertTriangle size={22} /></span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không thể tải thông báo</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng thử lại sau.</p>
          <Button onClick={() => load()} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="Bạn chưa có thông báo nào" description="Các cập nhật mới sẽ hiển thị tại đây." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy thông báo phù hợp"
          description="Thử đổi từ khóa hoặc bộ lọc."
          action={<Button variant="outline" onClick={() => { setTab("all"); setSearch(""); }}>Xóa bộ lọc</Button>}
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-2.5 text-sm font-extrabold text-muted-foreground">{group.title}</h2>
              <div className="space-y-2.5">
                {group.items.map((n) => (
                  <NotificationRow key={n.id} n={n} onOpen={() => openNotification(n)} onMarkRead={() => markRead(n.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function NotificationRow({ n, onOpen, onMarkRead }) {
  const Icon = CATEGORY_ICONS[n.category] || Bell;
  const cta = notificationCta(n);

  return (
    <article
      className={`flex gap-3 rounded-2xl border p-4 transition ${
        n.read ? "border-border bg-card" : "border-primary/25 bg-primary-container/25"
      }`}
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${CATEGORY_TONES[n.category]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-extrabold">{n.title}</h3>
          {!n.read && <span className="size-2 rounded-full bg-primary" aria-label="Chưa đọc" />}
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${CATEGORY_TONES[n.category]}`}>
            {CATEGORY_LABELS[n.category]}
          </span>
        </div>
        {n.message && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.message}</p>}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <time className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</time>
          {cta && (
            <Button size="sm" variant={n.read ? "outline" : "default"} onClick={onOpen}>
              {cta.label}
            </Button>
          )}
          {!n.read && (
            <button
              type="button"
              onClick={onMarkRead}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <Check size={14} /> Đánh dấu đã đọc
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
