import { ArrowRight, CalendarDays, Car, Clock3, MapPin, SendHorizonal, Sparkles, Wallet, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatCurrency } from "@/lib/booking-flow";

export function BookingSuccessStep({ result, selection, paymentMethod = "CASH", promotion, discountAmount }) {
  const promo = promotion || selection?.promotion || result?.promotion;
  const disc = Number(discountAmount ?? selection?.discountAmount ?? result?.discountAmount ?? result?.discount ?? 0);
  const basePrice = Number(selection.service?.price || 0);
  const finalPrice = Math.max(0, basePrice - disc);

  const summaryRows = [
    { icon: MapPin, label: "Gara", value: selection.garage?.name },
    { icon: Sparkles, label: "Dịch vụ", value: `${selection.service?.name} — ${formatCurrency(basePrice)}` },
    ...(promo || disc > 0 ? [
      {
        icon: Tag,
        label: "Mã giảm giá",
        value: promo?.code ? `${promo.code} (-${formatCurrency(disc)})` : `Giảm giá (-${formatCurrency(disc)})`,
        highlight: true,
      }
    ] : []),
    ...(disc > 0 ? [
      {
        icon: Wallet,
        label: "Thành tiền",
        value: formatCurrency(finalPrice),
        isTotal: true,
      }
    ] : []),
    { icon: Car, label: "Xe", value: `${selection.vehicle?.licensePlate} · ${[selection.vehicle?.brand, selection.vehicle?.model].filter(Boolean).join(" ")}` },
    { icon: CalendarDays, label: "Ngày", value: formatDate(selection.date) },
    { icon: Clock3, label: "Giờ", value: `${selection.slot?.startTime} – ${selection.slot?.endTime || ""}` },
    { icon: Wallet, label: "Thanh toán", value: paymentMethod === "CASH" ? "Tiền mặt tại gara" : "Chuyển khoản VNPay" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Top accent */}
        <div className="h-2 bg-gradient-to-r from-primary to-cyan-500" />

        <div className="p-8 sm:p-10 text-center">
          {/* Icon */}
          <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <SendHorizonal size={36} />
          </span>

          {result?.isDemo && (
            <span className="mt-5 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-extrabold text-secondary-foreground">
              Dữ liệu mẫu
            </span>
          )}

          <h2 className="mt-6 text-2xl font-extrabold text-foreground sm:text-3xl">
            Yêu cầu đặt lịch đã được gửi!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            Gara sẽ xác nhận lịch của bạn trong thời gian sớm nhất. Bạn sẽ nhận được
            thông báo khi gara xác nhận.
          </p>

          {/* Status badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2.5">
            <span className="size-2 rounded-full bg-orange-400" />
            <span className="text-sm font-extrabold text-orange-700">Chờ gara xác nhận</span>
          </div>

          {/* Booking code */}
          {(result?.bookingCode || result?.bookingId) && (
            <p className="mt-4 text-xs text-muted-foreground">
              Mã đặt lịch:{" "}
              <strong className="font-extrabold text-foreground">
                {result.bookingCode || `BK-${result.bookingId}`}
              </strong>
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-border bg-muted/40 px-8 py-6 sm:px-10">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Thông tin đặt lịch
          </h3>
          <dl className="space-y-3">
            {summaryRows.map(({ icon: Icon, label, value, highlight, isTotal }) => (
              <div key={label} className={`flex items-start gap-3 ${isTotal ? "border-t border-dashed border-border pt-3 font-extrabold" : ""}`}>
                <Icon size={15} className={`mt-0.5 shrink-0 ${highlight ? "text-emerald-600" : "text-primary"}`} />
                <div className="flex-1 flex items-start justify-between gap-2 text-sm">
                  <dt className="text-muted-foreground shrink-0">{label}</dt>
                  <dd className={`font-semibold text-right ${highlight ? "text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200" : isTotal ? "text-primary font-black text-base" : "text-foreground"}`}>{value || "—"}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Payment note */}
        <div className="border-t border-border bg-amber-50/60 px-8 py-4 sm:px-10">
          <p className="text-xs text-amber-700 text-center font-semibold">
            {paymentMethod === "CASH"
              ? "Vui lòng chuẩn bị tiền mặt thanh toán sau khi gara hoàn tất rửa xe."
              : "Lịch hẹn đang xử lý. Bạn sẽ tiến hành quét mã chuyển khoản sau khi gara xác nhận."}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-border p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/khach-hang/lich-dat"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(37,99,235,.6)]"
            >
              Xem lịch đặt <ArrowRight size={17} />
            </Link>
            <Link
              to="/khach-hang"
              className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-3 font-bold text-foreground"
            >
              Về trang khách hàng
            </Link>
          </div>
        </div>
      </div>

      {result?.isDemo && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dữ liệu demo — booking đã được lưu vào{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            washmate_demo_bookings
          </code>{" "}
          (localStorage) để Staff xem.
        </p>
      )}
    </div>
  );
}
