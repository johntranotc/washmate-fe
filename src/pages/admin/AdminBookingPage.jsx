import { useCallback, useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { CalendarDays, RefreshCw, Search, AlertTriangle, X, CheckCircle2, XCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { staffApi } from "../../api/staffApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "../../components/common/Pagination";
import { formatDate, formatMoney, formatTime } from "../../lib/format";
import { Button } from "@/components/ui/button";

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
          { key: "confirm", label: "Xác nhận lịch", api: () => staffApi.confirmBooking(b.id), variant: "default", icon: <CheckCircle2 /> },
          { key: "cancel", label: "Hủy lịch", api: () => staffApi.cancelBooking(b.id), variant: "destructive", icon: <XCircle /> },
        ];
      case "CONFIRMED":
        return [
          { key: "cancel", label: "Hủy lịch", api: () => staffApi.cancelBooking(b.id), variant: "destructive", icon: <XCircle /> },
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
    <PageContainer>
      <PageHeader
        title="Lịch hẹn"
        description="Theo dõi và quản lý toàn bộ lịch đặt rửa xe trong hệ thống."
        actions={
          <Button variant="outline" onClick={load} className="w-fit text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        }
      />

      {/* Bộ lọc */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border px-3 sm:max-w-xs">
          <Search size={16} className="text-neutral-muted" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm mã lịch, khách, biển số..." className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary">
          {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary">
          <option value="all">Tất cả chi nhánh</option>
          {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
          <span className="text-sm text-neutral-muted">→</span>
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
        </div>
        {(fromDate || toDate || status !== "ALL" || garageId !== "all" || keyword) && (
          <Button
            variant="ghost"
            onClick={() => { setStatus("ALL"); setGarageId("all"); setFromDate(""); setToDate(""); setKeyword(""); }}
            className="text-xs font-bold text-muted-foreground"
          >
            Xóa bộ lọc
          </Button>
        )}
      </section>

      {/* Bảng dữ liệu */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 p-5 pb-3">
          <CalendarDays size={18} className="text-primary" />
          <span className="font-extrabold text-foreground">{loading ? "Đang tải..." : `${filtered.length} lịch hẹn`}</span>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Đang tải danh sách lịch hẹn...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 text-critical" size={24} />
            <p className="text-sm font-bold text-critical">{error}</p>
            <Button variant="destructive" size="sm" onClick={load} className="mt-3">Thử lại</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays size={40} className="mx-auto text-border" />
            <p className="mt-3 text-sm font-bold text-muted-foreground">Không có lịch hẹn nào khớp bộ lọc</p>
            <p className="mt-1 text-xs text-neutral-muted">Thử thay đổi trạng thái, chi nhánh hoặc khoảng ngày.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-5">
              <table className="w-full min-w-[960px] whitespace-nowrap text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-xs text-neutral-muted">
                    <th className="px-2 py-3 font-semibold">Mã lịch</th>
                    <th className="px-2 py-3 font-semibold">Khách hàng</th>
                    <th className="px-2 py-3 font-semibold">Biển số</th>
                    <th className="px-2 py-3 font-semibold">Dịch vụ</th>
                    <th className="px-2 py-3 font-semibold">Chi nhánh</th>
                    <th className="px-2 py-3 font-semibold">Giờ hẹn</th>
                    <th className="px-2 py-3 font-semibold">Số tiền</th>
                    <th className="px-2 py-3 font-semibold">Trạng thái</th>
                    <th className="px-2 py-3 font-semibold">Thanh toán</th>
                    <th className="px-2 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-surface">
                      <td className="px-2 py-3 font-bold text-foreground">{b.code || `#${b.id}`}</td>
                      <td className="max-w-[160px] truncate px-2 py-3 font-semibold text-ink-soft">{b.customerName}</td>
                      <td className="px-2 py-3">
                        <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-ink-soft">{b.plate}</span>
                      </td>
                      <td className="max-w-[150px] truncate px-2 py-3 text-muted-foreground">{b.serviceName}</td>
                      <td className="max-w-[140px] truncate px-2 py-3 text-muted-foreground">{b.garageName}</td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {formatDate(b.bookingDate)}
                        {b.slotTime && <span className="ml-1 font-bold text-primary">{formatTime(b.slotTime)}</span>}
                      </td>
                      <td className="px-2 py-3 font-bold text-foreground">{formatMoney(b.finalAmount)}</td>
                      <td className="px-2 py-3"><StatusBadge status={b.bookingStatus} type="booking" size="sm" /></td>
                      <td className="px-2 py-3"><StatusBadge status={b.paymentStatus} type="payment" size="sm" /></td>
                      <td className="px-2 py-3">
                        <button onClick={() => { setSelected(b); setActionError(null); }} className="font-bold text-primary hover:underline">Chi tiết</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-floating" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">Lịch hẹn {selected.code || `#${selected.id}`}</h3>
                <div className="mt-1.5 flex gap-2">
                  <StatusBadge status={selected.bookingStatus} type="booking" />
                  <StatusBadge status={selected.paymentStatus} type="payment" />
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Đóng" onClick={() => setSelected(null)} className="text-neutral-muted hover:text-ink-soft"><X className="size-4.5" /></Button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-xs font-semibold text-neutral-muted">Khách hàng</dt><dd className="mt-0.5 font-semibold text-foreground">{selected.customerName}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Số điện thoại</dt><dd className="mt-0.5 font-semibold text-foreground">{selected.phone}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Xe</dt><dd className="mt-0.5 font-semibold text-foreground">{selected.vehicle} · {selected.plate}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Dịch vụ</dt><dd className="mt-0.5 font-semibold text-foreground">{selected.serviceName}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Chi nhánh</dt><dd className="mt-0.5 font-semibold text-foreground">{selected.garageName}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Giờ hẹn</dt><dd className="mt-0.5 font-semibold text-foreground">{formatDate(selected.bookingDate)} {selected.slotTime && `· ${formatTime(selected.slotTime)}`}</dd></div>
              <div><dt className="text-xs font-semibold text-neutral-muted">Thành tiền</dt><dd className="mt-0.5 font-black text-primary">{formatMoney(selected.finalAmount)}</dd></div>
              {selected.rejectionReason && (
                <div className="col-span-2"><dt className="text-xs font-semibold text-neutral-muted">Lý do từ chối</dt><dd className="mt-0.5 text-ink-soft">{selected.rejectionReason}</dd></div>
              )}
            </dl>

            {actionError && (
              <p className="mt-4 rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">{actionError}</p>
            )}

            {actionsFor(selected).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {actionsFor(selected).map((a) => (
                  <Button
                    key={a.key}
                    variant={a.variant}
                    size="sm"
                    disabled={actionBusy}
                    onClick={() => runAction(a)}
                  >
                    {a.icon} {actionBusy ? "Đang xử lý..." : a.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
