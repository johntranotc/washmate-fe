import { useEffect, useState } from "react";
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

/**
 * Drawer "Cấu hình rule" — danh sách rule insight thật từ GET /owner/insight-rules,
 * bật/tắt rule qua PATCH /owner/insight-rules/{id} (có confirm, không fake).
 */
export function InsightRuleDrawer({ open, onOpenChange, onChanged }) {
  const [rules, setRules] = useState(null); // null = đang tải
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setRules(null);
    setError(null);
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Cấu hình rule phân tích</AlertDialogTitle>
          <AlertDialogDescription>
            Bật/tắt các rule tạo insight vận hành. Ngưỡng cảnh báo do hệ thống quản lý.
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
            rules.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-3.5">
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
                  {rule.thresholdValue != null && (
                    <p className="mt-0.5 text-xs text-neutral-muted">
                      Ngưỡng: {rule.comparisonOperator || ""} {String(rule.thresholdValue)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={rule.active ? "destructive" : "default"}
                  disabled={busyId === rule.id}
                  onClick={() => handleToggle(rule)}
                >
                  {busyId === rule.id ? "..." : rule.active ? "Tắt" : "Bật"}
                </Button>
              </div>
            ))
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
