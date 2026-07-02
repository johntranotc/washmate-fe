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
import { StatusBadge } from "@/components/customer/BookingStatusBadge";
import {
  formatBookingDate,
  formatMoney,
  normalizeBooking,
  normalizePayment,
  paymentMethodLabels,
} from "@/lib/customer-booking-data";
import { loadCustomerBookingList } from "@/lib/customer-bookings";


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
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition",
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      <Copy size={13} />
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
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/40">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-extrabold text-blue-800">Quét mã QR để thanh toán</h3>
        <p className="mt-0.5 text-xs text-blue-600">
          Vui lòng chuyển đúng nội dung để hệ thống đối soát nhanh hơn.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start">
        {/* QR code */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
            <QRCodeSVG value={qrContent} size={220} level="M" includeMargin={false} />
          </div>
          <p className="text-[11px] font-bold text-blue-700">{WASHMATE_BANK.bankName}</p>
        </div>

        {/* Bank details */}
        <div className="flex-1 space-y-3">
          {rows.map(([label, display, copyValue]) => (
            <div key={label} className="rounded-2xl border border-blue-100 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-400">{label}</p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "font-extrabold",
                    label === "Nội dung chuyển khoản"
                      ? "text-sm text-blue-700"
                      : label === "Số tiền"
                        ? "text-base text-emerald-700"
                        : "text-sm text-slate-800",
                  )}
                >
                  {display}
                </span>
                {copyValue && <CopyButton value={copyValue} label="Sao chép" />}
              </div>
            </div>
          ))}

          <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            <strong>Lưu ý:</strong> Nhập đúng nội dung{" "}
            <strong className="text-amber-800">{transferContent}</strong> để hệ thống
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
        <div className="rounded-2xl bg-white p-12 text-center text-[var(--text-muted)]">
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <XCircle className="mx-auto text-red-500" />
          <h1 className="mt-4 text-xl font-extrabold text-red-700">Không thể tải dữ liệu lịch đặt</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button onClick={loadPayment} className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (booking.bookingStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-10 text-center">
          <Clock className="mx-auto text-orange-500" size={40} />
          <h1 className="mt-4 text-xl font-extrabold text-orange-800">Chưa thể thanh toán</h1>
          <p className="mt-2 text-sm text-orange-700">
            Lịch đặt cần được gara xác nhận trước khi thanh toán.
          </p>
          <p className="mt-1 text-sm font-bold text-orange-700">
            Vui lòng chờ gara xác nhận và kiểm tra lại thông báo của bạn.
          </p>
          <Link
            to="/khach-hang/lich-dat"
            className="mt-6 inline-block rounded-2xl border border-orange-300 bg-white px-5 py-3 text-sm font-bold text-orange-700"
          >
            Quay lại lịch đặt
          </Link>
        </div>
      </div>
    );
  }

  if (booking.bookingStatus === "REJECTED") {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <XCircle className="mx-auto text-red-500" size={40} />
          <h1 className="mt-4 text-xl font-extrabold text-red-700">Gara từ chối lịch đặt</h1>
          <p className="mt-2 text-sm text-red-600">
            Gara không thể nhận lịch này. Không thể thực hiện thanh toán.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/khach-hang/lich-dat" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
              Quay lại lịch đặt
            </Link>
            <Link to="/khach-hang/dat-lich-moi" className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white">
              Đặt lịch mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main payment view ── */

  const paid = payment?.status === "PAID";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--brand-blue)]">
          Thanh toán an toàn
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Thanh toán lịch đặt</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Gara đã xác nhận lịch. Thanh toán để giữ khung giờ của bạn.
        </p>
      </header>



      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left: payment method + QR ── */}
        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Phương thức thanh toán</h2>
            <StatusBadge status={payment?.status || "PENDING"} type="payment" />
          </div>

          {payment?.status === "FAILED" && (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Thanh toán thất bại. Vui lòng thử lại.
            </p>
          )}
          {payment?.status === "CANCELLED" && (
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
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
                      ? "border-[var(--brand-blue)] bg-blue-50 text-[var(--brand-blue)]"
                      : "border-[var(--border-soft)]",
                  )}
                >
                  <Icon size={22} />
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
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
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
                <Link to="/khach-hang/dat-lich-moi" className="w-full rounded-2xl bg-[var(--brand-blue)] py-3.5 text-center font-bold text-white">
                  Đặt lịch mới
                </Link>
              </div>
            ) : method === "VNPAY" ? (
              <button
                onClick={processPayment}
                disabled={processing}
                className="mt-6 w-full rounded-2xl bg-[var(--brand-blue)] py-3.5 font-bold text-white disabled:opacity-60"
              >
                {processing ? "Đang tạo URL thanh toán..." : "Thanh toán qua VNPAY"}
              </button>
            ) : (
              <Link
                to={`/khach-hang/lich-dat/${booking.id}`}
                className="mt-6 block w-full rounded-2xl border border-[var(--border-soft)] bg-white py-3.5 text-center font-bold text-[var(--brand-blue)] hover:bg-slate-50 transition"
              >
                Quay lại chi tiết lịch đặt
              </Link>
            )
          ) : (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700">
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
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* ── Right: summary ── */}
        <aside className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
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
                <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
                <dd className="mt-1 font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 space-y-3 border-t border-[var(--border-soft)] pt-5 text-sm">
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
              <strong className="text-[var(--brand-blue)]">{formatMoney(booking.finalAmount)}</strong>
            </div>
          </div>
        </aside>
      </div>

      {paid && (
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to={`/khach-hang/lich-dat/${booking.id}`}
            className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold"
          >
            Xem chi tiết lịch đặt
          </Link>
          <Link
            to={`/khach-hang/thanh-toan/${booking.id}/hoa-don`}
            className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white"
          >
            Xem hóa đơn
          </Link>
          <Link
            to="/khach-hang"
            className="rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-bold"
          >
            Về trang khách hàng
          </Link>
        </div>
      )}
    </div>
  );
}
