import { useEffect } from "react";
import { BadgePercent, CheckCircle2, Sparkles, X } from "lucide-react";
import { TierBadge, tierLabel } from "@/components/customer-portal/tier-badge";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

/**
 * Drawer quyền lợi hạng thành viên. Dữ liệu hạng từ API tier thật.
 * Props: tier (null = đóng), account, isCurrent, onClose.
 */
export function TierDetailDrawer({ tier, account, isCurrent = false, onClose }) {
  const open = Boolean(tier);

  useEffect(() => {
    if (!open) return undefined;
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

  const points = Number(account?.totalPoints || 0);
  const reached = points >= tier.minPoints;
  const missing = Math.max(0, tier.minPoints - points);
  const hasDiscount = tier.discountPercentage != null && tier.discountPercentage > 0;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Chi tiết hạng thành viên">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <aside className="wm-drawer-panel absolute inset-y-0 right-0 flex w-[min(28rem,100vw)] flex-col bg-card shadow-floating">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <TierBadge name={tier.name} size="size-11" iconSize={22} />
            <div>
              <h2 className="text-lg font-extrabold">{tierLabel(tier.name)}</h2>
              {isCurrent && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-container px-2 py-0.5 text-xs font-bold text-primary">
                  <CheckCircle2 size={12} /> Hạng hiện tại
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold text-muted-foreground">Điểm yêu cầu</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-lg font-extrabold">
              <Sparkles size={16} className="text-primary" /> {fmt(tier.minPoints)} điểm
            </p>
          </div>

          <h3 className="mt-5 text-sm font-extrabold text-muted-foreground">Quyền lợi</h3>
          {hasDiscount ? (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-border p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-container text-success">
                <BadgePercent size={18} />
              </span>
              <div>
                <p className="font-bold">Giảm {Number(tier.discountPercentage)}% mỗi lần rửa xe</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Tự động áp dụng khi bạn đạt hạng này.</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-sm text-muted-foreground">Chưa có dữ liệu quyền lợi.</p>
          )}

          <h3 className="mt-6 text-sm font-extrabold text-muted-foreground">Trạng thái của bạn</h3>
          <div className="mt-3 rounded-xl border border-border p-4 text-sm">
            {reached ? (
              <p className="inline-flex items-center gap-2 font-semibold text-success">
                <CheckCircle2 size={16} /> Bạn đã đạt hạng này
              </p>
            ) : (
              <p className="font-semibold text-warning">Cần thêm {fmt(missing)} điểm để đạt hạng này</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Điểm tích lũy hiện tại: <b className="text-foreground">{fmt(points)} điểm</b>
            </p>
          </div>

          {tier.maintainPoints != null && tier.maintainPoints > 0 && (
            <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
              Điểm duy trì hạng: {fmt(tier.maintainPoints)} điểm.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default TierDetailDrawer;
