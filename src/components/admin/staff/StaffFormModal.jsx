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
import { adminApi } from "@/api/adminApi";

const EMPTY_FORM = { email: "", password: "", fullName: "", phone: "", role: "STAFF", garageIds: [] };

// Khớp validation BE: @Pattern("^[0-9+]{9,20}$") và @Size(min = 6) cho mật khẩu.
const PHONE_RE = /^[0-9+]{9,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Form tạo nhân sự vận hành / đổi phân công chi nhánh — API thật:
 *   POST /admin/staff              { email, password, fullName, phone, role, garageIds }
 *   PUT  /admin/staff/{id}/assignment { role, garageIds }
 *
 * Bắt buộc chọn ít nhất 1 chi nhánh: quan hệ nhân viên–chi nhánh nằm ở user_role.garage_id,
 * và BE chặn booking gán cho staff không thuộc cùng garage.
 */
export function StaffFormModal({ member, garages = [], open, onOpenChange, onDone }) {
  const editing = Boolean(member?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setForm(member
      ? {
          ...EMPTY_FORM,
          fullName: member.fullName || "",
          email: member.email || "",
          phone: member.phone || "",
          role: member.role === "MANAGER" ? "MANAGER" : "STAFF",
          garageIds: Array.isArray(member.garageIds) ? member.garageIds.map(Number) : [],
        }
      : EMPTY_FORM);
  }, [open, member]);

  function toggleGarage(garageId) {
    setForm((prev) => ({
      ...prev,
      garageIds: prev.garageIds.includes(garageId)
        ? prev.garageIds.filter((id) => id !== garageId)
        : [...prev.garageIds, garageId],
    }));
  }

  function validate() {
    const errs = {};
    if (!form.garageIds.length) errs.garageIds = "Chọn ít nhất một chi nhánh phụ trách.";
    if (editing) return errs;

    if (!form.fullName.trim()) errs.fullName = "Họ tên là bắt buộc.";
    if (!EMAIL_RE.test(form.email.trim())) errs.email = "Email không hợp lệ.";
    if (!PHONE_RE.test(form.phone.trim())) errs.phone = "Số điện thoại gồm 9–20 chữ số.";
    if (form.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự.";
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
        await adminApi.updateStaffAssignment(member.id, {
          role: form.role,
          garageIds: form.garageIds,
        });
        toast.success("Đã cập nhật phân công", { description: member.fullName });
      } else {
        await adminApi.createStaff({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          role: form.role,
          garageIds: form.garageIds,
        });
        toast.success("Đã tạo tài khoản nhân viên", {
          description: `${form.fullName.trim()} — hãy gửi mật khẩu tạm cho nhân viên.`,
        });
      }
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      setSubmitError(err?.message || "Không thể lưu nhân viên. Vui lòng thử lại.");
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
          <AlertDialogTitle>{editing ? "Đổi vai trò & chi nhánh" : "Thêm nhân viên"}</AlertDialogTitle>
          <AlertDialogDescription>
            {editing
              ? `Cập nhật phân công cho "${member.fullName}".`
              : "Tạo tài khoản vận hành và gán vào chi nhánh phụ trách."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          {!editing && (
            <>
              <div>
                <label className="text-xs font-bold text-foreground">Họ và tên <span className="text-critical">*</span></label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className={inputCls(errors.fullName)}
                />
                {errors.fullName && <p className="mt-1 text-xs text-critical">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Email <span className="text-critical">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nhanvien@washmate.vn"
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-critical">{errors.email}</p>}
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

              <div>
                <label className="text-xs font-bold text-foreground">Mật khẩu tạm <span className="text-critical">*</span></label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className={inputCls(errors.password)}
                />
                {errors.password
                  ? <p className="mt-1 text-xs text-critical">{errors.password}</p>
                  : <p className="mt-1 text-xs text-muted-foreground">Gửi cho nhân viên và nhắc họ đổi lại sau lần đăng nhập đầu.</p>}
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-foreground">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            >
              <option value="STAFF">Nhân viên</option>
              <option value="MANAGER">Quản lý</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Chi nhánh phụ trách <span className="text-critical">*</span></label>
            {garages.length === 0 ? (
              <p className="mt-1.5 rounded-xl border border-input bg-background px-3 py-3 text-xs text-muted-foreground">
                Chưa có chi nhánh nào. Hãy tạo chi nhánh trước ở trang Chi nhánh.
              </p>
            ) : (
              <div className="mt-1.5 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-input bg-background p-2">
                {garages.map((garage) => {
                  const garageId = Number(garage.id ?? garage.garageId);
                  return (
                    <label
                      key={garageId}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={form.garageIds.includes(garageId)}
                        onChange={() => toggleGarage(garageId)}
                        className="size-4 accent-primary"
                      />
                      <span className="truncate">{garage.name ?? garage.garageName ?? `Chi nhánh #${garageId}`}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.garageIds && <p className="mt-1 text-xs text-critical">{errors.garageIds}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <Button type="submit" size="lg" disabled={submitting || garages.length === 0}>
              {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
