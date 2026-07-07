import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { paymentApi } from "@/api/paymentApi";
import { formatMoney, formatDate, formatDateTime, friendlyName } from "@/lib/format";

export const INVOICE_STATUS = {
  ISSUED: { label: "Chờ thanh toán", tone: "bg-warning-container text-warning" },
  PAID: { label: "Đã thanh toán", tone: "bg-success-container text-success" },
  CANCELLED: { label: "Đã hủy", tone: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "bg-primary-container text-primary-strong" },
};

export const PAYMENT_METHOD_LABELS = {
  CASH: "Tiền mặt",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
};

const TXN_STATUS_LABELS = {
  SUCCESS: "Thành công",
  PENDING: "Đang xử lý",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

/**
 * Drawer chi tiết hóa đơn — dữ liệu thật từ booking (kèm invoice + payment).
 * "Lịch sử thanh toán" gọi thật GET /payments/{id}/transactions khi mở.
 * BE chưa có khái niệm đối soát/audit/invoice URL → empty state, không fake.
 * invoice: { invoiceCode, bookingCode, customerName, phone, garageName,
 *   serviceName, subtotal, discount, totalAmount, status, issuedAt, paidAt,
 *   paymentMethod, paymentStatus, paymentId }
 */
export function AdminInvoiceDrawer({ invoice, open, onOpenChange }) {
  const [transactions, setTransactions] = useState(null); // null = đang tải
  const [txnError, setTxnError] = useState(false);

  useEffect(() => {
    if (!open || !invoice?.paymentId) {
      setTransactions(invoice?.paymentId ? null : []);
      return;
    }
    let mounted = true;
    setTransactions(null);
    setTxnError(false);
    paymentApi.getPaymentTransactions(invoice.paymentId)
      .then((d) => { if (mounted) setTransactions(Array.isArray(d) ? d : []); })
      .catch(() => { if (mounted) { setTransactions([]); setTxnError(true); } });
    return () => { mounted = false; };
  }, [open, invoice?.paymentId]);

  if (!invoice) return null;

  const st = INVOICE_STATUS[invoice.status] || { label: invoice.status || "—", tone: "bg-muted text-muted-foreground" };
  const rows = [
    ["Mã booking", invoice.bookingCode || "Booking chưa cập nhật"],
    ["Khách hàng", friendlyName(invoice.customerName, "Khách hàng chưa cập nhật")],
    ["Số điện thoại", friendlyName(invoice.phone, "SĐT chưa cập nhật")],
    ["Chi nhánh", friendlyName(invoice.garageName, "Chi nhánh chưa cập nhật")],
    ["Dịch vụ", friendlyName(invoice.serviceName, "Dịch vụ chưa cập nhật")],
    ["Tạm tính", formatMoney(invoice.subtotal)],
    ["Giảm giá", formatMoney(invoice.discount)],
    ["Tổng tiền", formatMoney(invoice.totalAmount)],
    ["Phương thức", PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod || "Chưa có dữ liệu thanh toán"],
    ["Ngày phát hành", invoice.issuedAt ? formatDateTime(invoice.issuedAt) : "—"],
    ["Ngày thanh toán", invoice.paidAt ? formatDateTime(invoice.paidAt) : "Chưa thanh toán"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(invoice.invoiceCode, "Hóa đơn chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết hóa đơn</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>{st.label}</span>
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Lịch sử thanh toán — thật từ GET /payments/{id}/transactions */}
        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử thanh toán</p>
          {transactions === null ? (
            <p className="mt-1 text-xs text-neutral-muted">Đang tải...</p>
          ) : transactions.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">
              {txnError ? "Không tải được lịch sử thanh toán." : "Chưa có giao dịch thanh toán."}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <b className="text-foreground">{formatMoney(t.amount)}</b>
                    <span className="ml-1.5 text-muted-foreground">
                      {t.provider || "—"} · {t.createdAt ? formatDate(t.createdAt) : "—"}
                    </span>
                  </div>
                  <span className="shrink-0 font-bold text-muted-foreground">
                    {TXN_STATUS_LABELS[t.status] || t.status || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BE chưa có khái niệm đối soát / audit / file hóa đơn */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Đối soát</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu đối soát từ hệ thống.</p>
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử thao tác</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch sử thao tác.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
