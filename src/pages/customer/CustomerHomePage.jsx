import {
  ArrowRight,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gift,
  Lightbulb,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "../../api/analyticsApi";
import { loyaltyApi } from "../../api/loyaltyApi";
import { notificationApi } from "../../api/notificationApi";
import { promotionApi } from "../../api/promotionApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import {
  normalizeLoyalty,
  normalizeNotifications,
  normalizePromotions,
  normalizeSummary,
  tierLabels,
} from "../../lib/customer-engagement-data";
import { customerDashboardMockData } from "../../mocks/customerDashboardMockData";
import { loyaltyMockAccount } from "../../mocks/loyaltyMockData";
import { notificationMockData } from "../../mocks/notificationMockData";
import { promotionMockData } from "../../mocks/promotionMockData";
import { useAppStore } from "../../state/AppStore";

const currency = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export default function CustomerHomePage() {
  const { state } = useAppStore();
  const [summary, setSummary] = useState(customerDashboardMockData);
  const [loyalty, setLoyalty] = useState(loyaltyMockAccount);
  const [promotions, setPromotions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.getCustomerSummary(),
      loyaltyApi.getMyLoyalty(),
      promotionApi.getActivePromotions(),
      notificationApi.getNotifications(),
    ]).then(([summaryResult, loyaltyResult, promotionResult, notificationResult]) => {
      const hasFallback = [summaryResult, loyaltyResult, promotionResult, notificationResult].some((item) => item.status === "rejected");
      setSummary(summaryResult.status === "fulfilled" ? normalizeSummary(summaryResult.value) : customerDashboardMockData);
      setLoyalty(loyaltyResult.status === "fulfilled" ? normalizeLoyalty(loyaltyResult.value) : loyaltyMockAccount);
      setPromotions(promotionResult.status === "fulfilled" ? normalizePromotions(promotionResult.value) : promotionMockData);
      setNotifications(notificationResult.status === "fulfilled" ? normalizeNotifications(notificationResult.value) : notificationMockData);
      setIsMock(hasFallback);
    });
  }, []);

  const customerName = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return user.fullName || user.name || state.session?.name || "Khách hàng";
    } catch {
      return state.session?.name || "Khách hàng";
    }
  }, [state.session?.name]);

  const bookings = state.bookings || [];
  const upcomingBookings = bookings.filter((item) => !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(item.bookingStatus));
  const recentBookings = bookings.slice(0, 3);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const tierName = loyalty.tierName || tierLabels[loyalty.tier] || loyalty.tier;

  const metrics = [
    [CalendarDays, "Lịch sắp tới", upcomingBookings.length, "lịch"],
    [CheckCircle2, "Đã hoàn tất", summary.completedBookings, "lịch"],
    [Sparkles, "Điểm khả dụng", loyalty.availablePoints, "điểm"],
    [Gift, "Ưu đãi đang có", promotions.length, "ưu đãi"],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-7 md:p-9">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-extrabold text-white"><Award size={13} /> THÀNH VIÊN {tierName?.toUpperCase()}</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Xin chào, {customerName}!</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Mọi thông tin đặt lịch, điểm thưởng và ưu đãi của bạn được tổng hợp tại đây.</p>
          </div>
          <Link to="/customer/booking" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Đặt lịch nhanh <ArrowRight size={18} /></Link>
        </div>
      </section>
      {isMock && <DemoDataNotice />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([Icon, label, value, unit]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19} /></span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{unit}</span></div>
            <p className="mt-4 text-xs text-slate-500">{label}</p>
            <strong className="mt-1 block text-2xl text-slate-950">{Number(value || 0).toLocaleString("vi-VN")}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-extrabold">Lịch đặt gần đây</h2><p className="mt-1 text-xs text-slate-500">Theo dõi nhanh các lịch của bạn.</p></div><Link to="/customer/bookings" className="text-xs font-bold text-blue-600">Xem tất cả</Link></div>
          <div className="mt-4 space-y-3">
            {recentBookings.length === 0 ? <p className="rounded-xl bg-slate-50 py-10 text-center text-sm text-slate-500">Chưa có lịch đặt.</p> : recentBookings.map((booking) => (
              <Link key={booking.id} to={`/customer/bookings/${booking.id}`} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 sm:flex-row sm:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays size={18} /></span>
                <div className="min-w-0 flex-1"><b className="text-sm">{booking.serviceName || "Dịch vụ chăm sóc xe"}</b><p className="mt-1 text-[11px] text-slate-500">{booking.bookingDate || "Chưa có ngày"} · {booking.slotTime || "Chưa có giờ"} · {booking.vehicle || booking.plate}</p></div>
                <div className="text-left sm:text-right"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">{booking.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}</span><p className="mt-2 text-xs font-bold">{currency(booking.finalAmount || booking.amount)}</p></div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between"><div><p className="text-xs text-blue-100">Điểm hiện có</p><p className="mt-1 text-4xl font-black">{loyalty.availablePoints.toLocaleString("vi-VN")}</p></div><Award size={34} className="text-blue-200" /></div>
          <p className="mt-6 text-xs font-semibold">Tiến độ đến hạng {loyalty.nextTierName || tierLabels[loyalty.nextTier] || "tiếp theo"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(loyalty.progressPercent, 100)}%` }} /></div>
          <p className="mt-2 text-[11px] text-blue-100">{loyalty.pointsToNextTier.toLocaleString("vi-VN")} điểm nữa</p>
          <Link to="/customer/loyalty" className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold">Xem chi tiết <ArrowRight size={14} /></Link>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2"><Star className="text-blue-600" size={18} /><h2 className="font-extrabold">Dịch vụ yêu thích</h2></div>
          <p className="mt-5 text-xl font-black">{summary.favoriteService}</p>
          <p className="mt-2 text-xs text-slate-500">Tổng chi tiêu ghi nhận: <b>{currency(summary.totalSpent)}</b></p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2"><Lightbulb className="text-amber-500" size={18} /><h2 className="font-extrabold">Gợi ý chăm sóc</h2></div>
          <p className="mt-4 text-xs leading-6 text-slate-600">{summary.careSuggestion || customerDashboardMockData.careSuggestion}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Bell className="text-blue-600" size={18} /><h2 className="font-extrabold">Thông báo</h2></div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{unreadCount} mới</span></div>
          <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-600">{notifications[0]?.message || "Bạn chưa có thông báo mới."}</p>
          <Link to="/customer/notifications" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600">Mở trung tâm thông báo <ArrowRight size={13} /></Link>
        </article>
      </section>

      <section>
        <div className="flex items-end justify-between"><div><h2 className="text-lg font-extrabold">Ưu đãi dành cho bạn</h2><p className="mt-1 text-xs text-slate-500">Các chương trình nổi bật đang có.</p></div><Link to="/customer/promotions" className="text-xs font-bold text-blue-600">Xem tất cả</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {promotions.slice(0, 3).map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><CircleDollarSign size={19} /></span>
              <p className="mt-4 text-xs font-bold text-blue-600">{item.discountLabel}</p><h3 className="mt-1 font-extrabold">{item.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
