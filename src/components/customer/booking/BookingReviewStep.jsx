import { Info, CalendarDays, Car, MapPin, Sparkles, Wallet, CreditCard } from "lucide-react";
import { formatCurrency, formatDate, getGarageId } from "@/lib/booking-flow";

export function BookingReviewStep({ selection, note, onNoteChange, paymentMethod = "CASH", onPaymentMethodChange }) {
  const { vehicle, service, garage, date, slot } = selection;
  const items = [
    {
      icon: MapPin,
      title: "Gara",
      lines: [garage.name, garage.address],
      debug: `Mã gara: ${getGarageId(garage) || "Không hợp lệ"}`,
    },
    {
      icon: Sparkles,
      title: "Dịch vụ",
      lines: [service.name, formatCurrency(service.price), `Thời gian dự kiến: ${service.duration || "—"} phút`],
    },
    {
      icon: Car,
      title: "Xe",
      lines: [
        vehicle.licensePlate,
        [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
        `Màu xe: ${vehicle.color}`,
      ],
    },
    {
      icon: CalendarDays,
      title: "Lịch hẹn",
      lines: [formatDate(date), `${slot.startTime} – ${slot.endTime || "Đang cập nhật"}`],
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(({ icon: Icon, title, lines, debug }) => (
          <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={21} />
            </span>
            <h3 className="mt-4 font-extrabold text-foreground">{title}</h3>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              {lines.filter(Boolean).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {debug && (
              <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                {debug}
              </p>
            )}
          </article>
        ))}
      </div>

      <aside className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        {/* Payment Method Selection */}
        <div>
          <label className="text-sm font-extrabold text-foreground uppercase tracking-wider block mb-3">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPaymentMethodChange?.("CASH")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "CASH"
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Wallet className="size-6 mb-1.5" />
              <span className="text-xs">Tiền mặt</span>
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange?.("TRANSFER")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "TRANSFER"
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <CreditCard className="size-6 mb-1.5" />
              <span className="text-xs">Chuyển khoản</span>
            </button>
          </div>
        </div>

        <label className="text-sm font-bold text-foreground block">
          Ghi chú cho gara
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={4}
            placeholder="Ví dụ: xe có vết bẩn ở bánh trước, cần vệ sinh kỹ nội thất..."
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-muted p-4 text-sm font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          <Info className="mt-0.5 size-5 shrink-0" />
          <p>
            {paymentMethod === "CASH"
              ? "Bạn sẽ thanh toán trực tiếp bằng tiền mặt tại quầy sau khi gara xác nhận lịch và rửa xong."
              : "Gara sẽ xác nhận lịch hẹn. Bạn có thể chuyển khoản trực tiếp qua mã QR VNPay tiện lợi."}
          </p>
        </div>
      </aside>
    </div>
  );
}
