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
import { promotionApi } from "@/api/promotionApi";
import { friendlyName, todayISO } from "@/lib/format";

const EMPTY_FORM = {
  garageId: "",
  promoCode: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "0",
  usageLimit: "",
  startDate: "",
  endDate: "",
  status: "ACTIVE",
};

function plusDaysISO(baseISO, days) {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Form Thêm/Chỉnh sửa ưu đãi theo mùa (không cần đổi điểm) — API thật:
 *   POST /v1/admin/promotions
 *     { garageId, promoCode, discountType, discountValue, maxDiscount?, minOrderValue,
 *       usageLimit?, startDate, endDate }
 *   PUT  /v1/admin/promotions/{id}
 *     { promoCode, discountType, discountValue, maxDiscount?, minOrderValue,
 *       usageLimit?, startDate, endDate, status }
 * Khách nhập/chọn mã này khi đặt lịch để được giảm — không tốn điểm.
 */
export function SeasonalPromotionFormModal({ promotion, garages = [], open, onOpenChange, onDone }) {
  const editing = Boolean(promotion?.promotionId || (promotion && !isNaN(Number(promotion.id))));
  const editId = promotion?.promotionId ?? promotion?.id;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    if (promotion) {
      const rawType = String(promotion.discountType || "").toUpperCase();
      setForm({
        ...EMPTY_FORM,
        garageId: String(promotion.garageId ?? ""),
        promoCode: promotion.promoCode || promotion.code || "",
        discountType: rawType.includes("PERCENT") ? "PERCENTAGE" : "FIXED_AMOUNT",
        discountValue: String(promotion.discountValue ?? ""),
        maxDiscount: promotion.maxDiscount != null ? String(promotion.maxDiscount) : "",
        minOrderValue: String(promotion.minOrderValue ?? "0"),
        usageLimit: promotion.usageLimit != null ? String(promotion.usageLimit) : "",
        startDate: promotion.startDate ? String(promotion.startDate).slice(0, 10) : "",
        endDate: promotion.endDate ? String(promotion.endDate).slice(0, 10) : "",
        status: ["ACTIVE", "INACTIVE"].includes(String(promotion.status).toUpperCase())
          ? String(promotion.status).toUpperCase()
          : "ACTIVE",
      });
    } else {
      const start = todayISO();
      setForm({
        ...EMPTY_FORM,
        garageId: String(garages[0]?.id ?? garages[0]?.garageId ?? ""),
        startDate: start,
        endDate: plusDaysISO(start, 30),
      });
    }
  }, [open, promotion, garages]);

  function validate() {
    const errs = {};
    if (!editing && !form.garageId) errs.garageId = "Vui lòng chọn gara.";
    if (!form.promoCode.trim()) errs.promoCode = "Mã ưu đãi là bắt buộc.";
    else if (form.promoCode.trim().length > 50) errs.promoCode = "Mã ưu đãi không quá 50 ký tự.";
    const dv = Number(form.discountValue);
    if (form.discountValue === "" || !Number.isFinite(dv) || dv <= 0) {
      errs.discountValue = "Giá trị giảm phải là số > 0.";
    } else if (form.discountType === "PERCENTAGE" && dv > 100) {
      errs.discountValue = "Giảm theo % không vượt quá 100.";
    }
    const minOrder = Number(form.minOrderValue);
    if (form.minOrderValue === "" || !Number.isFinite(minOrder) || minOrder < 0) {
      errs.minOrderValue = "Đơn tối thiểu phải là số ≥ 0.";
    }
    if (form.usageLimit !== "" && (!Number.isFinite(Number(form.usageLimit)) || Number(form.usageLimit) < 1)) {
      errs.usageLimit = "Số lượt sử dụng phải là số > 0.";
    }
    if (!form.startDate) errs.startDate = "Vui lòng chọn ngày bắt đầu.";
    if (!form.endDate) errs.endDate = "Vui lòng chọn ngày kết thúc.";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    }
    if (form.endDate && form.endDate < todayISO()) {
      errs.endDate = "Ngày kết thúc phải ở tương lai.";
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
    const base = {
      promoCode: form.promoCode.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscount:
        form.discountType === "PERCENTAGE" && form.maxDiscount !== ""
          ? Number(form.maxDiscount)
          : null,
      minOrderValue: Number(form.minOrderValue),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      startDate: `${form.startDate}T00:00:00Z`,
      endDate: `${form.endDate}T23:59:59Z`,
    };
    try {
      if (editing) {
        await promotionApi.adminUpdate(editId, { ...base, status: form.status });
        toast.success("Đã cập nhật ưu đãi", { description: base.promoCode });
      } else {
        await promotionApi.adminCreate({ garageId: Number(form.garageId), ...base });
        toast.success("Đã tạo ưu đãi theo mùa", { description: base.promoCode });
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
          <AlertDialogTitle>{editing ? "Chỉnh sửa ưu đãi theo mùa" : "Tạo ưu đãi theo mùa"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editing
              ? `Cập nhật ưu đãi "${form.promoCode || promotion?.code}".`
              : "Ưu đãi giảm giá theo mùa cho gara, khách nhập/chọn mã khi đặt lịch — không tốn điểm."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          {!editing && (
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

          <div>
            <label className="text-xs font-bold text-foreground">Mã ưu đãi <span className="text-critical">*</span></label>
            <input
              value={form.promoCode}
              onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
              placeholder="VD: HE2026"
              className={`${inputCls(errors.promoCode)} font-mono uppercase`}
            />
            {errors.promoCode && <p className="mt-1 text-xs text-critical">{errors.promoCode}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">Loại giảm <span className="text-critical">*</span></label>
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

          <div className={`grid gap-3 ${form.discountType === "PERCENTAGE" ? "grid-cols-2" : "grid-cols-1"}`}>
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
            {form.discountType === "PERCENTAGE" && (
              <div>
                <label className="text-xs font-bold text-foreground">Giảm tối đa (đ)</label>
                <input
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="Không bắt buộc"
                  className={inputCls(false)}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Giới hạn lượt sử dụng</label>
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Để trống = không giới hạn"
              className={inputCls(errors.usageLimit)}
            />
            {errors.usageLimit && <p className="mt-1 text-xs text-critical">{errors.usageLimit}</p>}
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
                min={form.startDate || undefined}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputCls(errors.endDate)}
              />
              {errors.endDate && <p className="mt-1 text-xs text-critical">{errors.endDate}</p>}
            </div>
          </div>

          {editing && (
            <div>
              <label className="text-xs font-bold text-foreground">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm dừng</option>
              </select>
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
