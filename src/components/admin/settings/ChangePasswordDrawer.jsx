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
import { authApi } from "@/api/authApi";

const EMPTY = { oldPassword: "", newPassword: "", confirm: "" };

/**
 * Drawer Bảo mật — đổi mật khẩu qua API thật PUT /auth/password/change
 * ({ oldPassword, newPassword }, mật khẩu mới 6–100 ký tự theo validation BE).
 * Phiên đăng nhập / xác thực 2 lớp chưa có API → hiển thị "Sắp có".
 */
export function ChangePasswordDrawer({ open, onOpenChange }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setErrors({});
    setSubmitError(null);
  }, [open]);

  function validate() {
    const errs = {};
    if (!form.oldPassword) errs.oldPassword = "Vui lòng nhập mật khẩu hiện tại.";
    if (form.newPassword.length < 6) errs.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    else if (form.newPassword === form.oldPassword) errs.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    if (form.confirm !== form.newPassword) errs.confirm = "Xác nhận mật khẩu không khớp.";
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
      await authApi.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đã đổi mật khẩu", { description: "Sử dụng mật khẩu mới cho lần đăng nhập sau." });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || err?.message || "Mật khẩu hiện tại không đúng. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    { key: "oldPassword", label: "Mật khẩu hiện tại", placeholder: "Nhập mật khẩu đang sử dụng" },
    { key: "newPassword", label: "Mật khẩu mới", placeholder: "Ít nhất 6 ký tự" },
    { key: "confirm", label: "Xác nhận mật khẩu mới", placeholder: "Nhập lại mật khẩu mới" },
  ];

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bảo mật tài khoản</AlertDialogTitle>
          <AlertDialogDescription>Đổi mật khẩu đăng nhập của quản trị viên.</AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {submitError && (
            <p className="rounded-xl border border-critical/25 bg-critical-container px-3 py-2 text-xs font-bold text-critical">
              {submitError}
            </p>
          )}

          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-bold text-foreground">
                {label} <span className="text-critical">*</span>
              </label>
              <input
                type="password"
                autoComplete={key === "oldPassword" ? "current-password" : "new-password"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className={`mt-1.5 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-ring ${
                  errors[key] ? "border-critical bg-critical-container" : "border-input bg-background"
                }`}
              />
              {errors[key] && <p className="mt-1 text-xs text-critical">{errors[key]}</p>}
            </div>
          ))}

          {/* Chưa có API quản lý phiên đăng nhập / 2FA */}
          <div className="rounded-xl border border-dashed border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-foreground">Phiên đăng nhập & xác thực 2 lớp</p>
              <span className="rounded-full bg-warning-container px-2 py-0.5 text-xs font-bold text-warning">Sắp có</span>
            </div>
            <p className="mt-1 text-xs text-neutral-muted">
              Sẽ được kích hoạt khi hệ thống hỗ trợ cấu hình tương ứng.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
