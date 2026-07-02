import { useState, useEffect } from "react";
import { Info, CalendarDays, Car, MapPin, Sparkles, Wallet, CreditCard, QrCode, Tag, BadgePercent, CheckCircle2, X } from "lucide-react";
import { formatCurrency, formatDate, getGarageId } from "@/lib/booking-flow";
import { promotionApi } from "@/api/promotionApi";

const VIETNAMESE_PROMOTIONS = [
  {
    code: "WASH10",
    title: "Giảm 10% phí dịch vụ",
    description: "Áp dụng cho mọi dịch vụ rửa xe tại WashMate (tối đa 30.000đ)",
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscount: 30000,
  },
  {
    code: "VIP20K",
    title: "Giảm trực tiếp 20.000đ",
    description: "Ưu đãi đặc biệt cho gói Chăm Sóc & Phủ Bóng VIP",
    discountType: "FIXED",
    discountValue: 20000,
  },
  {
    code: "BANMOI15K",
    title: "Bạn mới giảm 15.000đ",
    description: "Khuyến mãi chào mừng khách hàng lần đầu đặt lịch",
    discountType: "FIXED",
    discountValue: 15000,
  },
];

export function BookingReviewStep({
  selection,
  note,
  onNoteChange,
  paymentMethod = "CASH",
  onPaymentMethodChange,
  promotion,
  onSelectPromotion,
}) {
  const { vehicle, service, garage, date, slot } = selection;
  const [inputCode, setInputCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [apiPromotions, setApiPromotions] = useState([]);

  useEffect(() => {
    const garageId = getGarageId(selection?.garage) || selection?.service?.garageId || 1;
    promotionApi.getAvailablePromotions(garageId).then((list) => {
      setApiPromotions(Array.isArray(list) ? list : []);
    }).catch(() => {
      setApiPromotions([]);
    });
  }, [selection?.garage, selection?.service]);

  const basePrice = service?.price || 0;

  function calculateDiscount(promo) {
    if (!promo || !basePrice) return 0;
    const isPercent = String(promo.discountType || "").toUpperCase().includes("PERCENT");
    if (isPercent) {
      const disc = (basePrice * promo.discountValue) / 100;
      return promo.maxDiscount ? Math.min(disc, promo.maxDiscount) : disc;
    }
    return Math.min(promo.discountValue || 0, basePrice);
  }

  const discountAmount = calculateDiscount(promotion);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  function handleApplyCode() {
    setPromoError("");
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Vui lòng nhập mã ưu đãi.");
      return;
    }
    const found = apiPromotions.find((p) => p.code === code);
    if (found) {
      onSelectPromotion?.(found);
      setInputCode("");
    } else {
      setPromoError("Mã khuyến mãi không tồn tại, đã hết hạn hoặc không áp dụng cho Gara này.");
    }
  }

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
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className="grid gap-4 md:grid-cols-2 self-start">
        {items.map(({ icon: Icon, title, lines, debug }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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

      <aside className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm self-start">
        {/* Ưu đãi & Khuyến mãi */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-primary font-extrabold text-sm">
              <Tag size={18} />
              <span>Mã ưu đãi & Khuyến mãi</span>
            </div>
            {promotion && (
              <button
                type="button"
                onClick={() => onSelectPromotion?.(null)}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <X size={14} /> Gỡ bỏ
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Nhập mã (VD: WASH10)..."
              className="flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={handleApplyCode}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold text-white hover:bg-primary/90 transition shadow-sm shrink-0"
            >
              Áp dụng
            </button>
          </div>
          {promoError && <p className="text-[11px] font-semibold text-red-600 mb-2">{promoError}</p>}

          <div className="space-y-2 mt-3">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Hoặc chọn ưu đãi khả dụng:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {apiPromotions.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Chưa có mã khuyến mãi nào đang áp dụng cho Gara này.</p>
              ) : (
                apiPromotions.map((p) => {
                const isSelected = promotion?.code === p.code;
                return (
                  <div
                    key={p.code}
                    onClick={() => onSelectPromotion?.(isSelected ? null : p)}
                    className={`cursor-pointer rounded-xl border p-2.5 transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-blue-100/80 bg-white hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${isSelected ? "bg-primary text-white" : "bg-blue-100 text-blue-700"}`}>
                        <BadgePercent size={15} />
                      </span>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{p.code}</span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            -{formatCurrency(calculateDiscount(p))}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{p.title}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 size={18} className="text-primary" />
                      ) : (
                        <span className="text-[11px] font-bold text-primary hover:underline">Chọn</span>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Bảng tóm tắt chi phí thanh toán */}
        <div className="rounded-2xl bg-muted/60 p-4 space-y-2 text-sm border border-border/70">
          <div className="flex justify-between text-muted-foreground">
            <span>Giá dịch vụ:</span>
            <span className="font-semibold text-foreground">{formatCurrency(basePrice)}</span>
          </div>
          {promotion && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Ưu đãi ({promotion.code}):</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="border-t border-border/80 pt-2.5 flex justify-between items-center font-extrabold">
            <span className="text-foreground">Tổng thanh toán:</span>
            <span className="text-primary text-lg">{formatCurrency(finalPrice)}</span>
          </div>
        </div>

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
              onClick={() => onPaymentMethodChange?.("VNPAY")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "VNPAY"
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <QrCode className="size-6 mb-1.5" />
              <span className="text-xs">Chuyển khoản / VNPAY</span>
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
              : "Bạn có thể thanh toán bằng Mã QR VNPay tiện lợi."}
          </p>
        </div>
      </aside>
    </div>
  );
}
