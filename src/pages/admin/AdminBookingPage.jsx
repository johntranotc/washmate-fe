import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Search, AlertTriangle, X, CheckCircle2, XCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { staffApi } from "../../api/staffApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import StatusBadge from "../../components/common/StatusBadge";
import Pagination from "../../components/common/Pagination";
import { formatDate, formatMoney, formatTime } from "../../lib/format";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  ["ALL", "Tất cả trạng thái"],
  ["PENDING", "Chờ xác nhận"],
  ["CONFIRMED", "Đã xác nhận"],
  ["CHECKED_IN", "Đã check-in"],
  ["WASHING", "Đang rửa"],
  ["COMPLETED", "Đã hoàn thành"],
  ["CANCELLED", "Đã hủy"],
  ["REJECTED", "Từ chối"],
  ["NO_SHOW", "Không đến"],
];

/**
 * Trang Lịch hẹn (Admin).
 * - Filter trạng thái / chi nhánh / khoảng ngày dùng filter THẬT của BE (GET /api/bookings).
 * - Search theo mã lịch / khách / biển số (client-side trên dữ liệu đã tải).
 * - Pagination 10 dòng/trang; modal chi tiết; action đúng workflow (chỉ khi BE có endpoint).
 */
export default function AdminBookingPage() {
  const [garages, setGarages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState("ALL");
  const [garageId, setGarageId] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setGarages([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { size: 500, sort: "id,desc" };
    if (status !== "ALL") params.status = status;
    if (garageId !== "all") params.garageId = garageId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    adminApi.getBookings(params)
      .then((res) => setBookings(normalizeBookingList(res).map(normalizeStaffBooking)))
      .catch((e) => { setError(e?.message || "Không thể tải danh sách lịch hẹn."); setBookings([]); })
      .finally(() => setLoading(false));
  }, [status, garageId, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, garageId, fromDate, toDate, keyword]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return bookings;
    return bookings.filter((b) =>
      `${b.code || ""} ${b.customerName || ""} ${b.plate || ""} ${b.serviceName || ""}`.toLowerCase().includes(kw),
    );
  }, [bookings, keyword]);

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  // Workflow: chỉ đưa ra action hợp lệ với trạng thái hiện tại (endpoint thật của BE).
  const actionsFor = (b) => {
    switch (b?.bookingStatus) {
      case "PENDING":
        return [
          { key: "confirm", label: "Xác nhận lịch", api: () => staffApi.confirmBooking(b.id), tone: "bg-blue-600 hover:bg-blue-700 text-white", icon: <CheckCircle2 size={14} /> },
          { key: "cancel", label: "Hủy lịch", api: () => staffApi.cancelBooking(b.id), tone: "bg-white border border-red-200 text-red-600 hover:bg-red-50", icon: <XCircle size={14} /> },
        ];
      case "CONFIRMED":
        return [
          { key: "cancel", label: "Hủy lịch", api: () => staffApi.cancelBooking(b.id), tone: "bg-white border border-red-200 text-red-600 hover:bg-red-50", icon: <XCircle size={14} /> },
        ];
      default:
        return []; // CHECKED_IN/WASHING do Staff vận hành; trạng thái cuối không có action
    }
  };

  const runAction = async (action) => {
    setActionBusy(true);
    setActionError(null);
    try {
      await action.api();
      setSelected(null);
      load();
    } catch (e) {
      setActionError(e?.message || "Thao tác không thành công.");
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Lịch hẹn</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và quản lý toàn bộ lịch đặt rửa xe trong hệ thống.</p>
        </div>
        <button onClick={load} className="flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCw size={16} /> Tải lại
        </button>
      </header>

      {/* Bộ lọc */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-xs">
          <Search size={16} className="text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm mã lịch, khách, biển số..." className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500">
          {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500">
          <option value="all">Tất cả chi nhánh</option>
          {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500" />
          <span className="text-sm text-slate-400">→</span>
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500" />
        </div>
        {(fromDate || toDate || status !== "ALL" || garageId !== "all" || keyword) && (
          <button onClick={() => { setStatus("ALL"); setGarageId("all"); setFromDate(""); setToDate(""); setKeyword(""); }} className="h-10 rounded-xl px-3 text-xs font-bold text-slate-500 hover:text-slate-800">
            Xóa bộ lọc
          </button>
        )}
      </section>

      {/* Bảng dữ liệu */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 p-5 pb-3">
          <CalendarDays size={18} className="text-blue-600" />
          <span className="font-extrabold text-slate-800">{loading ? "Đang tải..." : `${filtered.length} lịch hẹn`}</span>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={22} />Đang tải danh sách lịch hẹn...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={24} />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button onClick={load} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays size={40} className="mx-auto text-slate-200" />
            <p className="mt-3 text-sm font-bold text-slate-500">Không có lịch hẹn nào khớp bộ lọc</p>
            <p className="mt-1 text-xs text-slate-400">Thử thay đổi trạng thái, chi nhánh hoặc khoảng ngày.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[960px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3 font-bold">Mã lịch</th>
                    <th className="px-2 py-3 font-bold">Khách hàng</th>
                    <th className="px-2 py-3 font-bold">Biển số</th>
                    <th className="px-2 py-3 font-bold">Dịch vụ</th>
                    <th className="px-2 py-3 font-bold">Chi nhánh</th>
                    <th className="px-2 py-3 font-bold">Giờ hẹn</th>
                    <th className="px-2 py-3 font-bold">Số tiền</th>
                    <th className="px-2 py-3 font-bold">Trạng thái</th>
                    <th className="px-2 py-3 font-bold">Thanh toán</th>
                    <th className="px-2 py-3 font-bold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-2 py-3 font-bold text-slate-800">{b.code || `#${b.id}`}</td>
                      <td className="max-w-[160px] truncate px-2 py-3 font-semibold text-slate-700">{b.customerName}</td>
                      <td className="px-2 py-3">
                        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">{b.plate}</span>
                      </td>
                      <td className="max-w-[150px] truncate px-2 py-3 text-slate-600">{b.serviceName}</td>
                      <td className="max-w-[140px] truncate px-2 py-3 text-slate-600">{b.garageName}</td>
                      <td className="px-2 py-3 text-slate-600">
                        {formatDate(b.bookingDate)}
                        {b.slotTime && <span className="ml-1 font-bold text-blue-600">{formatTime(b.slotTime)}</span>}
                      </td>
                      <td className="px-2 py-3 font-bold text-slate-800">{formatMoney(b.finalAmount)}</td>
                      <td className="px-2 py-3"><StatusBadge status={b.bookingStatus} type="booking" /></td>
                      <td className="px-2 py-3"><StatusBadge status={b.paymentStatus} type="payment" /></td>
                      <td className="px-2 py-3">
                        <button onClick={() => { setSelected(b); setActionError(null); }} className="font-bold text-blue-600 hover:underline">Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </section>

      {/* Modal chi tiết */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Lịch hẹn {selected.code || `#${selected.id}`}</h3>
                <div className="mt-1.5 flex gap-2">
                  <StatusBadge status={selected.bookingStatus} type="booking" />
                  <StatusBadge status={selected.paymentStatus} type="payment" />
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khách hàng</dt><dd className="mt-0.5 font-semibold text-slate-800">{selected.customerName}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Số điện thoại</dt><dd className="mt-0.5 font-semibold text-slate-800">{selected.phone}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xe</dt><dd className="mt-0.5 font-semibold text-slate-800">{selected.vehicle} · {selected.plate}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dịch vụ</dt><dd className="mt-0.5 font-semibold text-slate-800">{selected.serviceName}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chi nhánh</dt><dd className="mt-0.5 font-semibold text-slate-800">{selected.garageName}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giờ hẹn</dt><dd className="mt-0.5 font-semibold text-slate-800">{formatDate(selected.bookingDate)} {selected.slotTime && `· ${formatTime(selected.slotTime)}`}</dd></div>
              <div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thành tiền</dt><dd className="mt-0.5 font-black text-blue-600">{formatMoney(selected.finalAmount)}</dd></div>
              {selected.rejectionReason && (
                <div className="col-span-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lý do từ chối</dt><dd className="mt-0.5 text-slate-700">{selected.rejectionReason}</dd></div>
              )}
            </dl>

            {actionError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{actionError}</p>
            )}

            {actionsFor(selected).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {actionsFor(selected).map((a) => (
                  <button
                    key={a.key}
                    disabled={actionBusy}
                    onClick={() => runAction(a)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${a.tone}`}
                  >
                    {a.icon} {actionBusy ? "Đang xử lý..." : a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
