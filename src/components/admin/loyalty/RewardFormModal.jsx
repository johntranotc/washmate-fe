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
import { friendlyName, todayISO } from "@/lib/format";

const EMPTY_FORM = {
  name: "",
  description: "",
  pointsRequired: "",
  stock: "",
  garageId: "",
  status: "ACTIVE",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "0",
  usageLimit: "",
  startDate: "",
  endDate: "",
};

/**
 * Form Thêm/Chỉnh sửa ưu đãi đổi điểm — API thật:
 *   POST /v1/admin/promotion-rewards
 *     { garageId, name, description, pointsRequired, stock, discountType, discountValue,
 *       maxDiscount?, minOrderValue, usageLimit?, startDate, endDate }
 *   PUT  /v1/admin/promotion-rewards/{id}
 *     { name, description, pointsRequired, stock, status }
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
    if (reward) {
      setForm({
        ...EMPTY_FORM,
        name: reward.name || "",
        description: reward.description || "",
        pointsRequired: String(reward.pointsRequired ?? ""),
        stock: String(reward.stock ?? ""),
        garageId: String(reward.garageId ?? ""),
        status: reward.status === "OUT_OF_STOCK" ? "ACTIVE" : reward.status || "ACTIVE",
      });
    } else {
      const start = todayISO();
      const end = new Date(`${start}T00:00:00`);
      end.setDate(end.getDate() + 30);
      const endISO = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      setForm({
        ...EMPTY_FORM,
        garageId: String(garages[0]?.id ?? garages[0]?.garageId ?? ""),
        startDate: start,
        endDate: endISO,
      });
    }
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
    if (!editing) {
      if (!form.garageId) errs.garageId = "Vui lòng chọn gara.";
      const dv = Number(form.discountValue);
      if (form.discountValue === "" || !Number.isFinite(dv) || dv <= 0) {
        errs.discountValue = "Giá trị ưu đãi phải là số > 0.";
      } else if (form.discountType === "PERCENTAGE" && dv > 100) {
        errs.discountValue = "Giảm theo % không vượt quá 100.";
      }
      const minOrder = Number(form.minOrderValue);
      if (form.minOrderValue === "" || !Number.isFinite(minOrder) || minOrder < 0) {
        errs.minOrderValue = "Đơn tối thiểu phải là số ≥ 0.";
      }
      if (!form.startDate) errs.startDate = "Vui lòng chọn ngày bắt đầu.";
      if (!form.endDate) errs.endDate = "Vui lòng chọn ngày kết thúc.";
      if (form.startDate && form.endDate && form.startDate > form.endDate) {
        errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
      }
    }
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
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
          minOrderValue: Number(form.minOrderValue),
          usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
          startDate: `${form.startDate}T00:00:00Z`,
          endDate: `${form.endDate}T23:59:59Z`,
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

          {!editing && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Loại ưu đãi <span className="text-critical">*</span></label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                  >
                    <option value="PERCENTAGE">Giảm theo %</option>
                    <option value="FIXED_AMOUNT">Giảm trực tiếp (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">
                    {form.discountType === "PERCENTAGE" ? "Mức giảm (%)" : "Số tiền giảm (đ)"} <span className="text-critical">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "VD: 10" : "VD: 30000"}
                    className={inputCls(errors.discountValue)}
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-critical">{errors.discountValue}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Đơn tối thiểu (đ) <span className="text-critical">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    placeholder="VD: 0"
                    className={inputCls(errors.minOrderValue)}
                  />
                  {errors.minOrderValue && <p className="mt-1 text-xs text-critical">{errors.minOrderValue}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">
                    {form.discountType === "PERCENTAGE" ? "Giảm tối đa (đ)" : "Giới hạn lượt dùng"}
                  </label>
                  {form.discountType === "PERCENTAGE" ? (
                    <input
                      type="number"
                      min="0"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      placeholder="Không bắt buộc"
                      className={inputCls(false)}
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                      placeholder="Không bắt buộc"
                      className={inputCls(false)}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Ngày bắt đầu <span className="text-critical">*</span></label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputCls(errors.startDate)}
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-critical">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Ngày kết thúc <span className="text-critical">*</span></label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={inputCls(errors.endDate)}
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-critical">{errors.endDate}</p>}
                </div>
              </div>
            </>
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
