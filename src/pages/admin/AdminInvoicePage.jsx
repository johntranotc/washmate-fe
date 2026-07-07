import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign, ReceiptText, Hourglass, Undo2, AlertTriangle, Search, RefreshCw, Download, BadgeCheck,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import { RevenueTrendChart } from "../../components/admin/dashboard/RevenueTrendChart";
import { PaymentStatusCard } from "../../components/admin/dashboard/PaymentStatusCard";
import { BranchRevenueTable } from "../../components/admin/dashboard/BranchRevenueTable";
import { ServiceRevenueDonut } from "../../components/admin/dashboard/ServiceRevenueDonut";
import {
  AdminInvoiceDrawer,
  INVOICE_STATUS,
  PAYMENT_METHOD_LABELS,
} from "../../components/admin/revenue/AdminInvoiceDrawer";
import { todayISO, formatDate, formatMoney, formatNumber, friendlyName } from "../../lib/format";

const DATE_RANGES = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "7 ngày qua" },
  { key: "month", label: "Tháng này" },
  { key: "all", label: "Toàn bộ" },
];

function addDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBetween(from, to) {
  return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);
}

// Trạng thái đối soát suy từ dữ liệu payment thật (BE chưa có khái niệm đối soát riêng).
function reconciliationOf(inv) {
  if (inv.paymentStatus === "FAILED") return { label: "Cần đối soát", tone: "bg-warning-container text-warning" };
  if (inv.status === "REFUNDED") return { label: "Đã hoàn tiền", tone: "bg-primary-container text-primary-strong" };
  return null;
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

/**
 * Trang Doanh thu (Admin).
 * Nguồn dữ liệu thật: GET /api/bookings — mỗi booking kèm invoice + payment.
 * (GET /api/admin/invoices hiện lỗi phía BE với tham số null — đã ghi nhận,
 * FE không sửa BE nên dùng nguồn booking, dữ liệu invoice/payment vẫn là thật.)
 */
export default function AdminInvoicePage() {
  const [garages, setGarages] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [garageId, setGarageId] = useState("all");
  const [rangeKey, setRangeKey] = useState("month");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : []))
      .catch(() => setGarages([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { size: 1000, sort: "id,desc" };
    if (garageId !== "all") params.garageId = garageId;
    adminApi.getBookings(params)
      .then((res) => {
        const bookings = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
        const rows = bookings
          .filter((b) => b.invoice)
          .map((b) => ({
            id: b.invoice.id,
            invoiceCode: b.invoice.invoiceCode,
            bookingCode: b.bookingCode,
            customerName: b.customer?.fullName,
            phone: b.customer?.phone,
            garageId: b.garage?.id,
            garageName: b.garage?.name,
            serviceName: b.service?.name,
            subtotal: Number(b.invoice.totalAmount || 0) + Number(b.discountAmount || 0),
            discount: Number(b.discountAmount || 0),
            totalAmount: Number(b.invoice.totalAmount || 0),
            status: b.invoice.status,
            issuedAt: b.invoice.issuedAt,
            paidAt: b.invoice.paidAt || b.payment?.paidAt || null,
            paymentId: b.payment?.id || null,
            paymentMethod: b.payment?.method || null,
            paymentStatus: b.payment?.status || null,
            bookingDate: b.bookingDate || "",
          }));
        setAllInvoices(rows);
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error("[AdminRevenue] load failed:", e);
        setError(e?.message || "Không thể tải dữ liệu doanh thu. Vui lòng thử lại.");
        setAllInvoices([]);
      })
      .finally(() => setLoading(false));
  }, [garageId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [keyword, statusFilter, methodFilter, rangeKey, pageSize, allInvoices]);

  // Kỳ hiện tại + kỳ liền trước (so sánh chart) — lọc client trên dữ liệu thật.
  const { start, end, prevStart } = useMemo(() => {
    const today = todayISO();
    let s = `${today.slice(0, 8)}01`;
    if (rangeKey === "today") s = today;
    else if (rangeKey === "week") s = addDays(today, -6);
    else if (rangeKey === "all") s = "";
    const len = s ? daysBetween(s, today) + 1 : 0;
    return { start: s, end: today, prevStart: s ? addDays(s, -len) : "" };
  }, [rangeKey]);

  const dateOf = (inv) => (inv.paidAt ? String(inv.paidAt).slice(0, 10) : inv.bookingDate);

  const invoices = useMemo(
    () => (start ? allInvoices.filter((inv) => dateOf(inv) >= start && dateOf(inv) <= end) : allInvoices),
    [allInvoices, start, end],
  );
  const prevInvoices = useMemo(
    () => (start ? allInvoices.filter((inv) => dateOf(inv) >= prevStart && dateOf(inv) < start) : []),
    [allInvoices, prevStart, start],
  );

  // ===== KPI (5 thẻ: dòng "N hóa đơn" + dòng tiền) =====
  const kpis = useMemo(() => {
    const of = (list) => ({ count: list.length, sum: list.reduce((s, i) => s + (i.totalAmount || 0), 0) });
    const paid = invoices.filter((i) => i.status === "PAID");
    return {
      total: of(invoices),
      paid: of(paid),
      pending: of(invoices.filter((i) => i.status === "ISSUED")),
      failed: of(invoices.filter((i) => i.paymentStatus === "FAILED")),
      refunded: of(invoices.filter((i) => i.status === "REFUNDED")),
    };
  }, [invoices]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng doanh thu", Icon: CircleDollarSign, tone: "text-primary bg-primary-container", sumOf: "paidSum" },
    { key: "paid", label: "Đã thanh toán", Icon: BadgeCheck, tone: "text-success bg-success-container" },
    { key: "pending", label: "Chờ thanh toán", Icon: Hourglass, tone: "text-warning bg-warning-container" },
    { key: "failed", label: "Cần đối soát", Icon: AlertTriangle, tone: "text-no-show bg-no-show-container" },
    { key: "refunded", label: "Đã hoàn tiền", Icon: Undo2, tone: "text-primary-strong bg-primary-container" },
  ];

  // ===== Chart doanh thu theo ngày (hóa đơn PAID, theo ngày thanh toán) =====
  const { revenueData, hasPrevRevenue } = useMemo(() => {
    const e = end;
    const s = start || (allInvoices.length
      ? allInvoices.map(dateOf).filter(Boolean).sort()[0] || e
      : e);
    const len = Math.min(daysBetween(s, e) + 1, 92);
    const from = addDays(e, -(len - 1));
    const byDay = new Map();
    invoices.forEach((inv) => {
      if (inv.status !== "PAID") return;
      const d = dateOf(inv);
      byDay.set(d, (byDay.get(d) || 0) + (inv.totalAmount || 0));
    });
    const prevByDay = new Map();
    prevInvoices.forEach((inv) => {
      if (inv.status !== "PAID") return;
      const d = dateOf(inv);
      prevByDay.set(d, (prevByDay.get(d) || 0) + (inv.totalAmount || 0));
    });
    const data = [];
    let anyPrev = false;
    for (let i = 0; i < len; i += 1) {
      const dateISO = addDays(from, i);
      const prevISO = prevStart ? addDays(prevStart, i) : null;
      const previousRevenue = prevISO ? prevByDay.get(prevISO) || 0 : 0;
      if (previousRevenue > 0) anyPrev = true;
      data.push({ dateISO, revenue: byDay.get(dateISO) || 0, previousRevenue });
    }
    return { revenueData: data, hasPrevRevenue: anyPrev };
  }, [invoices, prevInvoices, allInvoices, start, end, prevStart]);

  // ===== Doanh thu theo chi nhánh / dịch vụ (hóa đơn PAID) =====
  const branchRevenue = useMemo(() => {
    const map = new Map();
    invoices.forEach((inv) => {
      if (inv.status !== "PAID") return;
      const name = friendlyName(inv.garageName, "Chi nhánh chưa cập nhật");
      const cur = map.get(name) || { name, revenue: 0, bookings: 0 };
      cur.revenue += inv.totalAmount || 0;
      cur.bookings += 1;
      map.set(name, cur);
    });
    const rows = [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const max = rows[0]?.revenue || 1;
    return rows.map((r) => ({ ...r, percentage: Math.round((r.revenue / max) * 100) }));
  }, [invoices]);

  const serviceRevenue = useMemo(() => {
    const map = new Map();
    invoices.forEach((inv) => {
      if (inv.status !== "PAID") return;
      const name = friendlyName(inv.serviceName, "Dịch vụ chưa cập nhật");
      map.set(name, (map.get(name) || 0) + (inv.totalAmount || 0));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [invoices]);

  const paymentCounts = useMemo(() => ({
    paid: kpis.paid.count,
    pending: kpis.pending.count,
    failed: kpis.failed.count,
    refunded: kpis.refunded.count,
  }), [kpis]);

  // ===== Bảng hóa đơn =====
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
      if (methodFilter !== "ALL" && inv.paymentMethod !== methodFilter) return false;
      if (kw) {
        const hay = `${inv.invoiceCode || ""} ${inv.bookingCode || ""} ${inv.customerName || ""} ${inv.phone || ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    }).sort((a, b) => (dateOf(b) || "").localeCompare(dateOf(a) || ""));
  }, [invoices, keyword, statusFilter, methodFilter]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const hasFilter = keyword.trim() !== "" || statusFilter !== "ALL" || methodFilter !== "ALL";
  const clearFilters = () => { setKeyword(""); setStatusFilter("ALL"); setMethodFilter("ALL"); };

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Doanh thu"
        description="Theo dõi doanh thu, hóa đơn, thanh toán và đối soát trong hệ thống."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Chọn chi nhánh"
            >
              <option value="all">Tất cả chi nhánh</option>
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
                </option>
              ))}
            </select>
            <select
              value={rangeKey}
              onChange={(e) => setRangeKey(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Chọn khoảng thời gian"
            >
              {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !allInvoices.length ? (
        <RevenueSkeleton />
      ) : error && !allInvoices.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI — "N hóa đơn" + số tiền, tính thật từ hóa đơn trong kỳ */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {KPI_CARDS.map(({ key, label, Icon, tone }) => (
              <article key={key} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-neutral-muted">{formatNumber(kpis[key].count)} hóa đơn</p>
                  <b className="block text-lg font-semibold text-foreground">
                    {formatMoney(kpis[key].sum)}
                  </b>
                </div>
              </article>
            ))}
          </section>

          {/* Analytics */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <RevenueTrendChart data={revenueData} showPrevious={hasPrevRevenue} />
            <PaymentStatusCard {...paymentCounts} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BranchRevenueTable data={branchRevenue} />
            <ServiceRevenueDonut data={serviceRevenue} />
          </div>

          {/* Bộ lọc hóa đơn */}
          <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
              <Search size={16} className="text-neutral-muted" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm mã hóa đơn, booking, khách hàng, SĐT..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Lọc trạng thái hóa đơn"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(INVOICE_STATUS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Lọc phương thức thanh toán"
            >
              <option value="ALL">Tất cả phương thức</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-bold text-muted-foreground">
                Xóa bộ lọc
              </Button>
            )}
          </section>

          {/* Bảng hóa đơn */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Danh sách hóa đơn</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiển thị {paged.length} / {filtered.length} hóa đơn
                </p>
              </div>
              {/* BE chưa có API export — nút disabled, không tạo file giả */}
              <Button variant="outline" size="sm" disabled title="Tính năng đang được hoàn thiện">
                <Download /> Xuất dữ liệu
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ReceiptText size={40} className="mx-auto text-border" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {hasFilter ? "Không có hóa đơn phù hợp." : "Chưa có dữ liệu doanh thu trong kỳ này."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc khoảng ngày.</p>
                {hasFilter && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5">
                  <table className="w-full min-w-[1000px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border font-semibold text-neutral-muted">
                        <th className="py-3 pr-3 font-semibold">Hóa đơn / Booking</th>
                        <th className="py-3 pr-3 font-semibold">Khách hàng</th>
                        <th className="py-3 pr-3 font-semibold">Chi nhánh</th>
                        <th className="py-3 pr-3 font-semibold">Tổng tiền</th>
                        <th className="py-3 pr-3 font-semibold">Thanh toán</th>
                        <th className="py-3 pr-3 font-semibold">Phát hành</th>
                        <th className="py-3 pr-3 font-semibold">Đối soát</th>
                        <th className="py-3 text-right font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                      {paged.map((inv) => {
                        const st = INVOICE_STATUS[inv.status] || { label: inv.status || "—", tone: "bg-muted text-muted-foreground" };
                        const recon = reconciliationOf(inv);
                        return (
                          <tr key={inv.id} className="align-middle hover:bg-surface">
                            <td className="min-w-[170px] py-3 pr-3">
                              <button
                                type="button"
                                onClick={() => setDetailTarget(inv)}
                                className="block whitespace-nowrap text-left font-bold text-primary hover:underline"
                              >
                                {friendlyName(inv.invoiceCode, "Hóa đơn chưa cập nhật")}
                              </button>
                              <p className="mt-0.5 text-neutral-muted">{inv.bookingCode || "Booking chưa cập nhật"}</p>
                            </td>
                            <td className="py-3 pr-3">
                              <p className="font-semibold text-ink-soft">
                                {friendlyName(inv.customerName, "Khách hàng chưa cập nhật")}
                              </p>
                              <p className="mt-0.5 text-neutral-muted">{friendlyName(inv.phone, "SĐT chưa cập nhật")}</p>
                            </td>
                            <td className="max-w-[150px] truncate py-3 pr-3 text-muted-foreground">
                              {friendlyName(inv.garageName, "Chi nhánh chưa cập nhật")}
                            </td>
                            <td className="py-3 pr-3 font-semibold text-foreground">{formatMoney(inv.totalAmount)}</td>
                            <td className="py-3 pr-3">
                              <span className={`rounded-full px-2.5 py-0.5 font-bold ${st.tone}`}>{st.label}</span>
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {inv.issuedAt ? formatDate(inv.issuedAt) : "—"}
                            </td>
                            <td className="py-3 pr-3">
                              {recon ? (
                                <span className={`rounded-full px-2.5 py-0.5 font-bold ${recon.tone}`}>{recon.label}</span>
                              ) : (
                                <span className="text-neutral-muted">—</span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {inv.status === "REFUNDED" && (
                                  <Button size="sm" variant="outline" onClick={() => setDetailTarget(inv)}>
                                    Xem hoàn tiền
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => setDetailTarget(inv)}>
                                  Chi tiết
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[8, 16, 32]}
                />
                <div className="border-t border-border px-5 py-3 text-xs text-neutral-muted">
                  Nhấn "Chi tiết" để xem chiết khấu, lịch sử thanh toán và đối soát.
                </div>
              </>
            )}
          </section>
        </>
      )}

      <AdminInvoiceDrawer
        invoice={detailTarget}
        open={Boolean(detailTarget)}
        onOpenChange={(open) => { if (!open) setDetailTarget(null); }}
      />
    </PageContainer>
  );
}
