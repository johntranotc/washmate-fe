import { useEffect } from "react";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

/**
 * Modal xác nhận đổi quà. Gọi API redeem THẬT ở component cha qua onConfirm — không tự trừ điểm.
 * Props: reward (null = đóng), availablePoints, submitting, onClose, onConfirm.
 */
export function RedeemRewardDialog({ reward, availablePoints, submitting = false, onClose, onConfirm }) {
  const open = Boolean(reward);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && !submitting && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const avail = Number(availablePoints || 0);
  const required = Number(reward.pointsRequired || 0);
  const remaining = Math.max(0, avail - required);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-floating" role="dialog" aria-modal="true" aria-label="Xác nhận đổi quà">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Gift size={20} />
            </span>
            <h2 className="text-lg font-extrabold">Xác nhận đổi quà</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <strong className="text-base">{reward.name}</strong>
          {reward.description && <p className="mt-1 text-sm text-muted-foreground">{reward.description}</p>}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-sm font-bold text-primary">
            <Sparkles size={14} /> {fmt(required)} điểm
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl bg-surface p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Điểm hiện có</span>
            <span className="font-semibold">{fmt(avail)} điểm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Điểm sử dụng</span>
            <span className="font-semibold text-warning">-{fmt(required)} điểm</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="font-bold">Điểm còn lại</span>
            <strong className="text-primary">{fmt(remaining)} điểm</strong>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Ưu đãi được áp dụng sau khi hệ thống xác nhận đổi điểm thành công.
        </p>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button size="lg" className="flex-1 shadow-cta" onClick={() => onConfirm(reward)} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Xác nhận đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RedeemRewardDialog;
