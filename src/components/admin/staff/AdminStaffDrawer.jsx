import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { friendlyName } from "@/lib/format";
import {
  userRoleLabels,
  userRoleTones,
  userStatusLabels,
  userStatusTones,
  userRoleLabel,
  userStatusLabel,
} from "@/lib/status-tones";

// Re-export từ nguồn chung status-tones.js — giữ tên cũ cho các trang đang dùng.
export const STAFF_ROLE_LABELS = userRoleLabels;
export const STAFF_ROLE_TONES = userRoleTones;
export const STAFF_STATUS_LABELS = userStatusLabels;
export const STAFF_STATUS_TONES = userStatusTones;
export const roleLabel = userRoleLabel;
export const statusLabel = userStatusLabel;

/**
 * Drawer chi tiết nhân viên — toàn bộ từ dữ liệu thật GET /admin/users
 * (MeResponse: fullName, email, phone, address, role, roles[], status,
 * garageIds[], accountCode) + tên chi nhánh từ GET /v1/garages.
 * BE chưa có: ngày tạo, đăng nhập gần nhất, lịch làm việc, booking đã xử lý
 * theo nhân viên, hoạt động gần đây → hiển thị trung thực "Chưa có dữ liệu".
 * member: { ...user, branchNames: [], unassigned: boolean }
 */
export function AdminStaffDrawer({ member, open, onOpenChange }) {
  if (!member) return null;

  const roles = Array.isArray(member.roles) && member.roles.length
    ? member.roles
    : member.role ? [member.role] : [];

  const infoRows = [
    ["Mã tài khoản", member.accountCode || `#${member.id}`],
    ["Email", member.email || "Chưa cập nhật"],
    ["Số điện thoại", member.phone || "Chưa cập nhật"],
    ["Địa chỉ", member.address || "Chưa cập nhật"],
    // BE không trả ngày tạo / đăng nhập gần nhất trong MeResponse
    ["Ngày tạo", "—"],
    ["Đăng nhập gần nhất", "—"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(member.fullName, "Nhân viên chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết nhân viên</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STAFF_ROLE_TONES[member.role] || "bg-muted text-muted-foreground"}`}>
            {roleLabel(member.role)}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STAFF_STATUS_TONES[member.status] || "bg-muted text-muted-foreground"}`}>
            {statusLabel(member.status)}
          </span>
          {member.unassigned && (
            <span className="rounded-full bg-warning-container px-2.5 py-0.5 text-xs font-bold text-warning">
              Chưa gán chi nhánh
            </span>
          )}
        </div>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {infoRows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="min-w-0 break-words text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Phân quyền ({roles.length})</p>
          {roles.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <span
                  key={r}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STAFF_ROLE_TONES[r] || "bg-muted text-muted-foreground"}`}
                >
                  {roleLabel(r)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">
            Chi nhánh đang gán ({member.branchNames?.length || 0})
          </p>
          {!member.branchNames?.length ? (
            <p className="mt-1 text-xs text-neutral-muted">
              Chưa gán chi nhánh nào. Nhân viên cần được gán chi nhánh để vận hành.
            </p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {member.branchNames.map((name) => (
                <p key={name} className="text-xs font-semibold text-ink-soft">{name}</p>
              ))}
            </div>
          )}
        </div>

        {member.status === "BLOCKED" && (
          <div className="mt-3 rounded-xl border border-critical/25 bg-critical-container p-4">
            <p className="text-xs font-bold text-critical">Tài khoản đang tạm khóa</p>
            <p className="mt-1 text-xs text-critical/80">
              Nhân viên không thể đăng nhập hoặc thao tác cho đến khi được kích hoạt lại.
            </p>
          </div>
        )}
        {member.status === "PENDING_VERIFY" && (
          <div className="mt-3 rounded-xl border border-warning/25 bg-warning-container p-4">
            <p className="text-xs font-bold text-warning">Tài khoản chờ kích hoạt</p>
            <p className="mt-1 text-xs text-warning/80">
              Tài khoản chưa xác minh, cần hoàn tất kích hoạt trước khi vận hành.
            </p>
          </div>
        )}

        {/* BE chưa có API lịch làm việc / booking đã xử lý / hoạt động theo nhân viên */}
        {["Lịch làm việc", "Booking đã xử lý", "Hoạt động gần đây"].map((label) => (
          <div key={label} className="mt-3 rounded-xl border border-dashed border-border p-4">
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu.</p>
          </div>
        ))}

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
