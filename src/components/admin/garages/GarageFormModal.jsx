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
import { garageApi } from "@/api/garageApi";

const EMPTY_FORM = { name: "", address: "", phone: "", status: "ACTIVE" };
const PHONE_RE = /^[0-9]{10,11}$/; // đúng validation của BE

/**
 * Form Thêm/Chỉnh sửa chi nhánh — API thật:
 *   POST /v1/garages { name, address, phone }
 *   PUT  /v1/garages/{id} { name, address, phone, status }
 * BE chỉ có 4 field trên — không có email/khu vực/giờ mở cửa/công suất.
 */
export function GarageFormModal({ garage, open, onOpenChange, onDone }) {
  const editing = Boolean(garage?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setForm(garage
      ? {
          name: garage.name || "",
          address: garage.address || "",
          phone: garage.phone || "",
          status: garage.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        }
      : EMPTY_FORM);
  }, [open, garage]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên chi nhánh là bắt buộc.";
    if (!form.address.trim()) errs.address = "Địa chỉ là bắt buộc.";
    if (!PHONE_RE.test(form.phone.trim())) errs.phone = "Số điện thoại phải gồm 10–11 chữ số.";
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
        await garageApi.update(garage.id, {
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          status: form.status,
        });
        toast.success("Đã cập nhật chi nhánh", { description: form.name.trim() });
      } else {
        await garageApi.create({
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
        });
        toast.success("Đã thêm chi nhánh mới", { description: form.name.trim() });
      }
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      setSubmitError(err?.message || "Không thể lưu chi nhánh. Vui lòng thử lại.");
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{editing ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editing ? `Cập nhật thông tin "${garage.name}".` : "Tạo cơ sở rửa xe mới trong hệ thống."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-foreground">Tên chi nhánh <span className="text-critical">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: WashMate Quận 7"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-critical">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Địa chỉ <span className="text-critical">*</span></label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Số nhà, đường, quận/huyện, thành phố"
              className={inputCls(errors.address)}
            />
            {errors.address && <p className="mt-1 text-xs text-critical">{errors.address}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Số điện thoại <span className="text-critical">*</span></label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="VD: 0901234567"
              className={inputCls(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-critical">{errors.phone}</p>}
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
                <option value="INACTIVE">Tạm ngừng</option>
              </select>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm chi nhánh"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
