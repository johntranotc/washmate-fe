import { useCallback, useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { CircleDollarSign, ReceiptText, RefreshCw, AlertTriangle, BadgeCheck, Hourglass } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { garageApi } from "../../api/garageApi";
import Pagination from "../../components/common/Pagination";
import { RevenueTrendChart } from "../../components/admin/dashboard/RevenueTrendChart";
import { formatDate, formatDateTime, formatMoney, formatMoneyShort, formatNumber, todayISO } from "../../lib/format";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const INVOICE_STATUS = {
  ISSUED: { label: "Đã phát hành", tone: "bg-warning-container text-warning" },
  PAID: { label: "Đã thanh toán", tone: "bg-success-container text-success" },
  CANCELLED: { label: "Đã hủy", tone: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "bg-primary-container text-primary-strong" },
};

function addDays(iso, delta) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Trang Doanh thu (Admin).
 *
 * LƯU Ý (chờ BE sửa): GET /api/admin/invoices đang lỗi "Database operation failed"
 * do query findAdminInvoices dùng "(:param is null or ...)" — PostgreSQL không suy được
 * kiểu cho tham số null. FE chuyển sang nguồn GET /api/bookings (hoạt động ổn định),
 * mỗi booking đã kèm invoice + payment thật từ BE — không mock.
 */
export default function AdminInvoicePage() {
  const [garages, setGarages] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [garageId, setGarageId] = useState("all");
  const [status, setStatus] = useState("ALL");
  const [range, setRange] = useState("month"); // week | month | quarter | all
  const [page, setPage] = useState(1);

  useEffect(() => {
    garageApi.getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : d?.data || []))
      .catch(() => setGarages([]));
  }, []);

  const { fromDate, toDate } = useMemo(() => {
    const today = todayISO();
    if (range === "week") return { fromDate: addDays(today, -6), toDate: today };
    if (range === "month") return { fromDate: `${today.slice(0, 7)}-01`, toDate: today };
    if (range === "quarter") return { fromDate: addDays(today, -89), toDate: today };
    return { fromDate: "", toDate: "" };
  }, [range]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.getBookings({ size: 1000 })
      .then((res) => {
        const bookings = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
        let list = bookings
          .filter((b) => b.invoice)
          .map((b) => ({
            id: b.invoice.id,
            invoiceCode: b.invoice.invoiceCode,
            bookingId: b.id,
            bookingCode: b.bookingCode,
            garageId: b.garage?.id,
            garageNameDirect: b.garage?.name,
            subtotal: b.totalAmount,
            discount: b.discountAmount,
            totalAmount: b.invoice.totalAmount,
            status: b.invoice.status,
            issuedAt: b.invoice.issuedAt,
            paidAt: b.invoice.paidAt,
          }));
        if (garageId !== "all") list = list.filter((i) => String(i.garageId) === String(garageId));
        if (status !== "ALL") list = list.filter((i) => i.status === status);
        if (fromDate) list = list.filter((i) => (i.issuedAt || "").slice(0, 10) >= fromDate);
        if (toDate) list = list.filter((i) => (i.issuedAt || "").slice(0, 10) <= toDate);
        list.sort((a, b) => (b.issuedAt || "").localeCompare(a.issuedAt || ""));
        setInvoices(list);
      })
      .catch((e) => { setError(e?.message || "Không thể tải dữ liệu hóa đơn."); setInvoices([]); })
      .finally(() => setLoading(false));
  }, [garageId, status, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [garageId, status, range]);

  const garageName = useCallback((id, direct) => {
    if (direct) return direct;
    const g = garages.find((x) => String(x.id ?? x.garageId) === String(id));
    return g ? (g.name ?? g.garageName) : (id ? `Gara #${id}` : "—");
  }, [garages]);

  const kpis = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "PAID");
    const issued = invoices.filter((i) => i.status === "ISSUED");
    return {
      paidRevenue: paid.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
      totalInvoices: invoices.length,
      paidCount: paid.length,
      issuedCount: issued.length,
      pendingAmount: issued.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    };
  }, [invoices]);

  // Doanh thu theo ngày (theo paidAt của hóa đơn PAID) — dữ liệu thật, không nội suy.
  const revenueByDay = useMemo(() => {
    const m = {};
    invoices.forEach((i) => {
      if (i.status !== "PAID") return;
      const d = (i.paidAt || i.issuedAt || "").slice(0, 10);
      if (!d) return;
      m[d] = (m[d] || 0) + Number(i.totalAmount || 0);
    });
    const days = Object.keys(m).sort();
    if (days.length === 0) return [];
    const start = fromDate || days[0];
    const end = toDate || days[days.length - 1];
    const out = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      out.push({ dateISO: d, revenue: m[d] || 0, previousRevenue: 0 });
      if (out.length > 120) break;
    }
    return out;
  }, [invoices, fromDate, toDate]);

  const paged = useMemo(() => invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [invoices, page]);

  const kpiCards = [
    { title: "Doanh thu đã thanh toán", value: formatMoneyShort(kpis.paidRevenue), sub: formatMoney(kpis.paidRevenue), icon: <CircleDollarSign size={20} className="text-primary" />, bg: "bg-primary-container" },
    { title: "Tổng hóa đơn", value: formatNumber(kpis.totalInvoices), icon: <ReceiptText size={20} className="text-accent-indigo" />, bg: "bg-accent-indigo/10" },
    { title: "Đã thanh toán", value: formatNumber(kpis.paidCount), icon: <BadgeCheck size={20} className="text-success" />, bg: "bg-success-container" },
    { title: "Chờ thanh toán", value: `${formatNumber(kpis.issuedCount)} · ${formatMoneyShort(kpis.pendingAmount)}`, icon: <Hourglass size={20} className="text-warning" />, bg: "bg-warning-container" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Doanh thu"
        description="Phân tích doanh thu theo hóa đơn đã phát hành trong hệ thống."
        actions={
          <>
        <div className="flex flex-wrap items-center gap-3">
          <select value={garageId} onChange={(e) => setGarageId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            <option value="all">Tất cả chi nhánh</option>
            {garages.map((g) => <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>)}
          </select>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">90 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm outline-none focus:border-primary">
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(INVOICE_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>
          <Button variant="outline" onClick={load} className="text-ink-soft">
            <RefreshCw /> Tải lại
          </Button>
        </div>
          </>
        }
      />

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="font-semibold text-muted-foreground">Đang tổng hợp dữ liệu doanh thu...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button variant="destructive" size="sm" onClick={load} className="mt-4">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((k) => (
              <div key={k.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-muted-foreground">{k.title}</p>
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${k.bg}`}>{k.icon}</div>
                </div>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{k.value}</h3>
                {k.sub && k.sub !== k.value && <p className="mt-0.5 text-xs font-semibold text-neutral-muted">{k.sub}</p>}
              </div>
            ))}
          </div>

          <RevenueTrendChart data={revenueByDay} showPrevious={false} />

          {/* Bảng hóa đơn */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 p-5 pb-3">
              <ReceiptText size={18} className="text-primary" />
              <span className="font-extrabold text-foreground">{invoices.length} hóa đơn</span>
            </div>
            {invoices.length === 0 ? (
              <div className="py-16 text-center">
                <ReceiptText size={40} className="mx-auto text-border" />
                <p className="mt-3 text-sm font-bold text-muted-foreground">Chưa có hóa đơn nào trong kỳ đã chọn</p>
                <p className="mt-1 text-xs text-neutral-muted">Hóa đơn được tạo khi lịch hẹn phát sinh thanh toán.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5">
                  <table className="w-full min-w-[860px] whitespace-nowrap text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-xs text-neutral-muted">
                        <th className="px-2 py-3 font-semibold">Mã hóa đơn</th>
                        <th className="px-2 py-3 font-semibold">Booking</th>
                        <th className="px-2 py-3 font-semibold">Chi nhánh</th>
                        <th className="px-2 py-3 font-semibold">Tạm tính</th>
                        <th className="px-2 py-3 font-semibold">Giảm giá</th>
                        <th className="px-2 py-3 font-semibold">Tổng tiền</th>
                        <th className="px-2 py-3 font-semibold">Trạng thái</th>
                        <th className="px-2 py-3 font-semibold">Phát hành</th>
                        <th className="px-2 py-3 font-semibold">Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paged.map((inv) => {
                        const st = INVOICE_STATUS[inv.status] || { label: inv.status || "—", tone: "bg-muted text-muted-foreground" };
                        return (
                          <tr key={inv.id} className="transition-colors hover:bg-surface">
                            <td className="px-2 py-3 font-bold text-foreground">{inv.invoiceCode || `#INV-${inv.id}`}</td>
                            <td className="px-2 py-3 text-muted-foreground">{inv.bookingCode || (inv.bookingId ? `#${inv.bookingId}` : "—")}</td>
                            <td className="max-w-[160px] truncate px-2 py-3 text-muted-foreground">{garageName(inv.garageId, inv.garageNameDirect)}</td>
                            <td className="px-2 py-3 text-muted-foreground">{formatMoney(inv.subtotal)}</td>
                            <td className="px-2 py-3 text-muted-foreground">{Number(inv.discount) > 0 ? `-${formatMoney(inv.discount)}` : "—"}</td>
                            <td className="px-2 py-3 font-black text-foreground">{formatMoney(inv.totalAmount)}</td>
                            <td className="px-2 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${st.tone}`}>{st.label}</span></td>
                            <td className="px-2 py-3 text-muted-foreground">{formatDate(inv.issuedAt)}</td>
                            <td className="px-2 py-3 text-muted-foreground">{inv.paidAt ? formatDateTime(inv.paidAt) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={invoices.length} onPageChange={setPage} />
              </>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
