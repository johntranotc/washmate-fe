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
import { rewardApi } from "@/api/rewardApi";
import { friendlyName } from "@/lib/format";

const EMPTY_FORM = { name: "", description: "", pointsRequired: "", stock: "", garageId: "", status: "ACTIVE" };

/**
 * Form Thêm/Chỉnh sửa ưu đãi đổi điểm — API thật:
 *   POST /v1/rewards { garageId, name, description, pointsRequired, stock }
 *   PUT  /v1/rewards/{id} { name, description, pointsRequired, stock, status }
 * BE chưa hỗ trợ hạn sử dụng/giá trị ưu đãi riêng → form không có các field đó.
 */
export function RewardFormModal({ reward, garages = [], open, onOpenChange, onDone }) {
  const editing = Boolean(reward?.rewardId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setForm(reward
      ? {
          name: reward.name || "",
          description: reward.description || "",
          pointsRequired: String(reward.pointsRequired ?? ""),
          stock: String(reward.stock ?? ""),
          garageId: String(reward.garageId ?? ""),
          status: reward.status === "OUT_OF_STOCK" ? "ACTIVE" : reward.status || "ACTIVE",
        }
      : { ...EMPTY_FORM, garageId: String(garages[0]?.id ?? garages[0]?.garageId ?? "") });
  }, [open, reward, garages]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên ưu đãi là bắt buộc.";
    const points = Number(form.pointsRequired);
    if (form.pointsRequired === "" || !Number.isFinite(points) || points <= 0) {
      errs.pointsRequired = "Điểm cần đổi phải là số > 0.";
    }
    const stock = Number(form.stock);
    if (form.stock === "" || !Number.isFinite(stock) || stock < 0) {
      errs.stock = "Số lượng phải là số ≥ 0.";
    }
    if (!editing && !form.garageId) errs.garageId = "Vui lòng chọn gara.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (editing) {
        await rewardApi.updateReward(reward.rewardId, {
          name: form.name.trim(),
          description: form.description.trim(),
          pointsRequired: Number(form.pointsRequired),
          stock: Number(form.stock),
          status: form.status,
        });
        toast.success("Đã cập nhật ưu đãi", { description: form.name.trim() });
      } else {
        await rewardApi.createReward({
          garageId: Number(form.garageId),
          name: form.name.trim(),
          description: form.description.trim(),
          pointsRequired: Number(form.pointsRequired),
          stock: Number(form.stock),
        });
        toast.success("Đã tạo ưu đãi mới", { description: form.name.trim() });
      }
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      setSubmitError(err?.message || "Không thể lưu ưu đãi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = (hasError) =>
    `mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-ring ${
      hasError ? "border-critical bg-critical-container" : "border-input bg-background"
    }`;

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{editing ? "Chỉnh sửa ưu đãi" : "Thêm ưu đãi mới"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editing ? `Cập nhật ưu đãi "${reward.name}".` : "Tạo ưu đãi để khách dùng điểm đổi thưởng."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-foreground">Tên ưu đãi <span className="text-critical">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Giảm 30.000đ cho lần rửa tiếp theo"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-critical">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Điều kiện áp dụng, ghi chú cho khách..."
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">Điểm cần đổi <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.pointsRequired}
                onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })}
                placeholder="VD: 300"
                className={inputCls(errors.pointsRequired)}
              />
              {errors.pointsRequired && <p className="mt-1 text-xs text-critical">{errors.pointsRequired}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Số lượng <span className="text-critical">*</span></label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="VD: 100"
                className={inputCls(errors.stock)}
              />
              {errors.stock && <p className="mt-1 text-xs text-critical">{errors.stock}</p>}
            </div>
          </div>

          {editing ? (
            <div>
              <label className="text-xs font-bold text-foreground">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ẩn</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-foreground">Gara áp dụng <span className="text-critical">*</span></label>
              <select
                value={form.garageId}
                onChange={(e) => setForm({ ...form, garageId: e.target.value })}
                className={inputCls(errors.garageId)}
              >
                {garages.map((g) => (
                  <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                    {friendlyName(g.name ?? g.garageName, "Gara chưa cập nhật")}
                  </option>
                ))}
              </select>
              {errors.garageId && <p className="mt-1 text-xs text-critical">{errors.garageId}</p>}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo ưu đãi"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
