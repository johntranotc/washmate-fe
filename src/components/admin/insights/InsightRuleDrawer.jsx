import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { adminApi } from "@/api/adminApi";
import { friendlyName } from "@/lib/format";

const SEVERITY_LABELS = {
  CRITICAL: "Nghiêm trọng",
  WARNING: "Cảnh báo",
  OPPORTUNITY: "Cơ hội",
  POSITIVE: "Tích cực",
};

const SEVERITY_TONES = {
  CRITICAL: "bg-critical-container text-critical",
  WARNING: "bg-warning-container text-warning",
  OPPORTUNITY: "bg-primary-container text-primary-strong",
  POSITIVE: "bg-success-container text-success",
};

const OPERATOR_LABELS = {
  GREATER_THAN: "lớn hơn",
  GREATER_THAN_OR_EQUAL: "từ",
  LESS_THAN: "nhỏ hơn",
  LESS_THAN_OR_EQUAL: "tối đa",
  EQUAL: "bằng",
  EQUALS: "bằng",
};

/**
 * Drawer "Cấu hình rule" — danh sách rule insight thật từ GET /owner/insight-rules.
 * Bật/tắt rule và CHỈNH NGƯỠNG cảnh báo qua PATCH /owner/insight-rules/{id}
 * (BE nhận { thresholdValue, active, ... }). Mọi thay đổi đều confirm, không fake.
 */
export function InsightRuleDrawer({ open, onOpenChange, onChanged }) {
  const [rules, setRules] = useState(null); // null = đang tải
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // { id, value }

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setRules(null);
    setError(null);
    setEditing(null);
    adminApi.getInsightRules()
      .then((d) => { if (mounted) setRules(Array.isArray(d) ? d : []); })
      .catch((e) => { if (mounted) { setRules([]); setError(e?.message || "Không thể tải cấu hình rule."); } });
    return () => { mounted = false; };
  }, [open]);

  async function handleToggle(rule) {
    const turningOff = rule.active;
    const ok = await confirmDialog({
      title: turningOff ? "Tắt rule này?" : "Bật rule này?",
      description: `${friendlyName(rule.ruleName, "Rule")} — ${turningOff
        ? "hệ thống sẽ ngừng tạo insight từ rule này."
        : "hệ thống sẽ tạo insight từ rule này ở lần phân tích tiếp theo."}`,
      confirmLabel: turningOff ? "Tắt rule" : "Bật rule",
      destructive: turningOff,
    });
    if (!ok) return;
    setBusyId(rule.id);
    try {
      await adminApi.updateInsightRule(rule.id, { active: !rule.active });
      toast.success(turningOff ? "Đã tắt rule" : "Đã bật rule", {
        description: friendlyName(rule.ruleName, "Rule"),
      });
      setRules((list) => list.map((r) => (r.id === rule.id ? { ...r, active: !rule.active } : r)));
      onChanged?.();
    } catch (e) {
      toast.error("Không thể cập nhật rule", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveThreshold(rule) {
    const value = Number(editing?.value);
    if (!Number.isFinite(value)) {
      toast.error("Ngưỡng không hợp lệ", { description: "Vui lòng nhập một số hợp lệ." });
      return;
    }
    const ok = await confirmDialog({
      title: "Cập nhật ngưỡng cảnh báo?",
      description: `${friendlyName(rule.ruleName, "Rule")}: ngưỡng ${operatorText(rule)} ${String(rule.thresholdValue)} → ${operatorText(rule)} ${value}.`,
      confirmLabel: "Lưu ngưỡng",
    });
    if (!ok) return;
    setBusyId(rule.id);
    try {
      await adminApi.updateInsightRule(rule.id, { thresholdValue: value });
      toast.success("Đã cập nhật ngưỡng", {
        description: `${friendlyName(rule.ruleName, "Rule")} · ${operatorText(rule)} ${value}`,
      });
      setRules((list) => list.map((r) => (r.id === rule.id ? { ...r, thresholdValue: value } : r)));
      setEditing(null);
      onChanged?.();
    } catch (e) {
      toast.error("Không thể cập nhật ngưỡng", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  function operatorText(rule) {
    return OPERATOR_LABELS[rule.comparisonOperator] || rule.comparisonOperator || "";
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Cấu hình rule phân tích</AlertDialogTitle>
          <AlertDialogDescription>
            Bật/tắt rule và điều chỉnh ngưỡng cảnh báo cho từng rule insight.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-2">
          {rules === null ? (
            <p className="py-8 text-center text-xs text-neutral-muted">Đang tải cấu hình...</p>
          ) : error ? (
            <p className="py-8 text-center text-xs font-bold text-critical">{error}</p>
          ) : rules.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-muted">Chưa có rule nào được cấu hình.</p>
          ) : (
            rules.map((rule) => {
              const busy = busyId === rule.id;
              const isEditing = editing?.id === rule.id;
              const isActive = rule.active === true;
              return (
                <div key={rule.id} className="rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <b className="text-sm text-foreground">{friendlyName(rule.ruleName, "Rule chưa đặt tên")}</b>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${SEVERITY_TONES[rule.severity] || "bg-muted text-muted-foreground"}`}>
                          {SEVERITY_LABELS[rule.severity] || rule.severity}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{rule.description}</p>
                      )}
                      {rule.thresholdValue != null && !isEditing && (
                        <p className="mt-0.5 text-xs text-neutral-muted">
                          Ngưỡng: {operatorText(rule)} <b className="text-foreground">{String(rule.thresholdValue)}</b>
                        </p>
                      )}
                    </div>
                    {/* Công tắc trạng thái: gạt phải/xanh = đang bật, gạt trái/xám = đang tắt */}
                    <div className="flex shrink-0 flex-col items-center gap-1 self-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label={isActive ? "Tắt rule" : "Bật rule"}
                        disabled={busy}
                        onClick={() => handleToggle(rule)}
                        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${
                          isActive ? "bg-primary" : "bg-neutral-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-card transition-all ${
                            isActive ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {busy && !isEditing ? "..." : isActive ? "Đang bật" : "Đang tắt"}
                      </span>
                    </div>
                  </div>

                  {rule.thresholdValue != null && (
                    isEditing ? (
                      <div className="mt-2.5 flex items-center gap-2 border-t border-border pt-2.5">
                        <span className="text-xs text-muted-foreground">Ngưỡng {operatorText(rule)}</span>
                        <input
                          type="number"
                          value={editing.value}
                          onChange={(e) => setEditing({ id: rule.id, value: e.target.value })}
                          className="h-9 w-24 rounded-xl border border-input bg-background px-2.5 text-sm font-bold outline-none focus:border-ring"
                          autoFocus
                        />
                        <Button size="sm" disabled={busy} onClick={() => handleSaveThreshold(rule)}>
                          {busy ? "..." : "Lưu"}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(null)} className="text-muted-foreground">
                          Hủy
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditing({ id: rule.id, value: String(rule.thresholdValue) })}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary-container"
                      >
                        <SlidersHorizontal size={13} /> Chỉnh ngưỡng
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
