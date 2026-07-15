import { ArrowRight, CalendarDays, Car, Clock3, Droplets, MapPin, SendHorizonal, Wallet, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/booking-flow";

export function BookingSuccessStep({ result, selection, paymentMethod = "CASH", promotion, discountAmount, tier }) {
  const promo = promotion || selection?.promotion || result?.promotion;
  // Tổng giảm THẬT do BE tính khi tạo booking (gồm cả giảm theo hạng + mã ưu đãi).
  const disc = Number(discountAmount ?? selection?.discountAmount ?? result?.discountAmount ?? result?.discount ?? 0);
  const basePrice = Number(selection.service?.price || 0);
  const finalPrice = result?.finalAmount != null ? Number(result.finalAmount) : Math.max(0, basePrice - disc);

  // Tách tổng giảm của BE thành 2 phần để khách thấy rõ: theo hạng thành viên và theo mã.
  const tierPercent = Number(tier?.percent ?? 0);
  const tierPart = tierPercent > 0 ? Math.min(Math.round((basePrice * tierPercent) / 100), disc) : 0;
  const promoPart = Math.max(0, disc - tierPart);

  const summaryRows = [
    { icon: MapPin, label: "Gara", value: selection.garage?.name },
    { icon: Droplets, label: "Dịch vụ", value: `${selection.service?.name} — ${formatCurrency(basePrice)}` },
    ...(tierPart > 0 ? [
      {
        icon: Tag,
        label: "Ưu đãi thành viên",
        value: `Hạng ${tier.name} -${tierPercent}% (-${formatCurrency(tierPart)})`,
        highlight: true,
      }
    ] : []),
    ...(promoPart > 0 ? [
      {
        icon: Tag,
        label: promo?.code ? "Mã giảm giá" : "Ưu đãi giảm giá",
        value: promo?.code ? `${promo.code} (-${formatCurrency(promoPart)})` : `Giảm giá (-${formatCurrency(promoPart)})`,
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
        <div className="h-1.5 bg-primary" />

        <div className="p-8 sm:p-10 text-center">
          {/* Icon */}
          <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-success-container text-success">
            <SendHorizonal size={36} />
          </span>

          <h2 className="mt-6 text-2xl font-extrabold text-foreground sm:text-3xl">
            Yêu cầu đặt lịch đã được gửi!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            Gara sẽ xác nhận lịch của bạn trong thời gian sớm nhất. Bạn sẽ nhận được
            thông báo khi gara xác nhận.
          </p>

          {/* Status badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning-container px-5 py-2.5">
            <span className="size-2 rounded-full bg-warning" />
            <span className="text-sm font-extrabold text-warning">Chờ gara xác nhận</span>
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
          <h3 className="mb-4 text-xs font-semibold text-muted-foreground">
            Thông tin đặt lịch
          </h3>
          <dl className="space-y-3">
            {summaryRows.map(({ icon: Icon, label, value, highlight, isTotal }) => (
              <div key={label} className={`flex items-start gap-3 ${isTotal ? "border-t border-dashed border-border pt-3 font-extrabold" : ""}`}>
                <Icon size={16} className={`mt-0.5 shrink-0 ${highlight ? "text-success" : "text-primary"}`} />
                <div className="flex-1 flex items-start justify-between gap-2 text-sm">
                  <dt className="text-muted-foreground shrink-0">{label}</dt>
                  <dd className={`font-semibold text-right ${highlight ? "text-success font-extrabold bg-success-container px-2.5 py-0.5 rounded-md border border-success/25" : isTotal ? "text-primary font-black text-base" : "text-foreground"}`}>{value || "—"}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Payment note */}
        <div className="border-t border-border bg-warning-container/60 px-8 py-4 sm:px-10">
          <p className="text-xs text-warning text-center font-semibold">
            {paymentMethod === "CASH"
              ? "Vui lòng chuẩn bị tiền mặt thanh toán sau khi gara hoàn tất rửa xe."
              : "Lịch hẹn đang xử lý. Bạn sẽ tiến hành quét mã chuyển khoản sau khi gara xác nhận."}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-border p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="shadow-cta" render={<Link to="/khach-hang/lich-dat" />}>
              Xem lịch đặt <ArrowRight />
            </Button>
            <Button variant="outline" size="lg" render={<Link to="/khach-hang" />}>
              Về trang khách hàng
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
