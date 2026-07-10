import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgePercent, CalendarClock, Check, Copy, MapPin, Store, Ticket, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBookingDate } from "@/lib/customer-booking-data";
import { daysLeft, discountLabel, promotionState, promotionTitle } from "@/lib/customer-promotion-data";

const fmtMoney = (n) => `${new Intl.NumberFormat("vi-VN").format(Number(n || 0))}đ`;
const EMPTY = "—";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={16} /></span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-bold break-words">{value || EMPTY}</dd>
      </div>
    </div>
  );
}

/**
 * Drawer chi tiết ưu đãi. Dữ liệu từ promotion đã chuẩn hoá (thật). "Dùng ngay" dẫn sang đặt lịch
 * (ưu đãi áp dụng ở bước thanh toán) — không có API "dùng ưu đãi" riêng nên không fake trạng thái đã dùng.
 * Props: promo (null = đóng), onClose.
 */
export function PromotionDetailDrawer({ promo, onClose }) {
  const open = Boolean(promo);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    setCopied(false);
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const state = promotionState(promo);
  const d = daysLeft(promo);

  const copyCode = () => {
    if (!promo.code) return;
    navigator.clipboard?.writeText(promo.code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Chi tiết ưu đãi">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <aside className="wm-drawer-panel absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-card shadow-floating">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BadgePercent size={22} /></span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold">{discountLabel(promo)}</h2>
              <p className="truncate text-xs text-muted-foreground">{promotionTitle(promo)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${state.key === "expiring" ? "bg-warning-container text-warning" : "bg-success-container text-success"}`}>
              {state.label}
            </span>
          </div>

          {/* Mã ưu đãi */}
          {promo.code && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-container/40 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Mã ưu đãi</p>
                <p className="font-mono text-lg font-extrabold tracking-wider text-primary">{promo.code}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyCode}>
                {copied ? <><Check size={15} /> Đã chép</> : <><Copy size={15} /> Sao chép</>}
              </Button>
            </div>
          )}

          <h3 className="mt-6 text-sm font-extrabold text-muted-foreground">Điều kiện áp dụng</h3>
          <dl className="mt-3 grid gap-4">
            <Row icon={Ticket} label="Loại ưu đãi" value={promo.discountType === "PERCENTAGE" ? "Giảm theo phần trăm" : "Giảm trực tiếp"} />
            <Row icon={Wallet} label="Đơn tối thiểu" value={promo.minOrderValue > 0 ? fmtMoney(promo.minOrderValue) : "Không yêu cầu"} />
            {promo.discountType === "PERCENTAGE" && (
              <Row icon={BadgePercent} label="Giảm tối đa" value={promo.maxDiscount ? fmtMoney(promo.maxDiscount) : "Không giới hạn"} />
            )}
            <Row icon={Ticket} label="Lượt còn lại" value={promo.remainingUses == null ? "Không giới hạn" : `${promo.remainingUses} lượt`} />
            <Row icon={Store} label="Chi nhánh áp dụng" value={promo.garageName || "Hệ thống WashMate"} />
          </dl>

          <h3 className="mt-6 text-sm font-extrabold text-muted-foreground">Thời gian</h3>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <Row icon={CalendarClock} label="Bắt đầu" value={promo.startDate ? formatBookingDate(promo.startDate) : ""} />
            <Row icon={CalendarClock} label="Kết thúc" value={promo.endDate ? formatBookingDate(promo.endDate) : ""} />
          </dl>
          {d != null && d >= 0 && d <= 7 && (
            <p className="mt-3 rounded-xl bg-warning-container/60 px-3 py-2 text-xs font-semibold text-warning">
              {d === 0 ? "Ưu đãi hết hạn hôm nay." : `Ưu đãi còn ${d} ngày sử dụng.`}
            </p>
          )}

          <p className="mt-5 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted-foreground">
            <MapPin size={13} className="mr-1 inline" />
            Ưu đãi sẽ hiển thị trong bước thanh toán khi đơn của bạn đủ điều kiện.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border p-5">
          <Button size="lg" className="w-full shadow-cta" onClick={() => { onClose?.(); navigate("/khach-hang/dat-lich-moi"); }}>
            Đặt lịch để dùng ưu đãi
          </Button>
          {promo.code && (
            <Button variant="outline" size="lg" className="w-full" onClick={copyCode}>
              {copied ? <><Check size={17} /> Đã sao chép mã</> : <><Copy size={17} /> Sao chép mã</>}
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default PromotionDetailDrawer;
