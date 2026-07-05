import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "../common/Pagination";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";

const PAGE_SIZE = 10;

const TABS = [
  { key: "ALL", label: "Tất cả", match: () => true },
  { key: "PENDING", label: "Chờ xác nhận", match: (b) => b.bookingStatus === "PENDING" },
  { key: "CONFIRMED", label: "Đã xác nhận", match: (b) => b.bookingStatus === "CONFIRMED" },
  { key: "CHECKED_IN", label: "Đã check-in", match: (b) => b.bookingStatus === "CHECKED_IN" },
  { key: "WASHING", label: "Đang rửa", match: (b) => b.bookingStatus === "WASHING" },
  { key: "COMPLETED", label: "Hoàn tất", match: (b) => b.bookingStatus === "COMPLETED" },
  { key: "CLOSED", label: "Hủy / No-show", match: (b) => ["CANCELLED", "REJECTED", "NO_SHOW"].includes(b.bookingStatus) },
];

/**
 * Bảng danh sách lịch đặt dùng cho Staff Dashboard.
 * Có tab trạng thái, ô tìm kiếm và phân trang 10/trang. Dữ liệu thật.
 */
export function StaffBookingTable({ bookings = [] }) {
  const [tab, setTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const matcher = TABS.find((t) => t.key === tab)?.match || (() => true);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return bookings.filter((b) => {
      if (!matcher(b)) return false;
      if (!kw) return true;
      return `${b.code} ${b.customerName} ${b.phone} ${b.plate}`.toLowerCase().includes(kw);
    });
  }, [bookings, matcher, keyword]);

  useEffect(() => { setPage(1); }, [tab, keyword, bookings]);

  const paged = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return filtered.slice(s, s + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-extrabold text-foreground">Danh sách lịch đặt</h2>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 lg:w-80">
          <Search size={16} className="text-neutral-muted" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm mã, tên, SĐT, biển số..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border px-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-xs font-bold transition",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto px-5">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-xs font-semibold text-neutral-muted">
              <th className="py-3 pr-3 font-semibold">Mã booking</th>
              <th className="py-3 pr-3 font-semibold">Khách hàng</th>
              <th className="py-3 pr-3 font-semibold">Biển số</th>
              <th className="py-3 pr-3 font-semibold">Dịch vụ</th>
              <th className="py-3 pr-3 font-semibold">Giờ hẹn</th>
              <th className="py-3 pr-3 font-semibold">Trạng thái</th>
              <th className="py-3 pr-3 font-semibold">Thanh toán</th>
              <th className="py-3 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {paged.length > 0 ? paged.map((b) => (
              <tr key={b.id} className="hover:bg-surface">
                <td className="py-3 pr-3 font-bold text-primary">{b.code}</td>
                <td className="py-3 pr-3 font-semibold text-ink-soft">{b.customerName}</td>
                <td className="py-3 pr-3 font-mono text-muted-foreground">{b.plate}</td>
                <td className="py-3 pr-3 text-muted-foreground truncate max-w-[140px]">{b.serviceName}</td>
                <td className="py-3 pr-3 font-bold text-ink-soft">{formatTime(b.slotTime) || "--:--"}</td>
                <td className="py-3 pr-3"><StatusBadge status={b.bookingStatus} type="booking" size="sm" /></td>
                <td className="py-3 pr-3"><StatusBadge status={b.paymentStatus} type="payment" size="sm" /></td>
                <td className="py-3 text-right">
                  <Link
                    to={`/nhan-vien/danh-sach/${b.id}`}
                    className="inline-grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-surface"
                    aria-label="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-10 text-center text-neutral-muted">Không có lịch đặt phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
    </section>
  );
}
