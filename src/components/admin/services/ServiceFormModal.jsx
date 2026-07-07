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
import { servicePackageApi } from "@/api/servicePackageApi";
import { friendlyName } from "@/lib/format";

const EMPTY_FORM = { name: "", description: "", price: "", durationMinutes: "", garageId: "", status: "ACTIVE" };

/**
 * Form Thêm/Chỉnh sửa gói dịch vụ — gọi API thật:
 *   POST /v1/services (tạo, BE tự đặt ACTIVE) · PUT /v1/services/{id} (sửa).
 * `service` = null → chế độ tạo; có giá trị → chế độ sửa.
 */
export function ServiceFormModal({ service, garages = [], open, onOpenChange, onDone }) {
  const editing = Boolean(service?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setForm(service
      ? {
          name: service.name || "",
          description: service.description || "",
          price: String(service.price ?? ""),
          durationMinutes: String(service.durationMinutes ?? ""),
          garageId: String(service.garageId ?? ""),
          status: service.status || "ACTIVE",
        }
      : { ...EMPTY_FORM, garageId: String(garages[0]?.id ?? garages[0]?.garageId ?? "") });
  }, [open, service, garages]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên dịch vụ là bắt buộc.";
    const price = Number(form.price);
    if (form.price === "" || !Number.isFinite(price) || price < 0) errs.price = "Giá phải là số hợp lệ và ≥ 0.";
    const duration = Number(form.durationMinutes);
    if (form.durationMinutes === "" || !Number.isFinite(duration) || duration <= 0) {
      errs.durationMinutes = "Thời lượng phải là số hợp lệ và > 0.";
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
        await servicePackageApi.update(service.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes),
          status: form.status,
        });
        toast.success("Đã cập nhật dịch vụ", { description: form.name.trim() });
      } else {
        await servicePackageApi.create({
          garageId: Number(form.garageId),
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes),
        });
        toast.success("Đã tạo dịch vụ mới", { description: form.name.trim() });
      }
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      setSubmitError(err?.message || "Không thể lưu dịch vụ. Vui lòng thử lại.");
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
          <AlertDialogTitle>{editing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editing ? `Cập nhật thông tin gói "${service.name}".` : "Tạo gói dịch vụ mới cho gara."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-foreground">Tên dịch vụ <span className="text-critical">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Rửa xe cơ bản"
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
              placeholder="Mô tả ngắn về dịch vụ"
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">Giá (đ) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="VD: 150000"
                className={inputCls(errors.price)}
              />
              {errors.price && <p className="mt-1 text-xs text-critical">{errors.price}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Thời lượng (phút) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="VD: 45"
                className={inputCls(errors.durationMinutes)}
              />
              {errors.durationMinutes && <p className="mt-1 text-xs text-critical">{errors.durationMinutes}</p>}
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
              {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo dịch vụ"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
