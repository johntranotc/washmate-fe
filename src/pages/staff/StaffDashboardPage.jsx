import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertTriangle, CalendarClock } from "lucide-react";
import { staffApi } from "@/api/staffApi";
import { normalizeBookingList, normalizeStaffBooking } from "@/lib/staff-booking-data";
import { todayISO } from "@/lib/format";
import { StaffKpiCards } from "@/components/staff/StaffKpiCards";
import { StaffNextTasks } from "@/components/staff/StaffNextTasks";
import { StaffQuickActions } from "@/components/staff/StaffQuickActions";
import { StaffGarageStatusDonut } from "@/components/staff/StaffGarageStatusDonut";
import { StaffNotifications } from "@/components/staff/StaffNotifications";
import { StaffBookingTable } from "@/components/staff/StaffBookingTable";

const ACTIONABLE = ["PENDING", "CONFIRMED", "CHECKED_IN", "WASHING"];

function readName() {
  try {
    const u = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "{}");
    return u?.fullName || u?.name || "bạn";
  } catch {
    return "bạn";
  }
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StaffDashboardPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi
      .getAllBookings()
      .then((data) => setAllBookings(normalizeBookingList(data).map(normalizeStaffBooking)))
      .catch((e) => {
        console.error("Failed to load bookings:", e);
        setError(e?.message || "Không thể tải danh sách lịch đặt.");
        setAllBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = todayISO();
  const yesterday = yesterdayISO();
  const nowHM = new Date().toTimeString().slice(0, 5);

  const todayBookings = useMemo(
    () => allBookings.filter((b) => b.bookingDate === today),
    [allBookings, today],
  );
  const yesterdayBookings = useMemo(
    () => allBookings.filter((b) => b.bookingDate === yesterday),
    [allBookings, yesterday],
  );

  const kpiOf = useCallback((list) => {
    const by = (s) => list.filter((b) => b.bookingStatus === s).length;
    return {
      total: list.length,
      waitingCheckIn: by("CONFIRMED"),
      washing: by("WASHING"),
      completed: by("COMPLETED"),
      noShow: by("NO_SHOW"),
      overdue: list.filter((b) => b.bookingStatus === "CONFIRMED" && b.slotTime && b.slotTime < nowHM).length,
    };
  }, [nowHM]);

  const kpis = useMemo(() => kpiOf(todayBookings), [kpiOf, todayBookings]);
  const deltas = useMemo(() => {
    if (yesterdayBookings.length === 0) return null;
    const y = kpiOf(yesterdayBookings);
    return Object.fromEntries(Object.keys(kpis).map((k) => [k, kpis[k] - y[k]]));
  }, [kpiOf, yesterdayBookings, kpis]);

  const nextTasks = useMemo(
    () => todayBookings
      .filter((b) => ACTIONABLE.includes(b.bookingStatus))
      .sort((a, b) => (a.slotTime || "99:99").localeCompare(b.slotTime || "99:99"))
      .slice(0, 6),
    [todayBookings],
  );

  const notifications = useMemo(() => {
    const list = [];
    const overdue = todayBookings.filter((b) => b.bookingStatus === "CONFIRMED" && b.slotTime && b.slotTime < nowHM);
    overdue.forEach((b) =>
      list.push({ tone: "warn", title: `Xe ${b.plate} đã quá giờ hẹn`, desc: `${b.code} · ${b.slotTime} · ${b.customerName}` }),
    );
    const waiting = todayBookings.filter((b) => b.bookingStatus === "CONFIRMED").length;
    if (waiting > 0) list.push({ tone: "info", title: `Có ${waiting} lịch chờ được check-in`, desc: "Vui lòng check-in đúng khung giờ." });
    const pending = todayBookings.filter((b) => b.bookingStatus === "PENDING").length;
    if (pending > 0) list.push({ tone: "time", title: `${pending} lịch chờ gara xác nhận`, desc: "Xử lý trong mục Hàng đợi." });
    return list;
  }, [todayBookings, nowHM]);

  const handleAction = useCallback(async (booking, action) => {
    if (!action?.enabled || busyId) return;
    setBusyId(booking.id);
    try {
      await staffApi[action.api](booking.id);
      setAllBookings((items) => items.map((it) =>
        String(it.id) === String(booking.id) ? { ...it, bookingStatus: action.next } : it,
      ));
    } catch (e) {
      console.error("Staff action failed:", e);
      alert(`Thao tác thất bại: ${e?.message || "Lỗi không xác định"}`);
    } finally {
      setBusyId(null);
    }
  }, [busyId]);

  const dateLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Trung tâm vận hành</p>
          <h1 className="mt-2 text-3xl font-extrabold">Xin chào, {readName()} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Hôm nay là {dateLabel}. Theo dõi công việc và lịch phục vụ trong ngày.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
            <CalendarClock size={14} /> Hôm nay
          </span>
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Tải lại
          </button>
        </div>
      </header>

      {loading && !allBookings.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="mb-3 animate-spin" size={28} />
          <p className="text-sm">Đang tải dữ liệu hôm nay...</p>
        </div>
      ) : error && !allBookings.length ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-500" size={28} />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={load} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
        </div>
      ) : (
        <>
          <StaffKpiCards {...kpis} deltas={deltas} />

          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-5">
              <StaffNextTasks tasks={nextTasks} onAction={handleAction} busyId={busyId} />
              <StaffBookingTable bookings={allBookings} />
            </div>
            <div className="space-y-5">
              <StaffQuickActions />
              <StaffGarageStatusDonut
                washing={kpis.washing}
                waiting={kpis.waitingCheckIn}
                completed={kpis.completed}
              />
              <StaffNotifications items={notifications} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
