import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import {
  CheckCircle2,
  Clock,
  Copy,
  QrCode,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { bookingApi } from "@/api/bookingApi";
import { paymentApi } from "@/api/paymentApi";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";


import {
  WASHMATE_BANK,
  buildQrContent,
  generateTransferContent,
} from "@/lib/payment-config";
import { cn } from "@/lib/utils";

const methods = [
  ["CASH", "Tiền mặt tại gara", Wallet],
  ["VNPAY", "Thanh toán qua VNPAY", QrCode],
];

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!value) return;
    const text = String(value);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function fallbackCopy(text) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
        copied
          ? "bg-success-container text-success"
          : "bg-muted text-muted-foreground hover:bg-border",
      )}
    >
      <Copy size={14} />
      {copied ? "Đã sao chép" : label}
    </button>
  );
}

function BankTransferBlock({ booking, transferContent }) {
  const amount = booking.finalAmount;
  const qrContent = useMemo(
    () =>
      buildQrContent({
        bankName: WASHMATE_BANK.bankName,
        accountNumber: WASHMATE_BANK.accountNumber,
        accountName: WASHMATE_BANK.accountName,
        amount,
        transferContent,
      }),
    [amount, transferContent],
  );

  const rows = [
    ["Ngân hàng", WASHMATE_BANK.bankName, null],
    ["Số tài khoản", WASHMATE_BANK.accountNumber, WASHMATE_BANK.accountNumber],
    ["Chủ tài khoản", WASHMATE_BANK.accountName, null],
    ["Số tiền", formatMoney(amount), String(amount)],
    ["Nội dung chuyển khoản", transferContent, transferContent],
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-primary-container/40">
      <div className="border-b border-primary/15 px-5 py-4">
        <h3 className="text-sm font-extrabold text-primary-strong">Quét mã QR để thanh toán</h3>
        <p className="mt-0.5 text-xs text-primary">
          Vui lòng chuyển đúng nội dung để hệ thống đối soát nhanh hơn.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start">
        {/* QR code */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="rounded-2xl border border-primary/15 bg-card p-3 shadow-sm">
            <QRCodeSVG value={qrContent} size={220} level="M" includeMargin={false} />
          </div>
          <p className="text-xs font-bold text-primary-strong">{WASHMATE_BANK.bankName}</p>
        </div>

        {/* Bank details */}
        <div className="flex-1 space-y-3">
          {rows.map(([label, display, copyValue]) => (
            <div key={label} className="rounded-2xl border border-primary/15 bg-card p-4">
              <p className="text-xs font-semibold text-neutral-muted">{label}</p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "font-extrabold",
                    label === "Nội dung chuyển khoản"
                      ? "text-sm text-primary-strong"
                      : label === "Số tiền"
                        ? "text-base text-success"
                        : "text-sm text-foreground",
                  )}
                >
                  {display}
                </span>
                {copyValue && <CopyButton value={copyValue} label="Sao chép" />}
              </div>
            </div>
          ))}

          <p className="rounded-2xl border border-warning/20 bg-warning-container px-4 py-3 text-xs text-warning">
            <strong>Lưu ý:</strong> Nhập đúng nội dung{" "}
            <strong className="text-warning">{transferContent}</strong> để hệ thống
            tự động đối soát giao dịch.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPaymentPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [method, setMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadPayment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingData, paymentData] = await Promise.all([
        bookingApi.getBookingById(bookingId).then(normalizeBooking),
        paymentApi.getPaymentByBookingId(bookingId).then(normalizePayment),
      ]);
      setBooking(normalizeBooking({ ...bookingData, payment: paymentData, paymentStatus: paymentData.status }));
      setPayment(paymentData);
      setMethod(paymentData.method && paymentData.method !== "BANK_TRANSFER" ? paymentData.method : "VNPAY");
    } catch (e) {
      setError("Không thể tải thông tin thanh toán.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  // Stable transfer content derived from booking fields — no random component
  const transferContent = useMemo(() => {
    if (!booking) return "";
    return generateTransferContent(booking.code, booking.customerName || "");
  }, [booking]);

  async function processPayment() {
    if (!booking) return;
    setProcessing(true);
    setError("");

    try {
      if (!payment?.id) throw new Error("Thanh toán chưa sẵn sàng.");
      if (method === "VNPAY") {
        const response = await paymentApi.createVnpayUrl(payment.id);
        if (response?.paymentUrl) {
          window.location.assign(response.paymentUrl);
        } else {
          throw new Error("Không thể tạo URL thanh toán VNPay.");
        }
      }
    } catch (e) {
      console.error("Failed to process payment:", e);
      setError(e?.message || "Không thể xử lý thanh toán.");
      setProcessing(false);
    }
  }



  /* ── Loading / error / guard states ── */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground">
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <XCircle className="mx-auto text-critical" />
          <h1 className="mt-4 text-xl font-extrabold text-critical">Không thể tải dữ liệu lịch đặt</h1>
          <p className="mt-2 text-sm text-critical">{error}</p>
          <Button onClick={loadPayment} className="mt-5 bg-critical text-white hover:bg-critical/90">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (booking.bookingStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-warning/30 bg-warning-container p-10 text-center">
          <Clock className="mx-auto text-warning" size={40} />
          <h1 className="mt-4 text-xl font-extrabold text-warning">Chưa thể thanh toán</h1>
          <p className="mt-2 text-sm text-warning">
            Lịch đặt cần được gara xác nhận trước khi thanh toán.
          </p>
          <p className="mt-1 text-sm font-bold text-warning">
            Vui lòng chờ gara xác nhận và kiểm tra lại thông báo của bạn.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-6 border-warning/40 text-warning"
            render={<Link to="/khach-hang/lich-dat" />}
          >
            Quay lại lịch đặt
          </Button>
        </div>
      </div>
    );
  }

  if (booking.bookingStatus === "REJECTED") {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <XCircle className="mx-auto text-critical" size={40} />
          <h1 className="mt-4 text-xl font-extrabold text-critical">Gara từ chối lịch đặt</h1>
          <p className="mt-2 text-sm text-critical">
            Gara không thể nhận lịch này. Không thể thực hiện thanh toán.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" size="lg" className="text-ink-soft" render={<Link to="/khach-hang/lich-dat" />}>
              Quay lại lịch đặt
            </Button>
            <Button size="lg" className="bg-critical text-white hover:bg-critical/90" render={<Link to="/khach-hang/dat-lich-moi" />}>
              Đặt lịch mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main payment view ── */

  const paid = payment?.status === "PAID";

  return (
    <PageContainer variant="customer">
      <PageHeader
        title="Thanh toán lịch đặt"
        description="Gara đã xác nhận lịch. Thanh toán để giữ khung giờ của bạn."
      />



      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left: payment method + QR ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Phương thức thanh toán</h2>
            <StatusBadge status={payment?.status || "PENDING"} type="payment" />
          </div>

          {payment?.status === "FAILED" && (
            <p className="mt-5 rounded-2xl border border-critical/25 bg-critical-container p-4 text-sm font-semibold text-critical">
              Thanh toán thất bại. Vui lòng thử lại.
            </p>
          )}
          {payment?.status === "CANCELLED" && (
            <p className="mt-5 rounded-2xl border border-warning/25 bg-warning-container p-4 text-sm font-semibold text-warning">
              Giao dịch thanh toán đã bị hủy. Lịch đặt này không thể thanh toán tiếp. Vui lòng đặt lịch mới.
            </p>
          )}

          {!paid && payment?.status !== "CANCELLED" && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {methods.map(([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left transition",
                    method === value
                      ? "border-primary bg-primary-container text-primary"
                      : "border-border",
                  )}
                >
                  <Icon size={20} />
                  <strong className="mt-3 block text-sm">{label}</strong>
                </button>
              ))}
            </div>
          )}

          {/* ── Per-method supplementary content ── */}
          {!paid && payment?.status !== "CANCELLED" && method === "VNPAY" && (
            <BankTransferBlock booking={booking} transferContent={transferContent} />
          )}

          {!paid && payment?.status !== "CANCELLED" && method === "CASH" && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm text-ink-soft">
              <strong className="block font-extrabold">Thanh toán tại gara</strong>
              <p className="mt-2 leading-6">
                Bạn sẽ thanh toán trực tiếp tại gara sau khi hoàn tất dịch vụ. Nhân viên sẽ xuất
                hóa đơn và ghi nhận thanh toán tại chỗ.
              </p>
            </div>
          )}



          {/* ── Confirm / paid result ── */}
          {!paid ? (
            payment?.status === "CANCELLED" ? (
              <div className="mt-6 flex justify-center gap-3">
                <Button size="xl" className="w-full" render={<Link to="/khach-hang/dat-lich-moi" />}>
                  Đặt lịch mới
                </Button>
              </div>
            ) : method === "VNPAY" ? (
              <Button
                size="xl"
                onClick={processPayment}
                disabled={processing}
                className="mt-6 w-full shadow-cta"
              >
                {processing ? "Đang tạo URL thanh toán..." : "Thanh toán qua VNPAY"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="xl"
                className="mt-6 w-full text-primary"
                render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}
              >
                Quay lại chi tiết lịch đặt
              </Button>
            )
          ) : (
            <div className="mt-6 rounded-2xl border border-success/25 bg-success-container p-6 text-success">
              <p className="flex items-center gap-2 text-lg font-extrabold">
                <CheckCircle2 /> Thanh toán thành công
              </p>
              <p className="mt-2 text-sm">
                Phương thức: {paymentMethodLabels[payment.method] || payment.method}
              </p>
              {payment.transferContent && (
                <p className="mt-1 text-sm">
                  Nội dung: <strong>{payment.transferContent}</strong>
                </p>
              )}
              <p className="mt-1 text-sm">
                Mã giao dịch: {payment.transactionCode || "Đang cập nhật"}
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-critical-container p-4 text-sm font-semibold text-critical">
              {error}
            </p>
          )}
        </section>

        {/* ── Right: summary ── */}
        <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Tóm tắt thanh toán</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Mã booking", booking.code],
              ["Dịch vụ", booking.serviceName],
              ["Gara", booking.garageName],
              ["Xe", `${booking.vehicle} · ${booking.plate}`],
              ["Ngày giờ", `${formatBookingDate(booking.bookingDate)} · ${booking.slotTime}`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span>Giá dịch vụ</span>
              <strong>{formatMoney(booking.amount)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá</span>
              <strong>-{formatMoney(booking.discount)}</strong>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Tổng cần thanh toán</span>
              <strong className="text-primary">{formatMoney(booking.finalAmount)}</strong>
            </div>
          </div>
        </aside>
      </div>

      {paid && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="lg" render={<Link to={`/khach-hang/lich-dat/${booking.id}`} />}>
            Xem chi tiết lịch đặt
          </Button>
          <Button size="lg" render={<Link to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`} />}>
            Xem hóa đơn
          </Button>
          <Button variant="outline" size="lg" render={<Link to="/khach-hang" />}>
            Về trang khách hàng
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
