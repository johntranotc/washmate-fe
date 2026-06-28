import { BarChart3, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList } from "../../lib/staff-booking-data";

export default function AdminReportPage() {
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      garageApi.getAll().catch(() => []),
      adminApi.getBookings().catch(() => []),
    ]).then(([g, b]) => {
      setGarages(Array.isArray(g) ? g : []);
      setBookings(normalizeBookingList(b));
    }).finally(() => setLoading(false));
  }, []);

  const completed = bookings.filter((b) => b.bookingStatus === "COMPLETED").length;
  const cancelled = bookings.filter((b) => ["CANCELLED", "NO_SHOW"].includes(b.bookingStatus)).length;
  const active = bookings.filter((b) => ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(b.bookingStatus)).length;
  const total = bookings.length || 1; // avoid /0

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Báo cáo tổng quan</p>
        <h1 className="mt-2 text-3xl font-extrabold">Hiệu suất hệ thống</h1>
        <p className="mt-2 text-sm text-slate-500">Tổng hợp hoạt động vận hành từ dữ liệu thực.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [Building2, "Số gara", garages.length, "blue"],
          [BarChart3, "Tổng booking", bookings.length, "blue"],
          [BarChart3, "Hoàn tất", completed, "emerald"],
          [BarChart3, "Đang xử lý", active, "violet"],
        ].map(([Icon, label, value, color]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Icon className={`text-${color}-600`} size={21} />
            <p className="mt-4 text-xs text-slate-500">{label}</p>
            <b className="mt-1 block text-xl">{value}</b>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-extrabold">Phân bố trạng thái booking</h2>
        {bookings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Chưa có dữ liệu booking.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {[
              ["Hoàn tất", completed],
              ["Đang xử lý", active],
              ["Không đến / Đã hủy", cancelled],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-xs">
                  <span>{label}</span>
                  <b>{Math.round((value / total) * 100)}%</b>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.round((value / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-extrabold">Danh sách gara ({garages.length})</h2>
        {garages.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Chưa có gara nào.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {garages.map((g) => (
              <div key={g.id} className="py-3 flex justify-between text-sm">
                <b>{g.name ?? g.garageName}</b>
                <span className="text-slate-500">{g.address ?? g.location ?? "–"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
